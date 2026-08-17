import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ProfilePage from './pages/ProfilePage';
import ContestPage from './pages/ContestPage';
import DiscussPage from './pages/DiscussPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contest" element={<ContestPage />} />
          <Route path="/discuss" element={<DiscussPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
