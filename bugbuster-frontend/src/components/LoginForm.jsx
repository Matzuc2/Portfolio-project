import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/LoginForm.css';

function LoginForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      console.log('Données de connexion:', formData);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form-container">
      <h2 className="login-form-title">Connexion</h2>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="votre.email@exemple.com"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Mot de passe *
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Votre mot de passe"
              className="form-input password-input"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle-btn"
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        <div className="form-links">
          <Link to="/forgot-password" className="forgot-link">
            Mot de passe oublié ?
          </Link>
        </div>

        <div className="auth-switch">
          <p className="switch-text">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="switch-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;