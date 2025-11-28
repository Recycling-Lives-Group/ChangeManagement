import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChangeForm from './pages/ChangeForm';
import ChangeDetail from './pages/ChangeDetailFull';
import AdminDashboard from './pages/AdminDashboard';
import CABReview from './pages/CABReview';
import Layout from './components/common/Layout';

// Phase 2 Features
import MetricsDashboard from './pages/MetricsDashboard';
import ChangeCalendar from './pages/ChangeCalendar';
import EffortAssessment from './pages/EffortAssessment';
import VotingSystem from './pages/VotingSystem';
import BenefitAssessment from './pages/BenefitAssessment';
import DependencyVisualization from './pages/DependencyVisualization';
import BenefitScoringConfig from './pages/BenefitScoringConfig';
import ChangeRequestDebug from './pages/ChangeRequestDebug';

function App() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/changes/new"
            element={
              isAuthenticated ? (
                <Layout>
                  <ChangeForm />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/changes/edit/:id"
            element={
              isAuthenticated ? (
                <Layout>
                  <ChangeForm />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/changes/:id"
            element={
              isAuthenticated ? (
                <Layout>
                  <ChangeDetail />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <Layout>
                  <AdminDashboard />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/cab-review"
            element={
              isAuthenticated ? (
                <Layout>
                  <CABReview />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Phase 2 Feature Routes */}
          <Route
            path="/metrics"
            element={
              isAuthenticated ? (
                <Layout>
                  <MetricsDashboard />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/calendar"
            element={
              isAuthenticated ? (
                <Layout>
                  <ChangeCalendar />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/effort-assessment"
            element={
              isAuthenticated ? (
                <Layout>
                  <EffortAssessment />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/voting"
            element={
              isAuthenticated ? (
                <Layout>
                  <VotingSystem />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/benefit-assessment"
            element={
              isAuthenticated ? (
                <Layout>
                  <BenefitAssessment />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/dependencies"
            element={
              isAuthenticated ? (
                <Layout>
                  <DependencyVisualization />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/benefit-scoring-config"
            element={
              isAuthenticated ? (
                <Layout>
                  <BenefitScoringConfig />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Debug Route - Development Only */}
          <Route
            path="/debug/changes/:id"
            element={
              isAuthenticated ? (
                <ChangeRequestDebug />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
