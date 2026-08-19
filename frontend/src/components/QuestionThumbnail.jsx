import React from 'react';
import { FiImage } from 'react-icons/fi';
import './QuestionThumbnail.css';

export default function QuestionThumbnail({ referenceImage, title }) {
  if (referenceImage) {
    return (
      <div className="q-row-thumbnail">
        <img src={referenceImage} alt={title} loading="lazy" className="q-thumb-img" />
      </div>
    );
  }

  return (
    <div className="q-row-thumbnail fallback">
      <FiImage size={18} className="fallback-icon" />
    </div>
  );
}
