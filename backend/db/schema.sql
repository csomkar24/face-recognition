-- Create the database
CREATE DATABASE IF NOT EXISTS face_attendance_system;
USE face_attendance_system;

-- Drop and recreate the students table
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    USN VARCHAR(20) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    FaceData TEXT NOT NULL,
    Semester INT
);

-- Drop and recreate the sessions table
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    SessionID INT AUTO_INCREMENT PRIMARY KEY,
    SessionDate DATE NOT NULL,
    Semester VARCHAR(10) NOT NULL
);

-- Drop and recreate the attendance table
DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
    AttendanceID INT AUTO_INCREMENT PRIMARY KEY,
    SessionID INT,
    USN VARCHAR(20),
    AttendanceStatus ENUM('Present', 'Absent') NOT NULL,
    FOREIGN KEY (SessionID) REFERENCES sessions(SessionID),
    FOREIGN KEY (USN) REFERENCES students(USN)
);

select * from students;
select * from sessions;
select * from attendance;

DROP DATABASE face_attendance_system;

ALTER TABLE students ADD COLUMN Semester INT;

UPDATE students SET Semester = 1 WHERE Semester IS NULL OR Semester = '';

SELECT USN, Name, Semester FROM students;

SELECT COUNT(*) as total_students FROM students WHERE Semester = 1;

DESCRIBE students;

SELECT * FROM students;