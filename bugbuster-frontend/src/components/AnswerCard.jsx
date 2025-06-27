import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import answerService from '../services/answerService';
import voteService from '../services/voteService';
import EditAnswerModal from './EditAnswerModal';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    
    console.log('AnswerCard - handleVote appelé:', { voteType, isAuthenticated });
    
    // SIMPLIFIER la vérification d'authentification
    if (!isAuthenticated) {
      console.log('AnswerCard - Utilisateur non authentifié');
      showWarning('Vous devez être connecté pour voter');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // VÉRIFICATION du token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('AnswerCard - Pas de token disponible');
      showWarning('Session expirée, veuillez vous reconnecter');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      console.log('AnswerCard - Tentative de vote pour réponse:', localAnswer.Id);
      
      const result = await voteService.voteAnswer(localAnswer.Id, voteType);
      
      console.log('AnswerCard - Résultat du vote:', result);
      
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
        console.error('AnswerCard - Erreur de vote:', result.error);
        showError(result.error || 'Erreur lors du vote');
      }
    } catch (error) {
      console.error('AnswerCard - Erreur lors du vote:', error);
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

  // NOUVELLE FONCTION: Vérifier si l'utilisateur est l'auteur de la question
  const isQuestionAuthor = () => {
    if (!isAuthenticated || !question) return false;
    
    const currentUserId = getCurrentUserId();
    const questionUserId = question.UserId || question.User?.Id;
    
    return currentUserId === questionUserId;
  };

  // NOUVELLE FONCTION: Vérifier si l'utilisateur est l'auteur de la réponse
  const isAnswerAuthor = () => {
    if (!isAuthenticated) return false;
    const currentUserId = getCurrentUserId();
    const answerUserId = localAnswer?.UserId || localAnswer?.User?.Id;
    return currentUserId === answerUserId;
  };

  // NOUVELLE FONCTION: Gérer l'édition
  const handleEdit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowEditModal(true);
  };

  // NOUVELLE FONCTION: Gérer la suppression
  const handleDelete = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await answerService.deleteAnswer(localAnswer.Id);
      
      if (result.success) {
        showSuccess('Réponse supprimée avec succès');
        
        // Notifier le parent pour retirer la réponse de la liste
        if (onUpdate) {
          onUpdate(null, 'delete', localAnswer.Id);
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
  const handleAnswerUpdate = (updatedAnswer) => {
    setShowEditModal(false);
    setLocalAnswer(updatedAnswer);
    if (onUpdate) {
      onUpdate(updatedAnswer);
    }
    showSuccess('Réponse mise à jour avec succès');
  };

  return (
    <div className={`answer-card ${localAnswer.IsAccepted ? 'accepted' : ''}`}>
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
          
          {/* NOUVEAU: Actions pour l'auteur */}
          {isAnswerAuthor() && (
            <div className="answer-author-actions">
              <button 
                className="edit-answer-btn"
                onClick={handleEdit}
                title="Modifier la réponse"
              >
                ✏️ Modifier
              </button>
              <button 
                className="delete-answer-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Supprimer la réponse"
              >
                {isDeleting ? '⏳' : '🗑️'} Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="answer-body">
        <p className="answer-content">
          {localAnswer.Body}
        </p>
        
        {/* Code snippet dans les réponses */}
        {localAnswer.CodeSnippet && (
          <div className="answer-code-section">
            <div className="code-header">
              <span className="code-label">📝 Code :</span>
            </div>
            <pre className="answer-code">
              {localAnswer.CodeSnippet}
            </pre>
          </div>
        )}
      </div>

      <div className="answer-footer">
        {/* Bouton d'acceptation - seulement pour l'auteur de la question */}
        {isQuestionAuthor() && (
          <button 
            className={`accept-btn ${localAnswer.IsAccepted ? 'accepted' : ''}`}
            onClick={handleAcceptAnswer}
            disabled={isAccepting}
          >
            {isAccepting ? (
              '⏳ Traitement...'
            ) : localAnswer.IsAccepted ? (
              '❌ Désaccepter'
            ) : (
              '✅ Accepter cette réponse'
            )}
          </button>
        )}

        {/* Votes - toujours à droite */}
        <div className="answer-votes">
          <button 
            className={`vote-btn upvote-btn ${voteData.userVote === true ? 'active' : ''}`}
            onClick={(e) => handleVote(true, e)}
            disabled={isVoting}
          >
            ▲ {voteData.upvotes}
          </button>
          <button 
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

      {/* NOUVEAU: Modal d'édition */}
      {showEditModal && (
        <EditAnswerModal 
          answer={localAnswer}
          onSave={handleAnswerUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

export default AnswerCard;