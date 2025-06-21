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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('LoginForm - Début de la soumission');
    
    if (!formData.email || !formData.password) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('LoginForm - Appel de la fonction login');
      const result = await login(formData);
      
      console.log('LoginForm - Résultat du login:', result);
      
      if (result.success) {
        console.log('LoginForm - Connexion réussie, début de la redirection');
        showSuccess('Connexion réussie ! Redirection en cours...');
        
        // FORCE LA REDIRECTION IMMÉDIATE
        navigate('/', { replace: true });
        
        // Alternative avec délai très court si nécessaire
        // setTimeout(() => {
        //   console.log('LoginForm - Exécution de la redirection');
        //   navigate('/', { replace: true });
        // }, 500);
        
      } else {
        console.log('LoginForm - Échec de la connexion:', result.error);
        showError(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('LoginForm - Erreur lors de la connexion:', error);
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