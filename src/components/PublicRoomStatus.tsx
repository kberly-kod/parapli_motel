import React, { useState, useEffect } from 'react';
import { Bed, Clock, Moon, RefreshCw, Shield, Timer, Calendar, Wifi, Phone, MapPin, Star, Users, Info, QrCode, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRCodeGenerator from './QRCodeGenerator';

interface PublicRoomStatusProps {
  onSwitchToAdmin: () => void;
}

const PublicRoomStatus: React.FC<PublicRoomStatusProps> = ({ onSwitchToAdmin }) => {
  const { state } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showInfo, setShowInfo] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Timer pour mettre à jour l'heure actuelle chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Générer l'URL publique
  const getPublicUrl = () => {
    const baseUrl = window.location.origin;
    return baseUrl;
  };

  // Fonction pour vérifier si une chambre est actuellement occupée
  const isRoomCurrentlyOccupied = (roomId: string) => {
    const now = currentTime;
    
    // Vérifier les moments actifs
    const activeMoments = state.moments.filter(moment => {
      if (moment.roomId !== roomId || moment.status !== 'active') return false;
      
      const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
      const multiplier = moment.multiplier || 1;
      const durationMs = 2 * multiplier * 60 * 60 * 1000;
      const endDateTime = new Date(startDateTime.getTime() + durationMs);
      
      return now >= startDateTime && now < endDateTime;
    });
    
    // Vérifier les nuits actives
    const activeNights = state.nights.filter(night => {
      if (night.roomId !== roomId || night.status !== 'active') return false;
      
      const checkInDate = new Date(night.checkInDate);
      const checkOutDate = new Date(night.checkOutDate);
      checkOutDate.setHours(23, 59, 59, 999);
      
      return now >= checkInDate && now <= checkOutDate;
    });
    
    return {
      isOccupied: activeMoments.length > 0 || activeNights.length > 0,
      moments: activeMoments,
      nights: activeNights
    };
  };

  // Calculer le temps restant pour un moment
  const getTimeRemaining = (moment: any) => {
    const now = currentTime;
    const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
    const multiplier = moment.multiplier || 1;
    const durationMs = 2 * multiplier * 60 * 60 * 1000;
    const endDateTime = new Date(startDateTime.getTime() + durationMs);
    
    if (now >= endDateTime) return 'Terminé';
    
    const diffMs = endDateTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else {
      return `${diffMinutes}min`;
    }
  };

  // Statistiques générales
  const totalRooms = state.rooms.length;
  const occupiedRooms = state.rooms.filter(room => isRoomCurrentlyOccupied(room.id).isOccupied).length;
  const availableRooms = totalRooms - occupiedRooms;

  // Prochaines libérations
  const getNextAvailableRooms = () => {
    const now = currentTime;
    const upcomingAvailable = [];

    state.rooms.forEach(room => {
      const occupationStatus = isRoomCurrentlyOccupied(room.id);
      if (occupationStatus.isOccupied) {
        // Trouver la prochaine heure de libération
        let nextAvailable = null;

        occupationStatus.moments.forEach(moment => {
          const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
          const multiplier = moment.multiplier || 1;
          const endDateTime = new Date(startDateTime.getTime() + (2 * multiplier * 60 * 60 * 1000));
          
          if (!nextAvailable || endDateTime < nextAvailable) {
            nextAvailable = endDateTime;
          }
        });

        occupationStatus.nights.forEach(night => {
          const checkOutDate = new Date(night.checkOutDate);
          checkOutDate.setHours(11, 0, 0, 0); // Check-out à 11h
          
          if (!nextAvailable || checkOutDate < nextAvailable) {
            nextAvailable = checkOutDate;
          }
        });

        if (nextAvailable) {
          upcomingAvailable.push({
            room: room.number,
            availableAt: nextAvailable
          });
        }
      }
    });

    return upcomingAvailable.sort((a, b) => a.availableAt.getTime() - b.availableAt.getTime()).slice(0, 3);
  };

  const upcomingAvailable = getNextAvailableRooms();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header Public */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-3 rounded-xl">
                <Bed className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{state.settings.motelName}</h1>
                <p className="text-sm text-gray-600">Disponibilité des Chambres en Temps Réel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* QR Code Button - Nouveau dans l'espace public */}
              <button
                onClick={() => setShowQRCode(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105"
                title="Partager ce QR Code"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden md:inline">Partager QR</span>
              </button>
              
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Info className="h-4 w-4" />
                <span>Infos</span>
              </button>
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600">Dernière mise à jour</p>
                <p className="text-sm font-medium text-gray-900">
                  {lastUpdate.toLocaleTimeString('fr-FR')}
                </p>
              </div>
              <button
                onClick={onSwitchToAdmin}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                title="Accès Administrateur"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QR Code Info Banner - Dans l'espace public */}
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl animate-pulse">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">📱 Partagez cette page !</h3>
                <p className="text-gray-600">
                  Générez un QR code pour partager l'accès à cette page de disponibilité
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQRCode(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                <QrCode className="h-5 w-5" />
                <span>Générer QR Code</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${state.settings.motelName} - Disponibilité`,
                      text: 'Consultez la disponibilité des chambres en temps réel',
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Lien copié dans le presse-papiers !');
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">Partager</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal d'informations */}
        {showInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Informations </h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Services */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Services
                  </h3>    
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">Moment (2h)</span>
                      </div>
                      <span className="font-bold text-gray-900">{state.settings.momentPrice.toLocaleString()} HTG</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Nuit</span>
                      </div>
                      <span className="font-bold text-gray-900">{state.settings.nightPrice.toLocaleString()} HTG</span>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-green-500" />
                    Contact & Réservation
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>📞 <strong>Téléphone :</strong> +509 4893-9310</p>
                    <p>📍 <strong>Adresse :</strong> 16, Rue Pomeyrac, Delmas 95</p>
                    <p>⏰ <strong>Horaires :</strong> 24h/24, 7j/7</p>
                  </div>
                </div>

                {/* Règles */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Règles Importantes</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Maximum 2 personnes par chambre</li>
                    <li>• Âge minimum : 18 ans</li>
                    <li>• Pièce d'identité obligatoire</li>
                    <li>• Check-out nuit : 8h00</li>
                    <li>• Respect des autres clients</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heure Actuelle */}
        <div className="text-center mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Clock className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('fr-FR')}
              </h2>
            </div>
            <p className="text-gray-600">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Statistiques Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 p-3 rounded-lg inline-block mb-3">
              <Bed className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalRooms}</h3>
            <p className="text-gray-600">Chambres Total</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-green-100 p-3 rounded-lg inline-block mb-3">
              <Bed className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800">{availableRooms}</h3>
            <p className="text-gray-600">Chambres Libres</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-red-100 p-3 rounded-lg inline-block mb-3">
              <Bed className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-800">{occupiedRooms}</h3>
            <p className="text-gray-600">Chambres Occupées</p>
          </div>
        </div>

        {/* Prochaines Disponibilités */}
        {upcomingAvailable.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Timer className="h-5 w-5 mr-2 text-blue-500" />
              Prochaines Disponibilités
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingAvailable.map((item, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="font-bold text-gray-900">Chambre {item.room}</p>
                    <p className="text-sm text-gray-600">Libre à</p>
                    <p className="font-medium text-blue-600">
                      {item.availableAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.availableAt.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* État des Chambres */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bed className="h-6 w-6 mr-3 text-orange-500" />
              État des Chambres en Temps Réel
            </h2>
            <button
              onClick={() => setLastUpdate(new Date())}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {state.rooms.map((room) => {
              const occupationStatus = isRoomCurrentlyOccupied(room.id);
              const { isOccupied, moments, nights } = occupationStatus;
              
              return (
                <div
                  key={room.id}
                  className={`p-6 rounded-xl shadow-lg border-2 transition-all duration-300 ${
                    isOccupied
                      ? 'bg-red-50 border-red-200 hover:shadow-xl'
                      : 'bg-green-50 border-green-200 hover:shadow-xl'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className={`p-4 rounded-full inline-block mb-3 ${
                      isOccupied ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <Bed className={`h-8 w-8 ${
                        isOccupied ? 'text-red-600' : 'text-green-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Chambre {room.number}
                    </h3>
                  </div>

                  <div className="text-center mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      isOccupied
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {isOccupied ? '🔴 OCCUPÉE' : '🟢 LIBRE'}
                    </span>
                  </div>

                  {/* Détails des réservations actives */}
                  {isOccupied && (
                    <div className="space-y-3">
                      {moments.map((moment) => (
                        <div key={moment.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-900">Moment</span>
                            {moment.multiplier && moment.multiplier > 1 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                x{moment.multiplier}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>📅 {moment.date}</p>
                            <p>⏰ {moment.startTime} - {moment.endTime}</p>
                            <div className="flex items-center space-x-1">
                              <Timer className="h-3 w-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                {getTimeRemaining(moment)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {nights.map((night) => (
                        <div key={night.id} className="bg-white p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Moon className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-gray-900">Nuit</span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>📅 {night.checkInDate}</p>
                            <p>📅 {night.checkOutDate}</p>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-orange-600" />
                              <span className="font-medium text-orange-600">
                                Jusqu'au {new Date(night.checkOutDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Légende & Informations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700"><strong>Libre :</strong> Chambre disponible pour réservation</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-700"><strong>Occupée :</strong> Chambre actuellement réservée</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-gray-700"><strong>Moment :</strong> Réservation de 2h (extensible)</span>
            </div>
            <div className="flex items-center space-x-3">
              <Moon className="h-4 w-4 text-orange-600" />
              <span className="text-gray-700"><strong>Nuit :</strong> Réservation pour une ou plusieurs nuits</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Astuce :</strong> Cliquez sur "Partager QR" pour générer un QR code et partager cette page avec d'autres personnes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm space-y-2">
          <p>🔄 Mise à jour automatique toutes les 30 secondes</p>
          <p>⏰ Heure locale : {currentTime.toLocaleString('fr-FR')}</p>
          <p>📱 Interface optimisée pour mobile et desktop</p>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs">© 2024 {state.settings.motelName} - Système de gestion moderne</p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeGenerator
          url={getPublicUrl()}
          onClose={() => setShowQRCode(false)}
        />
      )}

      {/* Bouton flottant pour QR Code */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowQRCode(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-bounce"
          title="Partager QR Code"
        >
          <QrCode className="h-6 w-6" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Partager cette page
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default PublicRoomStatus;