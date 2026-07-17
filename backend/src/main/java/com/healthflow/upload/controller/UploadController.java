package com.healthflow.upload.controller;

import com.healthflow.common.dto.ApiResponse;
import com.healthflow.upload.entity.Upload;
import com.healthflow.upload.repository.UploadRepository;
import com.healthflow.exception.ResourceNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/uploads")
public class UploadController {

    private final UploadRepository uploadRepository;
    private static final String SUPABASE_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3eGVsZnFidGptbm5hZXRud3hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA0NDIwNiwiZXhwIjoyMDk4NjIwMjA2fQ.ssUyZPWar71Ag30tRfPlq28oXZk5OkJdfQoFPynW3ec";
    private static final String SUPABASE_BASE_URL = "https://pwxelfqbtjmnnaetnwxa.supabase.co/storage/v1/object/healthflow";

    public UploadController(UploadRepository uploadRepository) {
        this.uploadRepository = uploadRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }

        // Limit size to less than 2MB
        if (file.getSize() >= 2 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File size must be less than 2MB"));
        }

        // Validate that it is a PNG, JPG/JPEG or PDF file
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        
        String fileType = "png";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileType = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        boolean isValidType = "png".equals(fileType) || "pdf".equals(fileType) || "jpg".equals(fileType) || "jpeg".equals(fileType);
        if (!isValidType) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only PDF, PNG, and JPG files are allowed"));
        }

        String uploadId = UUID.randomUUID().toString();

        try {
            // Call Supabase API internally
            HttpClient client = HttpClient.newHttpClient();
            String supabaseUrl = SUPABASE_BASE_URL + "/" + uploadId + "." + fileType;

            HttpRequest supabaseRequest = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl))
                    .header("Authorization", "Bearer " + SUPABASE_BEARER_TOKEN)
                    .header("Content-Type", "image/png")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = client.send(supabaseRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Failed to upload file to Supabase: Status " + response.statusCode()));
            }

            // Save details to DB
            Upload upload = new Upload(uploadId, fileType, originalFilename, file.getSize());
            uploadRepository.save(upload);

            // Construct response payload
            Map<String, Object> data = new HashMap<>();
            data.put("uploadId", uploadId);
            data.put("fileType", fileType);
            data.put("fileName", originalFilename);
            data.put("fileSize", file.getSize());
            data.put("url", "/api/v1/uploads/" + uploadId);

            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Supabase upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/{uploadId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable("uploadId") String uploadId) {
        Upload upload = uploadRepository.findById(uploadId)
                .orElseThrow(() -> new ResourceNotFoundException("Upload not found with id: " + uploadId));

        try {
            // Call Supabase download API internally
            HttpClient client = HttpClient.newHttpClient();
            String supabaseUrl = SUPABASE_BASE_URL + "/" + uploadId + "." + upload.getFileType();

            HttpRequest supabaseRequest = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl))
                    .header("Authorization", "Bearer " + SUPABASE_BEARER_TOKEN)
                    .GET()
                    .build();

            HttpResponse<byte[]> response = client.send(supabaseRequest, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() >= 300) {
                return ResponseEntity.status(response.statusCode()).build();
            }

            String mimeType = "image/png";
            if ("pdf".equalsIgnoreCase(upload.getFileType())) {
                mimeType = "application/pdf";
            } else if ("jpg".equalsIgnoreCase(upload.getFileType()) || "jpeg".equalsIgnoreCase(upload.getFileType())) {
                mimeType = "image/jpeg";
            } else if ("docx".equalsIgnoreCase(upload.getFileType())) {
                mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(mimeType));
            headers.setContentDispositionFormData("inline", upload.getFileName());

            return new ResponseEntity<>(response.body(), headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
