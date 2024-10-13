const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path'); // 추가: HTML 파일 경로를 설정하기 위해 필요
const pool = require('../config/database');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken.js');

// // '/timetables' 경로 정의 (HTML 파일 반환)
// router.get('/timetables', authenticateToken, (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'views', 'timetable.html'));
// });

// // 타임테이블 유지 (이 부분은 원래대로 유지)
// router.get('/', authenticateToken, (req, res) => {
//     res.render('timetables', { user: req.user });
// });

router.get('/:email', authenticateToken, async (req, res) => {
    const email = req.params.email;
    try {
    const postResult = await pool.query('SELECT * FROM events WHERE user_email = $1', [email]);
    // res.render('timetables', { user: req.user });
    res.json(postResult.rows);
    } catch (err) {
        console.error('Error loading comments:', err);
        res.status(500).send('Error loading comments');}});

// 타임테이블 작성 처리
// Timetable creation handler
// Timetable creation handler
router.post('/create', authenticateToken, async (req, res) => {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    
    let { email, title, day, startday, endday, starttime, endtime, location, init_date, semester } = req.body;
    
    console.log('Parsed data:');
    console.log('Email:', email);
    console.log('Title:', title);
    console.log('Day:', day);
    console.log('Start Day:', startday);
    console.log('End Day:', endday);
    console.log('Start Time:', starttime);
    console.log('End Time:', endtime);
    console.log('Location:', location);
    console.log('Init Date:', init_date);
    console.log('Semester:', semester);

    // Set init_date to current date and time if not provided
    if (!init_date) {
        init_date = new Date().toISOString();
        console.log('Init Date was not provided. Set to current date and time:', init_date);
    }

    // Validate required fields
    if (!email || !title || !day || !starttime || !endtime || !semester) {
        console.log('Validation failed: Missing required fields');
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        console.log('Attempting to insert data into database...');
        const result = await pool.query(
            'INSERT INTO events (user_email, title, day, startday, endday, starttime, endtime, location, init_date, semester) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [email, title, day, startday, endday, starttime, endtime, location, init_date, semester]
        );
        
        console.log('Data inserted successfully. Inserted row:', JSON.stringify(result.rows[0], null, 2));
        
        res.status(201).json({ message: 'Schedule created successfully', data: result.rows[0] });
    } catch (err) {
        console.error('Database error:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Error creating schedule', error: err.message });
    }
});
// 이벤트 삭제 처리
router.delete('/:id', authenticateToken, async (req, res) => {
    const eventId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM events WHERE id = $1', [eventId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).send('Error deleting event');
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
    const eventId = req.params.id;
    const { title, day, startday, endday, semester, startTime, endTime, location, init_date } = req.body;

    try {
        // 이벤트 존재 여부 확인
        const postCheck = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
        if (!postCheck.rows.length) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // 이벤트 수정
        const result = await pool.query(
            `UPDATE events 
            SET
                title = COALESCE($1, title),
                day = COALESCE($2, day), 
                startday = COALESCE($3, startday), 
                endday = COALESCE($4, endday), 
                semester = COALESCE($5, semester),
                startTime = COALESCE($6, startTime), 
                endTime = COALESCE($7, endTime), 
                location = COALESCE($8, location), 
                init_date = COALESCE($9, init_date) 
            WHERE id = $10 `,
            [title, day, startday, endday, semester, startTime, endTime, location, init_date, eventId]
        );

        res.status(200).json({ message: 'Event updated successfully', event: result.rows[0] });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ message: 'Error updating event', error: err.message });
    }
});


module.exports = router;