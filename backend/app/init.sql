-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hyrox_pacer_db;
USE hyrox_pacer_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    age INT,
    categoria_hyrox ENUM('Open', 'Pro', 'Doubles', 'Single Open', 'Single Pro', 'Doubles Men', 'Doubles Women', 'Doubles Pro') DEFAULT 'Open',
    role ENUM('admin', 'user', 'pro', 'coach') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    INDEX (email)
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tempo_alvo VARCHAR(50),
    json_resultados JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    share_token VARCHAR(100) UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (share_token)
);

-- Recovery logs table
CREATE TABLE IF NOT EXISTS recovery_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    intensity INT,
    protocol_name VARCHAR(255),
    duration_minutes INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed System Admin if not exists
-- Password is 'admin123' (hashed with bcrypt)
INSERT INTO users (email, password_hash, full_name, role, is_active)
SELECT 'admin@hyroxpacer.pro', '$2b$12$K.z8m.2Xy2.I4I1z/Xo.I.K.z8m.2Xy2.I4I1z/Xo.I', 'System Admin', 'admin', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@hyroxpacer.pro');
