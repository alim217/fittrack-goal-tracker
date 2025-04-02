import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, Container, Spinner, Center } from '@chakra-ui/react';

// Context for authentication state
import { AuthContext } from './context/AuthContext.jsx';

// Page Components
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GoalDetailPage from './pages/GoalDetailPage.jsx';

/**
 * Represents the main application component.
 * Sets up routing and handles protected routes based on authentication status.
 */
function App() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation(); // To pass state during redirects if needed

  // Loading State Component
  const LoadingIndicator = () => (
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>
  );

  // Protected Route Logic Element
  // Renders children if authenticated (after loading), otherwise redirects to auth page.
  const ProtectedElement = ({ children }) => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    return isAuthenticated ? children : <Navigate to="/auth" state={{ from: location }} replace />;
  };

  // Public Route Logic Element for Auth Page
  // Renders auth page if not authenticated (after loading), otherwise redirects to dashboard.
  const AuthRouteElement = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    return !isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />;
  };

  // Root Route Logic Element
  // Redirects based on authentication status after loading check.
  const RootRouteElement = () => {
     if (isLoading) {
       return <LoadingIndicator />;
     }
     return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
   };


  return (
    <Container maxW="container.lg" py={8}>
      <Routes>
        {/* Root path: Redirects based on auth status */}
        <Route path="/" element={<RootRouteElement />} />

        {/* Authentication Route: Accessible only when not authenticated */}
        <Route path="/auth" element={<AuthRouteElement />} />

        {/* Protected Routes: Accessible only when authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedElement>
              <DashboardPage />
            </ProtectedElement>
          }
        />
        <Route
          path="/goal/:goalId"
          element={
            <ProtectedElement>
              <GoalDetailPage />
            </ProtectedElement>
          }
        />

        {/* Fallback for unmatched routes (optional) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Container>
  );
}

export default App;