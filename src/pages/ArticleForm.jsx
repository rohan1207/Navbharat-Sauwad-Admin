import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';
import { FiUpload, FiX, FiSave, FiSend } from 'react-icons/fi';

const ArticleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id && id !== 'undefined' && id !== 'null';

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  // Get current date in YYYY-MM-DD format for default
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    content: '',
    categoryId: '',
    subCategoryId: '',
    authorId: '',
    featuredImage: '',
    imageGallery: [],
    isBreaking: false,
    isFeatured: false,
    status: 'draft',
    date: getCurrentDate(), // Default to current date
    scheduledAt: '',
    metaKeywords: '',
    metaDescription: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    if (isEdit) {
      fetchArticle();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/admin/categories');
      if (data && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const data = await apiFetch('/admin/authors');
      if (data && data.data) {
        setAuthors(data.data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const fetchArticle = async () => {
    try {
      // Validate ID before fetching
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid article ID:', id);
        toast.error('Invalid article ID');
        navigate('/admin/articles');
        return;
      }
      
      setLoading(true);
      const data = await apiFetch(`/admin/articles/${id}`);
      if (data) {
        // Helper to extract ID from populated or ObjectId field
        const getFieldId = (field) => {
          if (!field) return '';
          if (typeof field === 'string') return field;
          if (field._id) return field._id.toString();
          if (field.id) return field.id.toString();
          return field.toString();
        };
        
        // Format date for input field (YYYY-MM-DD)
        const formatDateForInput = (dateValue) => {
          if (!dateValue) return getCurrentDate();
          const date = new Date(dateValue);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          title: data.title || '',
          titleEn: data.titleEn || '',
          content: data.content || '',
          categoryId: getFieldId(data.categoryId) || '',
          subCategoryId: getFieldId(data.subCategoryId) || '',
          authorId: getFieldId(data.authorId) || '',
          featuredImage: data.featuredImage || '',
          imageGallery: data.imageGallery || [],
          isBreaking: data.isBreaking || false,
          isFeatured: data.isFeatured || false,
          status: data.status || 'draft',
          date: formatDateForInput(data.date || data.publishedAt || data.createdAt),
          scheduledAt: data.scheduledAt || '',
          metaKeywords: data.metaKeywords || '',
          metaDescription: data.metaDescription || ''
        });
      }
    } catch (error) {
      toast.error('Error loading article');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      toast.info('Uploading image...', { autoClose: 2000 });
      const formData = new FormData();
      formData.append('image', file);
      
      const data = await apiFetch('/admin/upload/image', {
        method: 'POST',
        body: formData
      });
      
      if (data && data.url) {
        toast.success('Image uploaded successfully', { autoClose: 2000 });
        return data.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error.body?.error || error.message || 'अज्ञात त्रुटी';
      toast.error(`Error uploading image: ${errorMessage}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    
    // Validate scheduled date if status is pending
    if (formData.status === 'pending' && !formData.scheduledAt) {
      toast.error('Please select publication date and time');
      return;
    }
    
    try {
      setLoading(true);
      
      // Clean up payload - remove empty strings for ObjectId fields
      const payload = {
        title: formData.title,
        titleEn: formData.titleEn || undefined,
        content: formData.content,
        categoryId: formData.categoryId || undefined,
        subCategoryId: formData.subCategoryId || undefined,
        authorId: formData.authorId || undefined,
        featuredImage: formData.featuredImage || undefined,
        imageGallery: formData.imageGallery && formData.imageGallery.length > 0 ? formData.imageGallery : undefined,
        isBreaking: formData.isBreaking || false,
        isFeatured: formData.isFeatured || false,
        status: publish ? 'published' : formData.status,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        scheduledAt: publish ? undefined : (formData.scheduledAt || undefined),
        metaKeywords: formData.metaKeywords || undefined,
        metaDescription: formData.metaDescription || undefined
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      if (isEdit) {
        await apiFetch(`/admin/articles/${id}`, {
          method: 'PUT',
          body: payload
        });
        toast.success('Article updated successfully');
      } else {
        await apiFetch('/admin/articles', {
          method: 'POST',
          body: payload
        });
        toast.success('Article created successfully');
      }

      navigate('/admin/articles');
    } catch (error) {
      console.error('Article save error:', error);
      const errorMessage = error.body?.error || error.message || 'Unknown error';
      toast.error(`${isEdit ? 'Error updating article' : 'Error creating article'}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get ID (handle both _id and id)
  const getId = (item) => item._id || item.id;
  
  const mainCategories = categories.filter(cat => !cat.parentId && !cat._id?.parentId);
  const subCategories = categories.filter(cat => {
    const catId = getId(cat);
    const parentId = cat.parentId || cat._id?.parentId;
    const formCategoryId = formData.categoryId;
    return parentId && (parentId.toString() === formCategoryId || getId(cat) === formCategoryId);
  });

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isEdit ? 'Edit article' : 'Create new article'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Save as Draft</span>
          </button>
          <button
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
          >
            <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Title (Marathi) *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter article title"
                required
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>Debug:</strong> TinyMCE API Key = {import.meta.env.VITE_TINYMCE_API_KEY ? '✅ Loaded' : '❌ Not found'}
                  {import.meta.env.VITE_TINYMCE_API_KEY && (
                    <span className="ml-2">(Key: {import.meta.env.VITE_TINYMCE_API_KEY.substring(0, 10)}...)</span>
                  )}
                </div>
              )}
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'}
                value={formData.content}
                onEditorChange={(content) => setFormData({ ...formData, content })}
                init={{
                  height: window.innerWidth < 640 ? 300 : 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                    'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'table | removeformat | help',
                  language: 'en',
                  content_style: 'body { font-family: "Noto Sans Devanagari", sans-serif; font-size:14px }',
                  images_upload_handler: async (blobInfo, progress) => {
                    const url = await handleImageUpload(blobInfo.blob());
                    return url;
                  },
                  // Table configuration
                  table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                  table_appearance_options: false,
                  table_grid: true,
                  table_resize_bars: true,
                  table_default_attributes: {
                    border: '1'
                  },
                  table_default_styles: {
                    'border-collapse': 'collapse',
                    'width': '100%'
                  }
                }}
              />
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">SEO Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    placeholder="SEO description"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Publishing Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Publishing Options</h3>
              <div className="space-y-3 sm:space-y-4">
                {/* Article Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Article date (default: today's date)
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormData({ 
                        ...formData, 
                        status: newStatus,
                        // Clear scheduledAt if not pending
                        scheduledAt: newStatus !== 'pending' ? '' : formData.scheduledAt
                      });
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending (Scheduled)</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                
                {/* Scheduled Date/Time Picker - Show only when status is pending */}
                {formData.status === 'pending' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Publication Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const dateTime = e.target.value;
                        setFormData({ 
                          ...formData, 
                          scheduledAt: dateTime ? new Date(dateTime).toISOString() : ''
                        });
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                      required={formData.status === 'pending'}
                    />
                    {formData.scheduledAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selected date: {new Date(formData.scheduledAt).toLocaleString('en-IN', {
                          dateStyle: 'full',
                          timeStyle: 'short'
                        })}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isBreaking}
                      onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">Breaking News</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">Featured Article</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Category</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Main Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select Category</option>
                    {mainCategories.map((cat) => {
                      const catId = getId(cat);
                      return (
                        <option key={catId} value={catId}>{cat.name}</option>
                      );
                    })}
                  </select>
                </div>
                {subCategories.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Sub-Category
                    </label>
                    <select
                      value={formData.subCategoryId}
                      onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Select Sub-Category</option>
                      {subCategories.map((cat) => {
                        const catId = getId(cat);
                        return (
                          <option key={catId} value={catId}>{cat.name}</option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Author Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Author</h3>
                  <select
                    value={formData.authorId}
                    onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">Select Author</option>
                {authors.map((author) => {
                  const authorId = getId(author);
                  return (
                    <option key={authorId} value={authorId}>{author.name}</option>
                  );
                })}
              </select>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Featured Image</h3>
              {formData.featuredImage ? (
                <div className="relative">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-40 sm:h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featuredImage: '' })}
                    className="absolute top-2 right-2 p-1.5 sm:p-2 bg-gray-900 text-white rounded-full hover:bg-black"
                  >
                    <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-gray-900 mb-2"></div>
                        <p className="text-xs sm:text-sm text-gray-500">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <FiUpload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-2" />
                        <p className="text-xs sm:text-sm text-gray-500">Upload Image</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file && !uploadingImage) {
                        const url = await handleImageUpload(file);
                        if (url) {
                          setFormData({ ...formData, featuredImage: url });
                        }
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;