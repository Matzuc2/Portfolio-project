import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import voteService from '../services/voteService';
import answerService from '../services/answerService';
import '../css/AnswerCard.css';

function AnswerCard({ answer, onUpdate, question }) {
  const navigate = useNavigate();
  const { isAuthenticated, getCurrentUserId } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [voteData, setVoteData] = useState({
    upvotes: 0,
    downvotes: 0,
    userVote: null
  });
  const [isVoting, setIsVoting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [localAnswer, setLocalAnswer] = useState(answer);

  // Synchroniser l'état local avec les props
  useEffect(() => {
    setLocalAnswer(answer);
  }, [answer]);

  // Charger les données de votes
  useEffect(() => {
    if (localAnswer?.Id && isAuthenticated) {
      loadVoteData();
    }
  }, [localAnswer?.Id, isAuthenticated]);

  const loadVoteData = async () => {
    try {
      const result = await voteService.getVotesByAnswerId(localAnswer.Id);
      
      if (result.success) {
        const votes = result.data;
        const upvotes = votes.filter(vote => vote.VoteType === true).length;
        const downvotes = votes.filter(vote => vote.VoteType === false).length;
        
        const currentUserId = getCurrentUserId();
        const userVote = votes.find(vote => vote.UserId === currentUserId);
        
        setVoteData({
          upvotes,
          downvotes,
          userVote: userVote ? userVote.VoteType : null
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des votes:', error);
    }
  };

  const handleVote = async (voteType, event) => {
    event.preventDefault();
    event.stopPropagation();
    
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
      const result = await voteService.voteAnswer(localAnswer.Id, voteType);
      
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
        showError(result.error || 'Erreur lors du vote');
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      showError('Erreur lors du vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAcceptAnswer = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAuthenticated) {
      showWarning('Vous devez être connecté pour accepter une réponse');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isAccepting) return;

    setIsAccepting(true);

    try {
      let result;
      
      if (localAnswer.IsAccepted) {
        result = await answerService.unacceptAnswer(localAnswer.Id);
        if (result.success) {
          showSuccess('Acceptation annulée');
          setLocalAnswer(prev => ({ ...prev, IsAccepted: false }));
        }
      } else {
        result = await answerService.acceptAnswer(localAnswer.Id);
        if (result.success) {
          showSuccess('Réponse acceptée !');
          setLocalAnswer(prev => ({ ...prev, IsAccepted: true }));
        }
      }

      if (result.success) {
        if (onUpdate && result.data?.answer) {
          onUpdate(result.data.answer);
        }
      } else {
        showError(result.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      showError('Erreur lors de la modification');
    } finally {
      setIsAccepting(false);
    }
  };

  // Vérifier si l'utilisateur connecté est l'auteur de la question
  const isQuestionAuthor = () => {
    if (!isAuthenticated || !question) return false;
    
    const currentUserId = getCurrentUserId();
    const questionUserId = question.UserId || question.User?.Id;
    
    return currentUserId === questionUserId;
  };

  return (
    <div className={`answer-card ${localAnswer.IsAccepted ? 'accepted' : ''}`}>
      {/* SUPPRESSION du badge "Meilleure réponse" */}
      
      {localAnswer.IsAccepted && (
        <div className="accepted-badge">
          ✓ Réponse acceptée
        </div>
      )}
      
      <div className="answer-header">
        <div className="answer-meta">
          <span className="answer-author">
            Par {localAnswer.User?.Username || 'Utilisateur anonyme'}
          </span>
          <span className="answer-date">
            {new Date(localAnswer.CreatedAt).toLocaleDateString('fr-FR')}
          </span>
          {localAnswer.IsAccepted && (
            <span className="accepted-indicator">
              🏆 Acceptée !
            </span>
          )}
        </div>
      </div>

      <div className="answer-body">
        <p className="answer-content">{localAnswer.Body}</p>
        
        {localAnswer.CodeSnippet && (
          <div className="answer-code-section">
            <pre className="answer-code">{localAnswer.CodeSnippet}</pre>
          </div>
        )}
      </div>

      <div className="answer-footer">
        {isQuestionAuthor() && (
          <button 
            type="button"
            className={`accept-btn ${localAnswer.IsAccepted ? 'unaccept' : ''}`}
            onClick={handleAcceptAnswer}
            disabled={isAccepting}
            title={localAnswer.IsAccepted ? "Annuler l'acceptation" : "Accepter cette réponse comme solution"}
          >
            {isAccepting ? (
              '⏳ Modification...'
            ) : localAnswer.IsAccepted ? (
              '❌ Annuler l\'acceptation'
            ) : (
              '✅ Accepter cette réponse'
            )}
          </button>
        )}

        <div className="answer-votes">
          <button 
            type="button"
            className={`vote-btn upvote-btn ${voteData.userVote === true ? 'active' : ''}`}
            onClick={(e) => handleVote(true, e)}
            disabled={isVoting}
          >
            ▲ {voteData.upvotes}
          </button>
          <button 
            type="button"
            className={`vote-btn downvote-btn ${voteData.userVote === false ? 'active' : ''}`}
            onClick={(e) => handleVote(false, e)}
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
  );
}

export default AnswerCard;