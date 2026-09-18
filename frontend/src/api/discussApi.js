import { API_URL } from '../config';

const BASE_URL = `${API_URL}/api/discuss`;

// Helper for making API calls with tokens
const fetchWithAuth = async (url, options = {}, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getDiscussions = (problemId, params = {}) => {
  const url = new URL(`${BASE_URL}/problem/${problemId}`);
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  });
  return fetchWithAuth(url.toString());
};

export const createDiscussion = (problemId, data, token) => {
  return fetchWithAuth(`${BASE_URL}/problem/${problemId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }, token);
};

export const getDiscussionDetails = (id) => {
  return fetchWithAuth(`${BASE_URL}/${id}`);
};

export const editDiscussion = (id, data, token) => {
  return fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, token);
};

export const deleteDiscussion = (id, token) => {
  return fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  }, token);
};

export const upvoteDiscussion = (id, token) => {
  return fetchWithAuth(`${BASE_URL}/${id}/upvote`, {
    method: 'POST'
  }, token);
};

export const createReply = (discussionId, content, token) => {
  return fetchWithAuth(`${BASE_URL}/${discussionId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }, token);
};

export const editReply = (replyId, content, token) => {
  return fetchWithAuth(`${BASE_URL}/replies/${replyId}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  }, token);
};

export const deleteReply = (replyId, token) => {
  return fetchWithAuth(`${BASE_URL}/replies/${replyId}`, {
    method: 'DELETE'
  }, token);
};

export const upvoteReply = (replyId, token) => {
  return fetchWithAuth(`${BASE_URL}/replies/${replyId}/upvote`, {
    method: 'POST'
  }, token);
};

export const acceptReply = (replyId, token) => {
  return fetchWithAuth(`${BASE_URL}/replies/${replyId}/accept`, {
    method: 'PUT'
  }, token);
};
