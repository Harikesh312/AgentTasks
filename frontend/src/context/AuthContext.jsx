import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // This is the hybrid memory token. 
  // It handles the "Remember Me = OFF" scenario by holding the token purely in React state.
  // When the page refreshes, this state is wiped, and since no cookie exists, the user is logged out.
  const [memoryToken, setMemoryToken] = useState(null);
  
  // Local fallback for completed questions
  const [localCompleted, setLocalCompleted] = useState(() => {
    const saved = localStorage.getItem('completedQuestions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Check auth on mount
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      // If we are mounting, memoryToken is null. We rely purely on the cookie.
      // If Remember Me was OFF, the cookie doesn't exist -> fails -> logs out (TEST 1 satisfied).
      // If Remember Me was ON, the cookie exists -> succeeds -> logs in (TEST 2, 3 satisfied).
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setMemoryToken(null);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
      setIsLoggedIn(false);
      setMemoryToken(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setMemoryToken(userData.token || null);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Failed to logout', err);
    } finally {
      setUser(null);
      setMemoryToken(null);
      setIsLoggedIn(false);
    }
  };

  const completeQuestion = async (questionId) => {
    if (isLoggedIn) {
      try {
        const headers = {};
        if (memoryToken) {
          headers['Authorization'] = `Bearer ${memoryToken}`;
        }
        
        const res = await fetch(`${API_URL}/api/auth/complete/${questionId}`, {
          method: 'POST',
          credentials: 'include',
          headers: headers
        });
        if (res.ok) {
          const completedQuestions = await res.json();
          // Re-fetch full user to get updated activityHistory
          const userRes = await fetch(`${API_URL}/api/auth/me`, {
            credentials: 'include'
          });
          if (userRes.ok) {
            const updatedUser = await userRes.json();
            setUser(updatedUser);
          } else {
            setUser({ ...user, completedQuestions });
          }
        }
      } catch (err) {
        console.error('Failed to mark question as completed', err);
      }
    } else {
      // Local storage fallback
      if (!localCompleted.includes(questionId)) {
        const updated = [...localCompleted, questionId];
        setLocalCompleted(updated);
        localStorage.setItem('completedQuestions', JSON.stringify(updated));
      }
    }
  };

  const updateProfile = async (updates) => {
    const headers = { 'Content-Type': 'application/json' };
    if (memoryToken) {
      headers['Authorization'] = `Bearer ${memoryToken}`;
    }
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
      return updatedUser;
    }
    const errData = await res.json();
    throw new Error(errData.message || 'Failed to update profile');
  };

  const completedQuestions = isLoggedIn && user ? (user.completedQuestions || []) : localCompleted;

  return (
    <AuthContext.Provider value={{ isLoggedIn, isInitializing, user, memoryToken, login, logout, completedQuestions, completeQuestion, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
