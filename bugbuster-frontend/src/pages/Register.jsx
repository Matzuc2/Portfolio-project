import React from 'react';
import TitleCard from '../components/TitleCard';
import RegisterForm from '../components/RegisterForm';
import '../css/Register.css';

function Register() {
  return (
    <div className="register-page">
      <div className="register-header">
        <div className="register-title-section">
          <TitleCard />
        </div>
      </div>

      <div className="register-content">
        <div className="register-form-section">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default Register;