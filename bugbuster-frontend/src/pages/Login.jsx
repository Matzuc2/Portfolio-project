import React from 'react';
import TitleCard from '../components/TitleCard';
import LoginForm from '../components/LoginForm';
import '../css/Login.css';

function Login() {
  return (
    <div className="login-page">
      <div className="login-header">
        <div className="login-title-section">
          <TitleCard />
        </div>
      </div>

      <div className="login-content">
        <div className="login-form-section">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;