import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiYoutube } from 'react-icons/fi';

const ShortsManagement = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShort, setEditingShort] = useState(null);
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/shorts/admin/all');
      setShorts(data || []);
    } catch (error) {
      console.error('Error fetching shorts:', error);
      toast.error('Error loading shorts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.youtubeUrl) {
      toast.error('Please enter YouTube Shorts link');
      return;
    }

    try {
      if (editingShort) {
        await apiFetch(`/shorts/admin/${editingShort._id}`, {
          method: 'PUT',
          body: formData
        });
        toast.success('Short updated successfully');
      } else {
        await apiFetch('/shorts/admin', {
          method: 'POST',
          body: formData
        });
        toast.success('Short added successfully');
      }

      setShowForm(false);
      setEditingShort(null);
      setFormData({
        youtubeUrl: '',
        order: 0,
        isActive: true
      });
      fetchShorts();
    } catch (error) {
      console.error('Error saving short:', error);
      const errorMessage = error.body?.error || error.message || 'Error saving short';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (short) => {
    setEditingShort(short);
    setFormData({
      youtubeUrl: short.youtubeUrl || '',
      order: short.order || 0,
      isActive: short.isActive !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this short?')) {
      return;
    }

    try {
      await apiFetch(`/shorts/admin/${id}`, {
        method: 'DELETE'
      });
      toast.success('Short deleted successfully');
      fetchShorts();
    } catch (error) {
      console.error('Error deleting short:', error);
      toast.error('Error deleting short');
    }
  };

  const toggleActive = async (short) => {
    try {
      await apiFetch(`/shorts/admin/${short._id}`, {
        method: 'PUT',
        body: {
          youtubeUrl: short.youtubeUrl,
          order: short.order,
          isActive: !short.isActive
        }
      });
      toast.success(`Short ${!short.isActive ? 'activated' : 'deactivated'}`);
      fetchShorts();
    } catch (error) {
      console.error('Error toggling short:', error);
      toast.error('त्रुटी');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingShort(null);
    setFormData({
      youtubeUrl: '',
      order: 0,
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">YouTube Shorts Management</h1>
          <p className="text-gray-600 mt-1">Shorts Management</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Add New Short
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingShort ? 'Edit Short' : 'Add New Short'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiYoutube className="inline w-4 h-4 mr-1" />
                YouTube Shorts Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/shorts/12TW4wthaPo?si=nww78blEXhY8VaxW"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the share link of YouTube Shorts
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingShort ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Shorts</h2>
          {shorts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No shorts added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shorts.map((short) => (
                <div key={short._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[9/16] bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${short.videoId}`}
                      title="YouTube Short"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => toggleActive(short)}
                        className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all ${short.isActive ? 'bg-green-500/90 hover:bg-green-600' : 'bg-gray-400/90 hover:bg-gray-500'} text-white`}
                      >
                        {short.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{short.order}</span>
                      <span className={`text-xs px-2 py-1 rounded ${short.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {short.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 break-all line-clamp-2">
                      {short.youtubeUrl}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(short)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        संपादित करा
                      </button>
                      <button
                        onClick={() => handleDelete(short._id)}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortsManagement;

