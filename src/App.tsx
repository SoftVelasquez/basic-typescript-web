import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

// Public Pages
import HomePage from '@/pages/HomePage';
import PeliculasPage from '@/pages/PeliculasPage';
import SeriesPage from '@/pages/SeriesPage';
import AnimePage from '@/pages/AnimePage';
import DoramasPage from '@/pages/DoramasPage';
import BuscarPage from '@/pages/BuscarPage';
import CategoriaPage from '@/pages/CategoriaPage';

// Admin Pages
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminContent from '@/pages/admin/Content';
import AdminContentEdit from '@/pages/admin/ContentEdit';
import AdminImport from '@/pages/admin/Import';
import AdminUsers from '@/pages/admin/Users';
import AdminMessages from '@/pages/admin/Messages';
import AdminSettings from '@/pages/admin/Settings';

// Protected Route Component
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/peliculas" element={<PeliculasPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/doramas" element={<DoramasPage />} />
          <Route path="/buscar" element={<BuscarPage />} />
          <Route path="/categoria/:genre" element={<CategoriaPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="content/new" element={<AdminContentEdit />} />
            <Route path="content/edit/:id" element={<AdminContentEdit />} />
            <Route path="import" element={<AdminImport />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
