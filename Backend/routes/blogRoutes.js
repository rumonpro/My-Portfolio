const express = require('express');
const router = express.Router();
const { getBlogs, createBlog, deleteBlog } = require('../controllers/blogController');

router.get('/', getBlogs);
router.post('/', createBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
