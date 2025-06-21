import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import '../css/RegisterForm.css';

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  
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
      showError('Veuillez remplir tous les champs');
      return false;
    }

    if (formData.username.length < 3) {
      showError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return false;
    }

    if (formData.password.length < 6) {
      showError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Les mots de passe ne correspondent pas');
      return false;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Format d\'email invalide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Soumission du formulaire avec:', formData);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Préparer les données sans confirmPassword
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };
      
      console.log('Données préparées pour l\'inscription:', registrationData);
      
      const result = await register(registrationData);
      
      console.log('Résultat de l\'inscription:', result);
      
      if (result.success) {
        showSuccess('Inscription réussie ! Bienvenue !');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        showError(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      showError('Erreur lors de l\'inscription');
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle-btn"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="password-toggle-btn"
              disabled={isSubmitting}
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
            disabled={isSubmitting || formData.password !== formData.confirmPassword || !formData.username || !formData.email || !formData.password}
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