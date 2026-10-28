CREATE DATABASE IF NOT EXISTS timbangan_nasi CHARACTER SET utf8mb4;
USE timbangan_nasi;

CREATE TABLE IF NOT EXISTS batches (
  id VARCHAR(40) PRIMARY KEY,
  batch_number INT NOT NULL UNIQUE,
  batch_name VARCHAR(120) NOT NULL,
  operator_name VARCHAR(80) NOT NULL,
  rice_type VARCHAR(80) NOT NULL,
  total_crates INT NOT NULL,
  total_gross_kg DECIMAL(10,2) NOT NULL,
  total_tare_kg DECIMAL(10,2) NOT NULL,
  total_net_kg DECIMAL(10,2) NOT NULL,
  total_net_ton DECIMAL(10,3) NOT NULL,
  avg_net_kg DECIMAL(10,2) NOT NULL,
  portion_grams DECIMAL(8,2) NOT NULL DEFAULT 150,
  total_portions INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  completed_at BIGINT NOT NULL,
  notes TEXT NULL
);

-- batch_id NULL = krat aktif (belum disimpan ke riwayat)
CREATE TABLE IF NOT EXISTS crates (
  id VARCHAR(40) PRIMARY KEY,
  batch_id VARCHAR(40) NULL,
  crate_number INT NOT NULL,
  gross_weight DECIMAL(8,2) NOT NULL,
  tare_weight DECIMAL(8,2) NOT NULL,
  net_weight DECIMAL(8,2) NOT NULL,
  rice_type VARCHAR(80) NOT NULL,
  notes TEXT NULL,
  timestamp BIGINT NOT NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id TINYINT PRIMARY KEY DEFAULT 1,
  default_tare DECIMAL(5,2) NOT NULL,
  operator_name VARCHAR(80) NOT NULL,
  auto_increment_crate BOOLEAN NOT NULL,
  default_batch_prefix VARCHAR(80) NOT NULL
);
INSERT IGNORE INTO settings VALUES (1, 1.50, 'Operator Dapur', TRUE, 'Batch Produksi');
