import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiImage, FiUser, FiMapPin } from 'react-icons/fi';

const PhotoOfTheDayManagement = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [formData, setFormData] = useState({
    caption: '',
    captionEn: '',
    photographer: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    isActive: true
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/photo-of-the-day');
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('फोटो लोड करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && !editingPhoto?.image) {
      toast.error('कृपया फोटो निवडा');
      return;
    }

    if (!formData.caption) {
      toast.error('कृपया कॅप्शन प्रविष्ट करा');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('caption', formData.caption);
      formDataToSend.append('captionEn', formData.captionEn || '');
      formDataToSend.append('photographer', formData.photographer || '');
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('date', formData.date);
      formDataToSend.append('isActive', formData.isActive.toString());
      
      if (file) {
        formDataToSend.append('file', file);
      }

      let result;
      if (editingPhoto) {
        result = await apiFetch(`/photo-of-the-day/${editingPhoto._id}`, {
          method: 'PUT',
          body: formDataToSend
        });
        toast.success('फोटो अपडेट केला');
      } else {
        result = await apiFetch('/photo-of-the-day', {
          method: 'POST',
          body: formDataToSend
        });
        toast.success('फोटो जोडला');
      }

      setShowForm(false);
      setEditingPhoto(null);
      setFile(null);
      setPreview(null);
      setFormData({
        caption: '',
        captionEn: '',
        photographer: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        isActive: true
      });
      fetchPhotos();
    } catch (error) {
      console.error('Error saving photo:', error);
      const errorMessage = error.body?.details || error.body?.error || error.message || 'फोटो सेव्ह करताना त्रुटी';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setFormData({
      caption: photo.caption || '',
      captionEn: photo.captionEn || '',
      photographer: photo.photographer || '',
      location: photo.location || '',
      date: photo.date ? new Date(photo.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      isActive: photo.isActive !== false
    });
    setPreview(photo.image);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्हाला खात्री आहे की तुम्ही हा फोटो हटवू इच्छिता?')) {
      return;
    }

    try {
      await apiFetch(`/photo-of-the-day/${id}`, {
        method: 'DELETE'
      });
      toast.success('फोटो हटवला');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('फोटो हटवताना त्रुटी');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPhoto(null);
    setFile(null);
    setPreview(null);
    setFormData({
      caption: '',
      captionEn: '',
      photographer: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">आजचे फोटो व्यवस्थापन</h1>
          <p className="text-gray-600 mt-1">Photo of the Day Management</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          नवीन फोटो जोडा
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingPhoto ? 'फोटो संपादित करा' : 'नवीन फोटो जोडा'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  फोटो <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!editingPhoto}
                />
                {preview && (
                  <div className="mt-4">
                    <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    कॅप्शन (मराठी) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    कॅप्शन (English)
                  </label>
                  <textarea
                    value={formData.captionEn}
                    onChange={(e) => setFormData({ ...formData, captionEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline w-4 h-4 mr-1" />
                  फोटोग्राफर
                </label>
                <input
                  type="text"
                  value={formData.photographer}
                  onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  स्थान
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  तारीख <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">सक्रिय</span>
              </label>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'सेव्ह होत आहे...' : editingPhoto ? 'अपडेट करा' : 'जोडा'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                रद्द करा
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">सर्व फोटो</h2>
          {photos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">अजून कोणतेही फोटो जोडलेले नाहीत</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div key={photo._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={photo.image}
                      alt={photo.caption}
                      className="w-full h-48 object-cover"
                    />
                    {!photo.isActive && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        निष्क्रिय
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                      {photo.caption}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      {photo.photographer && (
                        <p><FiUser className="inline w-3 h-3 mr-1" />{photo.photographer}</p>
                      )}
                      {photo.location && (
                        <p><FiMapPin className="inline w-3 h-3 mr-1" />{photo.location}</p>
                      )}
                      <p><FiCalendar className="inline w-3 h-3 mr-1" />
                        {new Date(photo.date).toLocaleDateString('mr-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(photo)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        संपादित करा
                      </button>
                      <button
                        onClick={() => handleDelete(photo._id)}
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

export default PhotoOfTheDayManagement;

