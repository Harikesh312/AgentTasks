import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import QuestionStatus from './QuestionStatus';
import './QuestionCard.css';

export default function QuestionCard({ question, index }) {
  const { id, title, difficulty, category, isOptimizationTrap, avgAttempts, referenceImage } = question;
  const { completedQuestions } = useAuth();
  
  const solved = completedQuestions.includes(id);

  return (
    <Link to={`/questions/${id}`} className="question-row" id={`question-${id}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="q-status">
        <QuestionStatus solved={solved} />
      </div>
      <div className="q-title-cell">

        <div className="q-title-info">
          <span className="q-title">{title}</span>
          {isOptimizationTrap && (
            <span className="badge badge-trap"><FiAlertTriangle size={12} /> Optimization Trap</span>
          )}
        </div>
      </div>
      <div className="q-badges-cell">
        <div className="q-difficulty">
          <span className={`badge badge-${difficulty.toLowerCase()}`}>{difficulty}</span>
        </div>
        <div className="q-category">
          <span className="category-tag" title={category}>{category}</span>
        </div>
      </div>
      <div className="q-attempts">
        <span className="attempts-value">{avgAttempts}</span>
        <span className="attempts-label">avg turns</span>
      </div>
    </Link>
  );
}
