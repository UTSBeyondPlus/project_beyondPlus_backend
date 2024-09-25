const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const multer = require('multer');
const router = express.Router();

// 업로드된 파일을 저장할 디렉터리 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './UploadFiles/'); // 파일을 저장할 경로 (예: 'uploads/' 폴더)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`; // 파일 이름에 고유한 식별자를 추가
    cb(null, `${uniqueSuffix}-${file.originalname}`); // 고유한 파일 이름 설정
  }
});

const upload = multer({ // Multer 설정
    storage,
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf']; // 허용된 MIME 타입 목록
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // 허용된 파일 타입인 경우 업로드 진행
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.')); // MIME 타입이 허용되지 않으면 오류 반환
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
  });

// 게시판 페이지 - 기존 게시글 목록 표시
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY upload_time DESC');
    res.json({ posts: result.rows, user: req.user });
  } catch (err) {
    console.error('Error loading posts:', err);
    res.status(500).send('Error loading posts');
  }
});

router.get('/:postId', authenticateToken, async (req, res) => {
  const postId = req.params.postId;
  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error loading posts:', err);
    res.status(500).send('Error loading posts');
  }
});

// 게시물 작성 처리
router.post('/create', authenticateToken, upload.single('file'), async (req, res) => {
  
  const { email, title, content} = req.body;
  const file = req.file; // 업로드된 파일

  try {
    const result = await pool.query(
      'INSERT INTO posts (user_email, title, content) VALUES ($1, $2, $3) RETURNING id',
      [email, title, content]
    );

    if (file) {console.log('Uploaded file:', file.filename);}

    const postId = result.rows[0].id;
    res.json({message: postId});
    // 올바른 리다이렉트 경로로 이동
    // res.redirect(`/comments/${postId}`);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Error creating post');
  }
});

// 게시물 삭제 처리
router.delete('/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;

  if (isNaN(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    await pool.query('BEGIN');

    const deleteComments = 'DELETE FROM comments WHERE post_id = $1';
    const deletePost = 'DELETE FROM posts WHERE id = $1 RETURNING id';

    await pool.query(deleteComments, [postId]);
    const { rowCount } = await pool.query(deletePost, [postId]);

    if (!rowCount) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Post not found' });
    }

    await pool.query('COMMIT');
    res.json({ message: 'Post and related comments deleted successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error deleting post and comments:', err.message);
    res.status(500).send('Error deleting post and related data');
  }
});

// 게시물 수정 처리 (PATCH 요청)
router.patch('/:postId', authenticateToken, async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const { title, content } = req.body;

  if (isNaN(postId) || !title || !content) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const postCheck = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
    if (!postCheck.rows.length) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, postId]
    );
    res.json({ message: 'Post updated successfully', post: result.rows[0] });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
});

module.exports = router;