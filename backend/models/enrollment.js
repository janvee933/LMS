const pool = require('../config/db');

const Enrollment = {
  async enroll(user_id, course_id) {
    const [result] = await pool.execute(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [user_id, course_id]
    );
    return result.insertId;
  },

  async isEnrolled(user_id, course_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
    return rows.length > 0;
  },

  async getByUser(user_id) {
    const [rows] = await pool.execute(
      `SELECT 
        e.*, 
        c.title, 
        c.thumbnail,
        qr.status as quiz_status,
        qr.attempts_count as quiz_attempts,
        qr.best_score as quiz_score,
        cert.issued_at as completed_at,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) 
         FROM progress p 
         JOIN lessons l ON p.lesson_id = l.id 
         WHERE p.user_id = e.user_id AND l.course_id = c.id AND p.status = 'completed') as completed_lessons
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id 
      LEFT JOIN quiz_results qr ON e.course_id = qr.course_id AND e.user_id = qr.user_id
      LEFT JOIN certificates cert ON e.user_id = cert.user_id AND e.course_id = cert.course_id
      WHERE e.user_id = ?`,
      [user_id]
    );
    // Add calculated progress percentage
    return rows.map(r => ({
      ...r,
      progress: r.total_lessons > 0 ? Math.round((r.completed_lessons / r.total_lessons) * 100) : 0
    }));
  },

  async getByInstructor(instructor_id) {
    const [rows] = await pool.execute(
      `SELECT 
        e.id, 
        u.id as student_id,
        u.name as student_name, 
        u.email as student_email, 
        c.title as course_title, 
        e.course_id,
        e.enrolled_at,
        cert.issued_at as completed_at,
        qr.attempts_count as quiz_attempts,
        qr.status as quiz_status,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) 
         FROM progress p 
         JOIN lessons l ON p.lesson_id = l.id 
         WHERE p.user_id = u.id AND l.course_id = c.id AND p.status = 'completed') as completed_lessons
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN certificates cert ON e.user_id = cert.user_id AND e.course_id = cert.course_id
      LEFT JOIN quiz_results qr ON e.course_id = qr.course_id AND e.user_id = qr.user_id
      WHERE c.instructor_id = ?
      ORDER BY student_name ASC, e.enrolled_at DESC`,
      [instructor_id]
    );
    return rows;
  },

  async getAllAdmin() {
    const [rows] = await pool.execute(
      `SELECT 
        e.id, 
        u.id as student_id,
        u.name as student_name, 
        u.email as student_email, 
        c.title as course_title, 
        e.course_id,
        e.enrolled_at,
        cert.issued_at as completed_at,
        qr.attempts_count as quiz_attempts,
        qr.status as quiz_status,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) 
         FROM progress p 
         JOIN lessons l ON p.lesson_id = l.id 
         WHERE p.user_id = u.id AND l.course_id = c.id AND p.status = 'completed') as completed_lessons
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN certificates cert ON e.user_id = cert.user_id AND e.course_id = cert.course_id
      LEFT JOIN quiz_results qr ON e.course_id = qr.course_id AND e.user_id = qr.user_id
      ORDER BY student_name ASC, e.enrolled_at DESC`
    );
    return rows;
  },
};

module.exports = Enrollment;
