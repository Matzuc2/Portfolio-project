import React from 'react';
import '../css/AnswerCard.css';

function AnswerCard({ answer }) {
  const handleVote = (voteType) => {
    console.log(`Vote ${voteType} pour la réponse ${answer.id}`);
    // Logique de vote ici
  };

  const handleAcceptAnswer = () => {
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
            className="vote-btn upvote-btn"
            onClick={() => handleVote('upvote')}
          >
            ▲ {answer.upvotes}
          </button>
          <button 
            className="vote-btn downvote-btn"
            onClick={() => handleVote('downvote')}
          >
            ▼ {answer.downvotes}
          </button>
          <span className="vote-score">
            Score: {answer.upvotes - answer.downvotes}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AnswerCard;