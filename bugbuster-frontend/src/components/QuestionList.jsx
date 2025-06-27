import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import questionService from '../services/questionService';
import '../css/QuestionList.css';

function QuestionList({ 
  searchQuery = '', 
  questions: propQuestions = null, 
  showAsResults = false 
}) {
  const { showError } = useNotification();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  useEffect(() => {
    if (propQuestions) {
      setQuestions(propQuestions);
      setFilteredQuestions(propQuestions);
      setLoading(false);
    } else {
      loadQuestions();
    }
  }, [propQuestions]);

  useEffect(() => {
    if (!propQuestions && searchQuery.trim()) {
      const filtered = questions.filter(question =>
        question.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.Content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else if (!propQuestions) {
      setFilteredQuestions(questions);
    }
  }, [searchQuery, questions, propQuestions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const result = await questionService.getAllQuestions();
      
      if (result.success) {
        setQuestions(result.data);
        setFilteredQuestions(result.data);
      } else {
        showError(result.error || 'Erreur lors du chargement des questions');
        setQuestions(getFakeQuestions());
        setFilteredQuestions(getFakeQuestions());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      showError('Erreur de connexion au serveur');
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
      Content: 'Je rencontre une erreur de syntaxe...',
      CodeSnippet: 'console.log("Hello World");',
      CreatedAt: new Date().toISOString(),
      User: { Username: 'John Doe' },
      stats: { answerCount: 3, upvotes: 5, downvotes: 1, score: 4, hasAcceptedAnswer: true }
    },
    { 
      Id: 2,
      Title: 'Problème avec React Hooks',
      Content: 'J\'ai un problème avec useState...',
      CodeSnippet: 'const [count, setCount] = useState(0);',
      CreatedAt: new Date().toISOString(),
      User: { Username: 'Jane Smith' },
      stats: { answerCount: 1, upvotes: 2, downvotes: 0, score: 2, hasAcceptedAnswer: false }
    },
    { 
      Id: 3,
      Title: 'Optimisation des requêtes SQL',
      Content: 'Comment optimiser une requête SQL lente ?',
      CodeSnippet: 'SELECT * FROM users WHERE active = 1;',
      CreatedAt: new Date().toISOString(),
      User: { Username: 'Bob Wilson' },
      stats: { answerCount: 0, upvotes: 1, downvotes: 0, score: 1, hasAcceptedAnswer: false }
    }
  ];

  if (loading) {
    return (
      <div className="question-list">
        <div className="questions-frame">
          <h2 className="frame-title">
            {showAsResults ? 'Résultats de recherche' : 'Questions populaires'}
          </h2>
          <div className="questions-grid">
            <div className="loading">Chargement des questions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (showAsResults) {
    return (
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
                  
                  {/* Description */}
                  <p className="question-description">
                    {(question.Content || question.content).substring(0, 150)}
                    {(question.Content || question.content).length > 150 ? '...' : ''}
                  </p>
                  
                  {/* Code snippet preview */}
                  {(question.CodeSnippet || question.codeSnippet) && (
                    <div className="question-code-preview">
                      <div className="code-preview-header">
                        <span className="code-preview-label">📝 Code inclus</span>
                      </div>
                      <pre className="code-preview-content">
                        {(question.CodeSnippet || question.codeSnippet).substring(0, 100)}
                        {(question.CodeSnippet || question.codeSnippet).length > 100 ? '...' : ''}
                      </pre>
                    </div>
                  )}

                  {/* NOUVEAU: Statistiques de la question */}
                  <div className="question-stats">
                    <div className="stat-item votes">
                      <span className="stat-value">
                        {question.stats?.score || 0}
                      </span>
                      <span className="stat-label">votes</span>
                    </div>
                    <div className="stat-item answers">
                      <span className="stat-value">
                        {question.stats?.answerCount || 0}
                      </span>
                      <span className="stat-label">réponses</span>
                    </div>
                    {question.stats?.hasAcceptedAnswer && (
                      <div className="stat-item accepted">
                        <span className="accepted-icon">✓</span>
                        <span className="stat-label">résolu</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="question-metadata">
                    <span className="question-author">
                      Par {question.User?.Username || question.author || 'Utilisateur anonyme'}
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
            Aucune question trouvée pour cette recherche
          </div>
        )}
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
                    
                    {/* Description */}
                    <p className="question-description">
                      {(question.Content || question.content).substring(0, 150)}
                      {(question.Content || question.content).length > 150 ? '...' : ''}
                    </p>
                    
                    {/* Code snippet preview */}
                    {(question.CodeSnippet || question.codeSnippet) && (
                      <div className="question-code-preview">
                        <div className="code-preview-header">
                          <span className="code-preview-label">📝 Code inclus</span>
                        </div>
                        <pre className="code-preview-content">
                          {(question.CodeSnippet || question.codeSnippet).substring(0, 100)}
                          {(question.CodeSnippet || question.codeSnippet).length > 100 ? '...' : ''}
                        </pre>
                      </div>
                    )}

                    {/* NOUVEAU: Statistiques de la question */}
                    <div className="question-stats">
                      <div className="stat-item votes">
                        <span className="stat-value">
                          {question.stats?.score || 0}
                        </span>
                        <span className="stat-label">votes</span>
                      </div>
                      <div className="stat-item answers">
                        <span className="stat-value">
                          {question.stats?.answerCount || 0}
                        </span>
                        <span className="stat-label">réponses</span>
                      </div>
                      {question.stats?.hasAcceptedAnswer && (
                        <div className="stat-item accepted">
                          <span className="accepted-icon">✓</span>
                          <span className="stat-label">résolu</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="question-metadata">
                      <span className="question-author">
                        Par {question.User?.Username || question.author || 'Utilisateur anonyme'}
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