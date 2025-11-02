package com.example.hrms.payrollservice.controller;

import com.example.hrms.payrollservice.entity.Payroll;
import com.example.hrms.payrollservice.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> updatePayroll(@PathVariable Long id, @RequestBody Payroll updatedPayroll) {
        try {
            Optional<Payroll> optionalPayroll = payrollRepository.findById(id);
            
            if (optionalPayroll.isPresent()) {
                Payroll payroll = optionalPayroll.get();
                
                if (updatedPayroll.getEmployeeId() != null) {
                    payroll.setEmployeeId(updatedPayroll.getEmployeeId());
                }
                if (updatedPayroll.getBasicPay() != null) {
                    payroll.setBasicPay(updatedPayroll.getBasicPay());
                }
                if (updatedPayroll.getBonus() != null) {
                    payroll.setBonus(updatedPayroll.getBonus());
                }
                if (updatedPayroll.getDeductions() != null) {
                    payroll.setDeductions(updatedPayroll.getDeductions());
                }
                if (updatedPayroll.getNetSalary() != null) {
                    payroll.setNetSalary(updatedPayroll.getNetSalary());
                }
                
                Payroll savedPayroll = payrollRepository.save(payroll);
                return ResponseEntity.ok(savedPayroll);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Payroll record with id " + id + " not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating payroll: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayroll(@PathVariable Long id) {
        try {
            Optional<Payroll> optionalPayroll = payrollRepository.findById(id);
            
            if (optionalPayroll.isPresent()) {
                payrollRepository.delete(optionalPayroll.get());
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Payroll record with id " + id + " not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting payroll: " + e.getMessage());
        }
    }
}
