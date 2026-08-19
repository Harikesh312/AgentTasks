import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import FilterBar from '../components/FilterBar';
import QuestionCard from '../components/QuestionCard';
import questions from '../data/questions';
import './QuestionsPage.css';

export default function QuestionsPage() {
  const [filtered, setFiltered] = useState(questions);

  const handleFilter = ({ search, difficulty, category }) => {
    let result = questions;
    if (search) {
      result = result.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (difficulty !== 'All') {
      result = result.filter((q) => q.difficulty === difficulty);
    }
    if (category !== 'All') {
      result = result.filter((q) => q.category === category);
    }
    setFiltered(result);
  };

  return (
    <div className="questions-page" id="questions-page">
      <div className="page-watermark"></div>
      <div className="questions-header">
        <h1 className="page-title">Problems</h1>
        <p className="page-subtitle">
          Practice guiding AI agents to build real UIs. Write prompts, not code.
        </p>
      </div>
      <FilterBar onFilter={handleFilter} />
      <div className="questions-table">
        <div className="table-header">
          <span className="th-status">Status</span>
          <span className="th-title">Title</span>
          <span className="th-diff">Difficulty</span>
          <span className="th-cat">Category</span>
          <span className="th-attempts">Avg Turns</span>
        </div>
        <div className="table-body">
          {filtered.length === 0 ? (
            <div className="no-results">
              <FiSearch size={32} />
              <p>No questions match your filters</p>
            </div>
          ) : (
            filtered.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
