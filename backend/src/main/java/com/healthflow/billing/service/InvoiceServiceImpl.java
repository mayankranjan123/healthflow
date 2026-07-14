package com.healthflow.billing.service;

import com.healthflow.billing.dto.InvoiceItemDto;
import com.healthflow.billing.dto.InvoiceRequestDto;
import com.healthflow.billing.dto.InvoiceResponseDto;
import com.healthflow.billing.dto.InvoiceStatsDto;
import com.healthflow.billing.entity.Invoice;
import com.healthflow.billing.entity.InvoiceItem;
import com.healthflow.billing.mapper.InvoiceMapper;
import com.healthflow.billing.repository.InvoiceRepository;
import com.healthflow.doctor.entity.Doctor;
import com.healthflow.doctor.repository.DoctorRepository;
import com.healthflow.exception.ResourceNotFoundException;
import com.healthflow.patient.entity.Patient;
import com.healthflow.patient.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Transactional(readOnly = true)
public class InvoiceServiceImpl implements InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceServiceImpl.class);

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final Random random = new Random();

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository) {
        this.invoiceRepository = invoiceRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    @Transactional
    public InvoiceResponseDto createInvoice(Long clinicId, InvoiceRequestDto request) {
        log.info("Creating billing invoice for patient ID: {} by doctor ID: {} in clinic: {}", 
                request.getPatientId(), request.getDoctorId(), clinicId);

        // 1. Verify active patient exists
        Patient patient = patientRepository.findById(request.getPatientId())
                .filter(p -> p.getClinicId().equals(clinicId))
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Active Patient not found with ID " + request.getPatientId()));

        // 2. Verify doctor exists
        Doctor doctor = doctorRepository.findByIdAndClinicId(request.getDoctorId(), clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID " + request.getDoctorId()));

        // 3. Instantiate Entity and generate code
        Invoice invoice = new Invoice();
        invoice.setClinicId(clinicId);
        invoice.setPatientId(request.getPatientId());
        invoice.setDoctorId(request.getDoctorId());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setInvoiceNumber(generateUniqueInvoiceNumber(clinicId));
        invoice.setPaymentMode(request.getPaymentMode());
        invoice.setReferenceNo(request.getReferenceNo());
        invoice.setTemplateId(request.getTemplateId() != null ? request.getTemplateId() : "CLASSIC_MEDICAL");

        // 4. Run Calculation Logic & Link Items
        calculateAndPopulateInvoice(invoice, request.getItems(), request.getPaidAmount(), request.getStatus());

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice saved successfully with ID: {} and Invoice Number: {}", saved.getId(), saved.getInvoiceNumber());

        return getInvoiceById(clinicId, saved.getId());
    }

    @Override
    public InvoiceResponseDto getInvoiceById(Long clinicId, Long invoiceId) {
        log.debug("Fetching invoice ID: {} in clinic: {}", invoiceId, clinicId);
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .filter(i -> i.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID " + invoiceId));
        return InvoiceMapper.toResponseDto(invoice);
    }

    @Override
    public Page<InvoiceResponseDto> getFilteredInvoices(
            Long clinicId,
            String patientSearch,
            LocalDate fromDate,
            LocalDate toDate,
            String status,
            String doctorName,
            Pageable pageable) {
        log.info("Querying filtered invoices - searchPrefix: {}, fromDate: {}, toDate: {}, status: {}, doctorName: {}", 
                patientSearch, fromDate, toDate, status, doctorName);
        
        String normalizedSearch = (patientSearch != null && !patientSearch.trim().isEmpty()) ? patientSearch.trim() : null;
        String normalizedStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) ? status.trim() : null;
        String normalizedDoctor = (doctorName != null && !doctorName.trim().isEmpty() && !doctorName.equalsIgnoreCase("all")) ? doctorName.trim() : null;

        Page<Invoice> page = invoiceRepository.findFilteredInvoices(
                clinicId, normalizedSearch, fromDate, toDate, normalizedStatus, normalizedDoctor, pageable);
        return page.map(InvoiceMapper::toResponseDto);
    }

    @Override
    public InvoiceResponseDto previewInvoice(Long clinicId, InvoiceRequestDto request) {
        log.info("Generating in-memory calculation preview for clinic ID: {}", clinicId);

        Patient patient = patientRepository.findById(request.getPatientId())
                .filter(p -> p.getClinicId().equals(clinicId))
                .orElse(null);

        Doctor doctor = doctorRepository.findByIdAndClinicId(request.getDoctorId(), clinicId)
                .orElse(null);

        Invoice previewEntity = new Invoice();
        previewEntity.setClinicId(clinicId);
        previewEntity.setPatientId(request.getPatientId());
        previewEntity.setPatient(patient);
        previewEntity.setDoctorId(request.getDoctorId());
        previewEntity.setDoctor(doctor);
        previewEntity.setInvoiceDate(request.getInvoiceDate());
        previewEntity.setInvoiceNumber("INV-PREVIEW-DRAFT");
        previewEntity.setPaymentMode(request.getPaymentMode());
        previewEntity.setReferenceNo(request.getReferenceNo());

        calculateAndPopulateInvoice(previewEntity, request.getItems(), request.getPaidAmount(), request.getStatus());

        return InvoiceMapper.toResponseDto(previewEntity);
    }

    @Override
    @Transactional
    public String generatePdfUrl(Long clinicId, Long invoiceId) {
        log.info("Generating placeholder PDF download path for invoice ID: {}", invoiceId);
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .filter(i -> i.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID " + invoiceId));

        String generatedPdfUrl = String.format("billing/inv-%s-%d.pdf", 
                invoice.getInvoiceNumber(), System.currentTimeMillis());
        
        invoice.setPdfUrl(generatedPdfUrl);
        invoiceRepository.save(invoice);

        return generatedPdfUrl;
    }

    @Override
    public InvoiceStatsDto getBillingStats(Long clinicId) {
        log.info("Fetching dashboard billing statistics for clinic ID: {}", clinicId);

        LocalDate today = LocalDate.now();
        BigDecimal revenueToday = invoiceRepository.getRevenueToday(clinicId, today);
        BigDecimal pendingPayments = invoiceRepository.getPendingPaymentsTotal(clinicId);
        
        Long paidInvoicesCount = invoiceRepository.getPaidInvoicesCount(clinicId);
        BigDecimal paidInvoicesAmount = invoiceRepository.getPaidInvoicesTotalAmount(clinicId);
        
        Long partialPaymentsCount = invoiceRepository.getPartialInvoicesCount(clinicId);
        BigDecimal partialPaymentsAmount = invoiceRepository.getPartialPaymentsTotalAmount(clinicId);

        return new InvoiceStatsDto(
                revenueToday,
                pendingPayments,
                paidInvoicesCount,
                paidInvoicesAmount,
                partialPaymentsCount,
                partialPaymentsAmount
        );
    }

    /**
     * core Pricing and Tax Calculation logic for Invoice and its nested items.
     */
    private void calculateAndPopulateInvoice(Invoice invoice, List<InvoiceItemDto> itemDtos, 
                                             BigDecimal requestPaidAmount, String requestStatus) {
        invoice.getItems().clear();

        BigDecimal subtotalAccumulator = BigDecimal.ZERO;
        BigDecimal discountAccumulator = BigDecimal.ZERO;
        BigDecimal taxAccumulator = BigDecimal.ZERO;
        BigDecimal grandTotalAccumulator = BigDecimal.ZERO;

        for (InvoiceItemDto itemDto : itemDtos) {
            BigDecimal qty = BigDecimal.valueOf(itemDto.getQuantity());
            BigDecimal itemSubtotal = itemDto.getRate().multiply(qty).setScale(2, RoundingMode.HALF_UP);
            
            // Item discount amount
            BigDecimal itemDiscountPct = itemDto.getDiscountPercent() != null ? itemDto.getDiscountPercent() : BigDecimal.ZERO;
            BigDecimal itemDiscountAmt = itemSubtotal.multiply(itemDiscountPct.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                    .setScale(2, RoundingMode.HALF_UP);
            
            // Tax calculation (applied post-discount as standard practice)
            BigDecimal itemTaxPct = itemDto.getTaxPercent() != null ? itemDto.getTaxPercent() : BigDecimal.ZERO;
            BigDecimal itemTaxableBase = itemSubtotal.subtract(itemDiscountAmt);
            BigDecimal itemTaxAmt = itemTaxableBase.multiply(itemTaxPct.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                    .setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal itemTotal = itemTaxableBase.add(itemTaxAmt).setScale(2, RoundingMode.HALF_UP);

            InvoiceItem entityItem = new InvoiceItem();
            entityItem.setItemName(itemDto.getItemName().trim());
            entityItem.setQuantity(itemDto.getQuantity());
            entityItem.setRate(itemDto.getRate());
            entityItem.setDiscountPercent(itemDiscountPct);
            entityItem.setTaxPercent(itemTaxPct);
            entityItem.setTotal(itemTotal);

            invoice.addItem(entityItem);

            subtotalAccumulator = subtotalAccumulator.add(itemSubtotal);
            discountAccumulator = discountAccumulator.add(itemDiscountAmt);
            taxAccumulator = taxAccumulator.add(itemTaxAmt);
            grandTotalAccumulator = grandTotalAccumulator.add(itemTotal);
        }

        invoice.setSubtotal(subtotalAccumulator);
        invoice.setDiscountTotal(discountAccumulator);
        invoice.setTaxTotal(taxAccumulator);
        invoice.setGrandTotal(grandTotalAccumulator);

        BigDecimal paid = requestPaidAmount != null ? requestPaidAmount : BigDecimal.ZERO;
        
        // Handle input status constraints
        if (requestStatus != null && !requestStatus.isBlank()) {
            String cleanStatus = requestStatus.trim();
            if (cleanStatus.equalsIgnoreCase("Paid")) {
                paid = grandTotalAccumulator;
                invoice.setStatus("Paid");
            } else if (cleanStatus.equalsIgnoreCase("Pending")) {
                paid = BigDecimal.ZERO;
                invoice.setStatus("Pending");
            } else if (cleanStatus.equalsIgnoreCase("Partial")) {
                if (paid.compareTo(BigDecimal.ZERO) <= 0 || paid.compareTo(grandTotalAccumulator) >= 0) {
                    // adjust paid to half of total or keep original if it exists
                    if (paid.compareTo(BigDecimal.ZERO) <= 0) {
                        paid = grandTotalAccumulator.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                    }
                }
                invoice.setStatus("Partial");
            } else {
                invoice.setStatus(cleanStatus);
            }
        } else {
            // Determine status dynamically
            if (paid.compareTo(grandTotalAccumulator) >= 0) {
                invoice.setStatus("Paid");
                paid = grandTotalAccumulator; // lock paid to exact total
            } else if (paid.compareTo(BigDecimal.ZERO) <= 0) {
                invoice.setStatus("Pending");
                paid = BigDecimal.ZERO;
            } else {
                invoice.setStatus("Partial");
            }
        }

        BigDecimal pending = grandTotalAccumulator.subtract(paid).setScale(2, RoundingMode.HALF_UP);
        if (pending.compareTo(BigDecimal.ZERO) < 0) {
            pending = BigDecimal.ZERO;
        }

        invoice.setPaidAmount(paid);
        invoice.setPendingAmount(pending);
    }

    private String generateUniqueInvoiceNumber(Long clinicId) {
        String num = "";
        boolean isUnique = false;
        int attempts = 0;
        int currentYear = LocalDate.now().getYear();

        while (!isUnique && attempts < 20) {
            int randomNo = 1000 + random.nextInt(9000); // 4 digit format
            num = String.format("INV-%d-%d", currentYear, randomNo);

            if (invoiceRepository.findByClinicIdAndInvoiceNumber(clinicId, num).isEmpty()) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            num = String.format("INV-%d-%d", currentYear, System.currentTimeMillis() % 10000);
        }

        return num;
    }
}
