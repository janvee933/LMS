const pool = require('../config/db');

const Lesson = {
  async create({ course_id, title, content, content_url, video_url, lesson_order }) {
    const [result] = await pool.execute(
      'INSERT INTO lessons (course_id, title, content, content_url, video_url, lesson_order) VALUES (?, ?, ?, ?, ?, ?)',
      [course_id, title, content || null, content_url || null, video_url || null, lesson_order]
    );
    return result.insertId;
  },

  async getByCourse(course_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC',
      [course_id]
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM lessons WHERE id = ?', [id]);
    return rows[0];
  },

  async update(id, { title, content, content_url, video_url, lesson_order }) {
    const [result] = await pool.execute(
      'UPDATE lessons SET title = ?, content = ?, content_url = ?, video_url = ?, lesson_order = ? WHERE id = ?',
      [title, content || null, content_url || null, video_url || null, lesson_order, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM lessons WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Lesson;
