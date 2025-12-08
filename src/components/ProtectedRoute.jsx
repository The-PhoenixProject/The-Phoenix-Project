// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser, token } = useAuth();

  if (!currentUser || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;