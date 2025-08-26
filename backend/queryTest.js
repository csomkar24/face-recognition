const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db/dbConnect');
const queries = require('./db/queries');

app.use(express.json());

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for face data
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.post('/insertStudent', (req, res) => {
    const { USN, Name, FaceData } = req.body;
    db.query(queries.insertStudent, [USN, Name, FaceData], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to Insert student.' });
        }

        const response = await res.json(results);
        res.status(201).send(response);
    });
})

app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
})