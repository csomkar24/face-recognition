// Student related queries
const insertStudent = `
  INSERT INTO students (USN, Name, FaceData) 
  VALUES (?, ?, ?)
`;

const getStudentByUSN = `
  SELECT * FROM students WHERE USN = ?
`;

const getAllStudents = `
  SELECT USN, Name FROM students
`;

const getStudentsBySemester = `
  SELECT COUNT(*) as total_students 
  FROM students 
  WHERE Semester = CAST(? AS UNSIGNED)
`;

// Session related queries
const createSession = `
  INSERT INTO sessions (SessionDate, Semester) 
  VALUES (?, ?)
`;

const getSessionById = `
  SELECT * FROM sessions WHERE SessionID = ?
`;

const getTodaysSessions = `
  SELECT * FROM sessions WHERE SessionDate = CURDATE()
`;

// Attendance related queries
const markAttendance = `
  INSERT INTO attendance (SessionID, USN, AttendanceStatus) 
  VALUES (?, ?, ?)
`;

const getAttendanceBySession = `
  SELECT s.USN, s.Name, a.AttendanceStatus 
  FROM students s
  LEFT JOIN attendance a ON s.USN = a.USN AND a.SessionID = ?
  ORDER BY s.USN
`;

const getAttendanceSummary = `
  SELECT 
    COUNT(CASE WHEN a.AttendanceStatus = 'Present' THEN 1 END) AS present_count,
    COUNT(CASE WHEN a.AttendanceStatus = 'Absent' THEN 1 END) AS absent_count,
    (SELECT COUNT(*) FROM students) AS total_students
  FROM attendance a
  WHERE a.SessionID = ?
`;

const getStudentAttendanceReport = `
  SELECT 
    s.SessionDate, 
    se.Semester,
    a.AttendanceStatus
  FROM attendance a
  JOIN sessions s ON a.SessionID = s.SessionID
  JOIN sessions se ON s.SessionID = se.SessionID
  WHERE a.USN = ?
  ORDER BY s.SessionDate DESC
`;

// New queries added:

const getSessionsByDate = `
  SELECT * FROM sessions 
  WHERE DATE(SessionDate) = ?
  ORDER BY SessionID DESC
`;

const checkAttendanceExists = `
  SELECT * FROM attendance 
  WHERE SessionID = ? AND USN = ?
`;

const updateAttendance = `
  UPDATE attendance 
  SET AttendanceStatus = ? 
  WHERE SessionID = ? AND USN = ?
`;

const getSessionsByDateAndSemester = `
  SELECT * FROM sessions 
  WHERE DATE(SessionDate) = ? AND Semester = ?
  ORDER BY SessionID DESC
`;

module.exports = {
  // Existing queries...
  insertStudent,
  getStudentByUSN,
  getAllStudents,
  getStudentsBySemester,
  createSession,
  getSessionById,
  getTodaysSessions,
  markAttendance,
  getAttendanceBySession,
  getAttendanceSummary,
  getStudentAttendanceReport,
  
  // New queries:
  getSessionsByDate,
  checkAttendanceExists,
  updateAttendance,
  getSessionsByDateAndSemester
};
