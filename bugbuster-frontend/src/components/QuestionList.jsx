import React, { useState, useEffect } from 'react';
import '../css/QuestionList.css';

function QuestionList() {
  const [questions, setQuestions] = useState([]); // État pour stocker les questions

  // Simule la récupération des questions factices avec votes
  useEffect(() => {
    const fakeQuestions = [
      { 
        id: 1, 
        title: 'Quelle est la capitale de la France ?', 
        description: 'Découvrez l\'histoire et les monuments emblématiques de la capitale française, ainsi que son rôle politique et culturel.',
        upvotes: 45,
        downvotes: 3
      },
      { 
        id: 2, 
        title: 'Combien de continents y a-t-il sur Terre ?', 
        description: 'Explorez la géographie mondiale et apprenez-en plus sur la formation des continents et leur diversité géologique.',
        upvotes: 32,
        downvotes: 8
      },
      { 
        id: 3, 
        title: 'Qui a écrit "Les Misérables" ?', 
        description: 'Plongez dans la vie et l\'œuvre de Victor Hugo, l\'un des plus grands écrivains français du XIXe siècle.',
        upvotes: 67,
        downvotes: 2
      },
      { 
        id: 4, 
        title: 'Quelle est la vitesse de la lumière ?', 
        description: 'Comprenez les principes fondamentaux de la physique et l\'importance de cette constante universelle.',
        upvotes: 89,
        downvotes: 5
      },
      { 
        id: 5, 
        title: 'Quel est le plus grand océan du monde ?', 
        description: 'Explorez les océans de notre planète, leur biodiversité et leur impact sur le climat mondial.',
        upvotes: 24,
        downvotes: 12
      },
    ];
    setQuestions(fakeQuestions);
  }, []);

  // Fonction pour gérer les votes
  const handleVote = (questionId, voteType) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(question => 
        question.id === questionId 
          ? {
              ...question,
              [voteType]: question[voteType] + 1
            }
          : question
      )
    );
  };

  return (
    <div className="question-list">
      {/* Cadre contenant les questions */}
      <div className="questions-frame">
        <h2 className="frame-title">Popular questions</h2>
        <div className="questions-grid">
          {questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} className="question-card">
                <div className="question-content">
                  <h3 className="question-title">{question.title}</h3>
                  <p className="question-description">{question.description}</p>
                  
                  {/* Section des votes */}
                  <div className="votes-section">
                    <div className="vote-controls">
                      <button 
                        className="vote-btn upvote-btn"
                        onClick={() => handleVote(question.id, 'upvotes')}
                      >
                        ▲ {question.upvotes}
                      </button>
                      <button 
                        className="vote-btn downvote-btn"
                        onClick={() => handleVote(question.id, 'downvotes')}
                      >
                        ▼ {question.downvotes}
                      </button>
                    </div>
                    <div className="vote-score">
                      Score: {question.upvotes - question.downvotes}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="loading">Chargement des questions...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionList;