import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // AJOUT
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import voteService from '../services/voteService';
import '../css/QuestionCard.css';

function QuestionCard({ question, isDetailView = false, onReplyClick }) {
  const navigate = useNavigate(); // AJOUT
  const { isAuthenticated, getCurrentUserId } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [voteData, setVoteData] = useState({
    upvotes: 0,
    downvotes: 0,
    userVote: null // null, true (upvote), false (downvote)
  });
  const [isVoting, setIsVoting] = useState(false);

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
    // CORRECTION : Redirection vers login si non connecté
    if (!isAuthenticated) {
      showWarning('Vous devez être connecté pour voter');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      const questionId = question?.id || question?.Id;
      const result = await voteService.voteQuestion(questionId, voteType);
      
      if (result.success) {
        // Recharger les données pour avoir les vrais chiffres
        await loadVoteData();
        
        if (result.data.message === 'Vote annulé') {
          showSuccess('Vote annulé');
        } else if (result.data.message === 'Vote mis à jour') {
          showSuccess('Vote modifié');
        } else {
          showSuccess('Vote enregistré');
        }
      } else {
        showError(result.error || 'Erreur lors du vote');
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      showError('Erreur lors du vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleReplyClick = () => {
    // CORRECTION : Redirection vers login si non connecté
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
        </div>
      </div>

      <div className="question-body">
        <p className="question-details-description">
          {question.description || question.Content}
        </p>
        {isDetailView && question.content && (
          <div className="question-full-content">
            <pre className="question-code">{question.content}</pre>
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
    </div>
  );
}

export default QuestionCard;