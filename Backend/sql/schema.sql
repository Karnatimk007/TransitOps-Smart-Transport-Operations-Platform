-- ============================================
-- Create Database
-- ============================================

CREATE DATABASE IF NOT EXISTS transitops;
USE transitops;

-- ============================================
-- Roles
-- ============================================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Users
-- ============================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    role_id INT NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    profile_image VARCHAR(255),

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    last_login TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id)
    REFERENCES roles(id)
);

-- ============================================
-- Vehicles
-- ============================================

CREATE TABLE vehicles (

    id INT AUTO_INCREMENT PRIMARY KEY,

    registration_number VARCHAR(30) UNIQUE NOT NULL,

    vehicle_name VARCHAR(100),

    manufacturer VARCHAR(100),

    model VARCHAR(100),

    vehicle_year INT,

    vehicle_type ENUM(
        'Truck',
        'Van',
        'Mini Truck',
        'Container',
        'Bike'
    ),

    fuel_type ENUM(
        'Diesel',
        'Petrol',
        'CNG',
        'Electric'
    ),

    max_load_capacity DECIMAL(10,2),

    odometer DECIMAL(12,2),

    acquisition_cost DECIMAL(12,2),

    purchase_date DATE,

    status ENUM(
        'AVAILABLE',
        'ON_TRIP',
        'IN_SHOP',
        'RETIRED'
    ) DEFAULT 'AVAILABLE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Drivers
-- ============================================

CREATE TABLE drivers (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE,

    license_number VARCHAR(50) UNIQUE,

    license_category VARCHAR(20),

    license_expiry DATE,

    safety_score DECIMAL(5,2),

    status ENUM(
        'AVAILABLE',
        'ON_TRIP',
        'OFF_DUTY',
        'SUSPENDED'
    ) DEFAULT 'AVAILABLE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
);

-- ============================================
-- Routes
-- ============================================

CREATE TABLE routes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    source VARCHAR(150),

    destination VARCHAR(150),

    distance DECIMAL(10,2),

    estimated_duration INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Trips
-- ============================================

CREATE TABLE trips (

    id INT AUTO_INCREMENT PRIMARY KEY,

    trip_code VARCHAR(30) UNIQUE,

    route_id INT,

    vehicle_id INT,

    driver_id INT,

    cargo_weight DECIMAL(10,2),

    planned_distance DECIMAL(10,2),

    actual_distance DECIMAL(10,2),

    start_time DATETIME,

    end_time DATETIME,

    revenue DECIMAL(12,2),

    status ENUM(
        'DRAFT',
        'DISPATCHED',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'DRAFT',

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(route_id)
    REFERENCES routes(id),

    FOREIGN KEY(vehicle_id)
    REFERENCES vehicles(id),

    FOREIGN KEY(driver_id)
    REFERENCES drivers(id),

    FOREIGN KEY(created_by)
    REFERENCES users(id)
);

-- ============================================
-- Trip Status History
-- ============================================

CREATE TABLE trip_status_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    trip_id INT,

    status VARCHAR(50),

    updated_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(trip_id)
    REFERENCES trips(id),

    FOREIGN KEY(updated_by)
    REFERENCES users(id)
);

-- ============================================
-- Maintenance
-- ============================================

CREATE TABLE maintenance_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    vehicle_id INT,

    maintenance_type ENUM(
        'SERVICE',
        'ENGINE',
        'TYRE',
        'BATTERY',
        'OIL_CHANGE',
        'OTHER'
    ),

    description TEXT,

    maintenance_cost DECIMAL(12,2),

    start_date DATE,

    end_date DATE,

    status ENUM(
        'ACTIVE',
        'COMPLETED'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(vehicle_id)
    REFERENCES vehicles(id)
);

-- ============================================
-- Fuel Logs
-- ============================================

CREATE TABLE fuel_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    vehicle_id INT,

    trip_id INT,

    odometer_reading DECIMAL(12,2),

    fuel_liters DECIMAL(10,2),

    fuel_cost DECIMAL(12,2),

    fuel_station VARCHAR(100),

    fuel_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(vehicle_id)
    REFERENCES vehicles(id),

    FOREIGN KEY(trip_id)
    REFERENCES trips(id)
);

-- ============================================
-- Expenses
-- ============================================

CREATE TABLE expenses (

    id INT AUTO_INCREMENT PRIMARY KEY,

    vehicle_id INT,

    trip_id INT,

    expense_type ENUM(
        'TOLL',
        'MAINTENANCE',
        'PARKING',
        'OTHER'
    ),

    amount DECIMAL(12,2),

    description TEXT,

    receipt_url VARCHAR(255),

    expense_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(vehicle_id)
    REFERENCES vehicles(id),

    FOREIGN KEY(trip_id)
    REFERENCES trips(id)
);

-- ============================================
-- Vehicle Documents
-- ============================================

CREATE TABLE vehicle_documents (

    id INT AUTO_INCREMENT PRIMARY KEY,

    vehicle_id INT,

    document_type VARCHAR(50),

    file_url VARCHAR(255),

    expiry_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(vehicle_id)
    REFERENCES vehicles(id)
);

-- ============================================
-- Notifications
-- ============================================

CREATE TABLE notifications (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    title VARCHAR(150),

    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
);

-- ============================================
-- Audit Logs
-- ============================================

CREATE TABLE audit_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    action VARCHAR(100),

    table_name VARCHAR(100),

    record_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
);