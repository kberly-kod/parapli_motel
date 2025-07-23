import React, { useState } from 'react';
import { Search, Filter, Star, Clock, AlertTriangle, QrCode, Share2, ChefHat, X, MapPin, Phone, Utensils } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-amber-900 via-orange-800 to-red-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-full border border-white border-opacity-30">
                <Utensils className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1 tracking-wide">{settings.restaurantName}</h1>
                <p className="text-amber-100 text-lg italic">{settings.restaurantDescription}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-amber-200">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>16, Rue Pomeyrac, Delmas 95</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>+509 4893-9310</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQRCode(true)}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center shadow-lg border border-white border-opacity-30"
              >
                <QrCode className="w-4 h-4 mr-2" />
                <span className="font-medium">QR Code</span>
              </button>
              <button
                onClick={handleShare}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center shadow-lg border border-white border-opacity-30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="font-medium">Partager</span>
              </button>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-current text-amber-50"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-current text-amber-50"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-current text-amber-50"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-amber-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-4 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none bg-white min-w-[220px] text-lg transition-all duration-200"
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
            <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">
              <Star className="w-8 h-8 mr-3 text-yellow-500 inline" />
              Nos Spécialités du Chef
              <Star className="w-8 h-8 ml-3 text-yellow-500 inline" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularItems.map((item) => {
                const category = menuCategories.find(c => c.id === item.categoryId);
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-yellow-300 hover:border-yellow-400 transform hover:-translate-y-1">
                    <div className="p-8">
                      <div className="flex items-start space-x-6">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-xl border-3 border-yellow-400 shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center border-3 border-yellow-400 shadow-lg">
                            <ChefHat className="w-10 h-10 text-amber-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="font-bold text-xl text-amber-900">{item.name}</h3>
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          </div>
                          <p className="text-gray-700 text-base mb-4 leading-relaxed">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">{item.price} HTG</span>
                            <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                              {category?.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                            {item.preparationTime > 0 && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-amber-600" />
                                {item.preparationTime} min
                              </span>
                            )}
                            {item.allergens && (
                              <span className="flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-1 text-orange-600" />
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
              <div key={category.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-8 py-6 relative">
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <h2 className="text-3xl font-bold text-white relative z-10 text-center tracking-wide">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-amber-100 text-center mt-2 relative z-10 italic">{category.description}</p>
                  )}
                </div>
                <div className="p-8">
                  <div className="grid gap-6">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="border-b border-amber-100 last:border-b-0 pb-6 last:pb-0 hover:bg-amber-50 rounded-xl p-4 transition-all duration-200">
                        <div className="flex items-start space-x-6">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-xl border-2 border-amber-200 shadow-md"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center border-2 border-amber-200 shadow-md">
                              <ChefHat className="w-10 h-10 text-amber-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-xl text-amber-900">{item.name}</h3>
                                {item.isPopular && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                              </div>
                              <span className="text-2xl font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg shadow-sm">{item.price} HTG</span>
                            </div>
                            <p className="text-gray-700 mb-3 text-base leading-relaxed">{item.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              {item.preparationTime > 0 && (
                                <span className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                  {item.preparationTime} min
                                </span>
                              )}
                              {item.allergens && (
                                <span className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
                                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
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
            <ChefHat className="w-20 h-20 text-amber-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-amber-800 mb-3">Aucun plat trouvé</h3>
            <p className="text-amber-600 text-lg">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-amber-900">QR Code Menu</h3>
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
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 text-center">
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
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 rounded-full shadow-2xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 z-40 transform hover:scale-110"
        title="QR Code Menu"
      >
        <QrCode className="w-6 h-6" />
      </button>
    </div>
  );
}