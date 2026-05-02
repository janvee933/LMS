const Quiz = require('../models/quiz');
const Lesson = require('../models/lesson');
const Course = require('../models/course');

const createQuizQuestion = async (req, res) => {
  try {
    const { lesson_id, course_id, is_final, question, options, correct_answer } = req.body;

    let targetCourseId = course_id;

    if (lesson_id) {
      const lesson = await Lesson.getById(lesson_id);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }
      targetCourseId = lesson.course_id;
    }

    if (!targetCourseId) {
      return res.status(400).json({ success: false, message: 'Course ID or Lesson ID is required' });
    }

    const course = await Course.getById(targetCourseId);
    if (String(course.instructor_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this course' });
    }

    const quizId = await Quiz.create({
      lesson_id: lesson_id || null,
      course_id: targetCourseId,
      is_final: is_final || false,
      question,
      options,
      correct_answer
    });

    const quiz = await Quiz.getById(quizId);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLessonQuizzes = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const quizzes = await Quiz.getByLesson(lessonId);
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correct_answer } = req.body;

    const quizExist = await Quiz.getById(id);
    if (!quizExist) {
      return res.status(404).json({ success: false, message: 'Quiz question not found' });
    }

    const lesson = await Lesson.getById(quizExist.lesson_id);
    const course = await Course.getById(lesson ? lesson.course_id : quizExist.course_id);
    if (String(course.instructor_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this course' });
    }

    await Quiz.update(id, { question, options, correct_answer });
    const refreshed = await Quiz.getById(id);
    res.status(200).json({ success: true, data: refreshed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const quizExist = await Quiz.getById(id);
    if (!quizExist) {
      return res.status(404).json({ success: false, message: 'Quiz question not found' });
    }

    const lesson = await Lesson.getById(quizExist.lesson_id);
    const course = await Course.getById(lesson ? lesson.course_id : quizExist.course_id);
    if (String(course.instructor_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
    }

    await Quiz.delete(id);
    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFinalQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.getFinalQuizByCourse(courseId);
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuizStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const result = await Quiz.getResult(userId, courseId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitFinalQuiz = async (req, res) => {
  try {
    const { courseId, answers } = req.body;
    const userId = req.user.id;

    // 1. Check existing attempts
    const existing = await Quiz.getResult(userId, courseId);
    if (existing && existing.attempts_count >= 3 && existing.status !== 'passed') {
      return res.status(403).json({ success: false, message: 'Maximum attempts (3) reached. Please contact support.' });
    }

    // 2. Fetch only final questions to calculate score
    const quizzes = await Quiz.getFinalQuizByCourse(courseId);
    if (quizzes.length === 0) {
      return res.status(400).json({ success: false, message: 'No final assessment questions found for this course.' });
    }

    let correctCount = 0;
    quizzes.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const scorePercent = (correctCount / quizzes.length) * 100;
    const passed = scorePercent >= 65;

    // 3. Save result
    const result = await Quiz.saveResult({
      user_id: userId,
      course_id: courseId,
      score: scorePercent,
      passed: passed
    });

    res.status(200).json({
      success: true,
      data: {
        score: scorePercent,
        correct_count: correctCount,
        total_questions: quizzes.length,
        passed,
        attempts: result.attempts,
        status: result.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const grantExtraAttempt = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    // Authorization check: Only instructor of this course or admin can grant attempts
    const course = await Course.getById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (Number(course.instructor_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to grant attempts for this course' });
    }

    const success = await Quiz.grantExtraAttempt(userId, courseId);
    if (success) {
      res.status(200).json({ success: true, message: 'Extra attempt granted successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Could not grant extra attempt. Student may have no existing attempts.' });
    }
  } catch (error) {
    console.error('grantExtraAttempt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createQuizQuestion,
  getLessonQuizzes,
  updateQuizQuestion,
  deleteQuizQuestion,
  getFinalQuiz,
  submitFinalQuiz,
  getQuizStatus,
  grantExtraAttempt
};
