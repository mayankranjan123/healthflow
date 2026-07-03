package com.healthflow.healthflow.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "billing_settings")
@Data
@NoArgsConstructor
public class BillingSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoicePrefix;
    private String startingInvoiceNumber;
    private String receiptPrefix;
    private Boolean autoGenerateInvoiceNumber;

    private Double defaultTaxPercent;
    private Boolean itemLevelTax;
    private Boolean invoiceLevelDiscount;
    private Boolean itemLevelDiscount;
    private String taxLabel;
    private Boolean showGstNumber;
    private Boolean roundOffFinalAmount;

    private String invoiceTemplate;

    private Boolean showClinicLogo;
    private Boolean showClinicAddress;
    private Boolean showDoctorName;
    private Boolean showPatientMobile;
    private String footerMessage;

    private String defaultPaperSize;
    private String printOrientation;
}
