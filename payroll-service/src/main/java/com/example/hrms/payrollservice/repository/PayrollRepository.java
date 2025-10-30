package com.example.hrms.payrollservice.repository;

import com.example.hrms.payrollservice.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
}
