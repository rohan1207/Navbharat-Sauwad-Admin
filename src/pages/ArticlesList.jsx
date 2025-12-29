import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlusCircle, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiFilter,
  FiMoreVertical
} from 'react-icons/fi';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [page, selectedCategory, selectedStatus, searchQuery]);

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

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);

      const data = await apiFetch(`/admin/articles?${params.toString()}`);
      if (data) {
        setArticles(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('लेख लोड करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्हाला खात्री आहे की तुम्ही हा लेख हटवू इच्छिता?')) {
      return;
    }

    try {
      await apiFetch(`/admin/articles/${id}`, { method: 'DELETE' });
      toast.success('लेख यशस्वीरित्या हटवला');
      fetchArticles();
    } catch (error) {
      toast.error('लेख हटवताना त्रुटी');
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    if (selectedIds.length === 0) {
      toast.warning('कृपया लेख निवडा');
      return;
    }

    try {
      await apiFetch('/admin/articles/bulk', {
        method: 'POST',
        body: { action, ids: selectedIds }
      });
      toast.success('क्रिया यशस्वीरित्या पूर्ण झाली');
      fetchArticles();
    } catch (error) {
      toast.error('क्रिया करताना त्रुटी');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">लेख व्यवस्थापन</h1>
          <p className="text-gray-600 mt-1">सर्व लेख पहा आणि व्यवस्थापित करा</p>
        </div>
        <Link
          to="/admin/articles/create"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
        >
          <FiPlusCircle className="w-5 h-5" />
          <span>नवीन लेख</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="लेख शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">सर्व श्रेणी</option>
            {categories.map((cat) => {
              const catId = cat._id || cat.id;
              return (
                <option key={catId} value={catId}>{cat.name}</option>
              );
            })}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">सर्व स्थिती</option>
            <option value="published">प्रकाशित</option>
            <option value="draft">ड्राफ्ट</option>
            <option value="pending">प्रलंबित</option>
          </select>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedStatus('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="w-5 h-5 inline mr-2" />
            साफ करा
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      लेख
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      श्रेणी
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      लेखक
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      स्थिती
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      दृश्ये
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      तारीख
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      क्रिया
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles
                    .filter(article => {
                      // Filter out articles without valid IDs
                      const articleId = article._id || article.id;
                      return articleId && articleId !== 'undefined' && articleId !== 'null';
                    })
                    .map((article) => {
                      // Get article ID (handle both _id and id)
                      const articleId = article._id || article.id;
                      return (
                        <tr key={articleId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {article.featuredImage && (
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <Link
                              to={`/admin/articles/edit/${articleId}`}
                              className="font-medium text-gray-900 hover:text-gray-700"
                            >
                              {article.title}
                            </Link>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                              {article.summary}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {article.categoryId?.name || article.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {article.authorId?.name || article.author?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : article.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.status === 'published' ? 'प्रकाशित' : 
                           article.status === 'draft' ? 'ड्राफ्ट' : 'प्रलंबित'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {article.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(article.date || article.createdAt || article.publishedAt).toLocaleDateString('mr-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/articles/edit/${articleId}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="संपादन"
                          >
                            <FiEdit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(articleId)}
                            className="text-gray-900 hover:text-black"
                            title="हटवा"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  पृष्ठ {page} पैकी {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    मागील
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    पुढील
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">कोणतेही लेख सापडले नाहीत</p>
            <Link
              to="/admin/articles/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
            >
              <FiPlusCircle className="w-5 h-5" />
              <span>नवीन लेख तयार करा</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesList;

