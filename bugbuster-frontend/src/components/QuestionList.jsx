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
      const searchLower = searchQuery.toLowerCase();
      
      const filtered = questions.filter(question => {
        // Recherche dans le titre
        const titleMatch = question.Title?.toLowerCase().includes(searchLower);
        
        // Recherche dans le contenu
        const contentMatch = question.Content?.toLowerCase().includes(searchLower);
        
        // NOUVEAU: Recherche dans les tags
        const tags = question.Tags || [];
        const tagMatch = tags.some(tag => 
          (tag.name || tag.Name || '').toLowerCase().includes(searchLower)
        );
        
        return titleMatch || contentMatch || tagMatch;
      });
      
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
      Tags: [{ Name: 'JavaScript' }, { Name: 'Debug' }],
      stats: { 
        answerCount: 3, 
        questionUpvotes: 5, 
        questionDownvotes: 1, 
        questionScore: 4,
        totalScore: 15, // 4 + 9 (3 réponses * 3) + 2 (votes réponses)
        hasAcceptedAnswer: true 
      }
    },
    { 
      Id: 2,
      Title: 'Problème avec React Hooks',
      Content: 'J\'ai un problème avec useState...',
      CodeSnippet: 'const [count, setCount] = useState(0);',
      CreatedAt: new Date().toISOString(),
      User: { Username: 'Jane Smith' },
      Tags: [{ Name: 'React' }, { Name: 'Hooks' }],
      stats: { 
        answerCount: 1, 
        questionUpvotes: 2, 
        questionDownvotes: 0, 
        questionScore: 2,
        totalScore: 8, // 2 + 3 (1 réponse * 3) + 3 (votes réponses)
        hasAcceptedAnswer: false 
      }
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

  const renderQuestionCard = (question) => {
    return (
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
              {(question.Content || question.content).substring(0, 150)}
              {(question.Content || question.content).length > 150 ? '...' : ''}
            </p>
            
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

            {/* TAGS - VERSION PROPRE */}
            {question.Tags && Array.isArray(question.Tags) && question.Tags.length > 0 && (
              <div className="question-tags">
                {question.Tags.slice(0, 4).map((tag, index) => (
                  <span key={index} className="question-tag">
                    {tag.name || tag.Name}
                  </span>
                ))}
                {question.Tags.length > 4 && (
                  <span className="question-tag more-tags">
                    +{question.Tags.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Statistiques */}
            <div className="question-stats">
              <div className="stat-item score">
                <span className="stat-value">
                  {question.stats?.totalScore || 0}
                </span>
                <span className="stat-label">score</span>
              </div>
              <div className="stat-item votes">
                <span className="stat-value">
                  {(question.stats?.questionUpvotes || 0) - (question.stats?.questionDownvotes || 0)}
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
    );
  };

  if (showAsResults) {
    return (
      <div className="questions-grid">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(renderQuestionCard)
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
          <span className="frame-subtitle">Triées par score de popularité</span>
        </h2>
        <div className="questions-grid">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(renderQuestionCard)
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