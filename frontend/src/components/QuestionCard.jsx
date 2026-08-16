import { Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiAlertTriangle } from 'react-icons/fi';
import './QuestionCard.css';

export default function QuestionCard({ question, index }) {
  const { id, title, difficulty, category, isOptimizationTrap, avgAttempts } = question;
  const solvedIds = [1, 2, 4, 5, 6];
  const solved = solvedIds.includes(id);

  return (
    <Link to={`/questions/${id}`} className="question-row" id={`question-${id}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="q-status">
        {solved ? (
          <FiCheckCircle className="status-icon solved" size={18} />
        ) : (
          <FiCircle className="status-icon" size={18} />
        )}
      </div>
      <div className="q-title-cell">
        <span className="q-title">{title}</span>
        {isOptimizationTrap && (
          <span className="badge badge-trap"><FiAlertTriangle size={12} /> Optimization Trap</span>
        )}
      </div>
      <div className="q-difficulty">
        <span className={`badge badge-${difficulty.toLowerCase()}`}>{difficulty}</span>
      </div>
      <div className="q-category">
        <span className="category-tag">{category}</span>
      </div>
      <div className="q-attempts">
        <span className="attempts-value">{avgAttempts}</span>
        <span className="attempts-label">avg turns</span>
      </div>
    </Link>
  );
}
