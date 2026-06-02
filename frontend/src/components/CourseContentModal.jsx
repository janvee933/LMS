import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, BookOpen, AlertCircle, CheckCircle, HelpCircle, Award, Play } from 'lucide-react';
import api from '../api/axios';
import Button from './Button';
import Loader from './Loader';
import './CourseContentModal.css';

const CourseContentModal = ({ isOpen, onClose, course }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null); // Selected for quiz management
  const [isManagingFinalQuiz, setIsManagingFinalQuiz] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // Success feedback state
  const [newLesson, setNewLesson] = useState({ title: '', content: '', content_url: '', video_url: '', lesson_order: 1 });
  const [contentFile, setContentFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [newQuiz, setNewQuiz] = useState({ 
    question: '', 
    options: ['', '', '', ''], 
    correct_answer: '' 
  });

  const fetchLessons = async () => {
    if (!course?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/lessons/course/${course.id}`);
      if (res.data.success) {
        setLessons(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching lessons', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (lessonId) => {
    try {
      const res = await api.get(`/quizzes/lesson/${lessonId}`);
      if (res.data.success) {
        setQuizzes(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching quizzes', err);
    }
  };

  const fetchFinalQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quizzes/course/${course.id}`);
      if (res.data.success) {
        setQuizzes(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching final quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLessons();
      setActiveLesson(null);
      setIsManagingFinalQuiz(false);
      setQuizzes([]);
    }
  }, [isOpen, course?.id]);

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('course_id', course.id);
      formData.append('title', newLesson.title);
      formData.append('content', newLesson.content);
      formData.append('content_url', newLesson.content_url);
      formData.append('video_url', newLesson.video_url);
      formData.append('lesson_order', newLesson.lesson_order);
      if (contentFile) {
        formData.append('content_file', contentFile);
      }
      if (videoFile) {
        formData.append('video_file', videoFile);
      }

      let res;
      if (isEditingLesson) {
        res = await api.put(`/lessons/${editingLessonId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        res = await api.post('/lessons', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (res.data.success) {
        if (isEditingLesson) {
          setLessons(lessons.map(l => l.id === editingLessonId ? res.data.data : l));
          if (activeLesson?.id === editingLessonId) setActiveLesson(res.data.data);
        } else {
          setLessons([...lessons, res.data.data]);
          setActiveLesson(res.data.data); // Auto-select new lesson
        }
        setIsAddingLesson(false);
        resetLessonForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditLesson = (lesson) => {
    setIsAddingLesson(true);
    setIsEditingLesson(true);
    setEditingLessonId(lesson.id);
    setNewLesson({
      title: lesson.title,
      content: lesson.content || '',
      content_url: lesson.content_url || '',
      video_url: lesson.video_url || '',
      lesson_order: lesson.lesson_order
    });
    // Scroll to the form
    document.querySelector('.mini-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetLessonForm = () => {
    setIsEditingLesson(false);
    setEditingLessonId(null);
    setNewLesson({ title: '', content: '', content_url: '', video_url: '', lesson_order: lessons.length + 1 });
    setContentFile(null);
    setVideoFile(null);
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const res = await api.delete(`/lessons/${id}`);
      if (res.data.success) {
        setLessons(lessons.filter(l => l.id !== id));
        if (activeLesson?.id === id) setActiveLesson(null);
      }
    } catch (err) {
      alert('Failed to delete lesson');
    }
  };

  const handleSelectLesson = (lesson) => {
    setIsManagingFinalQuiz(false);
    setActiveLesson(lesson);
    fetchQuizzes(lesson.id);
  };

  const handleSelectFinalQuiz = () => {
    setIsManagingFinalQuiz(true);
    setActiveLesson(null);
    fetchFinalQuizzes();
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newQuiz.correct_answer) {
      alert('Please select the correct answer!');
      return;
    }
    try {
      const payload = { 
        ...newQuiz, 
        course_id: course.id,
        is_final: isManagingFinalQuiz 
      };
      
      if (!isManagingFinalQuiz) {
        payload.lesson_id = activeLesson.id;
      }

      const res = await api.post('/quizzes', payload);
      if (res.data.success) {
        setQuizzes([...quizzes, res.data.data]);
        setSaveStatus(`Success! Question added to ${isManagingFinalQuiz ? 'Final Assessment' : 'this lesson'}.`);
        setTimeout(() => setSaveStatus(null), 3000);
        setNewQuiz({ question: '', options: ['', '', '', ''], correct_answer: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add quiz question');
    }
  };

  const handleDeleteQuiz = async (id) => {
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="content-modal-overlay animate-fade-in" onClick={onClose}>
      {isSaving && <Loader message="Uploading and saving lesson content..." />}
      <div className="content-modal-container glass animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="content-modal-header">
          <div>
            <span className="course-label">Managing Content For</span>
            <h2>{course?.title}</h2>
          </div>
          <button className="close-x" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="content-modal-body">
          <div className="lessons-sidebar">
            <div className="sidebar-header">
              <h3>Lessons List</h3>
              <button 
                className="add-small-btn" 
                onClick={() => setIsAddingLesson(!isAddingLesson)}
              >
                {isAddingLesson ? <X size={16} /> : <Plus size={16} />}
              </button>
            </div>

            {isAddingLesson && (
              <form className="mini-form glass" onSubmit={handleSubmitLesson}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#6366f1' }}>{isEditingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h4>
                  {isEditingLesson && (
                    <button type="button" onClick={resetLessonForm} style={{ fontSize: '0.7rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  )}
                </div>
                <input 
                  placeholder="Lesson Title" required
                  value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                />
                <textarea 
                  placeholder="Lesson Description / Paragraph (Optional)" 
                  value={newLesson.content} 
                  onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                  style={{ 
                    width: '100%', 
                    minHeight: '100px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'white', 
                    borderRadius: '8px', 
                    padding: '10px',
                    fontSize: '14px',
                    marginBottom: '10px'
                  }}
                />
                <input 
                  placeholder="Video URL" 
                  value={newLesson.video_url} onChange={e => setNewLesson({...newLesson, video_url: e.target.value})}
                />
                
                <div className="file-upload-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Reading Material (PDF)</label>
                  <input 
                    type="file" 
                    key={isEditingLesson ? `pdf-edit-${editingLessonId}` : 'pdf-new'}
                    accept=".pdf"
                    onChange={e => setContentFile(e.target.files[0])}
                    style={{ 
                      fontSize: '12px', 
                      color: '#94a3b8', 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '5px', 
                      borderRadius: '4px', 
                      width: '100%' 
                    }}
                  />
                </div>

                <div className="file-upload-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Lesson Video (MP4)</label>
                  <input 
                    type="file" 
                    key={isEditingLesson ? `video-edit-${editingLessonId}` : 'video-new'}
                    accept="video/mp4"
                    onChange={e => setVideoFile(e.target.files[0])}
                    style={{ 
                      fontSize: '12px', 
                      color: '#94a3b8', 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '5px', 
                      borderRadius: '4px', 
                      width: '100%' 
                    }}
                  />
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Recommended: Max 100MB per lesson</div>
                </div>

                <Button 
                  type="submit" 
                  size="sm" 
                  variant={isEditingLesson ? "secondary" : "primary"}
                  disabled={isSaving}
                >
                  {isSaving ? 'Processing...' : (isEditingLesson ? 'Update Lesson' : 'Save Lesson')}
                </Button>
              </form>
            )}

            <div className="lesson-items">
              {lessons.length > 0 ? lessons.map((lesson, idx) => (
                <div 
                  key={lesson.id} 
                  className={`lesson-item ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                  onClick={() => handleSelectLesson(lesson)}
                >
                  <div className="lesson-rank">{idx + 1}</div>
                  <div className="lesson-info">
                    <span className="l-title">{lesson.title}</span>
                  </div>
                  <div className="lesson-actions" onClick={e => e.stopPropagation()}>
                    <button className="edit-lesson-btn" onClick={() => handleEditLesson(lesson)}><Edit2 size={14} /></button>
                    <button className="delete-lesson-btn" onClick={() => handleDeleteLesson(lesson.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              )) : (
                <div className="empty-mini">No lessons yet.</div>
              )}
            </div>

            <div 
              className={`lesson-item final-quiz-sidebar ${isManagingFinalQuiz ? 'active' : ''}`}
              onClick={handleSelectFinalQuiz}
              style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}
            >
              <div className="lesson-rank" style={{ background: '#fbbf24' }}><Award size={14} /></div>
              <div className="lesson-info">
                <span className="l-title" style={{ fontWeight: 'bold', color: '#fbbf24' }}>Final Assessment</span>
                <span className="l-meta" style={{ fontSize: '10px' }}>Course Graduation Quiz</span>
              </div>
            </div>
          </div>

          <div className="quiz-main-view">
            {activeLesson || isManagingFinalQuiz ? (
              <>
                {!isManagingFinalQuiz && activeLesson && (
                  <div className="lesson-preview-section" style={{ padding: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>Lesson Content Preview</h3>
                    </div>
                    {activeLesson.video_url && (
                      <div style={{ marginBottom: '20px' }}>
                        {activeLesson.video_url.toLowerCase().endsWith('.mp4') || activeLesson.video_url.startsWith('/uploads/') ? (
                          <video 
                            src={activeLesson.video_url} 
                            controls 
                            controlsList="nodownload"
                            style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000', objectFit: 'contain' }} 
                          />
                        ) : (
                          <div style={{ padding: '15px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <a href={activeLesson.video_url} target="_blank" rel="noreferrer" style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                              <Play size={16} /> Watch External Video
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    {activeLesson.content_url && (
                      <div style={{ marginBottom: '20px' }}>
                        <a 
                          href={activeLesson.content_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: '#6366f1', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <BookOpen size={16} /> View Reading Material (PDF)
                        </a>
                      </div>
                    )}
                    {activeLesson.content && (
                      <div style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                        {activeLesson.content}
                      </div>
                    )}
                    {!activeLesson.video_url && !activeLesson.content_url && !activeLesson.content && (
                       <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>No content added for this lesson yet.</p>
                    )}
                  </div>
                )}

                <div className="quiz-header">
                  <div>
                    <span className="lesson-label">{isManagingFinalQuiz ? 'Course Level' : `Lesson ${lessons.findIndex(l => l.id === activeLesson.id) + 1}`}</span>
                    <h4>{isManagingFinalQuiz ? 'Final Assessment Questions' : `${activeLesson.title} Quizzes`}</h4>
                  </div>
                  <Button size="sm" onClick={() => setIsAddingQuiz(!isAddingQuiz)}>
                    {isAddingQuiz ? 'Cancel' : <><Plus size={14} /> Add Question</>}
                  </Button>
                </div>

                {isAddingQuiz && (
                  <form className="quiz-form glass animate-slide-up" onSubmit={handleCreateQuiz}>
                    <div className="form-group-full">
                      <label>Question Text</label>
                      <input 
                        required placeholder="What is the result of...?"
                        value={newQuiz.question} onChange={e => setNewQuiz({...newQuiz, question: e.target.value})}
                      />
                    </div>
                    <div className="options-grid">
                      {newQuiz.options.map((opt, i) => (
                        <div key={i} className="opt-input">
                          <label>Option {String.fromCharCode(65 + i)}</label>
                          <input 
                            required value={opt} 
                            placeholder={`Enter answer ${String.fromCharCode(65 + i)}`}
                            onChange={e => {
                              const opts = [...newQuiz.options];
                              opts[i] = e.target.value;
                              setNewQuiz({...newQuiz, options: opts});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="form-group-full">
                      <label>Correct Answer</label>
                      <select 
                        required value={newQuiz.correct_answer}
                        onChange={e => setNewQuiz({...newQuiz, correct_answer: e.target.value})}
                      >
                        <option value="">Select the correct option...</option>
                        {newQuiz.options.map((opt, i) => (
                          opt && <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Button type="submit" variant="primary" size="sm">Add Question to Quiz</Button>
                      {saveStatus && <span className="animate-fade-in" style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}><CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {saveStatus}</span>}
                    </div>
                  </form>
                )}

                <div className="quiz-questions-list">
                  {quizzes.length > 0 ? quizzes.map((q, idx) => (
                    <div key={q.id} className="quiz-q-card glass">
                      <div className="q-card-header">
                        <span className="q-number">Q{idx + 1}</span>
                        <p>{q.question}</p>
                        <button className="del-q" onClick={() => handleDeleteQuiz(q.id)}><Trash2 size={16} /></button>
                      </div>
                      <div className="q-options-display">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`q-opt ${opt === q.correct_answer ? 'correct' : ''}`}>
                            <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                            <span>{opt}</span>
                            {opt === q.correct_answer && <CheckCircle size={14} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="empty-quiz">
                      <HelpCircle size={40} />
                      <p>No questions added to this {isManagingFinalQuiz ? 'assessment' : "lesson's quiz"} yet.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="select-lesson-prompt">
                <BookOpen size={60} />
                <h3>Select a lesson or Final Assessment to manage quizzes</h3>
                <p>Add lessons on the left, then click them or the Final Assessment button to add questions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentModal;
