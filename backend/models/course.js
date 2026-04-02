const pool = require('../config/db');

const Course = {
  async create({ title, description, instructor_id, price, level, category, thumbnail, video_url }) {
    console.log('Course.create Params:', [title, description, instructor_id, price || 0, level || 'Beginner', category || 'Development', thumbnail, video_url]);
    const [result] = await pool.execute(
      'INSERT INTO courses (title, description, instructor_id, price, level, category, thumbnail, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, instructor_id, price || 0, level || 'Beginner', category || 'Development', thumbnail || null, video_url || null]
    );
    return result.insertId;
  },

  async getAll() {
    const [rows] = await pool.execute(
      `SELECT c.*, u.name as instructor_name, 
         (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
         COALESCE(r.avg_rating, 0) as average_rating,
         COALESCE(r.rating_count, 0) as rating_count
       FROM courses c 
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN (
         SELECT course_id, AVG(rating) as avg_rating, COUNT(*) as rating_count 
         FROM course_ratings 
         GROUP BY course_id
       ) r ON c.id = r.course_id`
    );
    return rows;
  },

  async getById(id) {
    console.log('Course.getById Param:', id);
    const [rows] = await pool.execute(
      `SELECT c.*, u.name as instructor_name, 
         (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
         COALESCE(r.avg_rating, 0) as average_rating,
         COALESCE(r.rating_count, 0) as rating_count
       FROM courses c 
       LEFT JOIN users u ON c.instructor_id = u.id 
       LEFT JOIN (
         SELECT course_id, AVG(rating) as avg_rating, COUNT(*) as rating_count 
         FROM course_ratings 
         GROUP BY course_id
       ) r ON c.id = r.course_id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  },

  async update(id, { title, description, price, level, category, thumbnail, video_url }) {
    const [result] = await pool.execute(
      'UPDATE courses SET title = ?, description = ?, price = ?, level = ?, category = ?, thumbnail = ?, video_url = ? WHERE id = ?',
      [title, description || null, price || 0, level || 'Beginner', category || 'Development', thumbnail || null, video_url || null, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Course;
