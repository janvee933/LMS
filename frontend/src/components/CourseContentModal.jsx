import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, BookOpen, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import api from '../api/axios';
import Button from './Button';
import './CourseContentModal.css';

const CourseContentModal = ({ isOpen, onClose, course }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null); // Selected for quiz management
  const [quizzes, setQuizzes] = useState([]);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // Success feedback state
  const [newLesson, setNewLesson] = useState({ title: '', content: '', content_url: '', video_url: '', lesson_order: 1 });
  const [contentFile, setContentFile] = useState(null);
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

  useEffect(() => {
    if (isOpen) {
      fetchLessons();
      setActiveLesson(null);
      setQuizzes([]);
    }
  }, [isOpen, course?.id]);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
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

      const res = await api.post('/lessons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setLessons([...lessons, res.data.data]);
        setActiveLesson(res.data.data); // Auto-select new lesson
        setIsAddingLesson(false);
        setNewLesson({ title: '', content: '', content_url: '', video_url: '', lesson_order: lessons.length + 1 });
        setContentFile(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create lesson');
    }
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
    setActiveLesson(lesson);
    fetchQuizzes(lesson.id);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newQuiz.correct_answer) {
      alert('Please select the correct answer!');
      return;
    }
    try {
      const res = await api.post('/quizzes', { ...newQuiz, lesson_id: activeLesson.id });
      if (res.data.success) {
        setQuizzes([...quizzes, res.data.data]);
        setSaveStatus('Success! Question added to this lesson.');
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
              <form className="mini-form glass" onSubmit={handleCreateLesson}>
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

                <Button type="submit" size="sm">Save Lesson</Button>
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
                    <span className="l-meta" style={{ display: 'flex', gap: '8px' }}>
                      {lesson.video_url && <span style={{ opacity: 0.7 }}>Video</span>}
                      {lesson.content_url && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>PDF</span>}
                      {!lesson.video_url && !lesson.content_url && <span style={{ opacity: 0.5 }}>Text Only</span>}
                    </span>
                  </div>
                  <div className="lesson-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleDeleteLesson(lesson.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              )) : (
                <div className="empty-mini">No lessons yet.</div>
              )}
            </div>
          </div>

          <div className="quiz-main-view">
            {activeLesson ? (
              <>
                <div className="active-lesson-details glass animate-slide-up" style={{ padding: '25px', margin: '0 30px 20px', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span className="lesson-label" style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Lesson Preview</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Instructor View</span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '10px' }}>{activeLesson.title}</h4>
                  <div className="lesson-description-preview" style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', maxHeight: '150px', overflowY: 'auto', paddingRight: '10px' }}>
                    {activeLesson.content ? (
                      activeLesson.content.split('\n').map((p, i) => (
                        <p key={i} style={{ marginBottom: '8px' }}>{p}</p>
                      ))
                    ) : (
                      <em style={{ color: '#475569' }}>No description provided for this lesson.</em>
                    )}
                  </div>
                  
                  {activeLesson.content_url && (
                    <div className="lesson-material-preview" style={{ 
                      marginTop: '20px', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      overflow: 'hidden'
                    }}>
                      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PDF Preview</span>
                         <a 
                            href={activeLesson.content_url} 
                            target="_blank" rel="noreferrer"
                            style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}
                          >
                            Open in New Tab
                          </a>
                      </div>
                      <iframe 
                        src={activeLesson.content_url} 
                        title="Instructor PDF Preview"
                        style={{ width: '100%', height: '350px', border: 'none' }}
                      />
                    </div>
                  )}
                </div>

                <div className="quiz-header">
                  <div>
                    <span className="lesson-label">Lesson {lessons.findIndex(l => l.id === activeLesson.id) + 1}</span>
                    <h4>{activeLesson.title} Quizzes</h4>
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
                      <p>No questions added to this lesson's quiz yet.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="select-lesson-prompt">
                <BookOpen size={60} />
                <h3>Select a lesson to manage its quizzes</h3>
                <p>Add lessons on the left, then click them to add assessment questions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentModal;
