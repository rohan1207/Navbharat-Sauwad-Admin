import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    parentId: '',
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/categories');
      if (data && data.data) {
        // Organize categories into tree structure
        const organized = organizeCategories(data.data);
        setCategories(organized);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('श्रेणी लोड करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const organizeCategories = (cats) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create map - use _id (MongoDB) or id (fallback)
    cats.forEach(cat => {
      const catId = cat._id || cat.id;
      categoryMap.set(catId?.toString(), { ...cat, children: [] });
    });

    // Second pass: build tree
    cats.forEach(cat => {
      const catId = (cat._id || cat.id)?.toString();
      const category = categoryMap.get(catId);
      if (category) {
        if (cat.parentId) {
          const parentId = (cat.parentId._id || cat.parentId || cat.parentId)?.toString();
          const parent = categoryMap.get(parentId);
          if (parent) {
            parent.children.push(category);
          } else {
            rootCategories.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      }
    });

    return rootCategories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const categoryId = editingCategory._id || editingCategory.id;
        await apiFetch(`/admin/categories/${categoryId}`, {
          method: 'PUT',
          body: formData
        });
        toast.success('श्रेणी यशस्वीरित्या अपडेट केली');
      } else {
        await apiFetch('/admin/categories', {
          method: 'POST',
          body: formData
        });
        toast.success('श्रेणी यशस्वीरित्या तयार केली');
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', nameEn: '', parentId: '', displayOrder: 0, isActive: true });
      fetchCategories();
    } catch (error) {
      toast.error('श्रेणी सेव्ह करताना त्रुटी');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      parentId: category.parentId || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm('तुम्हाला खात्री आहे की तुम्ही ही श्रेणी हटवू इच्छिता?')) {
      return;
    }

    try {
      const categoryId = category._id || category.id;
      await apiFetch(`/admin/categories/${categoryId}`, { method: 'DELETE' });
      toast.success('श्रेणी यशस्वीरित्या हटवली');
      fetchCategories();
    } catch (error) {
      toast.error('श्रेणी हटवताना त्रुटी');
    }
  };

  const toggleExpand = (category) => {
    const categoryId = (category._id || category.id)?.toString();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getAllCategoriesFlat = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(getAllCategoriesFlat(cat.children, level + 1));
      }
    });
    return result;
  };

  const renderCategoryTree = (cats, level = 0) => {
    return cats.map((category) => {
      const categoryId = (category._id || category.id)?.toString();
      return (
        <div key={categoryId}>
          <div
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-b border-gray-200 hover:bg-gray-50 ${
              level > 0 ? 'pl-4 sm:pl-8' : ''
            }`}
          >
            {category.children && category.children.length > 0 && (
              <button
                onClick={() => toggleExpand(category)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                {expandedCategories.has(categoryId) ? (
                  <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            )}
            {(!category.children || category.children.length === 0) && (
              <span className="w-4 sm:w-5"></span>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{category.name || 'No Name'}</div>
              {category.nameEn && (
                <div className="text-xs sm:text-sm text-gray-500 truncate">{category.nameEn}</div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span className={`px-1.5 sm:px-2 py-1 text-xs rounded ${
                category.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {category.isActive !== false ? 'सक्रिय' : 'निष्क्रिय'}
              </span>
              <button
                onClick={() => handleEdit(category)}
                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="p-1.5 sm:p-2 text-gray-900 hover:bg-gray-50 rounded"
              >
                <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          {category.children && category.children.length > 0 && expandedCategories.has(categoryId) && (
            <div className="ml-4">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const allCategoriesFlat = getAllCategoriesFlat(categories);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">श्रेणी व्यवस्थापन</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">श्रेणी तयार करा आणि व्यवस्थापित करा</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: '', nameEn: '', parentId: '', displayOrder: 0, isActive: true });
          }}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>नवीन श्रेणी</span>
        </button>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              {editingCategory ? 'श्रेणी संपादन' : 'नवीन श्रेणी'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  नाव (मराठी) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  नाव (English)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  मुख्य श्रेणी (उप-श्रेणीसाठी)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">मुख्य श्रेणी (None)</option>
                  {allCategoriesFlat.filter(c => !c.parentId).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label className="text-xs sm:text-sm text-gray-700">सक्रिय</label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900 text-white rounded-lg hover:bg-black"
                >
                  {editingCategory ? 'अपडेट करा' : 'तयार करा'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  रद्द करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {renderCategoryTree(categories)}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">कोणतीही श्रेणी नाही</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesManagement;

