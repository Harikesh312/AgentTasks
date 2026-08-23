import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { createDiscussion } from '../api/discussApi';
import DiscussionList from './discuss/DiscussionList';
import DiscussionDetail from './discuss/DiscussionDetail';
import './QuestionDiscussTab.css';

export default function QuestionDiscussTab({ questionId, onTryPrompt }) {
  const { isLoggedIn, user, memoryToken } = useAuth();
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);

  const handleCreateDiscussion = useCallback(async (data) => {
    await createDiscussion(questionId, data, memoryToken);
  }, [questionId, memoryToken]);

  const handleSelectDiscussion = useCallback((id) => {
    setSelectedDiscussionId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedDiscussionId(null);
  }, []);

  const currentUserId = user?._id || null;

  if (selectedDiscussionId) {
    return (
      <div className="qd-discuss-tab animate-fade">
        <DiscussionDetail
          discussionId={selectedDiscussionId}
          onBack={handleBack}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          memoryToken={memoryToken}
        />
      </div>
    );
  }

  return (
    <div className="qd-discuss-tab animate-fade">
      <DiscussionList
        problemId={questionId}
        onSelectDiscussion={handleSelectDiscussion}
        onCreateDiscussion={handleCreateDiscussion}
        isLoggedIn={isLoggedIn}
        memoryToken={memoryToken}
      />
    </div>
  );
}
