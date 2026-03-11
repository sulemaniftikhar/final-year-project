import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Copy, Upload, RefreshCw } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { menuService } from '../../services/menu.service';
import toast from 'react-hot-toast';

const MenuManagement = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState('');
  // Controlled form state for the editor drawer
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
  });

  // Get restaurantId from localStorage or session (set on login)
  const restaurantId = localStorage.getItem('restaurantId') || sessionStorage.getItem('restaurantId');

  useEffect(() => {
    const shouldOpenFromState = location.state?.openEditor;
    const shouldOpenFromQuery = searchParams.get('add') === '1';
    if (shouldOpenFromState || shouldOpenFromQuery) {
      const item = location.state?.currentItem ?? null;
      setCurrentItem(item);
      setFormData({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price || '',
        categoryId: item?.categoryId || '',
        image: item?.image || '',
      });
      setImagePreview(item?.image || '');
      setEditorOpen(true);
    }
  }, [location.state, searchParams]);

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // Load menu from backend
  const loadMenu = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const data = await menuService.getMenuByRestaurantId(restaurantId);
      const cats = data.data || [];
      setCategories(cats.map(c => ({ id: c.id, name: c.name, count: c.menuItems?.length || 0, visible: c.visible })));
      const allItems = cats.flatMap(c => (c.menuItems || []).map(item => ({ ...item, category: c.name })));
      setItems(allItems);
    } catch (err) {
      console.error('Failed to load menu', err);
      // Fall back to empty state without crashing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMenu(); }, [restaurantId]);

  const handleItemSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      categoryId: item.categoryId || '',
      image: item.image || '',
    });
    setImagePreview(item.image || '');
    setEditorOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(f => ({ ...f, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategory = async () => {
    const name = window.prompt('Category name');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed || !restaurantId) return;
    try {
      const res = await menuService.createCategory(restaurantId, { name: trimmed, sortOrder: categories.length });
      const newCat = res.data;
      setCategories(prev => [...prev, { id: newCat.id, name: newCat.name, count: 0, visible: newCat.visible }]);
      toast.success(`Category "${trimmed}" added!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add category');
    }
  };

  const handleSaveItem = async () => {
    if (!restaurantId) { toast.error('Restaurant ID not found'); return; }
    const name = formData.name.trim();
    const price = parseFloat(formData.price);
    if (!name) { toast.error('Item name is required'); return; }
    if (!price || price <= 0) { toast.error('Valid price is required'); return; }
    const catId = formData.categoryId || categories[0]?.id;
    if (!catId) { toast.error('Please add a category first'); return; }
    setSaving(true);
    try {
      const payload = {
        name,
        description: formData.description || '',
        price,
        categoryId: catId,
        inStock: true,
        image: formData.image || null,
      };
      if (currentItem?.id) {
        await menuService.updateMenuItem(restaurantId, currentItem.id, payload);
        toast.success('Item updated!');
      } else {
        await menuService.createMenuItem(restaurantId, payload);
        toast.success('Item added to menu!');
      }
      await loadMenu();
      setEditorOpen(false);
      setCurrentItem(null);
      setFormData({ name: '', description: '', price: '', categoryId: '', image: '' });
      setImagePreview('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!restaurantId || !window.confirm('Delete this item?')) return;
    try {
      await menuService.deleteMenuItem(restaurantId, itemId);
      toast.success('Item deleted');
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      toast.error('Could not delete item');
    }
  };

  const handleToggleStock = async (item) => {
    if (!restaurantId) return;
    try {
      await menuService.updateMenuItemStock(restaurantId, item.id, { inStock: !item.inStock });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, inStock: !i.inStock } : i));
    } catch (err) {
      toast.error('Could not update stock status');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'in' && item.inStock) ||
      (stockFilter === 'out' && !item.inStock);
    // Note: simplified logic for mode filter for demo
    const matchesMode = modeFilter === 'all' || item[modeFilter];
    const matchesCategory = selectedCategory === 'all' ||
      item.category === categories.find(c => c.id === selectedCategory)?.name;
    return matchesSearch && matchesStock && matchesMode && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
            {['all', 'in', 'out'].map(filter => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${stockFilter === filter ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                {filter === 'all' ? 'All' : filter === 'in' ? 'In Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadMenu} className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg" title="Refresh"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <Button variant="outline" size="sm" icon={Plus} onClick={handleAddCategory}>Add Category</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => {
            setCurrentItem(null);
            setFormData({ name: '', description: '', price: '', categoryId: categories[0]?.id || '', image: '' });
            setImagePreview('');
            setEditorOpen(true);
          }}>Add Item</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="font-semibold text-neutral-900">Categories</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              <span>All Items</span>
              <span className="bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full text-xs">{items.length}</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
              >
                <span>{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">{cat.count}</span>
                  <span className={`w-2 h-2 rounded-full ${cat.visible ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedItems.length > 0 && (
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">{selectedItems.length} items selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs bg-white">Mark Out of Stock</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-white text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Item</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-neutral-500">
                      No menu items match the current filters. Adjust filters or add a new item.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors group">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemSelect(item.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <span className="text-primary-700 font-bold text-xs">
                                  {item.name.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{item.name}</div>
                            <div className="text-xs text-neutral-500 truncate max-w-[200px]">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-neutral-900">PKR {item.price}</td>
                      <td className="p-4 text-sm text-neutral-600">{item.category}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStock(item)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border transition ${item.inStock ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditItem(item)} className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                          <button className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"><Copy size={16} /></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editor Drawer (Overlay) */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setEditorOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="font-bold text-lg text-neutral-900">{currentItem ? 'Edit Item' : 'New Item'}</h2>
              <button onClick={() => setEditorOpen(false)} className="text-neutral-500 hover:text-neutral-900">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Item Image (optional)</label>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors overflow-hidden relative"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-neutral-400 mb-2" />
                      <p className="text-sm text-neutral-500">Click to upload image</p>
                      <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WEBP</p>
                    </div>
                  )}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setImagePreview(''); setFormData(f => ({ ...f, image: '' })); }}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Chicken Burger"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.description}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of the item"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Price (PKR) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none"
                      value={formData.price}
                      onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
                    <select
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none"
                      value={formData.categoryId}
                      onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))}
                    >
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Toggles 
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h4 className="font-medium text-neutral-900">Availability</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Available for Delivery</span>
                  <input type="checkbox" className="toggle" defaultChecked={currentItem?.delivery ?? true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Available for Pickup</span>
                  <input type="checkbox" className="toggle" defaultChecked={currentItem?.pickup ?? true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">In Stock</span>
                  <input type="checkbox" className="toggle" defaultChecked={currentItem?.inStock ?? true} />
                </div>

              </div>
            */}

            </div>

            <div className="p-4 border-t border-neutral-200 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleSaveItem} isLoading={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
