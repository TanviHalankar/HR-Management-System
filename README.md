# HR Management System (Microservices)

A simple HRMS built with Spring Boot and Spring Cloud, split into microservices for Users, Employees, Payroll, and Attendance with centralized configuration, service discovery, and an API Gateway.

- Stack: Spring Boot 3, Spring Cloud 2023.x, MySQL, JPA, Actuator
- Modules: config-server, eureka-server, api-gateway, user-service, employee-service, payroll-service, attendance-service
- Start order: config-server → eureka-server → services → api-gateway

---

## Architecture

- Config Server (`config-server`)
  - Port: `8888` (YAML) or `8889` (Properties). Prefer `8888`.
  - Git backend: `https://github.com/TanviHalankar/hr-configs` (branch `main`)
  - Purpose: Centralized externalized configuration for all services
  - Example endpoint: `GET http://localhost:8888/user-service/default`

- Service Registry (`eureka-server`)
  - Port: `8761`
  - Purpose: Service discovery for all microservices
  - UI: `http://localhost:8761`

- API Gateway (`api-gateway`)
  - Port: `8080`
  - Purpose: Single entry point; routes to services via Eureka
  - Routes:
    - `/users/**` → `lb://user-service`
    - `/employees/**` → `lb://employee-service`
    - `/payroll/**` → `lb://payroll-service`
    - `/attendance/**` → `lb://attendance-service`

- Domain Services
  - `user-service` (Port `8101`): Manage users
  - `employee-service` (Port `8102`): Manage employees
  - `payroll-service` (Port `8103`): Manage payroll records
  - `attendance-service` (Port `8104`): Manage attendance records

- Databases (MySQL)
  - `user-service`: `userdb`
  - `employee-service`: `employeedb`
  - `payroll-service`: `payrolldb`
  - `attendance-service`: `attendancedb`
  - JPA: `ddl-auto=update`, SQL logging enabled

- Observability
  - All services expose Spring Boot Actuator: `GET /actuator` (management endpoints set to `*`)

---

## Running Locally

1. Start `config-server` first.
2. Start `eureka-server`.
3. Start each domain service (`user-service`, `employee-service`, `payroll-service`, `attendance-service`).
4. Start `api-gateway`.

Each module is a Maven project; from that module folder you can run with Maven’s Spring Boot plugin.

---

## API Endpoints

All endpoints below are exposed directly on each service’s port and also via the `api-gateway` on port `8080` using the same path. For example:
- Direct: `http://localhost:8101/users`
- Gateway: `http://localhost:8080/users`

### User Service (`/users`) — Port `8101`
Entity: `User { id, name, email, role, password }`

- `GET /users` — List all users
- `GET /users/{id}` — Get user by ID
- `POST /users` — Create user
  - Example JSON:
    ```json
    {
      "name": "Alice",
      "email": "alice@example.com",
      "role": "ADMIN",
      "password": "secret"
    }
    ```
- `PUT /users/{id}` — Update user
  - Example JSON:
    ```json
    {
      "name": "Alice B",
      "email": "alice.b@example.com",
      "role": "MANAGER",
      "password": "new-secret"
    }
    ```
- `DELETE /users/{id}` — Delete user

### Employee Service (`/employees`) — Port `8102`
Entity: `Employee { id, name, designation, department, salary }`

- `GET /employees` — List all employees
- `GET /employees/{id}` — Get employee by ID
- `POST /employees` — Create employee
  - Example JSON:
    ```json
    {
      "name": "Bob",
      "designation": "Software Engineer",
      "department": "IT",
      "salary": 75000
    }
    ```
- `PUT /employees/{id}` — Update employee
  - Example JSON:
    ```json
    {
      "name": "Bob C",
      "designation": "Senior Engineer",
      "department": "IT",
      "salary": 90000
    }
    ```
- `DELETE /employees/{id}` — Delete employee

### Payroll Service (`/payroll`) — Port `8103`
Entity: `Payroll { id, employeeId, basicPay, bonus, deductions, netSalary }`

- `GET /payroll` — List all payrolls
- `GET /payroll/{id}` — Get payroll by ID
- `POST /payroll` — Create payroll
  - Example JSON:
    ```json
    {
      "employeeId": 1,
      "basicPay": 60000,
      "bonus": 5000,
      "deductions": 2000,
      "netSalary": 63000
    }
    ```
- `PUT /payroll/{id}` — Update payroll
  - Example JSON:
    ```json
    {
      "employeeId": 1,
      "basicPay": 62000,
      "bonus": 5500,
      "deductions": 2100,
      "netSalary": 65400
    }
    ```
- `DELETE /payroll/{id}` — Delete payroll

### Attendance Service (`/attendance`) — Port `8104`
Entity: `Attendance { id, employeeId, date, checkInTime, checkOutTime }`

- `GET /attendance` — List all attendance records
- `GET /attendance/{id}` — Get attendance record by ID
- `POST /attendance` — Create attendance record
  - Example JSON:
    ```json
    {
      "employeeId": 1,
      "date": "2024-10-01",
      "checkInTime": "09:15:00",
      "checkOutTime": "17:45:00"
    }
    ```
- `PUT /attendance/{id}` — Update attendance record
  - Example JSON:
    ```json
    {
      "employeeId": 1,
      "date": "2024-10-01",
      "checkInTime": "09:00:00",
      "checkOutTime": "18:00:00"
    }
    ```
- `DELETE /attendance/{id}` — Delete attendance record

---

## Gateway Paths

Use `http://localhost:8080` as the base URL to route via the API Gateway:
- `GET/POST/PUT/DELETE /users...` → `user-service`
- `GET/POST/PUT/DELETE /employees...` → `employee-service`
- `GET/POST/PUT/DELETE /payroll...` → `payroll-service`
- `GET/POST/PUT/DELETE /attendance...` → `attendance-service`

---

## Config Server Usage

- Base URL: `http://localhost:8888`
- Pattern: `/{application}/{profile}`
  - Example: `GET http://localhost:8888/user-service/default`
- All services import config: `spring.config.import=optional:configserver:`
- Bootstrap config example (from `user-service`):
  - `spring.cloud.config.uri=http://localhost:8888`
  - `spring.cloud.config.fail-fast=false`

---

## Health and Actuator

All services expose Actuator:
- `GET /actuator` — Index
- Common endpoints (depending on starter defaults): `/actuator/health`, `/actuator/info`, etc.
- Management exposure is set to `*` in application properties

---

## Notes

- All services register to Eureka: `http://localhost:8761/eureka/`
- MySQL credentials in services are `username=root`, `password=root` (adjust as needed)
- JPA `ddl-auto=update` will auto-manage schema on startup
- If `config-server` port conflicts, verify whether `application.yml` or `application.properties` is active; prefer `8888`
