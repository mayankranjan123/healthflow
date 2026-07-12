package com.healthflow.billing.repository;

import com.healthflow.billing.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByClinicIdAndInvoiceNumber(Long clinicId, String invoiceNumber);

    @Query("SELECT i FROM Invoice i " +
           "LEFT JOIN FETCH i.patient pat " +
           "LEFT JOIN FETCH i.doctor doc " +
           "WHERE i.clinicId = :clinicId " +
           "AND (cast(:patientName as string) IS NULL OR LOWER(pat.fullName) LIKE LOWER(CONCAT('%', cast(:patientName as string), '%'))) " +
           "AND (cast(:invoiceSearch as string) IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', cast(:invoiceSearch as string), '%')) OR CAST(i.id AS string) = cast(:invoiceSearch as string)) " +
           "AND (cast(:fromDate as date) IS NULL OR i.invoiceDate >= :fromDate) " +
           "AND (cast(:toDate as date) IS NULL OR i.invoiceDate <= :toDate) " +
           "AND (cast(:status as string) IS NULL OR LOWER(i.status) = LOWER(cast(:status as string))) " +
           "AND (cast(:doctorId as Long) IS NULL OR i.doctorId = :doctorId)")
    Page<Invoice> findFilteredInvoices(
            @Param("clinicId") Long clinicId,
            @Param("patientName") String patientName,
            @Param("invoiceSearch") String invoiceSearch,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") String status,
            @Param("doctorId") Long doctorId,
            Pageable pageable
    );

    @Query("SELECT i FROM Invoice i WHERE i.clinicId = :clinicId AND i.invoiceDate >= :start AND i.invoiceDate <= :end")
    java.util.List<Invoice> findAllByClinicIdAndDateRange(
            @Param("clinicId") Long clinicId,
            @Param("start") java.time.LocalDate start,
            @Param("end") java.time.LocalDate end
    );

    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.clinicId = :clinicId AND i.invoiceDate = :today")
    BigDecimal getRevenueToday(@Param("clinicId") Long clinicId, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(i.pendingAmount), 0) FROM Invoice i WHERE i.clinicId = :clinicId")
    BigDecimal getPendingPaymentsTotal(@Param("clinicId") Long clinicId);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.clinicId = :clinicId AND LOWER(i.status) = 'paid'")
    Long getPaidInvoicesCount(@Param("clinicId") Long clinicId);

    @Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM Invoice i WHERE i.clinicId = :clinicId AND LOWER(i.status) = 'paid'")
    BigDecimal getPaidInvoicesTotalAmount(@Param("clinicId") Long clinicId);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.clinicId = :clinicId AND LOWER(i.status) = 'partial'")
    Long getPartialInvoicesCount(@Param("clinicId") Long clinicId);

    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.clinicId = :clinicId AND LOWER(i.status) = 'partial'")
    BigDecimal getPartialPaymentsTotalAmount(@Param("clinicId") Long clinicId);
}
