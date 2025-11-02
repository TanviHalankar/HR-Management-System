package com.example.hrms.employeeservice.controller;

import com.example.hrms.employeeservice.entity.Employee;
import com.example.hrms.employeeservice.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {
    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Optional<Employee> employee = employeeRepository.findById(id);
        return employee.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeRepository.save(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee updatedEmployee) {
        try {
            Optional<Employee> optionalEmployee = employeeRepository.findById(id);
            
            if (optionalEmployee.isPresent()) {
                Employee employee = optionalEmployee.get();
                
                // Update fields only if provided
                if (updatedEmployee.getName() != null) {
                    employee.setName(updatedEmployee.getName());
                }
                if (updatedEmployee.getDesignation() != null) {
                    employee.setDesignation(updatedEmployee.getDesignation());
                }
                if (updatedEmployee.getDepartment() != null) {
                    employee.setDepartment(updatedEmployee.getDepartment());
                }
                if (updatedEmployee.getSalary() != null) {
                    employee.setSalary(updatedEmployee.getSalary());
                }
                
                Employee savedEmployee = employeeRepository.save(employee);
                return ResponseEntity.ok(savedEmployee);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Employee with id " + id + " not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating employee: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            Optional<Employee> optionalEmployee = employeeRepository.findById(id);
            
            if (optionalEmployee.isPresent()) {
                employeeRepository.delete(optionalEmployee.get());
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Employee with id " + id + " not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting employee: " + e.getMessage());
        }
    }
}
