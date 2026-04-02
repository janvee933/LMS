const pool = require('../config/db');

const Progress = {
  async updateStatus(user_id, lesson_id, status) {
    const [rows] = await pool.execute(
        'INSERT INTO progress (user_id, lesson_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
        [user_id, lesson_id, status || 'completed', status || 'completed']
    );
    return rows;
  },

  async getProgressByCourse(user_id, course_id) {
    const [rows] = await pool.execute(
      `SELECT p.*, l.title FROM progress p 
       JOIN lessons l ON p.lesson_id = l.id 
       WHERE p.user_id = ? AND l.course_id = ?`,
      [user_id, course_id]
    );
    return rows;
  },
};

module.exports = Progress;
