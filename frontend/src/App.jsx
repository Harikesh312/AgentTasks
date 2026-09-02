import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ProfilePage from './pages/ProfilePage';
import ContestPage from './pages/ContestPage';
import DiscussPage from './pages/DiscussPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
function ProtectedRoute({ children }) {
  const { isLoggedIn, isInitializing } = useAuth();
  
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-off-white)' }}>
        <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { isLoggedIn, isInitializing, user } = useAuth();
  
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-off-white)' }}>
        <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/questions" element={
            <ProtectedRoute>
              <QuestionsPage />
            </ProtectedRoute>
          } />
          <Route path="/questions/:id" element={
            <ProtectedRoute>
              <QuestionDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/contest" element={
            <ProtectedRoute>
              <ContestPage />
            </ProtectedRoute>
          } />
          <Route path="/discuss" element={
            <ProtectedRoute>
              <DiscussPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="questions" element={<AdminQuestions />} />
          </Route>
        </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
}
