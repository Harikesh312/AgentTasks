import React from 'react';
import { FiLayout, FiMaximize, FiPieChart, FiZap, FiCopy, FiImage } from 'react-icons/fi';
import './QuestionThumbnail.css';

const getCategoryDetails = (category) => {
  switch (category) {
    case 'Component':
      return { icon: <FiMaximize />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' };
    case 'Landing Page':
      return { icon: <FiLayout />, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' };
    case 'Dashboard':
      return { icon: <FiPieChart />, gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' };
    case 'Optimization Challenge':
      return { icon: <FiZap />, gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' };
    case 'UI Cloning':
      return { icon: <FiCopy />, gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' };
    default:
      return { icon: <FiImage />, gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' };
  }
};

export default function QuestionThumbnail({ category, referenceImage, title }) {
  if (referenceImage) {
    return (
      <div className="question-thumbnail image-thumbnail">
        <img src={referenceImage} alt={title} loading="lazy" />
      </div>
    );
  }

  const { icon, gradient } = getCategoryDetails(category);

  return (
    <div className="question-thumbnail generated-thumbnail" style={{ background: gradient }}>
      <div className="thumbnail-icon-wrapper">
        {icon}
      </div>
    </div>
  );
}
