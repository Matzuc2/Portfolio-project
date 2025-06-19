import React from 'react';
import TitleCard from '../components/TitleCard';
import '../css/Home.css'
import QuestionList from '../components/QuestionList';

function Home() {
  return (
    <>
      <div className="Title-section">
        <TitleCard />
      </div>
      <div className="QList-section">
        <QuestionList/>
    </div>
    </>
  );
}

export default Home;