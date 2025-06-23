import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import '../css/LoginForm.css';

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // AJOUT : État pour les erreurs

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // AJOUT : Effacer l'erreur quand l'utilisateur tape
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est obligatoire';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('LoginForm - Début de la soumission');
    
    // MODIFICATION : Validation avec affichage des erreurs
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormErrors({}); // Effacer les erreurs précédentes
    
    try {
      console.log('LoginForm - Appel de la fonction login');
      const result = await login(formData);
      
      console.log('LoginForm - Résultat du login:', result);
      
      if (result.success) {
        console.log('LoginForm - Connexion réussie, début de la redirection');
        showSuccess('Connexion réussie ! Redirection en cours...');
        navigate('/', { replace: true });
      } else {
        console.log('LoginForm - Échec de la connexion:', result.error);
        
        // AJOUT : Gestion spécifique des erreurs de connexion
        const errorMessage = result.error || 'Erreur de connexion';
        
        if (errorMessage.includes('Email ou mot de passe incorrect') || 
            errorMessage.includes('utilisateur non trouvé') ||
            errorMessage.includes('incorrect')) {
          setFormErrors({
            general: 'Email ou mot de passe incorrect. Vérifiez vos identifiants.'
          });
        } else if (errorMessage.includes('Email') && errorMessage.includes('obligatoire')) {
          setFormErrors({
            email: 'L\'email est obligatoire'
          });
        } else if (errorMessage.includes('mot de passe') && errorMessage.includes('obligatoire')) {
          setFormErrors({
            password: 'Le mot de passe est obligatoire'
          });
        } else {
          setFormErrors({
            general: 'Erreur de connexion. Veuillez réessayer.'
          });
        }
        
        // Aussi afficher dans la notification
        showError(errorMessage);
      }
    } catch (error) {
      console.error('LoginForm - Erreur lors de la connexion:', error);
      setFormErrors({
        general: 'Erreur de connexion au serveur. Veuillez réessayer.'
      });
      showError('Erreur lors de la connexion');
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
      
      {/* AJOUT : Affichage de l'erreur générale */}
      {formErrors.general && (
        <div className="form-error-message general-error">
          ⚠️ {formErrors.general}
        </div>
      )}
      
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
            className={`form-input ${formErrors.email ? 'error' : ''}`}
            required
            disabled={isSubmitting}
          />
          {/* AJOUT : Affichage de l'erreur pour l'email */}
          {formErrors.email && (
            <span className="form-error-message">
              {formErrors.email}
            </span>
          )}
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
              className={`form-input password-input ${formErrors.password ? 'error' : ''}`}
              required
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
          {/* AJOUT : Affichage de l'erreur pour le mot de passe */}
          {formErrors.password && (
            <span className="form-error-message">
              {formErrors.password}
            </span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !formData.email || !formData.password}
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        <div className="form-links">
          <Link to="#" className="forgot-link">
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