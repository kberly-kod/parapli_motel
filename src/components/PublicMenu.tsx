import React, { useState } from 'react';
import { Search, Filter, Star, Clock, AlertTriangle, QrCode, Share2, ChefHat, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRCodeGenerator from './QRCodeGenerator';

export default function PublicMenu() {
  const { state } = useApp();
  const { menuCategories, menuItems, settings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

  const sortedCategories = [...menuCategories].sort((a, b) => a.order - b.order);
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const popularItems = menuItems.filter(item => item.isPopular && item.isAvailable);

  const handleShare = async () => {
    const url = `${window.location.origin}/?view=menu`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Menu - ${settings.restaurantName}`,
          text: `Découvrez notre menu délicieux !`,
          url: url
        });
      } catch (error) {
        // Fallback to copy
        navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papiers !');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const menuUrl = `${window.location.origin}/?view=menu`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Notre Menu</h1>
                <p className="text-gray-600">{settings.restaurantName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQRCode(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center shadow-lg"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code Menu
              </button>
              <button
                onClick={handleShare}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex items-center shadow-lg"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="">Toutes les catégories</option>
                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Popular Items */}
        {popularItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Nos Spécialités
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularItems.map((item) => {
                const category = menuCategories.find(c => c.id === item.categoryId);
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-200">
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-yellow-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center border-2 border-yellow-300">
                            <ChefHat className="w-8 h-8 text-orange-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                            <Star className="w-4 h-4 text-yellow-500" />
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-green-600">{item.price} HTG</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              {category?.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {item.preparationTime > 0 && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.preparationTime} min
                              </span>
                            )}
                            {item.allergens && (
                              <span className="flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {item.allergens}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu by Categories */}
        <div className="space-y-8">
          {sortedCategories.map((category) => {
            const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
            
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-start space-x-4">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <ChefHat className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                {item.isPopular && <Star className="w-4 h-4 text-yellow-500" />}
                              </div>
                              <span className="text-xl font-bold text-green-600">{item.price} HTG</span>
                            </div>
                            <p className="text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {item.preparationTime > 0 && (
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {item.preparationTime} min
                                </span>
                              )}
                              {item.allergens && (
                                <span className="flex items-center">
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  Allergènes: {item.allergens}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun plat trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">QR Code Menu</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <QRCodeGenerator 
                  url={menuUrl}
                  title="Menu Restaurant"
                  description="Scannez pour voir notre menu"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  <strong>Partagez ce QR code</strong><br />
                  Vos clients peuvent le scanner pour accéder directement à votre menu !
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating QR Button */}
      <button
        onClick={() => setShowQRCode(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 z-40"
        title="QR Code Menu"
      >
        <QrCode className="w-6 h-6" />
      </button>
    </div>
  );
}