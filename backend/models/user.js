const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create({ name, email, password, phone, role }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('User.create Params:', [name, email, hashedPassword, phone, role || 'student']);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role || 'student']
    );

    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    console.log('User.findById Param:', id);
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at, 
          (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) as enrollment_count,
          (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id) as created_courses_count
       FROM users u`
    );
    return rows;
  },

  async findByRole(role) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE role = ?',
      [role]
    );
    return rows;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = User;
