import React, { useState } from 'react';
import { ChefHat, Clock, Star, AlertCircle, QrCode, Share2, ArrowLeft, Filter, Search, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRCodeGenerator from './QRCodeGenerator';

interface PublicMenuProps {
  onBack: () => void;
}

const PublicMenu: React.FC<PublicMenuProps> = ({ onBack }) => {
  const { state } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrer les catégories actives et les trier
  const activeCategories = state.menuCategories
    .filter(cat => cat.isActive)
    .sort((a, b) => a.order - b.order);

  // Filtrer les articles disponibles
  const availableItems = state.menuItems.filter(item => item.isAvailable);

  // Filtrer par catégorie et recherche
  const filteredItems = availableItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Grouper les articles par catégorie
  const itemsByCategory = activeCategories.map(category => ({
    category,
    items: filteredItems.filter(item => item.categoryId === category.id)
  })).filter(group => group.items.length > 0);

  // Articles populaires
  const popularItems = availableItems.filter(item => item.isPopular);

  // Générer l'URL du menu
  const getMenuUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?view=menu`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-green-400 to-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-400 to-blue-400 p-3 rounded-xl">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{state.settings.restaurantName}</h1>
                  <p className="text-sm text-gray-600">{state.settings.restaurantDescription}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQRCode(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
                title="Partager le menu"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden md:inline">QR Menu</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${state.settings.restaurantName} - Menu`,
                      text: 'Découvrez notre délicieux menu',
                      url: getMenuUrl()
                    });
                  } else {
                    navigator.clipboard.writeText(getMenuUrl());
                    alert('Lien du menu copié !');
                  }
                }}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">Partager</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </button>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tout voir
                </button>
                {activeCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Popular Items */}
        {popularItems.length > 0 && selectedCategory === 'all' && !searchTerm && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 mr-3 text-yellow-500 fill-current" />
              Nos Spécialités
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularItems.map(item => {
                const category = state.menuCategories.find(cat => cat.id === item.categoryId);
                return (
                  <div key={item.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">{item.price.toLocaleString()} HTG</span>
                          {item.preparationTime && (
                            <span className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.preparationTime}min
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-yellow-600 font-medium">{category?.name}</span>
                      </div>
                    </div>
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-orange-600 mt-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>Allergènes: {item.allergens.join(', ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu by Categories */}
        <div className="space-y-8">
          {itemsByCategory.map(({ category, items }) => (
            <div key={category.id} className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  {category.description && (
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="bg-gradient-to-r from-green-400 to-blue-400 p-3 rounded-lg">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {items.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-green-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                          {item.isPopular && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">{item.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="text-xl font-bold text-green-600">{item.price.toLocaleString()} HTG</span>
                          </div>
                          {item.preparationTime && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{item.preparationTime} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.allergens && item.allergens.length > 0 && (
                      <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-2 text-sm text-orange-700">
                          <AlertCircle className="h-4 w-4" />
                          <span><strong>Allergènes:</strong> {item.allergens.join(', ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun plat trouvé</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Aucun plat disponible dans cette catégorie'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm space-y-2">
          <p>🍽️ Menu mis à jour en temps réel</p>
          <p>📞 Pour commander : +509 4893-9310</p>
          <p>📍 16, Rue Pomeyrac, Delmas 95</p>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs">© 2024 {state.settings.restaurantName} - Saveurs authentiques</p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeGenerator
          url={getMenuUrl()}
          onClose={() => setShowQRCode(false)}
        />
      )}

      {/* Floating QR Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowQRCode(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
          title="QR Code du Menu"
        >
          <QrCode className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default PublicMenu;