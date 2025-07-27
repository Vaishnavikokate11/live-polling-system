import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../contexts/SocketContext';
import { UserContext } from '../contexts/UserContext';
import Chat from './Chat';
import { FaSignOutAlt, FaComments } from 'react-icons/fa';

const StudentDashboard = () => {
  const socket = useContext(SocketContext);
  const { user, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [activePoll, setActivePoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Join as student
    socket.emit('student-join', { name: user.name });

    // Listen for events
    socket.on('current-poll', (poll) => {
      setActivePoll(poll);
      setSelectedOption(null);
      setHasAnswered(false);
      if (poll && !poll.isComplete) {
        setTimeRemaining(Math.max(0, Math.ceil((poll.endTime - Date.now()) / 1000)));
      }
    });

    socket.on('new-poll', (poll) => {
      setActivePoll(poll);
      setSelectedOption(null);
      setHasAnswered(false);
      setTimeRemaining(poll.maxTime);
    });

    socket.on('poll-results', (results) => {
      setActivePoll(prev => prev ? { ...prev, results: results.results, totalVotes: results.totalVotes } : null);
    });

    socket.on('poll-ended', (poll) => {
      setActivePoll(poll);
      setTimeRemaining(0);
    });

    socket.on('kicked', () => {
      logoutUser();
      navigate('/kicked');
    });

    return () => {
      socket.off('current-poll');
      socket.off('new-poll');
      socket.off('poll-results');
      socket.off('poll-ended');
      socket.off('kicked');
    };
  }, [socket, user.name, logoutUser, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleSubmitAnswer = () => {
    if (!selectedOption || hasAnswered) return;

    socket.emit('submit-answer', { option: selectedOption });
    setHasAnswered(true);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo">Live Polling System</a>
            <div className="user-info">
              <span className="user-name">Student: {user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Participate in polls and view real-time results</p>
          </div>

          <div className="dashboard-grid">
            <div>
              {/* Active Poll */}
              {activePoll && !activePoll.isComplete && (
                <div className="poll-form">
                  <h2 className="mb-4">Current Poll</h2>
                  <div className="mb-4">
                    <h3 className="results-question">{activePoll.question}</h3>
                    {timeRemaining > 0 && (
                      <div className="timer">
                        Time Remaining: {formatTime(timeRemaining)}
                      </div>
                    )}
                  </div>

                  {!hasAnswered && timeRemaining > 0 ? (
                    <div>
                      <p className="mb-4">Select your answer:</p>
                      <div className="results-list">
                        {activePoll.options.map((option, index) => (
                          <div
                            key={index}
                            className={`poll-option ${selectedOption === option ? 'selected' : ''}`}
                            onClick={() => setSelectedOption(option)}
                          >
                            <div className="poll-option-content">
                              {option}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        className="btn mt-4"
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption}
                      >
                        Submit Answer
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="mb-4">
                        {hasAnswered ? 'You have submitted your answer!' : 'Time is up!'}
                      </p>
                      <p>Waiting for results...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Poll Results */}
              {activePoll && (activePoll.isComplete || hasAnswered || timeRemaining === 0) && (
                <div className="poll-results">
                  <div className="results-header">
                    <h3 className="results-question">{activePoll.question}</h3>
                    <p className="results-stats">
                      Total Votes: {activePoll.totalVotes || 0}
                      {activePoll.isComplete && ' | Poll Complete'}
                    </p>
                  </div>
                  <div className="results-list">
                    {activePoll.options.map((option, index) => {
                      const votes = (activePoll.results && activePoll.results[option]) || 0;
                      const percentage = activePoll.totalVotes > 0 ? (votes / activePoll.totalVotes) * 100 : 0;
                      return (
                        <div key={index} className="result-item">
                          <div className="result-bar" style={{ width: `${percentage}%` }}></div>
                          <div className="result-content">
                            <span className="result-option">{option}</span>
                            <span className="result-count">{votes} votes ({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Active Poll */}
              {!activePoll && (
                <div className="poll-form">
                  <div className="text-center">
                    <h2 className="mb-4">No Active Poll</h2>
                    <p>Wait for the teacher to create a new poll.</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Student Info */}
              <div className="card">
                <h3 className="mb-4">Your Information</h3>
                <div className="mb-4">
                  <strong>Name:</strong> {user.name}
                </div>
                <div className="mb-4">
                  <strong>Status:</strong> 
                  <span className={`status-indicator ${hasAnswered ? 'status-answered' : 'status-pending'}`}></span>
                  {hasAnswered ? 'Answered' : 'Waiting'}
                </div>
                {activePoll && !activePoll.isComplete && timeRemaining > 0 && (
                  <div>
                    <strong>Time Remaining:</strong> {formatTime(timeRemaining)}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="card">
                <h3 className="mb-4">Instructions</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                  <li className="mb-2">Wait for the teacher to create a poll</li>
                  <li className="mb-2">Select your answer when the poll appears</li>
                  <li className="mb-2">You have 60 seconds to answer (or as set by teacher)</li>
                  <li className="mb-2">View live results after submitting</li>
                  <li className="mb-2">Use the chat to communicate with others</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Toggle */}
      <button
        className="chat-toggle"
        onClick={() => setShowChat(!showChat)}
      >
        <FaComments />
      </button>

      {/* Chat Component */}
      {showChat && <Chat onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default StudentDashboard; 