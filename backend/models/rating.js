const pool = require('../config/db');

const Rating = {
  async create({ course_id, user_id, rating, review }) {
    const [result] = await pool.execute(
      'INSERT INTO course_ratings (course_id, user_id, rating, review) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, review = ?',
      [course_id, user_id, rating, review, rating, review]
    );
    return result.insertId || true;
  },

  async getByCourse(course_id) {
    const [rows] = await pool.execute(
      'SELECT r.*, u.name as user_name FROM course_ratings r JOIN users u ON r.user_id = u.id WHERE r.course_id = ? ORDER BY r.created_at DESC',
      [course_id]
    );
    return rows;
  },

  async getAverage(course_id) {
    const [rows] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM course_ratings WHERE course_id = ?',
      [course_id]
    );
    return {
      avg_rating: parseFloat(rows[0].avg_rating) || 0,
      count: rows[0].count || 0
    };
  },

  async getUserRating(course_id, user_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM course_ratings WHERE course_id = ? AND user_id = ?',
      [course_id, user_id]
    );
    return rows[0] || null;
  }
};

module.exports = Rating;
