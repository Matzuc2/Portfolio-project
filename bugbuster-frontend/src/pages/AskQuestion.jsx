import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import TitleCard from '../components/TitleCard';
import QuestionForm from '../components/QuestionForm';
import QuestionPreview from '../components/QuestionPreview';
import questionService from '../services/questionService';
import '../css/AskQuestion.css';

function AskQuestion() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [questionData, setQuestionData] = useState({
    title: '',
    description: '',
    content: '',
    tags: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionDataChange = (newData) => {
    setQuestionData(newData);
  };

  const handleSubmitQuestion = async (formData) => {
    // Vérifier l'authentification
    if (!isAuthenticated) {
      showWarning('Vous devez être connecté pour poser une question');
      navigate('/login');
      return;
    }

    // Validation des données
    if (!formData.title || !formData.description) {
      showError('Le titre et la description sont obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API
      const questionPayload = {
        title: formData.title.trim(),
        content: formData.description.trim() + (formData.content ? '\n\n' + formData.content.trim() : '')
      };

      console.log('Envoi de la question:', questionPayload);

      // Appeler le service pour créer la question
      const result = await questionService.createQuestion(questionPayload);

      if (result.success) {
        showSuccess('Question publiée avec succès !');
        
        // Rediriger vers la page de la question créée ou vers l'accueil
        if (result.data.question?.Id) {
          navigate(`/question/${result.data.question.Id}`);
        } else {
          navigate('/');
        }
      } else {
        showError(result.error || 'Erreur lors de la publication de la question');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
      showError('Erreur de connexion au serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="ask-question-page">
      <div className="ask-header">
        <div className="ask-title-section">
          <TitleCard />
        </div>
      </div>

      <div className="ask-content">
        <div className="ask-main-section">
          <h1 className="ask-page-title">Posez votre question</h1>
          <p className="ask-page-subtitle">
            Décrivez votre problème en détail pour obtenir les meilleures réponses de la communauté
          </p>

          <div className="ask-layout">
            {/* Formulaire principal */}
            <div className="form-section">
              <QuestionForm 
                onSubmit={handleSubmitQuestion}
                onDataChange={handleQuestionDataChange}
                questionData={questionData}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Section de prévisualisation */}
            <div className="preview-section">
              <div className="preview-header">
                <h3 className="preview-title">Aperçu de votre question</h3>
                <button 
                  className="preview-toggle-btn"
                  onClick={togglePreview}
                  type="button"
                >
                  {showPreview ? '👁️ Masquer' : '👀 Afficher'}
                </button>
              </div>
              
              {showPreview && (
                <QuestionPreview questionData={questionData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskQuestion;