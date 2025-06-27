import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import TitleCard from '../components/TitleCard';
import MiniSearchBar from '../components/MiniSearchBar';
import QuestionCard from '../components/QuestionCard';
import AnswerCard from '../components/AnswerCard';
import ReplyForm from '../components/ReplyForm';
import questionService from '../services/questionService';
import answerService from '../services/answerService';
import '../css/QuestionDetail.css';

function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadQuestionData();
    }
  }, [id]);

  // NOUVELLE FONCTION : Trier les réponses pour mettre les acceptées en premier
  const sortAnswers = (answersArray) => {
    return [...answersArray].sort((a, b) => {
      // D'abord par statut d'acceptation (acceptées en premier)
      if (a.IsAccepted && !b.IsAccepted) return -1;
      if (!a.IsAccepted && b.IsAccepted) return 1;
      
      // Si même statut d'acceptation, trier par date (plus récent en premier)
      const dateA = new Date(a.CreatedAt || a.createdAt);
      const dateB = new Date(b.CreatedAt || b.createdAt);
      return dateB - dateA;
    });
  };

  const loadQuestionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger la question
      console.log('Chargement de la question ID:', id);
      const questionResult = await questionService.getQuestionWithDetails(id);
      
      if (questionResult.success) {
        console.log('Question chargée:', questionResult.data);
        setQuestion(questionResult.data);
        
        // Charger les réponses
        await loadAnswers(id);
      } else {
        console.error('Erreur lors du chargement de la question:', questionResult.error);
        setError(questionResult.error);
        showError(questionResult.error || 'Question non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur de connexion au serveur');
      showError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async (questionId) => {
    try {
      setLoadingAnswers(true);
      console.log('Chargement des réponses pour la question:', questionId);
      
      const answersResult = await answerService.getAnswersByQuestionId(questionId);
      
      if (answersResult.success) {
        console.log('Réponses chargées:', answersResult.data);
        // MODIFICATION : Trier les réponses avant de les définir
        const sortedAnswers = sortAnswers(answersResult.data);
        setAnswers(sortedAnswers);
      } else {
        console.error('Erreur lors du chargement des réponses:', answersResult.error);
        showError('Erreur lors du chargement des réponses');
        setAnswers([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
      setAnswers([]);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      // Rediriger vers la page de recherche
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleReplySubmit = async (newReply) => {
    try {
      console.log('Soumission de nouvelle réponse:', newReply);
      
      // Préparer les données pour l'API
      const answerData = {
        content: newReply.content,
        questionId: parseInt(id),
        codeContent: newReply.codeContent
      };
      
      console.log('Données envoyées à l\'API:', answerData);
      
      const result = await answerService.createAnswer(answerData);
      
      if (result.success) {
        showSuccess('Réponse publiée avec succès !');
        setShowReplyForm(false);
        
        // Recharger les réponses pour afficher la nouvelle
        await loadAnswers(id);
      } else {
        showError(result.error || 'Erreur lors de la publication de la réponse');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse:', error);
      showError('Erreur lors de la publication de la réponse');
    }
  };

  const handleReplyClick = (questionId) => {
    if (!isAuthenticated) {
      showWarning('Vous devez être connecté pour répondre');
      setTimeout(() => {
        navigate('/login', { 
          state: { from: { pathname: `/question/${id}` } }
        });
      }, 1500);
      return;
    }

    console.log('Répondre à la question:', questionId);
    setShowReplyForm(true);
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
  };

  const handleAnswerUpdate = async (updatedAnswer = null, action = 'update', answerId = null) => {
    if (action === 'delete' && answerId) {
      // Retirer la réponse supprimée de la liste
      setAnswers(prevAnswers => {
        const filteredAnswers = prevAnswers.filter(answer => answer.Id !== answerId);
        return sortAnswers(filteredAnswers);
      });
    } else if (updatedAnswer) {
      // Mise à jour normale
      setAnswers(prevAnswers => {
        const updatedAnswers = prevAnswers.map(answer => 
          answer.Id === updatedAnswer.Id ? updatedAnswer : answer
        );
        return sortAnswers(updatedAnswers);
      });
    } else {
      // Rechargement complet si nécessaire
      await loadAnswers(id);
    }
  };

  if (loading) {
    return (
      <div className="question-detail-page">
        <div className="header-section">
          <div className="title-section">
            <TitleCard />
          </div>
          <div className="mini-search-section">
            <MiniSearchBar />
          </div>
        </div>
        <div className="content-section">
          <div className="loading-section">
            <p className="loading-text">Chargement de la question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="question-detail-page">
        <div className="header-section">
          <div className="title-section">
            <TitleCard />
          </div>
          <div className="mini-search-section">
            <MiniSearchBar />
          </div>
        </div>
        <div className="content-section">
          <div className="error-section">
            <h2 className="error-title">Question introuvable</h2>
            <p className="error-message">
              {error || 'La question que vous recherchez n\'existe pas ou a été supprimée.'}
            </p>
            <button 
              className="back-home-btn"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-detail-page">
      <div className="header-section">
        <div className="title-section">
          <TitleCard />
        </div>
        <div className="mini-search-section">
          <MiniSearchBar />
        </div>
      </div>

      <div className="content-section">
        <div className="question-section">
          <QuestionCard 
            question={question} 
            isDetailView={true} 
            onReplyClick={handleReplyClick}
          />
          
          {/* Formulaire de réponse conditionnel */}
          {showReplyForm && (
            <ReplyForm 
              questionId={question.Id || question.id} 
              onReplySubmit={handleReplySubmit}
              onCancel={handleCancelReply}
            />
          )}
        </div>

        <div className="answers-section">
          <div className="answers-header">
            <h2 className="answers-title">
              {loadingAnswers ? (
                'Chargement des réponses...'
              ) : (
                `${answers.length} Réponse${answers.length > 1 ? 's' : ''}`
              )}
            </h2>
            {/* NOUVEAU : Indicateur de tri */}
            {answers.length > 1 && (
              <p className="sort-indicator">
                📌 Réponses acceptées affichées en premier
              </p>
            )}
          </div>
          
          {loadingAnswers ? (
            <div className="loading-answers">
              <p>Chargement des réponses...</p>
            </div>
          ) : (
            <div className="answers-list">
              {answers.length > 0 ? (
                answers.map((answer) => ( // SUPPRESSION de l'index
                  <AnswerCard 
                    key={answer.Id || answer.id} 
                    answer={answer}
                    question={question}
                    onUpdate={handleAnswerUpdate}
                    // SUPPRESSION : isFirstAccepted={answer.IsAccepted && index === 0}
                  />
                ))
              ) : (
                <div className="no-answers">
                  <p>Aucune réponse pour le moment.</p>
                  {isAuthenticated ? (
                    <p>Soyez le premier à répondre !</p>
                  ) : (
                    <p>
                      <button 
                        className="login-to-answer-btn"
                        onClick={() => navigate('/login', { 
                          state: { from: { pathname: `/question/${id}` } }
                        })}
                      >
                        Connectez-vous pour répondre
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionDetail;