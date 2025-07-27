import React from 'react';
import { useNavigate } from 'react-router-dom';

const KickedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 32 }}>
        <h2 style={{ color: '#ff6b6b', marginBottom: 24 }}>You have been removed</h2>
        <p style={{ marginBottom: 32 }}>
          You have been kicked out of the session by the teacher.<br />
          If you believe this was a mistake, please contact your teacher.
        </p>
        <button className="btn" onClick={() => navigate('/')}>Go to Home</button>
      </div>
    </div>
  );
};

export default KickedPage;
