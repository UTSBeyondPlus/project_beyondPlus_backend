const express = require('express');
const pool = require('../config/database');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken.js');

// 특정 게시글의 댓글 페이지 표시 및 좋아요 수 조회
router.get('/:postId', authenticateToken, async (req, res) => {
    const postId = req.params.postId;
    const userEmail = req.user.email;

    try {
        // 게시글 정보 가져오기
        const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
        if (postResult.rows.length === 0) {
            return res.status(404).send('Post not found');
        }

        // 댓글 정보 가져오기
        const commentsResult = await pool.query('SELECT * FROM comments WHERE post_id = $1', [postId]);

        // 각 댓글에 대한 좋아요 수를 계산
        const comments = await Promise.all(commentsResult.rows.map(async (comment) => {
            const likesResult = await pool.query('SELECT COUNT(*) AS likes_count FROM likes WHERE comment_id = $1', [comment.comment_id]);
            comment.likes = likesResult.rows[0].likes_count; // 각 댓글에 좋아요 수 추가
            return comment;
        }));

        // 현재 사용자가 좋아요를 누른 댓글 목록을 가져옴
        const likedCommentsResult = await pool.query('SELECT comment_id FROM likes WHERE user_email = $1', [userEmail]);
        const likedComments = likedCommentsResult.rows.map(row => row.comment_id); // 좋아요한 댓글 목록

        // reder
        // res.render('comments', {
        //     post: postResult.rows[0],
        //     comments: comments,
        //     user: req.user,
        //     likedComments: likedComments // 좋아요 상태 전달
        // });

        // 
        res.status(200).json({
            post: postResult.rows[0],
            comments: comments,
            user: req.user,
            likedComments: likedComments // 좋아요 상태 전달
        });
    } catch (err) {
        console.error('Error loading comments:', err);
        res.status(500).send('Error loading comments');
    }
});

// 댓글 저장 처리
router.post('/create', authenticateToken, async (req, res) => {
    const { email, post_id, content } = req.body;

    try {
        await pool.query('INSERT INTO comments (user_email, post_id, content) VALUES ($1, $2, $3)', [email, post_id, content]);
        // res.redirect(`/comments/${post_id}`);
        res.status(200).send({message:'comments upload.'})
    } catch (err) {
        console.error('Error saving comment:', err);
        res.status(500).send('Error saving comment');
    }
});

// 댓글 좋아요 추가 처리
router.post('/like/:commentId', authenticateToken, async (req, res) => {
    const commentId = req.params.commentId;
    const userEmail = req.user.email;

    try {
        // 사용자가 이미 좋아요를 눌렀는지 확인
        const likeResult = await pool.query('SELECT * FROM likes WHERE user_email = $1 AND comment_id = $2', [userEmail, commentId]);

        if (likeResult.rows.length > 0) {
            return res.status(400).send('You have already liked this comment.');
        }

        // likes 테이블에 좋아요 추가
        await pool.query('INSERT INTO likes (user_email, comment_id) VALUES ($1, $2)', [userEmail, commentId]);
        // res.redirect('back');  // 페이지를 새로고침하여 업데이트 반영
        res.status(200).send({message:`${userEmail} likes comment ${commentId}`});
    } catch (err) {
        console.error('Error liking comment:', err);
        res.status(500).send('Error liking comment');
    }
});

// 댓글 좋아요 취소 처리
router.post('/unlike/:commentId', authenticateToken, async (req, res) => {
    const commentId = req.params.commentId;
    const userEmail = req.user.email;

    try {
        // 사용자가 이미 좋아요를 눌렀는지 확인
        const likeResult = await pool.query('SELECT * FROM likes WHERE user_id = $1 AND comment_id = $2', [userEmail, commentId]);

        if (likeResult.rows.length === 0) {
            return res.status(400).send('You have not liked this comment.');
        }

        // likes 테이블에서 좋아요 기록 삭제
        await pool.query('DELETE FROM likes WHERE user_id = $1 AND comment_id = $2', [userEmail, commentId]);
        // res.redirect('back');  // 페이지를 새로고침하여 업데이트 반영
        res.status(200).send({message:`${userEmail} unlikes comment ${commentId}`});
    } catch (err) {
        console.error('Error unliking comment:', err);
        res.status(500).send('Error unliking comment');
    }
});

module.exports = router;
