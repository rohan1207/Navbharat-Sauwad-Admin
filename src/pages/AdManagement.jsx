import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const AdManagement = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    position: 'left',
    title: '',
    link: '',
    order: 0,
    isActive: true
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/ads');
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Error loading ads');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && !editingAd) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('position', formData.position);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('link', formData.link);
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      
      if (file) {
        formDataToSend.append('file', file);
      }

      let result;
      if (editingAd) {
        result = await apiFetch(`/admin/ads/${editingAd._id}`, {
          method: 'PUT',
          body: formDataToSend
        });
        toast.success('Ad updated successfully');
      } else {
        result = await apiFetch('/admin/ads', {
          method: 'POST',
          body: formDataToSend
        });
        toast.success('Ad added successfully');
      }

      setShowForm(false);
      setEditingAd(null);
      setFile(null);
      setFormData({
        position: 'left',
        title: '',
        link: '',
        order: 0,
        isActive: true
      });
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('Error saving ad');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      position: ad.position,
      title: ad.title || '',
      link: ad.link || '',
      order: ad.order || 0,
      isActive: ad.isActive
    });
    setFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      await apiFetch(`/admin/ads/${id}`, {
        method: 'DELETE'
      });
      toast.success('Ad deleted successfully');
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Error deleting ad');
    }
  };

  const toggleActive = async (ad) => {
    try {
      const formData = new FormData();
      formData.append('position', ad.position);
      formData.append('title', ad.title || '');
      formData.append('link', ad.link || '');
      formData.append('order', ad.order.toString());
      formData.append('isActive', (!ad.isActive).toString());
      
      await apiFetch(`/admin/ads/${ad._id}`, {
        method: 'PUT',
        body: formData
      });
      toast.success(`Ad ${!ad.isActive ? 'activated' : 'deactivated'}`);
      fetchAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
      toast.error('त्रुटी');
    }
  };

  const groupedAds = {
    left: ads.filter(ad => ad.position === 'left').sort((a, b) => a.order - b.order),
    right: ads.filter(ad => ad.position === 'right').sort((a, b) => a.order - b.order),
    'horizontal-video': ads.filter(ad => ad.position === 'horizontal-video').sort((a, b) => a.order - b.order),
    'right-vertical-video': ads.filter(ad => ad.position === 'right-vertical-video').sort((a, b) => a.order - b.order),
    'horizontal-image': ads.filter(ad => ad.position === 'horizontal-image').sort((a, b) => a.order - b.order)
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
        <h1 className="text-2xl font-bold text-gray-900">Ads Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAd(null);
            setFormData({
              position: 'left',
              title: '',
              link: '',
              order: 0,
              isActive: true
            });
            setFile(null);
          }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiPlus /> New Ad
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAd ? 'Edit Ad' : 'New Ad'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                    setFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all bg-white text-gray-900"
                    required
                  >
                    <option value="left">Left Side (Image/Video)</option>
                    <option value="right">Right Side (Image/Video)</option>
                    <option value="horizontal-video">Horizontal Video Ad</option>
                    <option value="right-vertical-video">Right Side - Vertical Video Ad</option>
                    <option value="horizontal-image">Horizontal Image Ad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all bg-white"
                    placeholder="Ad title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all bg-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all bg-white"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2.5 w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black/20"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    File {editingAd && <span className="text-gray-400 font-normal text-xs">(Select new file to replace old one)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all bg-white file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 file:cursor-pointer"
                      accept="image/*,video/*"
                      required={!editingAd}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Image or Video (up to 10MB)
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm hover:shadow-md"
                  >
                    {uploading ? 'Saving...' : editingAd ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAd(null);
                      setFile(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ads List - Compact and Structured */}
      <div className="space-y-8">
        {/* Left Side Ads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Left Side Ads</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{groupedAds.left.length} ads</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedAds.left.map((ad) => (
              <div key={ad._id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="relative overflow-hidden bg-black">
                  {ad.videoUrl ? (
                    <video src={ad.videoUrl} className="w-full h-32 object-cover" muted />
                  ) : (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`p-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all ${ad.isActive ? 'bg-green-500/90 hover:bg-green-600' : 'bg-gray-400/90 hover:bg-gray-500'} text-white`}
                    >
                      {ad.isActive ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-1">{ad.title || 'शीर्षक नाही'}</h3>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{ad.order}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ad.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-300 transition-all font-medium"
                    >
                      <FiEdit2 className="w-3 h-3" /> संपादन
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-2 py-1.5 rounded text-xs hover:bg-red-200 transition-all font-medium"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {groupedAds.left.length === 0 && (
              <p className="text-gray-400 text-sm col-span-full text-center py-8">कोणतीही जाहिरात नाही</p>
            )}
          </div>
        </div>

        {/* Right Side Ads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">उजवी बाजू जाहिरात</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{groupedAds.right.length} जाहिरात</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedAds.right.map((ad) => (
              <div key={ad._id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="relative overflow-hidden bg-black">
                  {ad.videoUrl ? (
                    <video src={ad.videoUrl} className="w-full h-32 object-cover" muted />
                  ) : (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`p-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all ${ad.isActive ? 'bg-green-500/90 hover:bg-green-600' : 'bg-gray-400/90 hover:bg-gray-500'} text-white`}
                    >
                      {ad.isActive ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-1">{ad.title || 'शीर्षक नाही'}</h3>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{ad.order}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ad.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-300 transition-all font-medium"
                    >
                      <FiEdit2 className="w-3 h-3" /> संपादन
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-2 py-1.5 rounded text-xs hover:bg-red-200 transition-all font-medium"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {groupedAds.right.length === 0 && (
              <p className="text-gray-400 text-sm col-span-full text-center py-8">कोणतीही जाहिरात नाही</p>
            )}
          </div>
        </div>

        {/* Horizontal Video Ads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">आडवी व्हिडिओ जाहिरात</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{groupedAds['horizontal-video'].length} जाहिरात</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedAds['horizontal-video'].map((ad) => (
              <div key={ad._id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="relative overflow-hidden bg-black">
                  {ad.videoUrl ? (
                    <video src={ad.videoUrl} className="w-full h-32 object-cover" muted />
                  ) : (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`p-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all ${ad.isActive ? 'bg-green-500/90 hover:bg-green-600' : 'bg-gray-400/90 hover:bg-gray-500'} text-white`}
                    >
                      {ad.isActive ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-1">{ad.title || 'शीर्षक नाही'}</h3>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{ad.order}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ad.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-300 transition-all font-medium"
                    >
                      <FiEdit2 className="w-3 h-3" /> संपादन
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-2 py-1.5 rounded text-xs hover:bg-red-200 transition-all font-medium"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {groupedAds['horizontal-video'].length === 0 && (
              <p className="text-gray-400 text-sm col-span-full text-center py-8">कोणतीही जाहिरात नाही</p>
            )}
          </div>
        </div>

        {/* Right Vertical Video Ads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">उजवी बाजू - उभी व्हिडिओ जाहिरात</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{groupedAds['right-vertical-video'].length} जाहिरात</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedAds['right-vertical-video'].map((ad) => (
              <div key={ad._id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="relative overflow-hidden bg-black">
                  {ad.videoUrl ? (
                    <video src={ad.videoUrl} className="w-full h-32 object-cover" muted />
                  ) : (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`p-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all ${ad.isActive ? 'bg-green-500/90 hover:bg-green-600' : 'bg-gray-400/90 hover:bg-gray-500'} text-white`}
                    >
                      {ad.isActive ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-1">{ad.title || 'शीर्षक नाही'}</h3>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{ad.order}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ad.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-300 transition-all font-medium"
                    >
                      <FiEdit2 className="w-3 h-3" /> संपादन
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-2 py-1.5 rounded text-xs hover:bg-red-200 transition-all font-medium"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {groupedAds['right-vertical-video'].length === 0 && (
              <p className="text-gray-400 text-sm col-span-full text-center py-8">कोणतीही जाहिरात नाही</p>
            )}
          </div>
        </div>

        {/* Horizontal Image Ads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">आडवी इमेज जाहिरात</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{groupedAds['horizontal-image'].length} जाहिरात</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedAds['horizontal-image'].map((ad) => (
              <div key={ad._id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group">
                <div className="relative overflow-hidden bg-black">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`p-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all ${ad.isActive ? 'bg-green-500/90 hover:bg-green-600' : 'bg-gray-400/90 hover:bg-gray-500'} text-white`}
                    >
                      {ad.isActive ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-1">{ad.title || 'शीर्षक नाही'}</h3>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{ad.order}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ad.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-300 transition-all font-medium"
                    >
                      <FiEdit2 className="w-3 h-3" /> संपादन
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-2 py-1.5 rounded text-xs hover:bg-red-200 transition-all font-medium"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {groupedAds['horizontal-image'].length === 0 && (
              <p className="text-gray-400 text-sm col-span-full text-center py-8">कोणतीही जाहिरात नाही</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdManagement;

