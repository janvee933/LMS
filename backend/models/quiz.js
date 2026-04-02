const pool = require('../config/db');

const Quiz = {
  async create({ lesson_id, question, options, correct_answer }) {
    const [result] = await pool.execute(
      'INSERT INTO quizzes (lesson_id, question, options, correct_answer) VALUES (?, ?, ?, ?)',
      [lesson_id, question, JSON.stringify(options), correct_answer]
    );
    return result.insertId;
  },

  async getByLesson(lesson_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM quizzes WHERE lesson_id = ? ORDER BY created_at ASC',
      [lesson_id]
    );
    return rows.map(r => ({
      ...r, 
      options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options
    }));
  },

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM quizzes WHERE id = ?', [id]);
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r, 
      options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options
    };
  },

  async update(id, { question, options, correct_answer }) {
    const [result] = await pool.execute(
      'UPDATE quizzes SET question = ?, options = ?, correct_answer = ? WHERE id = ?',
      [question, JSON.stringify(options), correct_answer, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM quizzes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getFinalQuizByCourse(course_id) {
    const [rows] = await pool.execute(`
      SELECT q.* FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE l.course_id = ?
      ORDER BY l.lesson_order ASC, q.created_at ASC
    `, [course_id]);
    return rows.map(r => ({
      ...r, 
      options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options
    }));
  },

  async saveResult({ user_id, course_id, score, passed }) {
    const status = passed ? 'passed' : 'failed';
    const [existing] = await pool.execute(
      'SELECT * FROM quiz_results WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (existing[0]) {
      const attempts = existing[0].attempts_count + 1;
      const bestScore = Math.max(existing[0].best_score, score);
      const newStatus = existing[0].status === 'passed' ? 'passed' : status;
      
      await pool.execute(
        'UPDATE quiz_results SET attempts_count = ?, best_score = ?, status = ? WHERE id = ?',
        [attempts, bestScore, newStatus, existing[0].id]
      );
      return { attempts, status: newStatus };
    } else {
      await pool.execute(
        'INSERT INTO quiz_results (user_id, course_id, attempts_count, best_score, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, course_id, 1, score, status]
      );
      return { attempts: 1, status };
    }
  },

  async getResult(user_id, course_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM quiz_results WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
    return rows[0] || null;
  },

  async grantExtraAttempt(user_id, course_id) {
    const [existing] = await pool.execute(
      'SELECT attempts_count FROM quiz_results WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (existing[0] && existing[0].attempts_count > 0) {
      await pool.execute(
        'UPDATE quiz_results SET attempts_count = attempts_count - 1 WHERE user_id = ? AND course_id = ?',
        [user_id, course_id]
      );
      return true;
    }
    return false;
  }
};

module.exports = Quiz;
