import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RoomsManagement from './components/RoomsManagement';
import MomentsManagement from './components/MomentsManagement';
import NightsManagement from './components/NightsManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';
import PublicRoomStatus from './components/PublicRoomStatus';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'admin' | 'public'>('public'); // Par défaut: public

  // Vérifier l'URL pour l'accès admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      // Vérifier si l'URL contient /admin_parapli
      if (path.includes('/admin_parapli') || hash.includes('/admin_parapli')) {
        setViewMode('admin');
      } else {
        setViewMode('public');
      }
    };

    // Vérifier au chargement
    checkAdminRoute();

    // Écouter les changements d'URL
    const handlePopState = () => {
      checkAdminRoute();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fonction pour accéder à l'admin
  const switchToAdmin = () => {
    setViewMode('admin');
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({}, '', '/admin_parapli');
  };

  // Fonction pour retourner au public
  const switchToPublic = () => {
    setViewMode('public');
    // Retourner à l'URL racine
    window.history.pushState({}, '', '/');
  };

  // Mode public - page par défaut
  if (viewMode === 'public') {
    return <PublicRoomStatus onSwitchToAdmin={switchToAdmin} />;
  }

  // Mode admin - nécessite authentification
  if (!state.isAuthenticated) {
    return <Login onSwitchToPublic={switchToPublic} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'rooms':
        return <RoomsManagement />;
      case 'moments':
        return <MomentsManagement />;
      case 'nights':
        return <NightsManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      onSwitchToPublic={switchToPublic}
    >
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;