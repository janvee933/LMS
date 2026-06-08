const Doubt = require('../models/doubt');
const Course = require('../models/course');

const createDoubt = async (req, res) => {
  try {
    const { course_id, message } = req.body;
    const user_id = req.user.id;

    if (!course_id || !message) {
      return res.status(400).json({ success: false, message: 'Course ID and message are required' });
    }

    const course = await Course.getById(course_id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await Doubt.create({
      user_id,
      course_id,
      instructor_id: course.instructor_id,
      message
    });

    res.status(201).json({ success: true, message: 'Doubt submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInstructorDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.getByInstructor(req.user.id);
    const formatted = doubts.map(d => ({
      id: d._id,
      student_name: d.user_id?.name,
      student_email: d.user_id?.email,
      course_title: d.course_id?.title,
      message: d.message,
      status: d.status,
      created_at: d.created_at
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.getAllAdmin();
    const formatted = doubts.map(d => ({
      id: d._id,
      student_name: d.user_id?.name,
      student_email: d.user_id?.email,
      course_title: d.course_id?.title,
      instructor_name: d.instructor_id?.name,
      message: d.message,
      status: d.status,
      created_at: d.created_at
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoubtStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['open', 'answered', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await Doubt.updateStatus(id, status);
    res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDoubt,
  getInstructorDoubts,
  getAdminDoubts,
  updateDoubtStatus
};
