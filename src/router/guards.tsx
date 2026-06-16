import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function AuthGuard() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleGuard({ role }: { role: 'creator' | 'brand' }) {
  const { currentUser } = useAuthStore();
  return currentUser?.role === role ? <Outlet /> : <Navigate to="/feed" replace />;
}

export function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/feed" replace /> : <>{children}</>;
}
