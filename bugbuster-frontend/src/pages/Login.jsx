import React from 'react';
import TitleCard from '../components/TitleCard';
import LoginForm from '../components/LoginForm';
import '../css/Login.css';

function Login() {
  const handleLogin = async (formData) => {
    // Ici vous pourrez ajouter la logique d'authentification backend
    console.log('Tentative de connexion avec:', formData);
    
    // Simuler une requête API
    try {
      // Exemple de ce qui sera fait plus tard :
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const result = await response.json();
      
      // Pour l'instant, juste un log
      alert('Connexion réussie ! (Simulation)');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="login-title-section">
          <TitleCard />
        </div>
      </div>

      <div className="login-content">
        <div className="login-form-section">
          <LoginForm onSubmit={handleLogin} />
        </div>
      </div>
    </div>
  );
}

export default Login;