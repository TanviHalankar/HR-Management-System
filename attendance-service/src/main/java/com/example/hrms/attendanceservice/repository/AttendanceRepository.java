package com.example.hrms.attendanceservice.repository;

import com.example.hrms.attendanceservice.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
}
