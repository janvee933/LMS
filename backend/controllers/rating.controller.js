const Rating = require('../models/rating');
const Enrollment = require('../models/enrollment');

const submitRating = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user.id;

    if (!courseId || !rating) {
      return res.status(400).json({ success: false, message: 'Course ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Verify enrollment
    const enrolled = await Enrollment.isEnrolled(userId, courseId);
    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in the course to rate it.' });
    }

    await Rating.create({ course_id: courseId, user_id: userId, rating, review });
    
    res.status(200).json({ success: true, message: 'Thank you for your rating!' });
  } catch (error) {
    console.error('submitRating Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseRating = async (req, res) => {
  try {
    const { courseId } = req.params;
    const ratingData = await Rating.getAverage(courseId);
    res.status(200).json({ success: true, data: ratingData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserRating = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const rating = await Rating.getUserRating(courseId, userId);
    res.status(200).json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitRating, getCourseRating, getUserRating };
