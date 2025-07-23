import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChefHat, Star, Clock, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MenuCategory, MenuItem } from '../types';

export default function MenuManagement() {
  const { menuCategories, menuItems, addMenuCategory, updateMenuCategory, deleteMenuCategory, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', order: 0 });
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    preparationTime: '',
    allergens: '',
    isPopular: false,
    isAvailable: true
  });

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const maxOrder = Math.max(...menuCategories.map(c => c.order), -1);
      addMenuCategory({
        ...newCategory,
        order: maxOrder + 1
      });
      setNewCategory({ name: '', order: 0 });
      setShowCategoryForm(false);
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      updateMenuCategory(editingCategory.id, editingCategory);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      deleteMenuCategory(id);
    }
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.categoryId) {
      addMenuItem({
        ...newItem,
        price: parseFloat(newItem.price) || 0,
        preparationTime: parseInt(newItem.preparationTime) || 0
      });
      setNewItem({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        preparationTime: '',
        allergens: '',
        isPopular: false,
        isAvailable: true
      });
      setShowItemForm(false);
    }
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      updateMenuItem(editingItem.id, {
        ...editingItem,
        price: typeof editingItem.price === 'string' ? parseFloat(editingItem.price) || 0 : editingItem.price,
        preparationTime: typeof editingItem.preparationTime === 'string' ? parseInt(editingItem.preparationTime) || 0 : editingItem.preparationTime
      });
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      deleteMenuItem(id);
    }
  };

  const moveCategoryOrder = (id: string, direction: 'up' | 'down') => {
    const category = menuCategories.find(c => c.id === id);
    if (!category) return;

    const sortedCategories = [...menuCategories].sort((a, b) => a.order - b.order);
    const currentIndex = sortedCategories.findIndex(c => c.id === id);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetCategory = sortedCategories[currentIndex - 1];
      updateMenuCategory(id, { ...category, order: targetCategory.order });
      updateMenuCategory(targetCategory.id, { ...targetCategory, order: category.order });
    } else if (direction === 'down' && currentIndex < sortedCategories.length - 1) {
      const targetCategory = sortedCategories[currentIndex + 1];
      updateMenuCategory(id, { ...category, order: targetCategory.order });
      updateMenuCategory(targetCategory.id, { ...targetCategory, order: category.order });
    }
  };

  const sortedCategories = [...menuCategories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <ChefHat className="w-8 h-8 mr-3 text-orange-600" />
          Gestion du Menu Restaurant
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Catégories
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Articles du Menu
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Catégories du Menu</h3>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Catégorie
            </button>
          </div>

          {/* Add Category Form */}
          {showCategoryForm && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-3">Ajouter une Catégorie</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom de la catégorie"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddCategory}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setShowCategoryForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {sortedCategories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-lg border shadow-sm">
                {editingCategory?.id === category.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateCategory}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-800">{category.name}</span>
                      <span className="text-sm text-gray-500">
                        ({menuItems.filter(item => item.categoryId === category.id).length} articles)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveCategoryOrder(category.id, 'up')}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Monter"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveCategoryOrder(category.id, 'down')}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Descendre"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Articles du Menu</h3>
            <button
              onClick={() => setShowItemForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Article
            </button>
          </div>

          {/* Add Item Form */}
          {showItemForm && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-3">Ajouter un Article</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nom de l'article"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <select
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Prix (HTG)"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Temps de préparation (min)"
                  value={newItem.preparationTime}
                  onChange={(e) => setNewItem({ ...newItem, preparationTime: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="url"
                  placeholder="URL de l'image"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Allergènes (séparés par des virgules)"
                  value={newItem.allergens}
                  onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="md:col-span-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
                <div className="md:col-span-2 flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.isPopular}
                      onChange={(e) => setNewItem({ ...newItem, isPopular: e.target.checked })}
                      className="mr-2"
                    />
                    Article populaire
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.isAvailable}
                      onChange={(e) => setNewItem({ ...newItem, isAvailable: e.target.checked })}
                      className="mr-2"
                    />
                    Disponible
                  </label>
                </div>
                {newItem.imageUrl && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Aperçu de l'image :</p>
                    <img
                      src={newItem.imageUrl}
                      alt="Aperçu"
                      className="w-16 h-16 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleAddItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </button>
                <button
                  onClick={() => setShowItemForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const category = menuCategories.find(c => c.id === item.categoryId);
              return (
                <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm">
                  {editingItem?.id === item.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <select
                        value={editingItem.categoryId}
                        onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {sortedCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={editingItem.preparationTime}
                        onChange={(e) => setEditingItem({ ...editingItem, preparationTime: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="url"
                        value={editingItem.imageUrl || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="URL de l'image"
                      />
                      <input
                        type="text"
                        value={editingItem.allergens || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, allergens: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Allergènes"
                      />
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="md:col-span-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="md:col-span-2 flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingItem.isPopular}
                            onChange={(e) => setEditingItem({ ...editingItem, isPopular: e.target.checked })}
                            className="mr-2"
                          />
                          Article populaire
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingItem.isAvailable}
                            onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                            className="mr-2"
                          />
                          Disponible
                        </label>
                      </div>
                      {editingItem.imageUrl && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600 mb-2">Aperçu de l'image :</p>
                          <img
                            src={editingItem.imageUrl}
                            alt="Aperçu"
                            className="w-16 h-16 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="md:col-span-2 flex space-x-2">
                        <button
                          onClick={handleUpdateItem}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            {item.isPopular && <Star className="w-4 h-4 text-yellow-500" />}
                            {!item.isAvailable && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Indisponible</span>}
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="font-medium text-green-600">{item.price} HTG</span>
                            <span className="text-blue-600">{category?.name}</span>
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}