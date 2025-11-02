package com.example.hrms.attendanceservice.controller;

import com.example.hrms.attendanceservice.entity.Attendance;
import com.example.hrms.attendanceservice.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping
    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long id) {
        Optional<Attendance> attendance = attendanceRepository.findById(id);
        return attendance.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Attendance createAttendance(@RequestBody Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(@PathVariable Long id, @RequestBody Attendance updatedAttendance) {
        try {
            Optional<Attendance> optionalAttendance = attendanceRepository.findById(id);
            
            if (optionalAttendance.isPresent()) {
                Attendance attendance = optionalAttendance.get();
                
                if (updatedAttendance.getEmployeeId() != null) {
                    attendance.setEmployeeId(updatedAttendance.getEmployeeId());
                }
                if (updatedAttendance.getDate() != null) {
                    attendance.setDate(updatedAttendance.getDate());
                }
                if (updatedAttendance.getCheckInTime() != null) {
                    attendance.setCheckInTime(updatedAttendance.getCheckInTime());
                }
                if (updatedAttendance.getCheckOutTime() != null) {
                    attendance.setCheckOutTime(updatedAttendance.getCheckOutTime());
                }
                
                Attendance savedAttendance = attendanceRepository.save(attendance);
                return ResponseEntity.ok(savedAttendance);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attendance record with id " + id + " not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating attendance: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        try {
            Optional<Attendance> optionalAttendance = attendanceRepository.findById(id);
            
            if (optionalAttendance.isPresent()) {
                attendanceRepository.delete(optionalAttendance.get());
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attendance record with id " + id + " not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting attendance: " + e.getMessage());
        }
    }
}
