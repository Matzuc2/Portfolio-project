import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TitleCard from '../components/TitleCard';
import MiniSearchBar from '../components/MiniSearchBar';
import QuestionCard from '../components/QuestionCard';
import AnswerCard from '../components/AnswerCard';
import ReplyForm from '../components/ReplyForm';
import '../css/QuestionDetail.css';

function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false); // État pour afficher/masquer le formulaire

  useEffect(() => {
    // Simuler la récupération de la question et ses réponses
    const fakeQuestion = {
      id: parseInt(id),
      title: 'Comment résoudre une erreur de compilation en JavaScript ?',
      description: 'Je rencontre une erreur de syntaxe dans mon code JavaScript et je ne comprends pas d\'où elle vient. L\'erreur que j\'obtiens est : "Unexpected token". Pouvez-vous m\'aider à comprendre ce qui ne va pas ?',
      content: `function myFunction() {
  console.log("Hello World")
  return true;
}`,
      author: 'John Doe',
      createdAt: '2024-01-15',
      upvotes: 45,
      downvotes: 3,
      tags: ['JavaScript', 'Debug', 'Syntaxe']
    };

    const fakeAnswers = [
      {
        id: 1,
        content: 'Le problème vient du fait qu\'il manque un point-virgule après console.log("Hello World") et une virgule dans votre tableau d\'objets.',
        codeContent: `// Code corrigé
function myFunction() {
  console.log("Hello World"); // Point-virgule ajouté
  return true;
}

// Tableau corrigé
const data = [
  { name: "John", age: 25 }, // Virgule ajoutée
  { name: "Jane", age: 30 }
];`,
        author: 'Jane Smith',
        createdAt: '2024-01-15',
        upvotes: 23,
        downvotes: 1,
        isAccepted: true
      },
      {
        id: 2,
        content: 'En plus du point-virgule manquant, je recommande d\'utiliser un linter comme ESLint. Voici un exemple de configuration :',
        codeContent: `// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['eslint:recommended'],
  rules: {
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline']
  }
};`,
        author: 'Bob Wilson',
        createdAt: '2024-01-15',
        upvotes: 15,
        downvotes: 0,
        isAccepted: false
      }
    ];

    // Simuler un délai de chargement
    setTimeout(() => {
      setQuestion(fakeQuestion);
      setAnswers(fakeAnswers);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSearch = (searchTerm) => {
    console.log('Recherche:', searchTerm);
    // Logique de recherche ici
  };

  const handleReplySubmit = (newReply) => {
    setAnswers(prevAnswers => [...prevAnswers, newReply]);
    setShowReplyForm(false); // Masquer le formulaire après soumission
  };

  // Nouvelle fonction pour gérer le clic sur "Reply"
  const handleReplyClick = (questionId) => {
    console.log('Répondre à la question:', questionId);
    setShowReplyForm(true); // Afficher le formulaire de réponse
  };

  const handleCancelReply = () => {
    setShowReplyForm(false); // Masquer le formulaire
  };

  if (loading) {
    return (
      <div className="question-detail-page">
        <div className="header-section">
          <div className="title-section">
            <TitleCard />
          </div>
          <div className="mini-search-section">
            <MiniSearchBar onSearch={handleSearch} />
          </div>
        </div>
        <div className="loading-section">
          <p className="loading-text">Chargement de la question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-detail-page">
      <div className="header-section">
        <div className="title-section">
          <TitleCard />
        </div>
        <div className="mini-search-section">
          <MiniSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="content-section">
        <div className="question-section">
          <QuestionCard 
            question={question} 
            isDetailView={true} 
            onReplyClick={handleReplyClick} // Passer la fonction de callback
          />
          
          {/* Formulaire de réponse conditionnel */}
          {showReplyForm && (
            <ReplyForm 
              questionId={question.id} 
              onReplySubmit={handleReplySubmit}
              onCancel={handleCancelReply}
            />
          )}
        </div>

        <div className="answers-section">
          <div className="answers-header">
            <h2 className="answers-title">
              {answers.length} Réponse{answers.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="answers-list">
            {answers.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionDetail;