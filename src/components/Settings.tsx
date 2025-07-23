import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, DollarSign, Building, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    momentPrice: state.settings.momentPrice,
    nightPrice: state.settings.nightPrice,
    motelName: state.settings.motelName,
  });
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [customDeleteDate, setCustomDeleteDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: formData
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
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
        if (customDeleteDate) {
          const customDate = new Date(customDeleteDate);
          const start = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate());
          const end = new Date(start);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return null;
      default:
        return null;
    }
  };

  const getDataToDelete = (period: string) => {
    const dateRange = getDateRange(period);
    if (!dateRange) return { moments: [], nights: [] };

    const { start, end } = dateRange;
    
    const momentsToDelete = state.moments.filter(moment => {
      const momentDate = new Date(moment.date);
      return momentDate >= start && momentDate <= end;
    });

    const nightsToDelete = state.nights.filter(night => {
      const nightDate = new Date(night.checkInDate);
      return nightDate >= start && nightDate <= end;
    });

    return { moments: momentsToDelete, nights: nightsToDelete };
  };

  const handleDeleteData = (period: string) => {
    const { moments, nights } = getDataToDelete(period);
    
    if (moments.length === 0 && nights.length === 0) {
      alert('Aucune donnée trouvée pour cette période.');
      return;
    }

    const dateRange = getDateRange(period);
    if (!dateRange) return;

    const periodLabel = period === 'week' ? 'cette semaine' : 
                       period === 'month' ? 'ce mois' : 
                       period === 'year' ? 'cette année' :
                       `le ${new Date(customDeleteDate).toLocaleDateString('fr-FR')}`;

    const confirmMessage = `⚠️ ATTENTION ⚠️\n\nVous êtes sur le point de supprimer DÉFINITIVEMENT :\n\n` +
                          `📅 Période : ${periodLabel}\n` +
                          `⏰ ${moments.length} moment(s)\n` +
                          `🌙 ${nights.length} nuit(s)\n\n` +
                          `💰 Revenus concernés : ${(moments.reduce((sum, m) => sum + m.price, 0) + nights.reduce((sum, n) => sum + n.price, 0)).toLocaleString()} HTG\n\n` +
                          `Cette action est IRRÉVERSIBLE !\n\n` +
                          `Tapez "SUPPRIMER" pour confirmer :`;

    const userInput = prompt(confirmMessage);
    
    if (userInput === 'SUPPRIMER') {
      // Delete moments
      moments.forEach(moment => {
        dispatch({ type: 'DELETE_MOMENT', payload: moment.id });
      });
      
      // Delete nights
      nights.forEach(night => {
        dispatch({ type: 'DELETE_NIGHT', payload: night.id });
      });

      alert(`✅ Suppression terminée !\n\n${moments.length} moment(s) et ${nights.length} nuit(s) ont été supprimés.`);
      setShowDeleteConfirm(null);
      setCustomDeleteDate('');
    } else {
      alert('❌ Suppression annulée. Aucune donnée n\'a été supprimée.');
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'year': return 'Cette année';
      case 'custom': return 'Date personnalisée';
      default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Configuration Générale */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-3 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration Générale</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Nom du Motel
              </label>
              <input
                type="text"
                value={formData.motelName}
                onChange={(e) => setFormData({ ...formData, motelName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Parapli ROOM"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Prix d'un Moment (HTG)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.momentPrice}
                  onChange={(e) => setFormData({ ...formData, momentPrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="1500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Durée: 2 heures</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Prix d'une Nuit (HTG)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.nightPrice}
                  onChange={(e) => setFormData({ ...formData, nightPrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="5000"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Durée: Une nuit complète</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-gray-900 mb-2">Informations Importantes</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Chaque réservation est limitée à exactement 2 personnes</li>
                <li>• L'âge minimum requis est de 18 ans pour chaque personne</li>
                <li>• Les prix sont en Gourdes Haïtiennes (HTG)</li>
                <li>• Les modifications prennent effet immédiatement</li>
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Sauvegarder</span>
              </button>

              {saved && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
                  Paramètres sauvegardés avec succès !
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Gestion des Données */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg">
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Données</h2>
              <p className="text-sm text-red-600 font-medium">⚠️ Zone Dangereuse - Actions Irréversibles</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">ATTENTION !</p>
                <p>La suppression de données est définitive et ne peut pas être annulée. Assurez-vous d'avoir une sauvegarde avant de procéder.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Supprimer les Données par Période
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['week', 'month', 'year'].map((period) => {
                const { moments, nights } = getDataToDelete(period);
                const totalRevenue = moments.reduce((sum, m) => sum + m.price, 0) + nights.reduce((sum, n) => sum + n.price, 0);
                
                return (
                  <div key={period} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">{getPeriodLabel(period)}</h4>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p>📅 {moments.length} moment(s)</p>
                      <p>🌙 {nights.length} nuit(s)</p>
                      <p className="font-medium">💰 {totalRevenue.toLocaleString()} HTG</p>
                    </div>
                    <button
                      onClick={() => handleDeleteData(period)}
                      disabled={moments.length === 0 && nights.length === 0}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        moments.length === 0 && nights.length === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Supprimer
                    </button>
                  </div>
                );
              })}

              {/* Custom Date Deletion */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Date Personnalisée</h4>
                <input
                  type="date"
                  value={customDeleteDate}
                  onChange={(e) => setCustomDeleteDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {customDeleteDate && (
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    {(() => {
                      const { moments, nights } = getDataToDelete('custom');
                      const totalRevenue = moments.reduce((sum, m) => sum + m.price, 0) + nights.reduce((sum, n) => sum + n.price, 0);
                      return (
                        <>
                          <p>📅 {moments.length} moment(s)</p>
                          <p>🌙 {nights.length} nuit(s)</p>
                          <p className="font-medium">💰 {totalRevenue.toLocaleString()} HTG</p>
                        </>
                      );
                    })()}
                  </div>
                )}
                <button
                  onClick={() => handleDeleteData('custom')}
                  disabled={!customDeleteDate}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    !customDeleteDate
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  <Trash2 className="h-4 w-4 inline mr-1" />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Delete All Data */}
            <div className="border-t pt-6">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h4 className="font-bold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Suppression Totale
                </h4>
                <p className="text-sm text-red-800 mb-4">
                  Supprimer TOUTES les données (moments, nuits) de l'application. Cette action supprimera définitivement tout l'historique.
                </p>
                <button
                  onClick={() => {
                    const totalMoments = state.moments.length;
                    const totalNights = state.nights.length;
                    const totalRevenue = state.moments.reduce((sum, m) => sum + m.price, 0) + state.nights.reduce((sum, n) => sum + n.price, 0);
                    
                    if (totalMoments === 0 && totalNights === 0) {
                      alert('Aucune donnée à supprimer.');
                      return;
                    }

                    const confirmMessage = `🚨 SUPPRESSION TOTALE 🚨\n\n` +
                                          `Vous allez supprimer DÉFINITIVEMENT :\n\n` +
                                          `⏰ ${totalMoments} moment(s)\n` +
                                          `🌙 ${totalNights} nuit(s)\n` +
                                          `💰 ${totalRevenue.toLocaleString()} HTG de revenus\n\n` +
                                          `⚠️ CETTE ACTION EST IRRÉVERSIBLE ! ⚠️\n\n` +
                                          `Tapez "TOUT SUPPRIMER" pour confirmer :`;

                    const userInput = prompt(confirmMessage);
                    
                    if (userInput === 'TOUT SUPPRIMER') {
                      state.moments.forEach(moment => {
                        dispatch({ type: 'DELETE_MOMENT', payload: moment.id });
                      });
                      state.nights.forEach(night => {
                        dispatch({ type: 'DELETE_NIGHT', payload: night.id });
                      });
                      alert(`✅ Suppression totale terminée !\n\nToutes les données ont été supprimées.`);
                    } else {
                      alert('❌ Suppression annulée.');
                    }
                  }}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Supprimer Toutes les Données</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques du Système</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{state.rooms.length}</p>
              <p className="text-sm text-gray-600">Chambres</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{state.moments.length}</p>
              <p className="text-sm text-gray-600">Moments</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{state.nights.length}</p>
              <p className="text-sm text-gray-600">Nuits</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {(state.moments.reduce((sum, m) => sum + m.price, 0) + 
                  state.nights.reduce((sum, n) => sum + n.price, 0)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">HTG Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;