import React from 'react';
import '../css/QuestionCard.css';

function QuestionCard({ question, isDetailView = false, onReplyClick }) {
  const handleVote = (voteType) => {
    console.log(`Vote ${voteType} pour la question ${question.id}`);
    // Logique de vote ici
  };

  const handleReplyClick = () => {
    if (onReplyClick) {
      onReplyClick(question.id);
    }
  };

  return (
    <div className={`question-details ${isDetailView ? 'detail-view' : ''}`}>
      <div className="question-header">
        <h1 className="question-details-title">{question.title}</h1>
        <div className="question-meta">
          <span className="question-author">Par {question.author}</span>
          <span className="question-date">{question.createdAt}</span>
        </div>
      </div>

      <div className="question-body">
        <p className="question-details-description">{question.description}</p>
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
          {/* Bouton Reply */}
          <button 
            className="reply-btn"
            onClick={handleReplyClick}
          >
            💬 Répondre
          </button>
          
          {/* Votes */}
          <div className="question-votes">
            <button 
              className="vote-btn upvote-btn"
              onClick={() => handleVote('upvote')}
            >
              ▲ {question.upvotes}
            </button>
            <button 
              className="vote-btn downvote-btn"
              onClick={() => handleVote('downvote')}
            >
              ▼ {question.downvotes}
            </button>
            <span className="vote-score">
              Score: {question.upvotes - question.downvotes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;