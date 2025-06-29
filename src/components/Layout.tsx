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
              {/* QR Code Button */}
              <button
                onClick={() => setShowQRCode(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
                title="Générer QR Code pour accès public"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden md:inline">QR Code</span>
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

            {/* QR Code Section in Sidebar */}
            <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg inline-block mb-3">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">QR Code Client</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Générez un QR code pour que vos clients puissent voir la disponibilité en temps réel
                </p>
                <button
                  onClick={() => setShowQRCode(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Générer QR Code
                </button>
              </div>
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
    </div>
  );
};

export default Layout;