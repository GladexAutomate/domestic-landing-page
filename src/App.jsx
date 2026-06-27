import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useParams } from 'react-router-dom';
import DestinationPreview from "./pages/DestinationPreview";
import TravelBriefingLanding from "./pages/TravelBriefingLanding";
import TravelBriefingHome from "./pages/TravelBriefingHome";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import { ThemeProvider } from "@/lib/ThemeContext";
import SiteLock from "@/lib/SiteLock";

const Admin = import.meta.env.DEV ? lazy(() => import('./pages/Admin')) : null;

// Blocks -test slugs on production; passes through in local dev
function DestinationRoute() {
  const { slug } = useParams();
  if (!import.meta.env.DEV && slug?.endsWith("-test")) return <SiteLock />;
  return <TravelBriefingLanding />;
}

// Lazy-loaded: keeps Base44 SDK out of the public-route bundle entirely.
// base44Client.js calls auth.me() at module init — lazy-loading prevents
// the 401 console error on admin/landing pages.
const AuthenticatedShell = lazy(() => import('./lib/AuthenticatedShell'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));

// Routes that are public (no Base44 auth required)
const PUBLIC_PREFIXES = ["/destination/", "/preview/", "/payment/", ...(import.meta.env.DEV ? ["/admin"] : [])];

const isPublicRoute = (pathname) =>
  PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/";

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

// ── Smart shell: public routes skip AuthProvider (and Base44 SDK) entirely ──
const AppShell = () => {
  const { pathname } = useLocation();

  if (isPublicRoute(pathname)) {
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<TravelBriefingHome />} />
          <Route path="/destination/:slug" element={<DestinationRoute />} />
          <Route path="/preview/:slug" element={<DestinationPreview />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          {import.meta.env.DEV && Admin && <Route path="/admin/*" element={<Admin />} />}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <AuthenticatedShell />
    </Suspense>
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
