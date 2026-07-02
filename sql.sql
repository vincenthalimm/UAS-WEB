DROP DATABASE IF EXISTS keuangan;
CREATE DATABASE keuangan;
USE keuangan;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    socket_id VARCHAR(100),
    token VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE catatan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keterangan VARCHAR(100) NOT NULL,
    jumlah INT NOT NULL,
    tipe ENUM('masuk', 'keluar') NOT NULL,
    kategori VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password, role, is_active) VALUES 
('admin@gmail.com', 'admin123', 'admin', TRUE),
('user1@gmail.com', 'user123', 'user', TRUE);

INSERT INTO catatan (keterangan, jumlah, tipe, kategori) VALUES
('Gaji Bulanan', 5000000, 'masuk', 'pekerjaan'),
('Makan Siang', 50000, 'keluar', 'makanan'),
('Transportasi', 20000, 'keluar', 'transportasi'),
('Bonus', 1000000, 'masuk', 'bonus'),
('Belanja', 150000, 'keluar', 'kebutuhan');

TRUNCATE TABLE sessions;

SELECT * FROM users;
SELECT * FROM catatan;