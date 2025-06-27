import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import voteService from '../services/voteService';
import questionService from '../services/questionService';
import EditQuestionModal from './EditQuestionModal';
import '../css/QuestionCard.css';

function QuestionCard({ question, isDetailView = false, onReplyClick, onQuestionUpdate, onQuestionDelete }) {
  const navigate = useNavigate();
  const { isAuthenticated, getCurrentUserId } = useAuth(); // ENLEVER user d'ici aussi
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [voteData, setVoteData] = useState({
    upvotes: 0,
    downvotes: 0,
    userVote: null
  });
  const [isVoting, setIsVoting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les données de votes au montage du composant
  useEffect(() => {
    if (question?.id || question?.Id) {
      loadVoteData();
    }
  }, [question?.id, question?.Id]);

  const loadVoteData = async () => {
    try {
      const questionId = question?.id || question?.Id;
      const result = await voteService.getVotesByQuestionId(questionId);
      
      if (result.success) {
        const votes = result.data;
        
        // Calculer upvotes et downvotes
        const upvotes = votes.filter(vote => vote.VoteType === true).length;
        const downvotes = votes.filter(vote => vote.VoteType === false).length;
        
        // Vérifier si l'utilisateur connecté a déjà voté
        const currentUserId = getCurrentUserId();
        const userVote = votes.find(vote => vote.UserId === currentUserId);
        
        setVoteData({
          upvotes,
          downvotes,
          userVote: userVote ? userVote.VoteType : null
        });
      } else {
        console.error('Erreur lors du chargement des votes:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des votes:', error);
    }
  };

  const handleVote = async (voteType) => {
    console.log('QuestionCard - handleVote appelé:', { voteType, isAuthenticated });
    
    // SIMPLIFIER la vérification d'authentification
    if (!isAuthenticated) {
      console.log('QuestionCard - Utilisateur non authentifié');
      showWarning('Vous devez être connecté pour voter');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // VÉRIFICATION du token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('QuestionCard - Pas de token disponible');
      showWarning('Session expirée, veuillez vous reconnecter');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      const questionId = question?.id || question?.Id;
      console.log('QuestionCard - Tentative de vote pour question:', questionId);
      
      const result = await voteService.voteQuestion(questionId, voteType);
      
      console.log('QuestionCard - Résultat du vote:', result);
      
      if (result.success) {
        await loadVoteData();
        
        if (result.data.message === 'Vote annulé') {
          showSuccess('Vote annulé');
        } else if (result.data.message === 'Vote mis à jour') {
          showSuccess('Vote modifié');
        } else {
          showSuccess('Vote enregistré');
        }
      } else {
        console.error('QuestionCard - Erreur de vote:', result.error);
        showError(result.error || 'Erreur lors du vote');
      }
    } catch (error) {
      console.error('QuestionCard - Erreur lors du vote:', error);
      showError('Erreur lors du vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      showWarning('Vous devez être connecté pour répondre');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (onReplyClick) {
      const questionId = question?.id || question?.Id;
      onReplyClick(questionId);
    }
  };

  // NOUVELLE FONCTION: Vérifier si l'utilisateur est l'auteur
  const isAuthor = () => {
    if (!isAuthenticated) return false;
    const currentUserId = getCurrentUserId();
    const questionUserId = question?.UserId || question?.User?.Id;
    return currentUserId === questionUserId;
  };

  // NOUVELLE FONCTION: Gérer l'édition
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // NOUVELLE FONCTION: Gérer la suppression
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const questionId = question?.id || question?.Id;
      const result = await questionService.deleteQuestion(questionId);
      
      if (result.success) {
        showSuccess('Question supprimée avec succès');
        
        // Notifier le parent ou rediriger
        if (onQuestionDelete) {
          onQuestionDelete(questionId);
        } else if (isDetailView) {
          // Si on est sur la page de détail, rediriger vers l'accueil
          navigate('/');
        }
      } else {
        showError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // NOUVELLE FONCTION: Gérer la mise à jour
  const handleQuestionUpdate = (updatedQuestion) => {
    setShowEditModal(false);
    if (onQuestionUpdate) {
      onQuestionUpdate(updatedQuestion);
    }
    showSuccess('Question mise à jour avec succès');
  };

  return (
    <div className={`question-details ${isDetailView ? 'detail-view' : ''}`}>
      <div className="question-header">
        <h1 className="question-details-title">
          {question.title || question.Title}
        </h1>
        <div className="question-meta">
          <span className="question-author">
            Par {question.author || question.User?.Username || 'Utilisateur'}
          </span>
          <span className="question-date">
            {new Date(question.createdAt || question.CreatedAt).toLocaleDateString('fr-FR')}
          </span>
          
          {/* NOUVEAU: Actions pour l'auteur */}
          {isAuthor() && (
            <div className="question-author-actions">
              <button 
                className="edit-question-btn"
                onClick={handleEdit}
                title="Modifier la question"
              >
                ✏️ Modifier
              </button>
              <button 
                className="delete-question-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Supprimer la question"
              >
                {isDeleting ? '⏳' : '🗑️'} Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="question-body">
        {/* Description/Contenu principal */}
        <div className="question-description">
          <p className="question-details-description">
            {question.Content || question.content}
          </p>
        </div>
        
        {/* Code snippet */}
        {(question.CodeSnippet || question.codeSnippet) && (
          <div className="question-code-section">
            <div className="code-header">
              <span className="code-label">📝 Code :</span>
            </div>
            <pre className="question-code">
              {question.CodeSnippet || question.codeSnippet}
            </pre>
          </div>
        )}
      </div>

      <div className="question-footer">
        <div className="question-tags">
          {question.tags && question.tags.map((tag, index) => (
            <span key={index} className="question-tag">{tag}</span>
          ))}
        </div>
        
        <div className="question-actions">
          <button 
            className="reply-btn"
            onClick={handleReplyClick}
          >
            💬 Répondre
          </button>
          
          <div className="question-votes">
            <button 
              className={`vote-btn upvote-btn ${voteData.userVote === true ? 'active' : ''}`}
              onClick={() => handleVote(true)}
              disabled={isVoting}
            >
              ▲ {voteData.upvotes}
            </button>
            <button 
              className={`vote-btn downvote-btn ${voteData.userVote === false ? 'active' : ''}`}
              onClick={() => handleVote(false)}
              disabled={isVoting}
            >
              ▼ {voteData.downvotes}
            </button>
            <span className="vote-score">
              Score: {voteData.upvotes - voteData.downvotes}
            </span>
          </div>
        </div>
      </div>

      {/* NOUVEAU: Modal d'édition */}
      {showEditModal && (
        <EditQuestionModal 
          question={question}
          onSave={handleQuestionUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

export default QuestionCard;