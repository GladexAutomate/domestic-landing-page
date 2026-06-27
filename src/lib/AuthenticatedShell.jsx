// @ts-nocheck
// Lazy-loaded shell for authenticated routes (/domestic, etc.).
// Keeping Base44 imports here means base44Client.js is NEVER loaded
// on public routes (landing page, admin) — preventing the 401 auth check.
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Domestic from '../pages/Domestic';
import PageNotFound from './PageNotFound';
import { Routes, Route } from 'react-router-dom';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/domestic" element={<Domestic />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default function AuthenticatedShell() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
