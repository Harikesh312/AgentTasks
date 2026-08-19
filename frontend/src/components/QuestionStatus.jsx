import React from 'react';
import { FiCheck } from 'react-icons/fi';
import './QuestionStatus.css';

export default function QuestionStatus({ solved }) {
  return (
    <div className={`question-status ${solved ? 'solved' : 'unsolved'}`}>
      {solved ? (
        <div className="status-indicator completed">
          <FiCheck size={16} />
        </div>
      ) : (
        <div className="status-indicator pending" />
      )}
    </div>
  );
}
