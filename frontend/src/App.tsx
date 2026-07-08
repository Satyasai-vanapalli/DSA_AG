import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import { ToastProvider } from './components/Toast';
import ProblemDetail from './pages/ProblemDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminCurriculum from './pages/AdminCurriculum';
import Landing from './pages/Landing';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import DailyReview from './pages/DailyReview';
import AdminInsights from './pages/AdminInsights';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Motivation from './pages/Motivation';
import Contact from './pages/Contact';
import AdminMotivation from './pages/AdminMotivation';
import AdminContact from './pages/AdminContact';
import AdminUsers from './pages/AdminUsers';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes - don't refetch if data is fresh
      gcTime: 10 * 60 * 1000,         // 10 minutes - keep unused data in cache
      retry: 2,                        // retry failed requests twice
      refetchOnWindowFocus: false,     // don't refetch when user tabs back
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Auth Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route index element={<Landing />} />
                  <Route path="learn" element={<Home category="LEARN" />} />
                  <Route path="learn-python" element={<Home category="LEARN_PYTHON" />} />
                  <Route path="learn-c" element={<Home category="LEARN_C" />} />
                  <Route path="learn-cpp" element={<Home category="LEARN_CPP" />} />
                  <Route path="learn-kotlin" element={<Home category="LEARN_KOTLIN" />} />
                  <Route path="practice" element={<Home category="PRACTICE" />} />
                  <Route path="cp" element={<Home category="CP" />} />
                  <Route path="problem/:id" element={<ProblemDetail />} />
                  <Route path="review" element={<DailyReview />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="motivation" element={<Motivation />} />
                  <Route path="contact" element={<Contact />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin" element={<ErrorBoundary><Outlet /></ErrorBoundary>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="motivation" element={<AdminMotivation />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="curriculum/learn" element={<AdminCurriculum category="LEARN" title="Learn Java Curriculum" />} />
                    <Route path="curriculum/learn-python" element={<AdminCurriculum category="LEARN_PYTHON" title="Learn Python Curriculum" />} />
                    <Route path="curriculum/learn-c" element={<AdminCurriculum category="LEARN_C" title="Learn C Curriculum" />} />
                    <Route path="curriculum/learn-cpp" element={<AdminCurriculum category="LEARN_CPP" title="Learn C++ Curriculum" />} />
                    <Route path="curriculum/learn-kotlin" element={<AdminCurriculum category="LEARN_KOTLIN" title="Learn Kotlin Curriculum" />} />
                    <Route path="curriculum/practice" element={<AdminCurriculum category="PRACTICE" title="DSA Practice Curriculum" />} />
                    <Route path="curriculum/cp" element={<AdminCurriculum category="CP" title="Competitive Programming Curriculum" />} />
                    <Route path="insights" element={<AdminInsights />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
