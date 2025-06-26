import React, { useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Moon, User, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Night, Person } from '../types';
import { DataProtection } from '../utils/encryption';

const NightsManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingNight, setEditingNight] = useState<Night | null>(null);
  const [showDecryptedData, setShowDecryptedData] = useState<{[key: string]: boolean}>({});
  
  // État du formulaire avec des clés stables
  const [formData, setFormData] = useState({
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    person1: { fullName: '', idNumber: '', address: '', phone: '', age: 18 },
    person2: { fullName: '', idNumber: '', address: '', phone: '', age: 18 }
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.person1.age < 18 || formData.person2.age < 18) {
      alert('Les deux personnes doivent avoir au moins 18 ans.');
      return;
    }

    if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      alert('La date de sortie doit être après la date d\'entrée.');
      return;
    }

    // Crypter les données des personnes avant de les sauvegarder
    const encryptedPerson1 = DataProtection.encryptPersonData(formData.person1);
    const encryptedPerson2 = DataProtection.encryptPersonData(formData.person2);

    if (editingNight) {
      dispatch({
        type: 'UPDATE_NIGHT',
        payload: {
          ...editingNight,
          roomId: formData.roomId,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          person1: encryptedPerson1,
          person2: encryptedPerson2
        }
      });
    } else {
      // Nouvelle nuit - statut par défaut "active"
      const newNight: Night = {
        id: Date.now().toString(),
        roomId: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        person1: encryptedPerson1,
        person2: encryptedPerson2,
        price: state.settings.nightPrice,
        status: 'active' // Statut par défaut ACTIF
      };
      dispatch({ type: 'ADD_NIGHT', payload: newNight });
    }

    resetForm();
  }, [formData, editingNight, state.settings.nightPrice, dispatch]);

  const resetForm = useCallback(() => {
    setFormData({
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      person1: { fullName: '', idNumber: '', address: '', phone: '', age: 18 },
      person2: { fullName: '', idNumber: '', address: '', phone: '', age: 18 }
    });
    setShowForm(false);
    setEditingNight(null);
  }, []);

  const handleEdit = useCallback((night: Night) => {
    setEditingNight(night);
    
    // Décrypter les données pour l'édition
    const decryptedPerson1 = DataProtection.decryptPersonData(night.person1);
    const decryptedPerson2 = DataProtection.decryptPersonData(night.person2);
    
    setFormData({
      roomId: night.roomId,
      checkInDate: night.checkInDate,
      checkOutDate: night.checkOutDate,
      person1: decryptedPerson1,
      person2: decryptedPerson2
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((nightId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette nuit ?')) {
      dispatch({ type: 'DELETE_NIGHT', payload: nightId });
    }
  }, [dispatch]);

  const updateStatus = useCallback((night: Night, status: 'active' | 'completed' | 'cancelled') => {
    dispatch({
      type: 'UPDATE_NIGHT',
      payload: { ...night, status }
    });
  }, [dispatch]);

  const calculateNights = useCallback((checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  // Filtrer les chambres disponibles pour le formulaire
  const getAvailableRooms = () => {
    if (editingNight) {
      // Si on modifie une nuit, inclure la chambre actuelle même si elle n'est pas disponible
      return state.rooms.filter(r => r.isAvailable || r.id === editingNight.roomId);
    }
    // Pour une nouvelle nuit, ne montrer que les chambres disponibles
    return state.rooms.filter(r => r.isAvailable);
  };

  // Basculer l'affichage des données décryptées pour une nuit spécifique avec PIN
  const toggleDecryptedView = async (nightId: string) => {
    const isCurrentlyDecrypted = showDecryptedData[nightId];
    
    if (!isCurrentlyDecrypted) {
      // Demander le PIN avant de révéler les données
      const pinVerified = await DataProtection.requestSecurityPin();
      
      if (pinVerified) {
        setShowDecryptedData(prev => ({
          ...prev,
          [nightId]: true
        }));
      }
    } else {
      // Masquer les données (pas besoin de PIN)
      setShowDecryptedData(prev => ({
        ...prev,
        [nightId]: false
      }));
    }
  };

  // Obtenir les données d'affichage (cryptées ou décryptées)
  const getDisplayData = (night: Night, personKey: 'person1' | 'person2') => {
    const isDecrypted = showDecryptedData[night.id];
    
    if (isDecrypted) {
      return DataProtection.decryptPersonData(night[personKey]);
    } else {
      return DataProtection.maskPersonDataForDisplay(night[personKey]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Nuits</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-500 hover:via-red-500 hover:to-yellow-500 transition-all duration-200 shadow-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle Nuit</span>
        </button>
      </div>

      {/* Information Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-1">🔒 Protection des Données Clients</p>
            <p>Toutes les informations personnelles sont <strong>automatiquement cryptées</strong> et masquées par des "xxxxx" pour protéger la confidentialité. Utilisez l'icône 👁️ avec le <strong>PIN de sécurité</strong> pour révéler temporairement les données si nécessaire.</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Moon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">🤖 Gestion Automatique des Chambres</p>
            <p>Lors de la création d'une nuit, la chambre sera automatiquement marquée comme <strong>"Occupée"</strong> et <strong>"À nettoyer"</strong>. Elle redeviendra <strong>"Libre"</strong> et <strong>"Propre"</strong> automatiquement à la fin de la période de nuit.</p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingNight ? 'Modifier la Nuit' : 'Nouvelle Nuit'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chambre
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner une chambre</option>
                    {getAvailableRooms().map(room => (
                      <option key={room.id} value={room.id}>
                        Chambre {room.number} {!room.isAvailable && editingNight?.roomId === room.id ? '(Actuelle)' : ''}
                      </option>
                    ))}
                  </select>
                  {getAvailableRooms().length === 0 && !editingNight && (
                    <p className="text-sm text-red-600 mt-1">Aucune chambre disponible</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'entrée
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de sortie
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Première Personne */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Première Personne (Données Cryptées)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={formData.person1.fullName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person1: { ...prev.person1, fullName: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Numéro d'identification"
                      value={formData.person1.idNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person1: { ...prev.person1, idNumber: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={formData.person1.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person1: { ...prev.person1, address: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone (optionnel)"
                      value={formData.person1.phone || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person1: { ...prev.person1, phone: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Âge"
                      min="18"
                      value={formData.person1.age}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person1: { ...prev.person1, age: parseInt(e.target.value) || 18 }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                {/* Deuxième Personne */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Deuxième Personne (Données Cryptées)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={formData.person2.fullName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person2: { ...prev.person2, fullName: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Numéro d'identification"
                      value={formData.person2.idNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person2: { ...prev.person2, idNumber: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={formData.person2.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person2: { ...prev.person2, address: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone (optionnel)"
                      value={formData.person2.phone || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person2: { ...prev.person2, phone: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Âge"
                      min="18"
                      value={formData.person2.age}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        person2: { ...prev.person2, age: parseInt(e.target.value) || 18 }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {formData.checkInDate && formData.checkOutDate && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <strong>🔒 Sécurité :</strong> Toutes les données personnelles seront automatiquement cryptées<br />
                        <strong>Nombre de nuits:</strong> {calculateNights(formData.checkInDate, formData.checkOutDate)}<br />
                        <strong>Prix par nuit:</strong> {state.settings.nightPrice.toLocaleString()} HTG<br />
                        <strong>Total:</strong> {(calculateNights(formData.checkInDate, formData.checkOutDate) * state.settings.nightPrice).toLocaleString()} HTG<br />
                        <strong>Statut par défaut:</strong> <span className="text-green-600 font-medium">Actif</span><br />
                        <strong>Chambre:</strong> <span className="text-orange-600 font-medium">Sera automatiquement marquée comme "Occupée" et "À nettoyer"</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-500 hover:via-red-500 hover:to-yellow-500 transition-all duration-200"
                >
                  {editingNight ? 'Modifier' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nights List */}
      <div className="space-y-4">
        {state.nights.map((night) => {
          const room = state.rooms.find(r => r.id === night.roomId);
          const nights = calculateNights(night.checkInDate, night.checkOutDate);
          const totalPrice = nights * state.settings.nightPrice;
          
          const person1Data = getDisplayData(night, 'person1');
          const person2Data = getDisplayData(night, 'person2');
          const isDecrypted = showDecryptedData[night.id];
          
          return (
            <div key={night.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 p-3 rounded-lg">
                    <Moon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Chambre {room?.number || 'N/A'} - {nights} nuit{nights > 1 ? 's' : ''}
                    </h3>
                    <p className="text-gray-600">
                      {night.checkInDate} au {night.checkOutDate} ({totalPrice.toLocaleString()} HTG)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Bouton pour révéler/masquer les données avec PIN */}
                  <button
                    onClick={() => toggleDecryptedView(night.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDecrypted 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                    title={isDecrypted ? 'Masquer les données' : 'Révéler les données (PIN requis)'}
                  >
                    {isDecrypted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  
                  <select
                    value={night.status}
                    onChange={(e) => updateStatus(night, e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Actif</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  <button
                    onClick={() => handleEdit(night)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(night.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Première Personne
                    {!isDecrypted && <Shield className="h-3 w-3 ml-2 text-green-600" />}
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Nom:</strong> {person1Data.fullName}</p>
                    <p><strong>ID:</strong> {person1Data.idNumber}</p>
                    <p><strong>Adresse:</strong> {person1Data.address}</p>
                    {person1Data.phone && <p><strong>Téléphone:</strong> {person1Data.phone}</p>}
                    <p><strong>Âge:</strong> {person1Data.age} ans</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Deuxième Personne
                    {!isDecrypted && <Shield className="h-3 w-3 ml-2 text-green-600" />}
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Nom:</strong> {person2Data.fullName}</p>
                    <p><strong>ID:</strong> {person2Data.idNumber}</p>
                    <p><strong>Adresse:</strong> {person2Data.address}</p>
                    {person2Data.phone && <p><strong>Téléphone:</strong> {person2Data.phone}</p>}
                    <p><strong>Âge:</strong> {person2Data.age} ans</p>
                  </div>
                </div>
              </div>

              {/* Indicateur de sécurité */}
              {!isDecrypted && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-green-800">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Données protégées par cryptage</span>
                    <span className="text-green-600">• Cliquez sur 👁️ et entrez le PIN pour révéler</span>
                  </div>
                </div>
              )}

              {/* Indicateur de données révélées */}
              {isDecrypted && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-red-800">
                    <EyeOff className="h-4 w-4" />
                    <span className="font-medium">⚠️ Données sensibles révélées</span>
                    <span className="text-red-600">• Cliquez sur 🚫 pour masquer à nouveau</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {state.nights.length === 0 && (
          <div className="text-center py-12">
            <Moon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune nuit enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NightsManagement;