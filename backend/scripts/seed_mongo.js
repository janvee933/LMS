const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Course = require('../models/course');
const User = require('../models/user');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await mongoose.model('Course').deleteMany({});
    await mongoose.model('User').deleteMany({ email: { $ne: 'admin@lms.com' } });
    console.log('Cleared existing data.');

    // Find or create an instructor
    let instructor = await User.findByEmail('admin@lms.com');
    if (!instructor) {
      console.log('Creating admin user...');
      const userId = await User.create({
        name: 'Admin User',
        email: 'admin@lms.com',
        password: 'password123',
        role: 'admin'
      });
      instructor = await User.findById(userId);
    }

    const courses = [
      // Computer Science
      {
        title: 'Algorithms & Data Structures',
        description: 'The foundation of computer science and technical interviews.',
        instructor_id: instructor.id,
        price: 89.99,
        level: 'Intermediate',
        category: 'Computer Science',
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80'
      },
      {
        title: 'Operating Systems Pro',
        description: 'Deep dive into process management, memory and file systems.',
        instructor_id: instructor.id,
        price: 75.00,
        level: 'Advanced',
        category: 'Computer Science',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
      },
      // Data Science
      {
        title: 'Python for Data Science',
        description: 'Master Python, Pandas, and Machine Learning from scratch.',
        instructor_id: instructor.id,
        price: 149.99,
        level: 'Beginner',
        category: 'Data Science',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda546697a?w=800&q=80'
      },
      {
        title: 'Deep Learning with PyTorch',
        description: 'Build neural networks for computer vision and NLP.',
        instructor_id: instructor.id,
        price: 199.99,
        level: 'Advanced',
        category: 'Data Science',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80'
      },
      // Information Technology
      {
        title: 'Cybersecurity Fundamentals',
        description: 'Protect systems and networks from digital attacks.',
        instructor_id: instructor.id,
        price: 110.00,
        level: 'Beginner',
        category: 'Information Technology',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'
      },
      {
        title: 'AWS Cloud Architect',
        description: 'Master AWS services and prepare for the Cloud Practitioner exam.',
        instructor_id: instructor.id,
        price: 159.00,
        level: 'Intermediate',
        category: 'Information Technology',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
      },
      // Personal Development
      {
        title: 'Public Speaking Masterclass',
        description: 'Communicate with confidence and influence your audience.',
        instructor_id: instructor.id,
        price: 49.99,
        level: 'Beginner',
        category: 'Personal Development',
        thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80'
      },
      {
        title: 'Time Management for Leaders',
        description: 'Optimize your productivity and focus on what truly matters.',
        instructor_id: instructor.id,
        price: 35.00,
        level: 'Beginner',
        category: 'Personal Development',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'
      }
    ];

    for (const c of courses) {
      await Course.create(c);
    }

    console.log('Seeded 3 courses successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
