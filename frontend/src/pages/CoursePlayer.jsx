import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, FileText, CheckCircle, ChevronLeft, Loader2, Award, HelpCircle, Star } from 'lucide-react';
import Button from '../components/Button';
import CertificateModal from '../components/CertificateModal';
import api from '../api/axios';
import CourseRatingModal from '../components/CourseRatingModal';
import './CoursePlayer.css';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [courseInfo, setCourseInfo] = useState(null);
  const [lessonQuizzes, setLessonQuizzes] = useState([]); // Keep for backward compatibility or lesson-level views
  const [finalQuizQuestions, setFinalQuizQuestions] = useState([]);
  const [quizStatus, setQuizStatus] = useState(null);
  const [isFinalQuizMode, setIsFinalQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  
  const [lessonAnswers, setLessonAnswers] = useState({});
  const [lessonQuizSubmitted, setLessonQuizSubmitted] = useState(false);

  const fetchCertificate = async () => {
    try {
      const res = await api.get(`/certificates/${courseId}`);
      if (res.data.success) {
        setCertificateData(res.data.data);
      }
    } catch (err) {
      console.log('Certificate not yet available or error fetching');
    }
  };

  const fetchQuizData = async () => {
    try {
      const questionsRes = await api.get(`/quizzes/course/${courseId}`);
      if (questionsRes.data.success) {
        setFinalQuizQuestions(questionsRes.data.data || []);
      }
      const statusRes = await api.get(`/quizzes/status/${courseId}`);
      if (statusRes.data.success) {
        setQuizStatus(statusRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching quiz data', err);
    }
  };

  const handleSelectLesson = async (lesson) => {
    setIsFinalQuizMode(false);
    setCurrentLesson(lesson);
    setQuizResult(null);
    setSelectedAnswers({});
    setLessonAnswers({});
    setLessonQuizSubmitted(false);
    
    if (lesson?.id) {
      sessionStorage.setItem(`lastLesson_${courseId}`, lesson.id);
    }
    
    // For lesson-level view (if any quizzes remain in lessons)
    try {
      const res = await api.get(`/quizzes/lesson/${lesson.id}`);
      if (res.data.success) {
        setLessonQuizzes(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching lesson quiz', err);
    }
  };

  const handleSelectFinalQuiz = () => {
    if (completedLessons.length < (lessons?.length || 0)) {
      alert('Please complete all lessons before taking the final assessment.');
      return;
    }
    setIsFinalQuizMode(true);
    setCurrentLesson(null);
    setQuizResult(null);
    setSelectedAnswers({});
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch course details
      const courseRes = await api.get(`/courses/${courseId}`);
      if (courseRes.data.success) {
        setCourseInfo(courseRes.data.data);
      }

      await fetchQuizData();

        // Fetch lessons
        const lessonsRes = await api.get(`/lessons/course/${courseId}`);
        if (lessonsRes.data.success) {
          const lessonData = lessonsRes.data.data || [];
          setLessons(lessonData);
          if (lessonData.length > 0) {
            const savedLessonId = sessionStorage.getItem(`lastLesson_${courseId}`);
            const lastLesson = lessonData.find(l => String(l.id) === savedLessonId);
            handleSelectLesson(lastLesson || lessonData[0]);
          }
        }

      // Fetch user progress
      const progressRes = await api.get(`/progress/course/${courseId}`);
      if (progressRes.data.success) {
        const completedIds = (progressRes.data.data || [])
          .filter(p => p.status === 'completed')
          .map(p => p.lesson_id);
        const uniqueCompleted = [...new Set(completedIds)];
        setCompletedLessons(uniqueCompleted);
      }
    } catch (error) {
      console.error('Error fetching course player data', error);
      alert('Failed to load course content. Please ensure you are enrolled.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (completedLessons.length === lessons.length && lessons.length > 0) {
      fetchCertificate();
    }
  }, [completedLessons, quizStatus]);

  const handleLessonComplete = async () => {
    if (!currentLesson || updating) return;
    
    setUpdating(true);
    try {
      const res = await api.post('/progress/update', {
        lesson_id: currentLesson.id,
        status: 'completed'
      });

      if (res.data.success) {
        const newCompleted = [...new Set([...completedLessons, currentLesson.id])];
        setCompletedLessons(newCompleted);
        
        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
          handleSelectLesson(lessons[currentIndex + 1]);
        } else {
          // All lessons done -> Try to enable quiz
          handleSelectFinalQuiz();
        }
      }
    } catch (error) {
      alert('Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitFinalQuiz = async () => {
    if (Object.keys(selectedAnswers).length < finalQuizQuestions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setUpdating(true);
    try {
      const res = await api.post('/quizzes/submit', {
        courseId,
        answers: selectedAnswers
      });

      if (res.data.success) {
        setQuizResult(res.data.data);
        await fetchQuizData(); // Refresh attempts and status
        
        // Automatically open rating modal if passed
        if (res.data.data.passed) {
          setTimeout(() => setIsRatingOpen(true), 2000);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <Loader2 size={48} className="animate-spin" color="#6366f1" />
      </div>
    );
  }

  return (
    <div className="course-player-container animate-fade-in">
      <div className="player-sidebar">
        <div className="sidebar-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ChevronLeft size={18} /> <span>Back to Dashboard</span>
          </button>
          
          <div className="course-header-branding">
            <h2 className="sidebar-course-title">{courseInfo?.title}</h2>
            {courseInfo?.video_url && (
              <a 
                href={courseInfo.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="intro-video-pill"
              >
                <Play size={12} fill="currentColor" /> Watch Intro
              </a>
            )}
          </div>

            <div className="sidebar-progress-section">
               <div className="progress-stats">
                 <span>Course Progress</span>
                 <span className="percent-badge">{Math.round((completedLessons.length / lessons.length) * 100) || 0}%</span>
               </div>
               <div className="mini-progress-bar">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
                  ></div>
               </div>
               
               <button 
                 className="sidebar-rate-btn" 
                 onClick={() => setIsRatingOpen(true)}
                 title="Rate this Course"
               >
                 <Star size={14} fill="#fbbf24" color="#fbbf24" /> <span>Rate Course</span>
               </button>
            </div>
        </div>

        <ul className="lesson-list">
          {lessons.map((lesson, index) => (
              <li 
                key={lesson.id} 
                className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''} ${completedLessons.includes(lesson.id) ? 'completed' : ''}`}
                onClick={() => handleSelectLesson(lesson)}
                style={{ 
                  borderLeft: completedLessons.includes(lesson.id) ? '4px solid #10b981' : (currentLesson?.id === lesson.id ? '4px solid var(--primary)' : '4px solid transparent'),
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="lesson-status">
                  {completedLessons.includes(lesson.id) ? (
                    <CheckCircle size={18} color="#10b981" className="animate-pop" />
                  ) : (
                    <Play size={16} />
                  )}
                </div>
                <div className="lesson-info-box">
                  <span className="l-title-p" style={{ color: completedLessons.includes(lesson.id) ? '#10b981' : 'inherit' }}>
                    {index + 1}. {lesson.title}
                  </span>
                </div>
              </li>
          ))}

          {finalQuizQuestions.length > 0 && (
            <li 
              className={`lesson-item final-quiz-item ${isFinalQuizMode ? 'active' : ''} ${quizStatus?.status === 'passed' ? 'passed' : ''} ${completedLessons.length < lessons.length ? 'locked' : ''}`}
              onClick={handleSelectFinalQuiz}
            >
              <div className="lesson-status">
                {quizStatus?.status === 'passed' ? (
                  <CheckCircle size={18} color="#fbbf24" />
                ) : (
                  <HelpCircle size={18} />
                )}
              </div>
              <div className="lesson-info-box">
                <span className="l-title-p">Final Assessment</span>
                {completedLessons.length < lessons.length && <span className="quiz-badge-sidebar locked-badge">Complete Lessons First</span>}
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className="player-main">
        {isFinalQuizMode ? (
          <div className="final-quiz-container glass animate-fade-in">
             <div className="quiz-header-main">
               <HelpCircle size={40} color="#6366f1" />
               <div>
                  <h2 className="gradient-text">Final Course Assessment</h2>
                  <p>Must score 65% or higher to earn your certificate.</p>
               </div>
               <div className="attempts-badge">
                 Attempts: {quizStatus?.attempts_count || 0}/3
               </div>
             </div>

             {quizResult || (quizStatus?.status === 'passed') ? (
               <div className="quiz-completion-view animate-zoom-in">
                  <Award size={64} color="#fbbf24" style={{ marginBottom: '20px' }} />
                  <h3>{quizResult?.passed || quizStatus?.status === 'passed' ? 'Congratulations! You Passed' : 'Assessment Failed'}</h3>
                  <div className="score-ring">
                    {Math.round(quizResult?.score || quizStatus?.best_score)}%
                  </div>
                  <p>
                    {quizResult?.passed || quizStatus?.status === 'passed' 
                      ? 'You have successfully mastered this course. Your certificate is now available!' 
                      : (quizStatus?.attempts_count >= 3 
                          ? 'You have exhausted all attempts. Please contact the administrator.' 
                          : 'You didn\'t reach the 65% passing threshold. Review the material and try again.')}
                  </p>
                  
                  {(quizResult?.passed || quizStatus?.status === 'passed') ? (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '20px', justifyContent: 'center' }}>
                      <Button variant="primary" size="lg" onClick={() => setIsCertOpen(true)}>
                         Claim Your Certificate
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setIsRatingOpen(true)}>
                         Rate Course <Star size={18} />
                      </Button>
                    </div>
                  ) : (
                    quizStatus?.attempts_count < 3 && (
                      <Button variant="outline" onClick={() => { setQuizResult(null); setSelectedAnswers({}); }} style={{ marginTop: '20px' }}>
                        Retake Assessment
                      </Button>
                    )
                  )}
               </div>
             ) : (
               <div className="final-quiz-questions">
                 {finalQuizQuestions.map((q, idx) => (
                    <div key={q.id} className="quiz-q-player">
                       <p className="q-text"><strong>Question {idx + 1}:</strong> {q.question}</p>
                       <div className="q-opts-player">
                          {q.options.map((opt, i) => (
                            <button 
                              key={i}
                              className={`q-opt-btn ${selectedAnswers[q.id] === opt ? 'selected' : ''}`}
                              onClick={() => setSelectedAnswers({...selectedAnswers, [q.id]: opt})}
                            >
                              <span>{String.fromCharCode(65 + i)}.</span> {opt}
                            </button>
                          ))}
                       </div>
                    </div>
                 ))}
                 
                 {(quizStatus?.attempts_count || 0) < 3 ? (
                    <div className="quiz-footer-actions">
                      <Button variant="primary" size="lg" onClick={handleSubmitFinalQuiz} disabled={updating || Object.keys(selectedAnswers).length < finalQuizQuestions.length}>
                        {updating ? <Loader2 size={20} className="animate-spin" /> : 'Submit Final Assessment'}
                      </Button>
                    </div>
                 ) : (
                    <div className="out-of-attempts-msg">
                      No attempts remaining. Please contact your instructor.
                    </div>
                 )}
               </div>
             )}
          </div>
        ) : currentLesson ? (
          <>
            <div className="video-container" style={{ position: 'relative', width: '100%', maxWidth: '1200px', height: '750px', minHeight: '750px', margin: '0 auto', overflow: 'hidden', background: '#0f172a', borderRadius: '12px' }}>
              {currentLesson.video_url && (currentLesson.video_url.toLowerCase().endsWith('.mp4') || currentLesson.video_url.startsWith('/uploads/')) ? (
                <video 
                  key={currentLesson.id}
                  src={currentLesson.video_url} 
                  controls 
                  controlsList="nodownload"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : currentLesson.content_url && (currentLesson.content_url.toLowerCase().endsWith('.pdf') || currentLesson.content_url.includes('/uploads/')) ? (
                <iframe 
                  src={currentLesson.content_url} 
                  title="Study Material"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : currentLesson.video_url ? (
                 /* Embed logic for YouTube/External links */
                 <div className="video-placeholder" style={{ height: '100%' }}>
                    <Play size={48} />
                    <p style={{ marginTop: '16px' }}>External Video: <a href={currentLesson.video_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{currentLesson.video_url}</a></p>
                 </div>
              ) : (
                <div className="video-placeholder" style={{ height: '100%' }}>
                   <FileText size={48} />
                   <p style={{ marginTop: '16px' }}>Reading Materials Only</p>
                </div>
              )}
            </div>

            <div className="content-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 className="gradient-text">{currentLesson.title}</h2>
                  <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>Topic: {courseInfo?.category || 'General'}</p>
                </div>
                {completedLessons.includes(currentLesson.id) ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 'bold', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <CheckCircle size={18} /> Completed
                   </div>
                ) : (
                   <Button variant="primary" onClick={handleLessonComplete} disabled={updating}>
                     {updating ? <Loader2 size={18} className="animate-spin" /> : 'Mark as Complete'}
                   </Button>
                )}
              </div>

              {currentLesson.content && (
                <div className="lesson-paragraph-content" style={{ marginBottom: '25px', lineHeight: '1.7', color: 'var(--text-light)', fontSize: '15px' }}>
                  {currentLesson.content.split('\n').map((para, i) => (
                    <p key={i} style={{ marginBottom: '12px' }}>{para}</p>
                  ))}
                </div>
              )}

              {lessonQuizzes.length > 0 && (
                <div className="lesson-quizzes-section" style={{ marginTop: '30px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ marginBottom: '15px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={20} /> Lesson Practice Quiz
                  </h3>
                  {lessonQuizzes.map((q, idx) => (
                    <div key={q.id} className="lesson-quiz-card" style={{ marginBottom: '20px' }}>
                      <p style={{ fontWeight: '500', marginBottom: '10px' }}>Q{idx + 1}: {q.question}</p>
                      <div className="lesson-quiz-opts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {q.options.map((opt, i) => {
                          const isSelected = lessonAnswers[q.id] === opt;
                          const isCorrect = q.correct_answer === opt;
                          
                          let bg = 'rgba(255,255,255,0.05)';
                          let border = '1px solid rgba(255,255,255,0.1)';
                          
                          if (lessonQuizSubmitted) {
                            if (isCorrect) {
                              bg = 'rgba(16, 185, 129, 0.2)';
                              border = '1px solid #10b981';
                            } else if (isSelected && !isCorrect) {
                              bg = 'rgba(239, 68, 68, 0.2)';
                              border = '1px solid #ef4444';
                            }
                          } else if (isSelected) {
                            bg = 'rgba(99, 102, 241, 0.2)';
                            border = '1px solid #6366f1';
                          }

                          return (
                            <div 
                              key={i} 
                              style={{ 
                                padding: '10px', 
                                background: bg, 
                                borderRadius: '8px', 
                                border: border,
                                cursor: lessonQuizSubmitted ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => {
                                if (!lessonQuizSubmitted) {
                                  setLessonAnswers({ ...lessonAnswers, [q.id]: opt });
                                }
                              }}
                            >
                              <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>{String.fromCharCode(65 + i)}.</span> {opt}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!lessonQuizSubmitted ? (
                      <Button 
                        variant="primary" 
                        onClick={() => setLessonQuizSubmitted(true)}
                        disabled={Object.keys(lessonAnswers).length < lessonQuizzes.length}
                      >
                        Submit Practice Quiz
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => { setLessonQuizSubmitted(false); setLessonAnswers({}); }}>
                        Try Again
                      </Button>
                    )}
                    {lessonQuizSubmitted && (
                      <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
                        You scored {lessonQuizzes.filter(q => lessonAnswers[q.id] === q.correct_answer).length} out of {lessonQuizzes.length}!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {completedLessons.length === (lessons?.length || 0) && lessons?.length > 0 && (
               <div className="course-completed-alert glass" style={{ border: '1px solid #10b981', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                  <Award size={40} color={quizStatus?.status === 'passed' ? "#fbbf24" : "#94a3b8"} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#10b981' }}>Lessons Completed!</h3>
                    <p>{quizStatus?.status === 'passed' ? "You've passed the assessment! You can now view your certificate." : "Finish the Final Assessment with 65%+ to earn your certificate."}</p>
                  </div>
                  {quizStatus?.status === 'passed' ? (
                    <Button variant="primary" onClick={() => setIsCertOpen(true)} style={{ marginLeft: 'auto' }}>
                      View & Print Certificate
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={handleSelectFinalQuiz} style={{ marginLeft: 'auto' }}>
                      Take Final Assessment
                    </Button>
                  )}
               </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <p>Select a lesson from the sidebar to start learning.</p>
          </div>
        )}
      </div>

      <CertificateModal 
        isOpen={isCertOpen} 
        onClose={() => { setIsCertOpen(false); sessionStorage.removeItem('activeCertificateCourseId'); }} 
        data={certificateData} 
      />

      <CourseRatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        courseId={courseId}
        courseTitle={courseInfo?.title}
        onRatingSubmitted={(msg) => alert(msg)}
      />
    </div>
  );
};

export default CoursePlayer;
