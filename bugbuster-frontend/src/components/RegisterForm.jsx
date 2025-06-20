import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/RegisterForm.css';

function RegisterForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Veuillez remplir tous les champs');
      return false;
    }

    if (formData.username.length < 3) {
      alert('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return false;
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      console.log('Données d\'inscription:', formData);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Faible';
    if (password.length < 8) return 'Moyen';
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)) {
      return 'Fort';
    }
    return 'Moyen';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="register-form-container">
      <h2 className="register-form-title">Créer un compte</h2>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Nom d'utilisateur *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Votre nom d'utilisateur"
            className="form-input"
            required
            minLength="3"
          />
        </div>

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
              minLength="6"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle-btn"
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
          {formData.password && (
            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Force: {passwordStrength}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmer le mot de passe *
          </label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirmer votre mot de passe"
              className={`form-input password-input ${
                formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? 'error' 
                  : formData.confirmPassword && formData.password === formData.confirmPassword 
                    ? 'success' 
                    : ''
              }`}
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="password-toggle-btn"
            >
              {showConfirmPassword ? '👁️' : '🙈'}
            </button>
          </div>
          {formData.confirmPassword && (
            <div className={`password-match ${
              formData.password === formData.confirmPassword ? 'match' : 'no-match'
            }`}>
              {formData.password === formData.confirmPassword 
                ? '✓ Les mots de passe correspondent' 
                : '✗ Les mots de passe ne correspondent pas'
              }
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || formData.password !== formData.confirmPassword}
          >
            {isSubmitting ? 'Création...' : 'Créer le compte'}
          </button>
        </div>

        <div className="auth-switch">
          <p className="switch-text">
            Déjà un compte ?{' '}
            <Link to="/login" className="switch-link">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;