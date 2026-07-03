package com.healthflow.healthflow.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clinic_settings")
@Data
@NoArgsConstructor
public class ClinicSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clinicName;
    private String clinicPhone;
    private String clinicEmail;
    private String website;
    private String gstNumber;
    private String registrationNumber;
    private String logoUrl;

    private String addressLine;
    private String city;
    private String state;
    private String country;
    private String pincode;

    private String currency;
    private String language;
}
