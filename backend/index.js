const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('./config/db');
const express = require('express');
console.log('Restarting server to clear any caching issues...');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

const cookieParser = require('cookie-parser');

const app = express();

app.set('trust proxy', 1);

// Disable caching for all API routes to prevent stale progress data
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  next();
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true, // Dynamically allow all origins (useful for multiple Vercel/Netlify links)
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  frameguard: false,
}));
app.use(morgan('dev'));

app.use('/api', apiLimiter);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const lessonRoutes = require('./routes/lesson.routes');
const progressRoutes = require('./routes/progress.routes');
const certificateRoutes = require('./routes/certificate.routes');
const quizRoutes = require('./routes/quiz.routes');
const ratingRoutes = require('./routes/rating.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const doubtRoutes = require('./routes/doubt.routes');

const errorHandler = require('./middleware/errorHandle');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/doubts', doubtRoutes);

app.get('/', (req, res) => {
  res.send('LMS Backend API is Running from backend folder...');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
