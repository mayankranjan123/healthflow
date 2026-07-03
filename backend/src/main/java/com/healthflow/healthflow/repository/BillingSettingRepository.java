package com.healthflow.healthflow.repository;

import com.healthflow.healthflow.model.BillingSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingSettingRepository extends JpaRepository<BillingSetting, Long> {
}
