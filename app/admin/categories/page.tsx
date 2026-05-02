'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert('Please enter category name');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (response.ok) {
        setNewCategory('');
        setShowAddModal(false);
        fetchCategories();
        alert('Category added successfully');
      } else {
        try {
          const errorData = await response.json();
          alert(`Failed to add category: ${errorData.message || `Status ${response.status}`}`);
        } catch {
          alert(`Failed to add category: Server returned ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Failed to add category', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add category'}`);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchCategories();
        alert('Category deleted successfully');
      } else {
        try {
          const errorData = await response.json();
          alert(`Failed to delete category: ${errorData.message || `Status ${response.status}`}`);
        } catch {
          alert(`Failed to delete category: Server returned ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Failed to delete category', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete category'}`);
    }
  };

  const handleEditCategory = async () => {
    if (!editName.trim()) {
      alert('Please enter category name');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditName('');
        fetchCategories();
        alert('Category updated successfully');
      } else {
        try {
          const errorData = await response.json();
          alert(`Failed to update category: ${errorData.message || `Status ${response.status}`}`);
        } catch {
          alert(`Failed to update category: Server returned ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Failed to update category', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update category'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm md:text-base text-gray-500">Manage your menu categories</p>
      </div>

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
