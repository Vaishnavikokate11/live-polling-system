import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

const LandingPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const { loginUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowNameInput(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      loginUser({
        name: name.trim(),
        role: selectedRole
      });
      navigate(selectedRole === 'teacher' ? '/teacher' : '/student');
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setShowNameInput(false);
    setName('');
  };

  if (showNameInput) {
    return (
      <div className="landing-container">
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="text-center mb-6">
            {selectedRole === 'teacher' ? 'Teacher Login' : 'Student Login'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter your ${selectedRole === 'teacher' ? 'teacher' : 'student'} name`}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-4">
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                Back
              </button>
              <button type="submit" className="btn">
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div className="role-selection">
        <div className="role-card" onClick={() => handleRoleSelect('teacher')}>
          <div className="role-icon">
            <FaChalkboardTeacher />
          </div>
          <h3 className="role-title">Teacher</h3>
          <p className="role-description">
            Create polls, view live results, and manage your classroom. 
            Control the flow of questions and monitor student participation.
          </p>
          <button className="btn">Join as Teacher</button>
        </div>

        <div className="role-card" onClick={() => handleRoleSelect('student')}>
          <div className="role-icon">
            <FaUserGraduate />
          </div>
          <h3 className="role-title">Student</h3>
          <p className="role-description">
            Participate in live polls, answer questions, and view real-time results. 
            Engage with your classmates in an interactive learning environment.
          </p>
          <button className="btn">Join as Student</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 