import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, DollarSign, Clock, Moon, FileText, Download, Shield, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DataProtection } from '../utils/encryption';

type DateFilter = 'today' | 'week' | 'month' | 'year' | 'custom';

const Reports: React.FC = () => {
  const { state } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDecryptedData, setShowDecryptedData] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return { start: weekStart, end: weekEnd };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        return { start: monthStart, end: monthEnd };
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        return { start: yearStart, end: yearEnd };
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return { start: today, end: today };
      default:
        return { start: today, end: today };
    }
  };

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange();
    
    const filteredMoments = state.moments.filter(moment => {
      const momentDate = new Date(moment.date);
      return momentDate >= start && momentDate <= end;
    });

    const filteredNights = state.nights.filter(night => {
      const nightDate = new Date(night.checkInDate);
      return nightDate >= start && nightDate <= end;
    });

    return { moments: filteredMoments, nights: filteredNights };
  }, [state.moments, state.nights, dateFilter, customStartDate, customEndDate]);

  const statistics = useMemo(() => {
    const { moments, nights } = filteredData;
    
    const totalMoments = moments.length;
    const activeMoments = moments.filter(m => m.status === 'active').length;
    const completedMoments = moments.filter(m => m.status === 'completed').length;
    const cancelledMoments = moments.filter(m => m.status === 'cancelled').length;
    const momentsRevenue = moments.reduce((sum, m) => sum + (m.status !== 'cancelled' ? m.price : 0), 0);

    const totalNights = nights.length;
    const activeNights = nights.filter(n => n.status === 'active').length;
    const completedNights = nights.filter(n => n.status === 'completed').length;
    const cancelledNights = nights.filter(n => n.status === 'cancelled').length;
    const nightsRevenue = nights.reduce((sum, n) => sum + (n.status !== 'cancelled' ? n.price : 0), 0);

    const totalRevenue = momentsRevenue + nightsRevenue;

    return {
      totalMoments,
      activeMoments,
      completedMoments,
      cancelledMoments,
      momentsRevenue,
      totalNights,
      activeNights,
      completedNights,
      cancelledNights,
      nightsRevenue,
      totalRevenue
    };
  }, [filteredData]);

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return "Aujourd'hui";
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'year': return 'Cette année';
      case 'custom': return 'Période personnalisée';
      default: return '';
    }
  };

  // Basculer l'affichage des données décryptées avec PIN
  const toggleDecryptedView = async () => {
    if (!showDecryptedData) {
      // Demander le PIN avant de révéler les données
      const pinVerified = await DataProtection.requestSecurityPin();
      
      if (pinVerified) {
        setShowDecryptedData(true);
      }
    } else {
      // Masquer les données (pas besoin de PIN)
      setShowDecryptedData(false);
    }
  };

  const exportReport = () => {
    const { start, end } = getDateRange();
    
    // Préparer les données pour l'export (avec ou sans cryptage selon le choix)
    const prepareDataForExport = (items: any[], type: 'moment' | 'night') => {
      return items.map(item => {
        if (showDecryptedData) {
          // Export avec données décryptées (pour usage interne sécurisé)
          return {
            ...item,
            person1: DataProtection.decryptPersonData(item.person1),
            person2: DataProtection.decryptPersonData(item.person2)
          };
        } else {
          // Export avec données masquées (pour partage sécurisé)
          return {
            ...item,
            person1: DataProtection.maskPersonDataForDisplay(item.person1),
            person2: DataProtection.maskPersonDataForDisplay(item.person2)
          };
        }
      });
    };

    const reportData = {
      periode: `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`,
      export_type: showDecryptedData ? 'DONNÉES_DÉCRYPTÉES' : 'DONNÉES_PROTÉGÉES',
      avertissement: showDecryptedData ? 
        'ATTENTION: Ce rapport contient des données personnelles décryptées. Manipuler avec précaution.' :
        'Ce rapport contient des données masquées pour la protection de la vie privée.',
      statistiques: statistics,
      moments: prepareDataForExport(filteredData.moments, 'moment'),
      nuits: prepareDataForExport(filteredData.nights, 'night')
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportType = showDecryptedData ? 'DECRYPTE' : 'PROTEGE';
    const exportFileDefaultName = `rapport_parapli_room_${exportType}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Obtenir les données d'affichage pour les réservations
  const getDisplayDataForBooking = (booking: any, type: 'moment' | 'night') => {
    if (showDecryptedData) {
      return {
        ...booking,
        person1: DataProtection.decryptPersonData(booking.person1),
        person2: DataProtection.decryptPersonData(booking.person2)
      };
    } else {
      return {
        ...booking,
        person1: DataProtection.maskPersonDataForDisplay(booking.person1),
        person2: DataProtection.maskPersonDataForDisplay(booking.person2)
      };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
        <div className="flex items-center space-x-4">
          {/* Bouton pour basculer l'affichage des données avec PIN */}
          <button
            onClick={toggleDecryptedView}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              showDecryptedData
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            title={showDecryptedData ? 'Masquer les données sensibles' : 'Révéler les données sensibles (PIN requis)'}
          >
            {showDecryptedData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showDecryptedData ? 'Masquer' : 'Révéler'}</span>
          </button>
          
          <button
            onClick={exportReport}
            className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-200 shadow-lg flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className={`border rounded-lg p-4 ${
        showDecryptedData 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            showDecryptedData ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <Shield className={`h-5 w-5 ${
              showDecryptedData ? 'text-red-600' : 'text-green-600'
            }`} />
          </div>
          <div className={`text-sm ${
            showDecryptedData ? 'text-red-800' : 'text-green-800'
          }`}>
            <p className="font-medium mb-1">
              {showDecryptedData ? '⚠️ Mode Données Décryptées' : '🔒 Mode Données Protégées'}
            </p>
            <p>
              {showDecryptedData 
                ? 'Les informations personnelles sont actuellement visibles. Utilisez ce mode avec précaution et uniquement si nécessaire.'
                : 'Les informations personnelles sont masquées par des "xxxxx" pour protéger la confidentialité des clients. Utilisez le PIN pour révéler si nécessaire.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Période de Rapport
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {[
            { value: 'today', label: "Aujourd'hui" },
            { value: 'week', label: 'Cette semaine' },
            { value: 'month', label: 'Ce mois' },
            { value: 'year', label: 'Cette année' },
            { value: 'custom', label: 'Personnalisé' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDateFilter(option.value as DateFilter)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                dateFilter === option.value
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Période sélectionnée:</strong> {getDateFilterLabel()}
            {dateFilter === 'custom' && customStartDate && customEndDate && 
              ` (${new Date(customStartDate).toLocaleDateString('fr-FR')} - ${new Date(customEndDate).toLocaleDateString('fr-FR')})`
            }
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Moments</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalMoments}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nuits</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalNights}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-red-400 p-3 rounded-lg">
              <Moon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Moments</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.momentsRevenue.toLocaleString()} HTG</p>
            </div>
            <div className="bg-gradient-to-r from-green-400 to-blue-400 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Total</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalRevenue.toLocaleString()} HTG</p>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moments Statistics */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            Statistiques des Moments
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Total</span>
              <span className="font-bold text-gray-900">{statistics.totalMoments}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Actifs</span>
              <span className="font-bold text-green-800">{statistics.activeMoments}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Terminés</span>
              <span className="font-bold text-blue-800">{statistics.completedMoments}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Annulés</span>
              <span className="font-bold text-red-800">{statistics.cancelledMoments}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-t-2 border-gray-300">
              <span className="text-gray-700 font-medium">Revenus</span>
              <span className="font-bold text-gray-900">{statistics.momentsRevenue.toLocaleString()} HTG</span>
            </div>
          </div>
        </div>

        {/* Nights Statistics */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Moon className="h-5 w-5 mr-2 text-orange-500" />
            Statistiques des Nuits
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Total</span>
              <span className="font-bold text-gray-900">{statistics.totalNights}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Actives</span>
              <span className="font-bold text-green-800">{statistics.activeNights}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Terminées</span>
              <span className="font-bold text-blue-800">{statistics.completedNights}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Annulées</span>
              <span className="font-bold text-red-800">{statistics.cancelledNights}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-t-2 border-gray-300">
              <span className="text-gray-700 font-medium">Revenus</span>
              <span className="font-bold text-gray-900">{statistics.nightsRevenue.toLocaleString()} HTG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Réservations de la Période
          {!showDecryptedData && <Shield className="h-4 w-4 ml-2 text-green-600" />}
        </h3>
        
        {filteredData.moments.length === 0 && filteredData.nights.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune réservation pour cette période</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Moments */}
            {filteredData.moments.map((moment) => {
              const room = state.rooms.find(r => r.id === moment.roomId);
              const displayData = getDisplayDataForBooking(moment, 'moment');
              
              return (
                <div key={`moment-${moment.id}`} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Moment - Chambre {room?.number || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {moment.date} • {moment.startTime} - {moment.endTime}
                      </p>
                      <p className="text-xs text-gray-500">
                        Clients: {displayData.person1.fullName} & {displayData.person2.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{moment.price.toLocaleString()} HTG</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      moment.status === 'active' ? 'bg-green-100 text-green-800' :
                      moment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {moment.status === 'active' ? 'Actif' :
                       moment.status === 'completed' ? 'Terminé' : 'Annulé'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Nights */}
            {filteredData.nights.map((night) => {
              const room = state.rooms.find(r => r.id === night.roomId);
              const calculateNights = (checkIn: string, checkOut: string) => {
                const start = new Date(checkIn);
                const end = new Date(checkOut);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              };
              const nightCount = calculateNights(night.checkInDate, night.checkOutDate);
              const totalPrice = nightCount * state.settings.nightPrice;
              const displayData = getDisplayDataForBooking(night, 'night');
              
              return (
                <div key={`night-${night.id}`} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <Moon className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Nuit - Chambre {room?.number || 'N/A'} ({nightCount} nuit{nightCount > 1 ? 's' : ''})
                      </p>
                      <p className="text-sm text-gray-600">
                        {night.checkInDate} au {night.checkOutDate}
                      </p>
                      <p className="text-xs text-gray-500">
                        Clients: {displayData.person1.fullName} & {displayData.person2.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{totalPrice.toLocaleString()} HTG</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      night.status === 'active' ? 'bg-green-100 text-green-800' :
                      night.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {night.status === 'active' ? 'Active' :
                       night.status === 'completed' ? 'Terminée' : 'Annulée'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;