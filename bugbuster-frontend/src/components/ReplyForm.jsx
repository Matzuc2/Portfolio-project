import React, { useState } from 'react';
import '../css/ReplyForm.css';

function ReplyForm({ questionId, onReplySubmit, onCancel }) {
  const [replyContent, setReplyContent] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [showCodeField, setShowCodeField] = useState(false); // État pour afficher/masquer le champ code
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      alert('Veuillez saisir une réponse');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReply = {
        id: Date.now(),
        content: replyContent,
        codeContent: (showCodeField && codeContent.trim()) ? codeContent : null,
        author: 'Utilisateur Connecté',
        createdAt: new Date().toLocaleDateString('fr-FR'),
        upvotes: 0,
        downvotes: 0,
        isAccepted: false
      };

      if (onReplySubmit) {
        onReplySubmit(newReply);
      }

      // Réinitialiser le formulaire
      setReplyContent('');
      setCodeContent('');
      setShowCodeField(false);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReplyContent('');
    setCodeContent('');
    setShowCodeField(false);
    if (onCancel) {
      onCancel();
    }
  };

  const toggleCodeField = () => {
    setShowCodeField(!showCodeField);
    if (showCodeField) {
      setCodeContent(''); // Vider le code si on masque le champ
    }
  };

  return (
    <div className="reply-form-container">
      <h3 className="reply-form-title">Votre réponse</h3>
      
      <form onSubmit={handleSubmit} className="reply-form">
        <div className="form-group">
          <label htmlFor="reply-content" className="form-label">
            Réponse *
          </label>
          <textarea
            id="reply-content"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
            className="reply-textarea"
            rows="6"
            required
          />
        </div>

        {/* Bouton pour ajouter/masquer le champ code */}
        <div className="code-toggle-section">
          <button
            type="button"
            onClick={toggleCodeField}
            className="code-toggle-btn"
          >
            {showCodeField ? '❌ Supprimer le code' : '📝 Ajouter un code snippet'}
          </button>
        </div>

        {/* Champ de code conditionnel */}
        {showCodeField && (
          <div className="form-group code-field-animate">
            <label htmlFor="code-content" className="form-label">
              Code snippet
            </label>
            <textarea
              id="code-content"
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="Ajoutez votre code ici..."
              className="code-textarea"
              rows="6"
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !replyContent.trim()}
          >
            {isSubmitting ? 'Envoi...' : 'Publier la réponse'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReplyForm;