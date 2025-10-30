package com.example.hrms.payrollservice.controller;

import com.example.hrms.payrollservice.entity.Payroll;
import com.example.hrms.payrollservice.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/payroll")
public class PayrollController {
    @Autowired
    private PayrollRepository payrollRepository;

    @GetMapping
    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id) {
        Optional<Payroll> payroll = payrollRepository.findById(id);
        return payroll.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Payroll createPayroll(@RequestBody Payroll payroll) {
        return payrollRepository.save(payroll);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long id, @RequestBody Payroll updatedPayroll) {
        return payrollRepository.findById(id)
                .map(payroll -> {
                    payroll.setEmployeeId(updatedPayroll.getEmployeeId());
                    payroll.setBasicPay(updatedPayroll.getBasicPay());
                    payroll.setBonus(updatedPayroll.getBonus());
                    payroll.setDeductions(updatedPayroll.getDeductions());
                    payroll.setNetSalary(updatedPayroll.getNetSalary());
                    return ResponseEntity.ok(payrollRepository.save(payroll));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long id) {
        return payrollRepository.findById(id)
                .map(payroll -> {
                    payrollRepository.delete(payroll);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
