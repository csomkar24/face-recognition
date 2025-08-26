const express = require('express');
const router = express.Router();
const db = require('../db/dbConnect');
const queries = require('../db/queries');

// Create a new session
router.post('/sessions', (req, res) => {
  const { semester } = req.body;

  if (!semester) {
    return res.status(400).json({ error: 'Semester is required' });
  }

  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  db.query(queries.createSession, [currentDate, semester], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.status(201).json({
      message: 'Session created successfully',
      sessionId: results.insertId
    });
  });
});

// Get today's sessions
router.get('/sessions/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  db.query(queries.getSessionsByDate, [today], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    res.status(200).json(results);
  });
});

// Get sessions by date
router.get('/sessions/by-date/:date', (req, res) => {
  const date = req.params.date;

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  db.query(queries.getSessionsByDate, [date], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch sessions for the specified date' });
    }

    res.status(200).json(results);
  });
});

// Get sessions by date and semester
router.post('/sessions/by-date', (req, res) => {
  const { date, semester } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  if (!semester) {
    // If semester is not provided, fallback to date only
    db.query(queries.getSessionsByDate, [date], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch sessions for the specified date' });
      }
      res.status(200).json(results);
    });
  } else {
    db.query(queries.getSessionsByDateAndSemester, [date, semester], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch sessions for the specified date and semester' });
      }
      res.status(200).json(results);
    });
  }
});

// Mark attendance for a student
router.post('/mark', (req, res) => {
  const { sessionId, usn, status } = req.body;

  if (!sessionId || !usn || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate status value
  const validStatuses = ['present', 'absent', 'excused'];
  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid status value. Use present, absent, or excused' });
  }

  // First check if attendance record already exists
  db.query(queries.checkAttendanceExists, [sessionId, usn], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to check existing attendance' });
    }

    if (results.length > 0) {
      // Update existing record
      db.query(queries.updateAttendance, [status, sessionId, usn], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update attendance' });
        }

        res.status(200).json({ message: 'Attendance updated successfully' });
      });
    } else {
      // Check if the student exists
      db.query(queries.getStudentByUSN, [usn], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to check student' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }

        // Check if session exists
        db.query(queries.getSessionById, [sessionId], (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to check session' });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
          }

          // Mark attendance
          db.query(queries.markAttendance, [sessionId, usn, status], (err, results) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to mark attendance' });
            }

            res.status(201).json({ message: 'Attendance marked successfully' });
          });
        });
      });
    }
  });
});

// Get attendance for a session
router.get('/sessions/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;

  if (!sessionId || isNaN(parseInt(sessionId))) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  db.query(queries.getAttendanceBySession, [sessionId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance' });
    }

    res.status(200).json(results);
  });
});

// Get attendance summary for a session
router.get('/summary/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;

  if (!sessionId || isNaN(parseInt(sessionId))) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  db.query(queries.getAttendanceSummary, [sessionId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No data found for this session' });
    }

    res.status(200).json(results[0]);
  });
});

// Get attendance report for a student
router.get('/report/:usn', (req, res) => {
  const usn = req.params.usn;

  if (!usn) {
    return res.status(400).json({ error: 'Invalid USN' });
  }

  db.query(queries.getStudentAttendanceReport, [usn], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance report' });
    }

    res.status(200).json(results);
  });
});

// Get total students for a semester
router.get('/students/count/:semester', (req, res) => {
  const semester = req.params.semester;
  console.log('Semester param:', semester);

  if (!semester || isNaN(parseInt(semester))) {
    return res.status(400).json({ error: 'Invalid semester' });
  }

  db.query(queries.getStudentsBySemester, [semester], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch student count', details: err.message });
    }

    res.status(200).json(results[0]);
  });
});

module.exports = router;
