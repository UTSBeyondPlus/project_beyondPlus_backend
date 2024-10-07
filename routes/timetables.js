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
router.post('/create', authenticateToken, async (req, res) => {
    const { email, title, day, startday, endday, starttime, endtime, location, init_date, semester } = req.body;
    
console.log(req.body);

    try {
        await pool.query(
            'INSERT INTO events (user_email, title, day, startday, endday, starttime, endtime, location, init_date, semester) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [email, title, day, startday, endday, starttime, endtime, location, init_date, semester]
        );
        // 데이터를 삽입한 후, 필요한 페이지로 리다이렉트 또는 응답을 전송합니다.
        // res.redirect('/timetables'); // 또는 원하는 다른 페이지로 리다이렉트
        //또는 
        res.status(201).send('Schedule created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating schedule');
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