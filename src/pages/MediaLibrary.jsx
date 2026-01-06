import React, { useState, useEffect } from 'react';
import { FiUpload, FiImage, FiVideo, FiFile, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';

const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState([]);

  useEffect(() => {
    fetchMedia();
  }, [filterType, searchQuery]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (searchQuery) params.append('search', searchQuery);

      const data = await apiFetch(`/admin/media?${params.toString()}`);
      if (data && data.data) {
        setMedia(data.data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('मीडिया लोड करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files, type = 'image') => {
    try {
      setUploading(true);
      const formData = new FormData();
      
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('type', type);

      const data = await apiFetch('/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (data) {
        toast.success(`${files.length} फाइल यशस्वीरित्या अपलोड केल्या`);
        fetchMedia();
      }
    } catch (error) {
      toast.error('फाइल अपलोड करताना त्रुटी');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    // Validate ID before proceeding
    if (!id || id === 'undefined' || id === 'null') {
      toast.error('अवैध मीडिया ID');
      console.error('Invalid media ID:', id);
      return;
    }

    if (!window.confirm('तुम्हाला खात्री आहे की तुम्ही ही फाइल हटवू इच्छिता?')) {
      return;
    }

    try {
      await apiFetch(`/admin/media/${id}`, { method: 'DELETE' });
      toast.success('फाइल यशस्वीरित्या हटवली');
      fetchMedia();
    } catch (error) {
      toast.error('फाइल हटवताना त्रुटी');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL कॉपी केला');
  };

  const getMediaIcon = (type) => {
    if (type.startsWith('image/')) return <FiImage className="w-8 h-8" />;
    if (type.startsWith('video/')) return <FiVideo className="w-8 h-8" />;
    return <FiFile className="w-8 h-8" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">मीडिया लायब्ररी</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">प्रतिमा, व्हिडिओ आणि PDF व्यवस्थापन</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <label className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>प्रतिमा अपलोड</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleUpload(e.target.files, 'image')}
              disabled={uploading}
            />
          </label>
          <label className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
            <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>PDF अपलोड</span>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              multiple
              onChange={(e) => handleUpload(e.target.files, 'pdf')}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
            <span className="text-xs sm:text-sm text-blue-800">फाइल अपलोड होत आहे...</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="मीडिया शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">सर्व प्रकार</option>
            <option value="image">प्रतिमा</option>
            <option value="video">व्हिडिओ</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <FiFilter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>साफ करा</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {media
            .filter(item => {
              // Filter out media items without valid IDs
              const mediaId = item._id || item.id;
              return mediaId && mediaId !== 'undefined' && mediaId !== 'null';
            })
            .map((item) => {
              // Get media ID (handle both _id and id)
              const mediaId = item._id || item.id;
              return (
                <div
                  key={mediaId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                    {item.type.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.type.startsWith('video/') ? (
                      <div className="text-gray-400">
                        <FiVideo className="w-12 h-12 mx-auto" />
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <FiFile className="w-12 h-12 mx-auto" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white text-gray-900 rounded text-sm hover:bg-gray-100"
                      >
                        URL कॉपी
                      </button>
                      <button
                        onClick={() => handleDelete(mediaId)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-gray-900 text-white rounded hover:bg-black"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('mr-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">कोणतेही मीडिया नाही</p>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;

