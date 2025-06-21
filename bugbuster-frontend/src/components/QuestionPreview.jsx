import React from 'react';
import '../css/QuestionPreview.css';

function QuestionPreview({ questionData }) {
  const { title, description, content, tags } = questionData;

  // Ne pas afficher la prévisualisation si aucune donnée
  if (!title && !description && !content && tags.length === 0) {
    return (
      <div className="preview-container">
        <div className="preview-empty">
          <p className="preview-empty-text">
            Commencez à remplir le formulaire pour voir l'aperçu de votre question
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div className="preview-question">
        {/* Titre */}
        {title && (
          <h2 className="preview-title">
            {title}
          </h2>
        )}

        {/* Métadonnées simulées */}
        <div className="preview-meta">
          <span className="preview-author">Par Vous</span>
          <span className="preview-date">À l'instant</span>
        </div>

        {/* Description */}
        {description && (
          <div className="preview-description">
            <p>{description}</p>
          </div>
        )}

        {/* Code */}
        {content && (
          <div className="preview-code-section">
            <pre className="preview-code">{content}</pre>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="preview-tags">
            {tags.map((tag, index) => (
              <span key={index} className="preview-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions simulées */}
        <div className="preview-actions">
          <button className="preview-btn reply-btn" disabled>
            💬 Répondre
          </button>
          <div className="preview-votes">
            <button className="preview-btn vote-btn" disabled>▲ 0</button>
            <button className="preview-btn vote-btn" disabled>▼ 0</button>
            <span className="preview-score">Score: 0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionPreview;