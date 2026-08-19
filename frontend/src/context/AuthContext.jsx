import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  // Local fallback for completed questions
  const [localCompleted, setLocalCompleted] = useState(() => {
    const saved = localStorage.getItem('completedQuestions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchUser(token);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [token]);

  const fetchUser = async (authToken) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const completeQuestion = async (questionId) => {
    if (isLoggedIn && token) {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/complete/${questionId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const completedQuestions = await res.json();
          setUser({ ...user, completedQuestions });
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

  const completedQuestions = isLoggedIn && user ? (user.completedQuestions || []) : localCompleted;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, completedQuestions, completeQuestion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
