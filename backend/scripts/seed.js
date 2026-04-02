const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 1. Create Admin/Instructor User
    const [userResult] = await pool.execute(
      'INSERT IGNORE INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['Admin Instructor', 'admin@lms.com', hashedPassword, '1112223334', 'admin']
    );

    let instructorId;
    if (userResult.insertId) {
      instructorId = userResult.insertId;
    } else {
      const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@lms.com']);
      instructorId = rows[0].id;
    }

    // 2. Create Sample Courses
    const courses = [
      {
        title: 'Complete Web Development Bootcamp 2026',
        description: 'Learn HTML, CSS, JavaScript, React, Node, and more from scratch.',
        price: 99.99,
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Advanced UI/UX Design Masterclass',
        description: 'Master Figma and design principles for modern web & mobile apps.',
        price: 79.99,
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600'
      },
      {
        title: 'Data Science & Machine Learning with Python',
        description: 'Deep dive into data analysis, visualization, and predictive modeling.',
        price: 129.99,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600'
      }
    ];

    for (const course of courses) {
      await pool.execute(
        'INSERT IGNORE INTO courses (title, description, instructor_id, price, thumbnail) VALUES (?, ?, ?, ?, ?)',
        [course.title, course.description, instructorId, course.price, course.thumbnail]
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
