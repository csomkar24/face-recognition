const express = require('express');
const router = express.Router();
const db = require('../db/dbConnect');
const queries = require('../db/queries');

console.log(router)

// Create a new session
router.post('/sessions', (req, res) => {
  const { semester } = req.body;
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  db.query(queries.createSession, [currentDate, semester], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    //test
    // console.log("Session created successfully")
    
    res.status(201).json({ 
      message: 'Session created successfully',
      sessionId: results.insertId 
    });
  });
});

// Get today's sessions
router.get('/sessions/today', (req, res) => {
  db.query(queries.getTodaysSessions, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    
    res.status(200).json(results);
  });
});

// Mark attendance for a student
router.post('/mark', (req, res) => {
  const { sessionId, usn, status } = req.body;
  
  if (!sessionId || !usn || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if the student exists
  db.query(queries.getStudentByUSN, [usn], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if session exists
    db.query(queries.getSessionById, [sessionId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Mark attendance
      db.query(queries.markAttendance, [sessionId, usn, status], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to mark attendance' });
        }
        
        res.status(201).json({ message: 'Attendance marked successfully' });
      });
    });
  });
});

// Get attendance for a session
router.get('/sessions/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  db.query(queries.getAttendanceBySession, [sessionId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch attendance' });
    }
    
    res.status(200).json(results);
  });
});

// Get attendance summary for a session
router.get('/summary/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  db.query(queries.getAttendanceSummary, [sessionId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
    
    res.status(200).json(results[0]);
  });
});

// Get attendance report for a student
router.get('/report/:usn', (req, res) => {
  const usn = req.params.usn;
  
  db.query(queries.getStudentAttendanceReport, [usn], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch attendance report' });
    }
    
    res.status(200).json(results);
  });
});

module.exports = router;