import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Clock, User, Timer, RotateCcw, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Moment, Person } from '../types';
import { DataProtection } from '../utils/encryption';

const MomentsManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDecryptedData, setShowDecryptedData] = useState<{[key: string]: boolean}>({});
  
  // État du formulaire avec des clés stables
  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    person1: { fullName: '', idNumber: '', address: '', phone: '', age: 18 },
    person2: { fullName: '', idNumber: '', address: '', phone: '', age: 18 }
  });

  // Timer pour mettre à jour l'heure actuelle chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Timer pour mettre à jour automatiquement les statuts
  useEffect(() => {
    const now = new Date();
    
    state.moments.forEach(moment => {
      if (moment.status === 'active') {
        const momentDate = new Date(`${moment.date}T${moment.startTime}`);
        const multiplier = moment.multiplier || 1;
        const durationMs = 2 * multiplier * 60 * 60 * 1000; // 2h * multiplicateur
        const endTime = new Date(momentDate.getTime() + durationMs);
        
        // Si le moment est terminé, changer le statut automatiquement
        if (now >= endTime) {
          dispatch({
            type: 'UPDATE_MOMENT',
            payload: { ...moment, status: 'completed' }
          });
        }
      }
    });
  }, [currentTime, state.moments, dispatch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.person1.age < 18 || formData.person2.age < 18) {
      alert('Les deux personnes doivent avoir au moins 18 ans.');
      return;
    }

    const startTime = new Date(`${formData.date}T${formData.startTime}`);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    // Crypter les données des personnes avant de les sauvegarder
    const encryptedPerson1 = DataProtection.encryptPersonData(formData.person1);
    const encryptedPerson2 = DataProtection.encryptPersonData(formData.person2);

    if (editingMoment) {
      dispatch({
        type: 'UPDATE_MOMENT',
        payload: {
          ...editingMoment,
          roomId: formData.roomId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: endTime.toTimeString().slice(0, 5),
          person1: encryptedPerson1,
          person2: encryptedPerson2
        }
      });
    } else {
      // Nouveau moment - statut par défaut "active"
      const newMoment: Moment = {
        id: Date.now().toString(),
        roomId: formData.roomId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: endTime.toTimeString().slice(0, 5),
        person1: encryptedPerson1,
        person2: encryptedPerson2,
        price: state.settings.momentPrice,
        status: 'active', // Statut par défaut ACTIF
        multiplier: 1
      };
      dispatch({ type: 'ADD_MOMENT', payload: newMoment });
    }

    resetForm();
  }, [formData, editingMoment, state.settings.momentPrice, dispatch]);

  const resetForm = useCallback(() => {
    setFormData({
      roomId: '',
      date: '',
      startTime: '',
      person1: { fullName: '', idNumber: '', address: '', phone: '', age: 18 },
      person2: { fullName: '', idNumber: '', address: '', phone: '', age: 18 }
    });
    setShowForm(false);
    setEditingMoment(null);
  }, []);

  const handleEdit = useCallback((moment: Moment) => {
    setEditingMoment(moment);
    
    // Décrypter les données pour l'édition
    const decryptedPerson1 = DataProtection.decryptPersonData(moment.person1);
    const decryptedPerson2 = DataProtection.decryptPersonData(moment.person2);
    
    setFormData({
      roomId: moment.roomId,
      date: moment.date,
      startTime: moment.startTime,
      person1: decryptedPerson1,
      person2: decryptedPerson2
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((momentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce moment ?')) {
      dispatch({ type: 'DELETE_MOMENT', payload: momentId });
    }
  }, [dispatch]);

  const updateStatus = useCallback((moment: Moment, status: 'active' | 'completed' | 'cancelled') => {
    dispatch({
      type: 'UPDATE_MOMENT',
      payload: { ...moment, status }
    });
  }, [dispatch]);

  const extendMoment = useCallback((momentId: string, multiplier: number) => {
    if (confirm(`Êtes-vous sûr de vouloir ${multiplier === 2 ? 'doubler' : multiplier === 3 ? 'tripler' : `multiplier par ${multiplier}`} ce moment ?`)) {
      dispatch({
        type: 'EXTEND_MOMENT',
        payload: { id: momentId, multiplier }
      });
    }
  }, [dispatch]);

  // Calculer le temps restant pour un moment avec chronomètre en temps réel
  const getTimeRemaining = useCallback((moment: Moment) => {
    if (moment.status !== 'active') return null;
    
    const now = currentTime;
    const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
    const multiplier = moment.multiplier || 1;
    const durationMs = 2 * multiplier * 60 * 60 * 1000; // 2h * multiplicateur
    const endDateTime = new Date(startDateTime.getTime() + durationMs);
    
    if (now >= endDateTime) return 'Terminé';
    
    const diffMs = endDateTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min ${diffSeconds}s`;
    } else {
      return `${diffSeconds}s`;
    }
  }, [currentTime]);

  // Calculer le temps écoulé depuis le début
  const getElapsedTime = useCallback((moment: Moment) => {
    const now = currentTime;
    const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
    
    if (now < startDateTime) return '0min 0s';
    
    const diffMs = now.getTime() - startDateTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min ${diffSeconds}s`;
    } else {
      return `${diffSeconds}s`;
    }
  }, [currentTime]);

  // Filtrer les chambres disponibles pour le formulaire
  const getAvailableRooms = () => {
    if (editingMoment) {
      // Si on modifie un moment, inclure la chambre actuelle même si elle n'est pas disponible
      return state.rooms.filter(r => r.isAvailable || r.id === editingMoment.roomId);
    }
    // Pour un nouveau moment, ne montrer que les chambres disponibles
    return state.rooms.filter(r => r.isAvailable);
  };

  // Basculer l'affichage des données décryptées pour un moment spécifique avec PIN
  const toggleDecryptedView = async (momentId: string) => {
    const isCurrentlyDecrypted = showDecryptedData[momentId];
    
    if (!isCurrentlyDecrypted) {
      // Demander le PIN avant de révéler les données
      const pinVerified = await DataProtection.requestSecurityPin();
      
      if (pinVerified) {
        setShowDecryptedData(prev => ({
          ...prev,
          [momentId]: true
        }));
      }
    } else {
      // Masquer les données (pas besoin de PIN)
      setShowDecryptedData(prev => ({
        ...prev,
        [momentId]: false
      }));
    }
  };

  // Obtenir les données d'affichage (cryptées ou décryptées)
  const getDisplayData = (moment: Moment, personKey: 'person1' | 'person2') => {
    const isDecrypted = showDecryptedData[moment.id];
    
    if (isDecrypted) {
      return DataProtection.decryptPersonData(moment[personKey]);
    } else {
      return DataProtection.maskPersonDataForDisplay(moment[personKey]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Moments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 transition-all duration-200 shadow-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Moment</span>
        </button>
      </div>

      {/* Information Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">🔒 Protection des Données Clients</p>
            <p>Toutes les informations personnelles sont <strong>automatiquement cryptées</strong> et masquées par des "xxxxx" pour protéger la confidentialité. Utilisez l'icône 👁️ avec le <strong>PIN de sécurité</strong> pour révéler temporairement les données si nécessaire.</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">🤖 Gestion Automatique des Chambres</p>
            <p>Lors de la création d'un moment, la chambre sera automatiquement marquée comme <strong>"Occupée"</strong> et <strong>"À nettoyer"</strong>. Elle redeviendra <strong>"Libre"</strong> et <strong>"Propre"</strong> automatiquement à la fin du moment.</p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingMoment ? 'Modifier le Moment' : 'Nouveau Moment'}
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
                        Chambre {room.number} {!room.isAvailable && editingMoment?.roomId === room.id ? '(Actuelle)' : ''}
                      </option>
                    ))}
                  </select>
                  {getAvailableRooms().length === 0 && !editingMoment && (
                    <p className="text-sm text-red-600 mt-1">Aucune chambre disponible</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
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

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>🔒 Sécurité :</strong> Toutes les données personnelles seront automatiquement cryptées<br />
                      <strong>Prix:</strong> {state.settings.momentPrice.toLocaleString()} HTG<br />
                      <strong>Durée:</strong> 2 heures<br />
                      <strong>Statut par défaut:</strong> <span className="text-green-600 font-medium">Actif</span><br />
                      <strong>Chambre:</strong> <span className="text-orange-600 font-medium">Sera automatiquement marquée comme "Occupée" et "À nettoyer"</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 transition-all duration-200"
                >
                  {editingMoment ? 'Modifier' : 'Enregistrer'}
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

      {/* Moments List */}
      <div className="space-y-4">
        {state.moments.map((moment) => {
          const room = state.rooms.find(r => r.id === moment.roomId);
          const timeRemaining = getTimeRemaining(moment);
          const elapsedTime = getElapsedTime(moment);
          const multiplier = moment.multiplier || 1;
          const totalDuration = 2 * multiplier; // heures totales
          
          const person1Data = getDisplayData(moment, 'person1');
          const person2Data = getDisplayData(moment, 'person2');
          const isDecrypted = showDecryptedData[moment.id];
          
          return (
            <div key={moment.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Chambre {room?.number || 'N/A'} - {moment.date}
                      {multiplier > 1 && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          x{multiplier}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600">
                      {moment.startTime} - {moment.endTime} ({moment.price.toLocaleString()} HTG)
                    </p>
                    <p className="text-sm text-gray-500">
                      Durée totale: {totalDuration}h
                    </p>
                    
                    {/* Chronomètre en temps réel */}
                    {moment.status === 'active' && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Timer className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">
                            Temps écoulé: {elapsedTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className={`text-sm font-medium ${
                            timeRemaining === 'Terminé' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {timeRemaining === 'Terminé' ? 'Temps écoulé !' : `Temps restant: ${timeRemaining}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Bouton pour révéler/masquer les données avec PIN */}
                  <button
                    onClick={() => toggleDecryptedView(moment.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDecrypted 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                    title={isDecrypted ? 'Masquer les données' : 'Révéler les données (PIN requis)'}
                  >
                    {isDecrypted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  
                  {moment.status === 'active' && (
                    <>
                      <button
                        onClick={() => extendMoment(moment.id, 2)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        title="Doubler le moment (4h total)"
                      >
                        x2
                      </button>
                      <button
                        onClick={() => extendMoment(moment.id, 3)}
                        className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors duration-200"
                        title="Tripler le moment (6h total)"
                      >
                        x3
                      </button>
                      <button
                        onClick={() => extendMoment(moment.id, 4)}
                        className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                        title="Quadrupler le moment (8h total)"
                      >
                        x4
                      </button>
                    </>
                  )}
                  <select
                    value={moment.status}
                    onChange={(e) => updateStatus(moment, e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Actif</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  <button
                    onClick={() => handleEdit(moment)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(moment.id)}
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

        {state.moments.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun moment enregistré</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentsManagement;