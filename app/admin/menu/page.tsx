'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { menuApi, categoryApi } from '@/lib/api';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    category_id: '', 
    price: '', 
    status: 'active',
    description: '',
    image: null as File | null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [itemsData, categoriesData] = await Promise.all([
        menuApi.getAll().catch(() => []),
        categoryApi.getAll().catch(() => []),
      ]);

      setItems(itemsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch data. Ensure backend server is running on port 3001.';
      setError(errorMsg);
      console.error('[v0] Failed to fetch menu data:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB for base64 storage)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      setFormData({ ...formData, image: file });
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.category_id || !formData.price) {
      alert('Please fill all fields');
      return;
    }

    try {
      const itemData: any = {
        name: formData.name,
        categoryId: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        description: formData.description || null,
      };

      // Store image as base64 if provided
      if (imagePreview && imagePreview.startsWith('data:image')) {
        itemData.image_url = imagePreview;
      }
      
      const response = await menuApi.create(itemData);
      
      // Reset form and clear file input
      setFormData({ name: '', category_id: '', price: '', status: 'active', description: '', image: null });
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowAddModal(false);
      await fetchData();
      alert('Item added successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add item';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to add item:', errorMsg, error);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name,
      category_id: item.category_id.toString(),
      price: item.price.toString(),
      status: item.status,
      description: item.description || '',
      image: null,
    });
    setImagePreview(item.image_url || '');
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!formData.name || !formData.category_id || !formData.price) {
      alert('Please fill all fields');
      return;
    }

    if (!editingItemId) return;

    try {
      const itemData: any = {
        name: formData.name,
        categoryId: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        description: formData.description || null,
        status: formData.status || 'active',
      };

      // Store new image as base64 if provided
      if (imagePreview && imagePreview.startsWith('data:image')) {
        itemData.image_url = imagePreview;
      }

      await menuApi.update(editingItemId, itemData);
      
      setEditingItemId(null);
      setFormData({ name: '', category_id: '', price: '', status: 'active', description: '', image: null });
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowEditModal(false);
      await fetchData();
      alert('Item updated successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update item';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to update item:', errorMsg, error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await menuApi.delete(id);
      await fetchData();
      alert('Item deleted successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete item';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to delete item:', { id, error: errorMsg });
    }
  };

  const filteredItems = items.filter((item: any) =>
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedCategory || item.category_id === parseInt(selectedCategory))
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-sm md:text-base text-gray-500">Manage your restaurant menu items</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Make sure categories are created first and backend server is running</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                className="pl-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg text-sm md:text-base"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Menu Items</CardTitle>
          <CardDescription className="text-sm">{filteredItems.length} items found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Image</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Item</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Price</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 md:px-4">
                      {item.image_url && !failedImages.has(item.id) ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-10 h-10 rounded object-cover" 
                          onError={() => {
                            setFailedImages(prev => new Set([...prev, item.id]));
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs">No image</div>
                      )}
                    </td>
                    <td className="py-3 px-2 md:px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-2 md:px-4 text-gray-600">{item.category_name}</td>
                    <td className="py-3 px-2 md:px-4 font-semibold">₹{item.price}</td>
                    <td className="py-3 px-2 md:px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 md:px-4 flex gap-1 md:gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                        <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Menu Item">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <Input
              placeholder="Enter item name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              placeholder="Enter item description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price (₹)</label>
            <Input
              type="number"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Item Image</label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddItem} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Add Item
            </Button>
            <Button 
              onClick={() => { 
                setShowAddModal(false); 
                setImagePreview('');
                setFormData({ name: '', category_id: '', price: '', status: 'active', description: '', image: null });
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }} 
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Menu Item">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <Input
              placeholder="Enter item name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              placeholder="Enter item description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price (₹)</label>
            <Input
              type="number"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Item Image</label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdateItem} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Update Item
            </Button>
            <Button 
              onClick={() => { 
                setShowEditModal(false); 
                setEditingItemId(null);
                setImagePreview('');
                setFormData({ name: '', category_id: '', price: '', status: 'active', description: '', image: null });
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }} 
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
        </Modal>
    </div>
  );
}
