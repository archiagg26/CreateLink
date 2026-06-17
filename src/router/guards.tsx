import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function AuthGuard() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleGuard({ role }: { role: 'creator' | 'brand' }) {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === role) return <Outlet />;
  // redirect to the correct dashboard for the logged-in user
  return currentUser.role === 'brand' ? <Navigate to="/brand/dashboard" replace /> : <Navigate to="/feed" replace />;
}

export function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  if (!isAuthenticated) return <>{children}</>;
  // if authenticated, redirect based on role
  return currentUser?.role === 'brand' ? <Navigate to="/brand/dashboard" replace /> : <Navigate to="/feed" replace />;
}
