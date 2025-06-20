import React from 'react';
import TitleCard from '../components/TitleCard';
import RegisterForm from '../components/RegisterForm';
import '../css/Register.css';

function Register() {
  const handleRegister = async (formData) => {
    // Ici vous pourrez ajouter la logique d'inscription backend
    console.log('Tentative d\'inscription avec:', formData);
    
    // Simuler une requête API
    try {
      // Exemple de ce qui sera fait plus tard :
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const result = await response.json();
      
      // Pour l'instant, juste un log
      alert('Inscription réussie ! (Simulation)');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <div className="register-title-section">
          <TitleCard />
        </div>
      </div>

      <div className="register-content">
        <div className="register-form-section">
          <RegisterForm onSubmit={handleRegister} />
        </div>
      </div>
    </div>
  );
}

export default Register;