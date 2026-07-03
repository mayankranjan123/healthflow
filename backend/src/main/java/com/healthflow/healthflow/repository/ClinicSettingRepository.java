package com.healthflow.healthflow.repository;

import com.healthflow.healthflow.model.ClinicSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicSettingRepository extends JpaRepository<ClinicSetting, Long> {
}
