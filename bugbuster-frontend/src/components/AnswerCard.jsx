import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // AJOUT
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import voteService from '../services/voteService';
import '../css/AnswerCard.css';

function AnswerCard({ answer }) {
  const navigate = useNavigate(); // AJOUT
  const { isAuthenticated, getCurrentUserId } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [voteData, setVoteData] = useState({
    upvotes: answer.upvotes || 0,
    downvotes: answer.downvotes || 0,
    userVote: null
  });
  const [isVoting, setIsVoting] = useState(false);

  // Charger les données de votes
  useEffect(() => {
    if (answer?.id && isAuthenticated) {
      loadVoteData();
    }
  }, [answer?.id, isAuthenticated]);

  const loadVoteData = async () => {
    try {
      const result = await voteService.getVotesByAnswerId(answer.id);
      
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
      const result = await voteService.voteAnswer(answer.id, voteType);
      
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

  const handleAcceptAnswer = () => {
    // CORRECTION : Redirection vers login si non connecté
    if (!isAuthenticated) {
      showWarning('Vous devez être connecté pour accepter une réponse');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    console.log(`Accepter la réponse ${answer.id}`);
    // Logique pour accepter la réponse
  };

  return (
    <div className={`answer-card ${answer.isAccepted ? 'accepted' : ''}`}>
      {answer.isAccepted && (
        <div className="accepted-badge">
          ✓ Réponse acceptée
        </div>
      )}
      
      <div className="answer-header">
        <div className="answer-meta">
          <span className="answer-author">Par {answer.author}</span>
          <span className="answer-date">{answer.createdAt}</span>
        </div>
      </div>

      <div className="answer-body">
        <p className="answer-content">{answer.content}</p>
        
        {/* Affichage du code si présent */}
        {answer.codeContent && (
          <div className="answer-code-section">
            <pre className="answer-code">{answer.codeContent}</pre>
          </div>
        )}
      </div>

      <div className="answer-footer">
        {/* Bouton d'acceptation À GAUCHE */}
        {!answer.isAccepted && (
          <button 
            className="accept-btn"
            onClick={handleAcceptAnswer}
          >
            Accepter cette réponse
          </button>
        )}

        {/* Votes À DROITE */}
        <div className="answer-votes">
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
  );
}

export default AnswerCard;