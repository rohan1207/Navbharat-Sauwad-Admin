import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiUpload } from 'react-icons/fi';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';

const AuthorsManagement = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    email: '',
    bio: '',
    designation: '',
    profileImage: '',
    isActive: true
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/authors');
      if (data && data.data) {
        setAuthors(data.data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('लेखक लोड करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const data = await apiFetch('/admin/upload/image', {
        method: 'POST',
        body: formData
      });
      
      return data.url;
    } catch (error) {
      toast.error('प्रतिमा अपलोड करताना त्रुटी');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await apiFetch(`/admin/authors/${editingAuthor.id}`, {
          method: 'PUT',
          body: formData
        });
        toast.success('लेखक यशस्वीरित्या अपडेट केला');
      } else {
        await apiFetch('/admin/authors', {
          method: 'POST',
          body: formData
        });
        toast.success('लेखक यशस्वीरित्या तयार केला');
      }
      setShowForm(false);
      setEditingAuthor(null);
      setFormData({ name: '', nameEn: '', email: '', bio: '', designation: '', profileImage: '', isActive: true });
      fetchAuthors();
    } catch (error) {
      toast.error('लेखक सेव्ह करताना त्रुटी');
    }
  };

  const handleEdit = (author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name || '',
      nameEn: author.nameEn || '',
      email: author.email || '',
      bio: author.bio || '',
      designation: author.designation || '',
      profileImage: author.profileImage || '',
      isActive: author.isActive !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्हाला खात्री आहे की तुम्ही हा लेखक हटवू इच्छिता?')) {
      return;
    }

    try {
      await apiFetch(`/admin/authors/${id}`, { method: 'DELETE' });
      toast.success('लेखक यशस्वीरित्या हटवला');
      fetchAuthors();
    } catch (error) {
      toast.error('लेखक हटवताना त्रुटी');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">लेखक व्यवस्थापन</h1>
          <p className="text-gray-600 mt-1">लेखक तयार करा आणि व्यवस्थापित करा</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAuthor(null);
            setFormData({ name: '', nameEn: '', email: '', bio: '', designation: '', profileImage: '', isActive: true });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
        >
          <FiPlus className="w-5 h-5" />
          <span>नवीन लेखक</span>
        </button>
      </div>

      {/* Author Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingAuthor ? 'लेखक संपादन' : 'नवीन लेखक'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    नाव (मराठी) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    नाव (English)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ईमेल
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पदनाम
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="संवाददाता, संपादक, इ."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  बायो
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  placeholder="लेखकाबद्दल संक्षिप्त माहिती"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  प्रोफाइल प्रतिमा
                </label>
                {formData.profileImage ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, profileImage: '' })}
                      className="absolute top-2 right-2 p-1 bg-gray-900 text-white rounded-full hover:bg-black"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">अपलोड करा</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = await handleImageUpload(file);
                          if (url) {
                            setFormData({ ...formData, profileImage: url });
                          }
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">सक्रिय</label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
                >
                  {editingAuthor ? 'अपडेट करा' : 'तयार करा'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAuthor(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  रद्द करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : authors.length > 0 ? (
          authors.map((author) => (
            <div
              key={author.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {author.profileImage ? (
                  <img
                    src={author.profileImage}
                    alt={author.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{author.name}</h3>
                  {author.designation && (
                    <p className="text-sm text-gray-600 mt-1">{author.designation}</p>
                  )}
                  {author.email && (
                    <p className="text-xs text-gray-500 mt-1">{author.email}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(author)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(author.id)}
                      className="p-2 text-gray-900 hover:bg-gray-50 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <span className={`ml-auto px-2 py-1 text-xs rounded ${
                      author.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {author.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">कोणतेही लेखक नाहीत</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorsManagement;

