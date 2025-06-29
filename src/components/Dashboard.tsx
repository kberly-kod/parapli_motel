import React from 'react';
import { Clock, Moon, Bed, DollarSign, Users, Calendar, QrCode, Smartphone, Zap, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  const activeMoments = state.moments.filter(m => m.status === 'active').length;
  const activeNights = state.nights.filter(n => n.status === 'active').length;
  const availableRooms = state.rooms.filter(r => r.isAvailable).length;
  const totalRevenue = state.moments.reduce((sum, m) => sum + m.price, 0) + 
                      state.nights.reduce((sum, n) => sum + n.price, 0);

  const stats = [
    {
      title: 'Moments Actifs',
      value: activeMoments,
      icon: Clock,
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Nuits Actives',
      value: activeNights,
      icon: Moon,
      color: 'from-orange-400 to-red-400',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Chambres Libres',
      value: availableRooms,
      icon: Bed,
      color: 'from-red-400 to-yellow-400',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Revenus Total',
      value: `${totalRevenue.toLocaleString()} HTG`,
      icon: DollarSign,
      color: 'from-green-400 to-blue-400',
      bgColor: 'bg-green-50'
    }
  ];

  const recentActivity = [
    ...state.moments.slice(-3).map(m => ({
      type: 'Moment',
      room: state.rooms.find(r => r.id === m.roomId)?.number || 'N/A',
      time: m.startTime,
      date: m.date,
      status: m.status
    })),
    ...state.nights.slice(-3).map(n => ({
      type: 'Nuit',
      room: state.rooms.find(r => r.id === n.roomId)?.number || 'N/A',
      time: 'Check-in',
      date: n.checkInDate,
      status: n.status
    }))
  ].slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* QR Code Info Banner - Plus visible et attractif */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl animate-pulse">
              <QrCode className="h-12 w-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🚀 Nouveau : QR Code Client</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Permettez à vos clients de voir la disponibilité des chambres en temps réel via QR code
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Temps réel</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-pink-600">
                  <Smartphone className="h-4 w-4" />
                  <span className="font-medium">Mobile optimisé</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">Interface publique</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer">
              Cliquez sur "QR Code" dans le header
            </div>
            <p className="text-sm text-gray-600 mt-2">ou dans la sidebar ⬅️</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} p-6 rounded-xl shadow-lg border border-gray-100`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Room Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
            Activité Récente
          </h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'Moment' ? 'bg-yellow-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'Moment' ? 
                      <Clock className="h-4 w-4 text-yellow-600" /> : 
                      <Moon className="h-4 w-4 text-orange-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.type} - Chambre {activity.room}</p>
                    <p className="text-sm text-gray-500">{activity.date} à {activity.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'active' ? 'bg-green-100 text-green-800' :
                  activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activity.status === 'active' ? 'Actif' :
                   activity.status === 'completed' ? 'Terminé' : 'Annulé'}
                </span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </div>

        {/* Room Status */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bed className="h-5 w-5 mr-2 text-red-500" />
            État des Chambres
          </h2>
          <div className="space-y-3">
            {state.rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bed className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Chambre {room.number}</span>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.isAvailable ? 'Libre' : 'Occupée'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.isClean ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.isClean ? 'Propre' : 'À nettoyer'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;