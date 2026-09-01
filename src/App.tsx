import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import { PublicCatalog } from './pages/PublicCatalog';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthScreen } from './components/AuthScreen';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { Building2, Settings, LogOut, ShieldAlert, Globe } from 'lucide-react';

function PublicCatalogWrapper() {
  const { tenantId } = useParams<{ tenantId?: string }>();
  return <PublicCatalog tenantId={tenantId} />;
}

export function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center text-sm shadow border-b border-gray-800">
        <div className="font-bold tracking-wide flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-400" /> Sistema Imobiliário Multi-Tenant
        </div>
        <div className="flex items-center gap-4">
          {user?.tenantId && (
            <Link to={`/catalog/${user.tenantId}`} className="hover:text-blue-300 transition flex items-center gap-1">
              <Globe className="h-4 w-4" /> Site Público da Imobiliária
            </Link>
          )}
          {user?.role === 'SUPER_ADMIN' ? (
            <Link to="/super-admin" className="hover:text-purple-300 transition flex items-center gap-1 text-purple-400 font-semibold">
              <ShieldAlert className="h-4 w-4" /> Super Admin
            </Link>
          ) : user ? (
            <Link to="/admin" className="hover:text-blue-300 transition flex items-center gap-1">
              <Settings className="h-4 w-4" /> Painel Admin
            </Link>
          ) : null}
          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
              <span className="text-xs text-gray-300">Olá, <b>{user.name}</b></span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition flex items-center gap-1">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          ) : (
            <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-semibold transition">
              Entrar / Registrar
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/catalog/:tenantId" element={<PublicCatalogWrapper />} />
        <Route path="/catalog" element={<PublicCatalogWrapper />} />
        <Route path="/" element={<PublicCatalogWrapper />} />
        <Route
          path="/auth"
          element={user ? <Navigate to={user.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin'} /> : <AuthScreen onLoginSuccess={(u) => setUser(u)} />}
        />
        <Route
          path="/admin"
          element={user ? (user.role === 'SUPER_ADMIN' ? <Navigate to="/super-admin" /> : <AdminDashboard />) : <Navigate to="/auth" />}
        />
        <Route
          path="/super-admin"
          element={user?.role === 'SUPER_ADMIN' ? <SuperAdminPanel /> : <Navigate to="/auth" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;