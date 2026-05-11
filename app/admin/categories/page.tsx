'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { categoryApi } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoryApi.getAll();
      setCategories(data || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch categories. Ensure backend server is running on port 3001.';
      setError(errorMsg);
      console.error('[v0] Failed to fetch categories:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      await categoryApi.create({ name: newCategory });
      setNewCategory('');
      setShowAddModal(false);
      fetchCategories();
      alert('Category added successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add category';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to add category:', errorMsg);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? You must delete all menu items in this category first.')) return;

    try {
      await categoryApi.delete(id);
      fetchCategories();
      alert('Category deleted successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete category';
      
      // Provide helpful message for common error
      let userMessage = errorMsg;
      if (errorMsg.includes('Cannot delete category with existing menu items')) {
        userMessage = 'This category has menu items. Please delete all menu items in this category first before deleting it.';
      }
      
      alert(`Error: ${userMessage}`);
      console.error('[v0] Failed to delete category:', errorMsg);
    }
  };

  const handleEditCategory = async () => {
    if (!editName.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      await categoryApi.update(editingId!, { name: editName });
      setEditingId(null);
      setEditName('');
      fetchCategories();
      alert('Category updated successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update category';
      alert(`Error: ${errorMsg}`);
      console.error('[v0] Failed to update category:', errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm md:text-base text-gray-500">Manage your menu categories</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Make sure the backend server is running: <code className="bg-red-100 px-1 py-0.5 rounded">npm run dev</code></p>
        </div>
      )}

      <div className="flex gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Add New Category</h2>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Categories List</CardTitle>
          <CardDescription className="text-sm">{categories.length} categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Category Name</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Items</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-2 md:px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">No categories found</td>
                  </tr>
                ) : (
                  categories.map((cat: any) => (
                    <tr key={cat.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 md:px-4 font-medium">{cat.name}</td>
                      <td className="py-3 px-2 md:px-4">0</td>
                      <td className="py-3 px-2 md:px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {cat.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-2 md:px-4 flex gap-1 md:gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                        >
                          <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteCategory(cat.id)}>
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Category">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name</label>
            <Input
              placeholder="Enter category name (e.g., Starters, Main Course)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddCategory} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Add Category
            </Button>
            <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={editingId !== null} onClose={() => setEditingId(null)} title="Edit Category">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name</label>
            <Input
              placeholder="Enter category name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleEditCategory} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Update Category
            </Button>
            <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
