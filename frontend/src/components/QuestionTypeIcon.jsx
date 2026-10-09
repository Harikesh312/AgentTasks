import React from 'react';
import { FiImage, FiCode, FiActivity, FiTarget, FiSearch, FiLayers } from 'react-icons/fi';

export default function QuestionTypeIcon({ type, size = 18 }) {
  switch (type) {
    case 'debugging': return <FiCode size={size} />;
    case 'testing': return <FiActivity size={size} />;
    case 'optimization': return <FiTarget size={size} />;
    case 'code-review': return <FiSearch size={size} />;
    case 'system-scaling': return <FiLayers size={size} />;
    case 'ui-generation':
    default:
      return <FiImage size={size} />;
  }
}

export function formatQuestionType(type) {
  if (!type) return 'UI Generation';
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
