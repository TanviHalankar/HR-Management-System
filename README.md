# HR Management System (Microservices)

A comprehensive HRMS built with Spring Boot Microservices architecture, featuring a modern React frontend. The system manages Users, Employees, Payroll, and Attendance with centralized configuration, service discovery, API Gateway, and a beautiful Material-UI frontend.

## 🏗️ Architecture

### Technology Stack
- **Backend:** Spring Boot 3, Spring Cloud 2023.x, MySQL, JPA, Spring Cloud Gateway
- **Frontend:** React 18, Material-UI (MUI), Axios, React Router
- **Infrastructure:** Docker, Docker Compose, Eureka Service Discovery, Spring Cloud Config

### Microservices

1. **Config Server** (`config-server`)
   - Port: `8888`
   - Purpose: Centralized externalized configuration for all services

2. **Service Registry** (`eureka-server`)
   - Port: `8761`
   - Purpose: Service discovery for all microservices
   - UI: `http://localhost:8761`

3. **API Gateway** (`api-gateway`)
   - Port: `8080`
   - Purpose: Single entry point with CORS handling; routes to services via Eureka
   - Routes:
     - `/users/**` → `lb://user-service`
     - `/employees/**` → `lb://employee-service`
     - `/payroll/**` → `lb://payroll-service`
     - `/attendance/**` → `lb://attendance-service`

4. **Domain Services**
   - `user-service` (Port `8101`): Manage users
   - `employee-service` (Port `8102`): Manage employees
   - `payroll-service` (Port `8103`): Manage payroll records
   - `attendance-service` (Port `8104`): Manage attendance records

5. **Databases (MySQL)**
   - Each service has its own database: `userdb`, `employeedb`, `payrolldb`, `attendancedb`
   - JPA: `ddl-auto=update` (auto-manages schema on startup)

6. **Frontend**
   - Port: `3000` (or `3001`)
   - React SPA with Material-UI components
   - Pages: Dashboard, Employees, Attendance, Payroll

---

## 🚀 Quick Start Guide

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Node.js** (v16 or higher) and **npm** installed
- **Git** installed

---

## 📋 Running the Project

### Option 1: Using Docker Compose (Recommended)

#### Step 1: Start Backend Services
```bash
# Clone the repository (if not already done)
git clone https://github.com/TanviHalankar/HR-Management-System.git
cd HR-Management-System

# Build and start all backend services and databases
docker-compose up -d --build

# Check if all containers are running
docker-compose ps
```

**Wait 1-2 minutes** for all services to start up completely.

#### Step 2: Verify Backend Services
1. **Eureka Dashboard:** Open `http://localhost:8761` in your browser
   - You should see all services registered (user-service, employee-service, payroll-service, attendance-service, api-gateway)

2. **API Gateway:** Test the gateway at `http://localhost:8080`
   - Example: `http://localhost:8080/employees` (should return empty array `[]` or employee data)

#### Step 3: Start Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the React development server
npm start
```

The frontend will open automatically at `http://localhost:3000` (or `http://localhost:3001` if 3000 is in use).

---

### Option 2: Manual Setup (Without Docker)

#### Step 1: Start MySQL Databases
Start 4 MySQL instances on different ports:
- `userdb`: Port `3310`
- `employeedb`: Port `3307`
- `payrolldb`: Port `3308`
- `attendancedb`: Port `3309`

#### Step 2: Start Backend Services (in order)
```bash
# 1. Start Config Server
cd config-server
mvn spring-boot:run

# 2. Start Eureka Server (in new terminal)
cd eureka-server
mvn spring-boot:run

# 3. Start Domain Services (in separate terminals)
cd user-service
mvn spring-boot:run

cd employee-service
mvn spring-boot:run

cd payroll-service
mvn spring-boot:run

cd attendance-service
mvn spring-boot:run

# 4. Start API Gateway (in new terminal)
cd api-gateway
mvn spring-boot:run
```

#### Step 3: Start Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🎯 Using the Application

### Frontend Features

1. **Dashboard** (`http://localhost:3000/`)
   - Overview of total employees, attendance records, payroll records, and total salary paid
   - Real-time statistics with auto-refresh

2. **Employees** (`http://localhost:3000/employees`)
   - View all employees in a table
   - Add, Edit, Delete employees
   - Beautiful card-based UI

3. **Attendance** (`http://localhost:3000/attendance`)
   - Mark attendance for employees with Present/Absent buttons
   - Select time slots (Full Day, Morning, Afternoon, Half Day, Custom)
   - View attendance records by date

4. **Payroll** (`http://localhost:3000/payroll`)
   - Manage payroll for each employee
   - Set basic pay, bonuses, and deductions
   - Automatic net salary calculation
   - Use employee's current salary as starting point

---

## 🔌 API Endpoints

All endpoints can be accessed via:
- **Direct Service:** `http://localhost:8XXX/service-path`
- **API Gateway:** `http://localhost:8080/service-path` (Recommended)

### User Service (`/users`)
- `GET /users` - List all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

**Example POST:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "ADMIN",
  "password": "secret"
}
```

### Employee Service (`/employees`)
- `GET /employees` - List all employees
- `GET /employees/{id}` - Get employee by ID
- `POST /employees` - Create employee
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Delete employee

**Example POST:**
```json
{
  "name": "John Doe",
  "designation": "Software Engineer",
  "department": "IT",
  "salary": 75000
}
```

### Payroll Service (`/payroll`)
- `GET /payroll` - List all payroll records
- `GET /payroll/{id}` - Get payroll by ID
- `POST /payroll` - Create payroll record
- `PUT /payroll/{id}` - Update payroll record
- `DELETE /payroll/{id}` - Delete payroll record

**Example POST:**
```json
{
  "employeeId": 1,
  "basicPay": 60000,
  "bonus": 5000,
  "deductions": 2000,
  "netSalary": 63000
}
```

### Attendance Service (`/attendance`)
- `GET /attendance` - List all attendance records
- `GET /attendance/{id}` - Get attendance by ID
- `POST /attendance` - Create attendance record
- `PUT /attendance/{id}` - Update attendance record
- `DELETE /attendance/{id}` - Delete attendance record

**Example POST:**
```json
{
  "employeeId": 1,
  "date": "2024-10-01",
  "checkInTime": "09:00",
  "checkOutTime": "17:00"
}
```

---

## 🐳 Docker Commands

### Useful Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start (after code changes)
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# View logs for specific service
docker-compose logs -f api-gateway
docker-compose logs -f employee-service

# Stop specific service
docker-compose stop api-gateway

# Remove all containers and volumes
docker-compose down -v
```

---

## 🔧 Configuration

### CORS Configuration
CORS is handled centrally by the API Gateway. The frontend (running on `localhost:3000` or `localhost:3001`) is automatically whitelisted.

### Database Configuration
All services connect to MySQL databases with:
- Username: `root`
- Password: `root`
- Auto-create schema: Enabled (`ddl-auto=update`)

### Port Configuration
- **Backend Services:**
  - Config Server: `8888`
  - Eureka Server: `8761`
  - API Gateway: `8080`
  - User Service: `8101`
  - Employee Service: `8102`
  - Payroll Service: `8103`
  - Attendance Service: `8104`
- **Databases:**
  - User DB: `3310`
  - Employee DB: `3307`
  - Payroll DB: `3308`
  - Attendance DB: `3309`
- **Frontend:**
  - React App: `3000` (or `3001`)

---

## 🐛 Troubleshooting

### Common Issues

1. **Services not starting in Docker**
   ```bash
   # Check logs
   docker-compose logs -f [service-name]
   
   # Rebuild without cache
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **CORS Errors**
   - Ensure API Gateway is running on port `8080`
   - Check that frontend is accessing `http://localhost:8080` (not direct service ports)
   - Verify `CorsConfig.java` in `api-gateway` is configured correctly

3. **Database Connection Issues**
   - Ensure MySQL containers are running: `docker-compose ps`
   - Wait 30-60 seconds after starting Docker containers for databases to initialize

4. **Eureka Services Not Showing**
   - Wait 1-2 minutes after starting services
   - Check Eureka dashboard: `http://localhost:8761`
   - Verify services are using correct Eureka URL: `http://eureka-server:8761/eureka/`

5. **Frontend Not Connecting**
   - Verify API Gateway is running: `http://localhost:8080/employees`
   - Check browser console for errors
   - Ensure `axiosConfig.js` has correct base URL: `http://localhost:8080`

---

## 📁 Project Structure

```
HR-Management-System/
├── api-gateway/          # Spring Cloud Gateway
├── config-server/        # Spring Cloud Config Server
├── eureka-server/        # Eureka Service Discovery
├── user-service/         # User Management Service
├── employee-service/     # Employee Management Service
├── payroll-service/      # Payroll Management Service
├── attendance-service/   # Attendance Management Service
├── frontend/             # React Frontend Application
├── docker-compose.yml    # Docker Compose configuration
└── README.md            # This file
```

---

## 🎨 Frontend Features

- **Modern UI:** Material-UI components with gradient designs
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Real-time Updates:** Auto-refreshing dashboard and data
- **User-friendly:** Intuitive forms and navigation
- **CRUD Operations:** Full Create, Read, Update, Delete functionality

---

## 📝 Notes

- All services register to Eureka: `http://localhost:8761/eureka/`
- JPA auto-creates database schemas on first startup
- Actuator endpoints are available at `/actuator` for all services
- API Gateway handles CORS for frontend requests
- Services use Spring Cloud Config (can be disabled via `spring.cloud.config.enabled=false`)

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is open source and available for educational purposes.

---

## ✨ Author

**Tanvi Halankar**
- GitHub: [@TanviHalankar](https://github.com/TanviHalankar)

---

## 🙏 Acknowledgments

- Spring Boot and Spring Cloud communities
- Material-UI team
- React community
