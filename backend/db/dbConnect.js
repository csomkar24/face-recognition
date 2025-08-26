const mysql = require('mysql2');

// Database configuration - use environment variables for production
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'face_attendance_system',
  port: process.env.DB_PORT || 3306,
  // Additional configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool for better performance
const connection = mysql.createPool(dbConfig);

// Test the connection
connection.getConnection((err, conn) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Database connected successfully');
  conn.release();
});

module.exports = connection;