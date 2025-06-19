import React from 'react';
import { Link } from 'react-router-dom';
import '../css/TitleCard.css';

function TitleCard() {
  return (
    <div className="title-card">
      <Link to="http://localhost:3001/" className="logo-link">
        <div className="logo">BugBuster</div>
      </Link>
    </div>
  );
}

export default TitleCard;