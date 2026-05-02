const Course = require('../models/course');

const createCourse = async (req, res) => {
  try {
    const { title, description, price, level, category, thumbnail: thumbnailBody, video_url } = req.body;
    const instructor_id = req.user.id;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : thumbnailBody;

    const courseId = await Course.create({
      title,
      description,
      instructor_id,
      price,
      level,
      category,
      thumbnail,
      video_url,
    });

    const course = await Course.getById(courseId);

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.getAll();
    console.log('--- DEBUG: getCourses ---');
    console.log('Sending Courses Count:', courses.length);
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error('getCourses Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const course = await Course.getById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { title, description, price, level, category, thumbnail: thumbnailBody, video_url } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : thumbnailBody;

    const courseExist = await Course.getById(req.params.id);
    if (!courseExist) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership
    if (courseExist.instructor_id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    const updated = await Course.update(req.params.id, {
      title: title || courseExist.title,
      description: description || courseExist.description,
      price: price || courseExist.price,
      level: level || courseExist.level,
      category: category || courseExist.category,
      thumbnail: thumbnail || courseExist.thumbnail,
      video_url: video_url || courseExist.video_url,
    });

    const refreshedCourse = await Course.getById(req.params.id);

    res.status(200).json({ success: true, data: refreshedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const courseExist = await Course.getById(req.params.id);
    if (!courseExist) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership
    if (courseExist.instructor_id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await Course.delete(req.params.id);

    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.id;
    
    // Total Courses
    const courses = await Course.getAll();
    const myCourses = courses.filter(c => c.instructor_id.toString() === instructorId.toString());
    
    // For now, let's return simplified stats or use models
    // In a real migration, we'd add aggregation methods to models
    const Enrollment = require('../models/enrollment');
    const myEnrollments = await Enrollment.getByInstructor(instructorId);
    
    const activeStudents = new Set(myEnrollments.map(e => e.student_id?.toString())).size;
    const totalRevenue = myCourses.reduce((sum, c) => sum + (c.price || 0), 0); // Simplified

    res.status(200).json({
      success: true,
      stats: {
        totalCourses: myCourses.length,
        activeStudents: activeStudents || 0,
        avgRating: 4.8, 
        totalRevenue: totalRevenue || 0
      },
      allCourses: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getInstructorStats,
};
