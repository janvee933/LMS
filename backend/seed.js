const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seed = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Connected to database for seeding...');

        const salt = await bcrypt.genSalt(10);
        const hashedAdminPassword = await bcrypt.hash('admin123', salt);
        const hashedStudentPassword = await bcrypt.hash('password123', salt);
        const hashedInstructorPassword = await bcrypt.hash('password123', salt);

        // Clear existing users to avoid conflicts (optional, but safer for a fresh start)
        // await connection.execute('DELETE FROM users');

        // Upsert Admin
        await connection.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?',
            ['Admin User', 'admin@test.com', hashedAdminPassword, '9999999999', 'admin', hashedAdminPassword, 'admin']
        );
        console.log('Admin user seeded: admin@test.com / admin123');

        // Upsert Student
        await connection.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?',
            ['Test Student', 'test@test.com', hashedStudentPassword, '8888888888', 'student', hashedStudentPassword, 'student']
        );
        console.log('Student user seeded: test@test.com / password123');

        // Upsert Instructor
        await connection.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?',
            ['Test Instructor', 'instructor@test.com', hashedInstructorPassword, '7777777777', 'instructor', hashedInstructorPassword, 'instructor']
        );
        console.log('Instructor user seeded: instructor@test.com / password123');

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Seeding failed:', error.message);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
};

seed();
