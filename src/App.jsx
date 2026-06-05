import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Domestic from "./pages/Domestic";
import DestinationPreview from "./pages/DestinationPreview";
import TravelBriefingLanding from "./pages/TravelBriefingLanding";
import TravelBriefingHome from "./pages/TravelBriefingHome";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import { ThemeProvider } from "@/lib/ThemeContext";

/*
  AUTH BYPASS NOTE
  ─────────────────────────────────────────────────────────────────────────────
  /destination/* and /preview/* are PUBLIC customer-facing pages.
  They must render immediately without any Base44 auth check — guests do not
  have Base44 accounts.  AppShell detects public routes BEFORE mounting
  AuthProvider so the Base44 API call never fires for those routes.
  ─────────────────────────────────────────────────────────────────────────────
*/

// Routes that are public (no Base44 auth required)
const PUBLIC_PREFIXES = ["/destination/", "/preview/", "/payment/"];

const isPublicRoute = (pathname) =>
  PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/";

// ── Authenticated shell (protected routes only) ───────────────────
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

// ── Smart shell: public routes skip AuthProvider entirely ─────────
const AppShell = () => {
  const { pathname } = useLocation();

  if (isPublicRoute(pathname)) {
    return (
      <Routes>
        <Route path="/" element={<TravelBriefingHome />} />
        <Route path="/destination/:slug" element={<TravelBriefingLanding />} />
        <Route path="/preview/:slug" element={<DestinationPreview />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }

  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

// ── Root app ──────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <ThemeProvider>
        <Router>
          <AppShell />
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
