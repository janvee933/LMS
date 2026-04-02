const pool = require('../config/db');

const Certificate = {
  async issue(user_id, course_id, certificate_id) {
    const [result] = await pool.execute(
      'INSERT INTO certificates (user_id, course_id, certificate_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE certificate_id = certificate_id',
      [user_id, course_id, certificate_id]
    );
    return result.insertId;
  },

  async getByUser(user_id) {
    const [rows] = await pool.execute(
      `SELECT cert.*, c.title as course_title, c.thumbnail as course_thumbnail 
       FROM certificates cert 
       JOIN courses c ON cert.course_id = c.id 
       WHERE cert.user_id = ?`,
      [user_id]
    );
    return rows;
  },

  async getByUserAndCourse(user_id, course_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
    return rows[0];
  }
};

module.exports = Certificate;
