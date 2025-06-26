import React, { useState } from 'react';
import { Plus, Edit, Trash2, Bed, Check, X, Clock, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Room } from '../types';

const RoomsManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    isAvailable: true,
    isClean: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRoom) {
      dispatch({
        type: 'UPDATE_ROOM',
        payload: {
          ...editingRoom,
          number: formData.number,
          isAvailable: formData.isAvailable,
          isClean: formData.isClean
        }
      });
    } else {
      const newRoom: Room = {
        id: Date.now().toString(),
        number: formData.number,
        isAvailable: formData.isAvailable,
        isClean: formData.isClean
      };
      dispatch({ type: 'ADD_ROOM', payload: newRoom });
    }

    setFormData({ number: '', isAvailable: true, isClean: true });
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      isAvailable: room.isAvailable,
      isClean: room.isClean
    });
    setShowForm(true);
  };

  const handleDelete = (roomId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      dispatch({ type: 'DELETE_ROOM', payload: roomId });
    }
  };

  const toggleAvailability = (room: Room) => {
    dispatch({
      type: 'UPDATE_ROOM',
      payload: { ...room, isAvailable: !room.isAvailable }
    });
  };

  const toggleCleanStatus = (room: Room) => {
    dispatch({
      type: 'UPDATE_ROOM',
      payload: { ...room, isClean: !room.isClean }
    });
  };

  // Fonction pour obtenir les réservations actives d'une chambre
  const getActiveReservations = (roomId: string) => {
    const now = new Date();
    
    const activeMoments = state.moments.filter(moment => {
      if (moment.roomId !== roomId || moment.status !== 'active') return false;
      
      const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
      const multiplier = moment.multiplier || 1;
      const durationMs = 2 * multiplier * 60 * 60 * 1000;
      const endDateTime = new Date(startDateTime.getTime() + durationMs);
      
      return now >= startDateTime && now < endDateTime;
    });
    
    const activeNights = state.nights.filter(night => {
      if (night.roomId !== roomId || night.status !== 'active') return false;
      
      const checkInDate = new Date(night.checkInDate);
      const checkOutDate = new Date(night.checkOutDate);
      checkOutDate.setHours(23, 59, 59, 999);
      
      return now >= checkInDate && now <= checkOutDate;
    });
    
    return { moments: activeMoments, nights: activeNights };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Chambres</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 transition-all duration-200 shadow-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter une Chambre</span>
        </button>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Bed className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">🤖 Gestion Automatique des Chambres</p>
            <ul className="space-y-1">
              <li>• Les chambres deviennent automatiquement <strong>"Occupées"</strong> et <strong>"À nettoyer"</strong> lors d'une nouvelle réservation</li>
              <li>• Elles redeviennent <strong>"Libres"</strong> et <strong>"Propres"</strong> automatiquement à la fin de la réservation</li>
              <li>• Vous pouvez toujours modifier manuellement le statut si nécessaire</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRoom ? 'Modifier la Chambre' : 'Nouvelle Chambre'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de Chambre
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: 101"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Disponible</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isClean}
                    onChange={(e) => setFormData({ ...formData, isClean: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Propre</span>
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 transition-all duration-200"
                >
                  {editingRoom ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
                    setFormData({ number: '', isAvailable: true, isClean: true });
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.rooms.map((room) => {
          const activeReservations = getActiveReservations(room.id);
          const hasActiveReservations = activeReservations.moments.length > 0 || activeReservations.nights.length > 0;
          
          return (
            <div key={room.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-3 rounded-lg">
                    <Bed className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chambre {room.number}</h3>
                    {hasActiveReservations && (
                      <p className="text-xs text-orange-600 font-medium">🤖 Gestion automatique active</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Disponibilité</span>
                  <button
                    onClick={() => toggleAvailability(room)}
                    disabled={hasActiveReservations}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      hasActiveReservations 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : room.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {room.isAvailable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{room.isAvailable ? 'Libre' : 'Occupée'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Propreté</span>
                  <button
                    onClick={() => toggleCleanStatus(room)}
                    disabled={hasActiveReservations}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      hasActiveReservations 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : room.isClean
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {room.isClean ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{room.isClean ? 'Propre' : 'À nettoyer'}</span>
                  </button>
                </div>
              </div>

              {/* Active Reservations Display */}
              {hasActiveReservations && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Réservations Actives:</h4>
                  <div className="space-y-2">
                    {activeReservations.moments.map(moment => (
                      <div key={moment.id} className="flex items-center space-x-2 text-xs bg-yellow-50 p-2 rounded">
                        <Clock className="h-3 w-3 text-yellow-600" />
                        <span className="text-yellow-800">
                          Moment: {moment.date} {moment.startTime}-{moment.endTime}
                          {moment.multiplier && moment.multiplier > 1 && ` (x${moment.multiplier})`}
                        </span>
                      </div>
                    ))}
                    {activeReservations.nights.map(night => (
                      <div key={night.id} className="flex items-center space-x-2 text-xs bg-orange-50 p-2 rounded">
                        <Moon className="h-3 w-3 text-orange-600" />
                        <span className="text-orange-800">
                          Nuit: {night.checkInDate} au {night.checkOutDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomsManagement;