import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import QuestionStatus from './QuestionStatus';
import QuestionThumbnail from './QuestionThumbnail';
import QuestionTypeIcon, { formatQuestionType } from './QuestionTypeIcon';
import './QuestionCard.css';

export default function QuestionCard({ question, index }) {
  const { id, title, difficulty, category, isOptimizationTrap, avgAttempts, referenceImage, type } = question;
  const { completedQuestions } = useAuth();
  
  const solved = completedQuestions.includes(id);
  const qType = type || 'ui-generation';

  return (
    <Link 
      to={`/questions/${id}`} 
      className={`question-row diff-${difficulty.toLowerCase()} ${solved ? 'completed-row' : ''}`} 
      id={`question-${id}`} 
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="q-status">
        <QuestionStatus solved={solved} />
      </div>
      <div className="q-thumb-cell">
        {qType === 'ui-generation' ? (
          <QuestionThumbnail referenceImage={referenceImage} title={title} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '6px', color: 'var(--primary)' }}>
            <QuestionTypeIcon type={qType} size={24} />
          </div>
        )}
      </div>
      <div className="q-title-cell">
        <div className="q-title-info">
          <span className="q-title">{title}</span>
          {isOptimizationTrap && (
            <span className="badge badge-trap" title="This agent may produce imperfect results first. Use follow-up prompts to guide it.">
              <FiAlertTriangle size={12} /> Optimization Trap
            </span>
          )}
        </div>
      </div>
      <div className="q-badges-cell">
        <div className="q-difficulty">
          <span className={`badge badge-${difficulty.toLowerCase()}`}>{difficulty}</span>
        </div>
        <div className="q-category">
          <span className="category-tag" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {formatQuestionType(qType)}
          </span>
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
