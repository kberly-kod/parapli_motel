import React, { useState } from 'react';
import { Bed, Home, Clock, Moon, Settings, Users, LogOut, BarChart3, Eye, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRCodeGenerator from './QRCodeGenerator';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSwitchToPublic?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onSwitchToPublic }) => {
  const { state, dispatch } = useApp();
  const [showQRCode, setShowQRCode] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'SET_AUTH', payload: false });
  };

  // Générer l'URL publique
  const getPublicUrl = () => {
    const baseUrl = window.location.origin;
    return baseUrl; // L'URL racine mène directement à la vue publique
  };

  const navigation = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'rooms', label: 'Chambres', icon: Bed },
    { id: 'moments', label: 'Moments', icon: Clock },
    { id: 'nights', label: 'Nuits', icon: Moon },
    { id: 'reports', label: 'Rapports', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-3 rounded-xl">
                <Bed className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{state.settings.motelName}</h1>
                <p className="text-sm text-gray-600">Système de Gestion - Mode Admin</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* QR Code Button - Plus visible */}
              <button
                onClick={() => setShowQRCode(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 animate-pulse"
                title="Générer QR Code pour accès public"
              >
                <QrCode className="h-5 w-5" />
                <span className="font-medium">QR Code Client</span>
              </button>
              
              {onSwitchToPublic && (
                <button
                  onClick={onSwitchToPublic}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden md:inline">Vue Public</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* QR Code Section in Sidebar - Plus proéminent */}
            <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl border-2 border-purple-300 shadow-lg">
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl inline-block mb-4 animate-bounce">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">🚀 QR Code Client</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Générez un QR code pour que vos clients puissent voir la disponibilité des chambres en temps réel
                </p>
                <button
                  onClick={() => setShowQRCode(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  <QrCode className="h-4 w-4 inline mr-2" />
                  Générer QR Code
                </button>
                
                {/* Indicateur visuel */}
                <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                  <span className="font-medium">Nouveau !</span>
                </div>
              </div>
            </div>

            {/* Instructions rapides */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 text-sm">💡 Comment utiliser :</h4>
              <ol className="text-xs text-blue-800 space-y-1">
                <li>1. Cliquez sur "QR Code"</li>
                <li>2. Téléchargez ou partagez</li>
                <li>3. Clients scannent avec leur téléphone</li>
                <li>4. Accès instantané à la disponibilité</li>
              </ol>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeGenerator
          url={getPublicUrl()}
          onClose={() => setShowQRCode(false)}
        />
      )}

      {/* Notification flottante pour attirer l'attention */}
      {!showQRCode && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowQRCode(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-bounce"
            title="Générer QR Code"
          >
            <QrCode className="h-6 w-6" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Générer QR Code pour clients
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;