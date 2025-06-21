import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import questionService from '../services/questionService';
import '../css/QuestionList.css';

function QuestionList({ searchQuery = '' }) {
  const { showError } = useNotification();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    // Filtrer les questions basées sur la recherche
    if (searchQuery.trim()) {
      const filtered = questions.filter(question =>
        question.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.Content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [searchQuery, questions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const result = await questionService.getAllQuestions();
      
      if (result.success) {
        setQuestions(result.data);
        setFilteredQuestions(result.data);
      } else {
        showError(result.error || 'Erreur lors du chargement des questions');
        // Fallback vers les données factices en cas d'erreur
        setQuestions(getFakeQuestions());
        setFilteredQuestions(getFakeQuestions());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      showError('Erreur de connexion au serveur');
      // Fallback vers les données factices
      setQuestions(getFakeQuestions());
      setFilteredQuestions(getFakeQuestions());
    } finally {
      setLoading(false);
    }
  };

  const getFakeQuestions = () => [
    { 
      Id: 1,
      Title: 'Comment résoudre une erreur de compilation en JavaScript ?',
      Content: 'Je rencontre une erreur de syntaxe dans mon code JavaScript...',
      CreatedAt: new Date().toISOString(),
      User: { Username: 'John Doe' }
    },
    { 
      Id: 2,
      Title: 'Problème avec React Hooks',
      Content: 'J\'ai un problème avec useState qui ne met pas à jour...',
      CreatedAt: new Date().toISOString(),
      User: { Username: 'Jane Smith' }
    },
    { 
      Id: 3,
      Title: 'Optimisation des requêtes SQL',
      Content: 'Comment optimiser une requête SQL lente ?',
      CreatedAt: new Date().toISOString(),
      User: { Username: 'Bob Wilson' }
    }
  ];

  if (loading) {
    return (
      <div className="question-list">
        <div className="questions-frame">
          <h2 className="frame-title">Questions populaires</h2>
          <div className="questions-grid">
            <div className="loading">Chargement des questions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-list">
      <div className="questions-frame">
        <h2 className="frame-title">
          {searchQuery ? `Résultats pour "${searchQuery}"` : 'Questions populaires'}
        </h2>
        <div className="questions-grid">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <Link 
                key={question.Id || question.id} 
                to={`/question/${question.Id || question.id}`}
                className="question-card-link"
              >
                <div className="question-card">
                  <div className="question-content">
                    <h3 className="question-title">
                      {question.Title || question.title}
                    </h3>
                    <p className="question-description">
                      {(question.Content || question.description)?.substring(0, 150)}
                      {(question.Content || question.description)?.length > 150 ? '...' : ''}
                    </p>
                    
                    <div className="question-metadata">
                      <span className="question-author">
                        Par {question.User?.Username || question.author || 'Utilisateur'}
                      </span>
                      <span className="question-date">
                        {new Date(question.CreatedAt || question.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-questions">
              {searchQuery 
                ? 'Aucune question trouvée pour cette recherche'
                : 'Aucune question disponible'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionList;