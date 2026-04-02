const Lesson = require('../models/lesson');
const Course = require('../models/course');

const createLesson = async (req, res) => {
  try {
    const { course_id, title, content, content_url, video_url, lesson_order } = req.body;

    const course = await Course.getById(course_id);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }

    
    if (Number(course.instructor_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add lessons to this course' });
    }

    const lessonId = await Lesson.create({
      course_id,
      title,
      content,
      content_url: req.file ? `/uploads/${req.file.filename}` : content_url,
      video_url,
      lesson_order,
    });

    const lesson = await Lesson.getById(lessonId);
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.getByCourse(req.params.courseId);
    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLesson = async (req, res) => {
    try {
        const lessonExist = await Lesson.getById(req.params.id);
        if (!lessonExist) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        const course = await Course.getById(lessonExist.course_id);
        if (Number(course.instructor_id) !== Number(req.user.id) && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Not authorized to update lessons in this course' });
        }

        const { title, content, content_url, video_url, lesson_order } = req.body;
        await Lesson.update(req.params.id, {
            title: title || lessonExist.title,
            content: content !== undefined ? content : lessonExist.content,
            content_url: req.file ? `/uploads/${req.file.filename}` : (content_url !== undefined ? content_url : lessonExist.content_url),
            video_url: video_url !== undefined ? video_url : lessonExist.video_url,
            lesson_order: lesson_order || lessonExist.lesson_order
        });

        const refreshed = await Lesson.getById(req.params.id);
        res.status(200).json({ success: true, data: refreshed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const lessonExist = await Lesson.getById(req.params.id);
        if (!lessonExist) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        const course = await Course.getById(lessonExist.course_id);
        if (Number(course.instructor_id) !== Number(req.user.id) && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Not authorized to delete lessons in this course' });
        }

        await Lesson.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Lesson deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createLesson, getLessons, updateLesson, deleteLesson };
