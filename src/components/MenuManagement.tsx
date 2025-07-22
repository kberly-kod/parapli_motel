import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChefHat, Tag, DollarSign, Clock, Star, Eye, EyeOff, Image, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MenuCategory, MenuItem } from '../types';

const MenuManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    order: 1,
    isActive: true
  });

  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: 0,
    image: '',
    isAvailable: true,
    isPopular: false,
    allergens: '',
    preparationTime: 0
  });

  // Category Management
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      dispatch({
        type: 'UPDATE_MENU_CATEGORY',
        payload: {
          ...editingCategory,
          ...categoryForm
        }
      });
    } else {
      const newCategory: MenuCategory = {
        id: Date.now().toString(),
        ...categoryForm
      };
      dispatch({ type: 'ADD_MENU_CATEGORY', payload: newCategory });
    }

    resetCategoryForm();
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      order: 1,
      isActive: true
    });
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      order: category.order,
      isActive: category.isActive
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const itemsInCategory = state.menuItems.filter(item => item.categoryId === categoryId);
    if (itemsInCategory.length > 0) {
      if (!confirm(`Cette catégorie contient ${itemsInCategory.length} article(s). Êtes-vous sûr de vouloir la supprimer ? Tous les articles seront également supprimés.`)) {
        return;
      }
    }
    dispatch({ type: 'DELETE_MENU_CATEGORY', payload: categoryId });
  };

  // Item Management
  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allergensList = itemForm.allergens ? itemForm.allergens.split(',').map(a => a.trim()) : [];
    
    if (editingItem) {
      dispatch({
        type: 'UPDATE_MENU_ITEM',
        payload: {
          ...editingItem,
          ...itemForm,
          allergens: allergensList
        }
      });
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...itemForm,
        allergens: allergensList
      };
      dispatch({ type: 'ADD_MENU_ITEM', payload: newItem });
    }

    resetItemForm();
  };

  const resetItemForm = () => {
    setItemForm({
      categoryId: '',
      name: '',
      description: '',
      price: 0,
      image: '',
      isAvailable: true,
      isPopular: false,
      allergens: '',
      preparationTime: 0
    });
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || '',
      isAvailable: item.isAvailable,
      isPopular: item.isPopular || false,
      allergens: item.allergens?.join(', ') || '',
      preparationTime: item.preparationTime || 0
    });
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      dispatch({ type: 'DELETE_MENU_ITEM', payload: itemId });
    }
  };

  const toggleItemAvailability = (item: MenuItem) => {
    dispatch({
      type: 'UPDATE_MENU_ITEM',
      payload: { ...item, isAvailable: !item.isAvailable }
    });
  };

  const sortedCategories = [...state.menuCategories].sort((a, b) => a.order - b.order);
  const getItemsForCategory = (categoryId: string) => 
    state.menuItems.filter(item => item.categoryId === categoryId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion du Menu Restaurant</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Tag className="h-4 w-4 inline mr-2" />
              Catégories
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'items'
                  ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChefHat className="h-4 w-4 inline mr-2" />
              Articles
            </button>
          </div>
        </div>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Catégories du Menu</h2>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvelle Catégorie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCategories.map((category) => {
              const itemCount = getItemsForCategory(category.id).length;
              return (
                <div key={category.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-green-400 to-blue-400 p-3 rounded-lg">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{itemCount} article(s)</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-700">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Ordre: {category.order}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Articles du Menu</h2>
            <button
              onClick={() => setShowItemForm(true)}
              className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvel Article</span>
            </button>
          </div>

          {sortedCategories.map((category) => {
            const categoryItems = getItemsForCategory(category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-green-600" />
                  {category.name}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start space-x-3 mb-3">
                        {/* Image du plat dans l'admin */}
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <ChefHat className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Contenu du plat dans l'admin */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            {item.isPopular && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="font-bold text-lg text-green-600">{item.price.toLocaleString()} HTG</span>
                            {item.preparationTime && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.preparationTime}min
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Boutons d'action dans l'admin */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleItemAvailability(item)}
                            className={`p-1 rounded-lg transition-colors duration-200 ${
                              item.isAvailable ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'
                            }`}
                            title={item.isAvailable ? 'Marquer comme indisponible' : 'Marquer comme disponible'}
                          >
                            {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Allergènes: {item.allergens.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {state.menuItems.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun article dans le menu</p>
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
            </h2>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Entrées"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Description de la catégorie"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  min="1"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Catégorie active
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-400 to-blue-400 text-white py-3 px-4 rounded-lg font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-200"
                >
                  {editingCategory ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? 'Modifier l\'Article' : 'Nouvel Article'}
            </h2>
            
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {sortedCategories.filter(cat => cat.isActive).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'article
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Griot avec Banann"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (HTG)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="850"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Description détaillée de l'article"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={itemForm.image}
                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://images.pexels.com/photos/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Utilisez des images de Pexels, Unsplash ou autres sources libres
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de préparation (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergènes (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={itemForm.allergens}
                    onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Gluten, Lactose"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Disponible</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={itemForm.isPopular}
                    onChange={(e) => setItemForm({ ...itemForm, isPopular: e.target.checked })}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">Article populaire</span>
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-400 to-blue-400 text-white py-3 px-4 rounded-lg font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-200"
                >
                  {editingItem ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetItemForm}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;