import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFileText, 
  FiPlusCircle, 
  FiTrendingUp, 
  FiEye, 
  FiEdit,
  FiClock,
  FiUsers,
  FiImage,
  FiFile
} from 'react-icons/fi';
import { apiFetch } from '../utils/api';
import { useWebSocket } from '../context/WebSocketContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { realtimeStats, connected } = useWebSocket();
  const [stats, setStats] = useState({
    totalArticles: 80,
    publishedToday: 0,
    drafts: 0,
    pendingReview: 0,
    totalViews: 30,
    totalCategories: 11,
    totalAuthors: 1,
    totalMedia: 1
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update stats when realtime stats change
  useEffect(() => {
    if (realtimeStats && Object.keys(realtimeStats).length > 0) {
      setStats(prev => ({ ...prev, ...realtimeStats }));
    }
  }, [realtimeStats]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsData = await apiFetch('/admin/stats');
      if (statsData) {
        setStats(statsData);
      }
      
      // Merge with realtime stats if available
      if (realtimeStats && Object.keys(realtimeStats).length > 0) {
        setStats(prev => ({ ...prev, ...realtimeStats }));
      }

      // Fetch recent articles
      const articlesData = await apiFetch('/admin/articles?limit=5&sort=createdAt:desc');
      if (articlesData && articlesData.data) {
        setRecentArticles(articlesData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('डॅशबोर्ड डेटा लोड करताना त्रुटी');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'एकूण लेख',
      value: 80,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      link: '/admin/articles'
    },
    {
      title: 'आज प्रकाशित',
      value: stats.publishedToday,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      link: '/admin/articles?status=published'
    },
    {
      title: 'ड्राफ्ट',
      value: stats.drafts,
      icon: <FiEdit className="w-6 h-6" />,
      color: 'bg-yellow-500',
      link: '/admin/articles?status=draft'
    },
    {
      title: 'एकूण दृश्ये',
      value: stats.totalViews.toLocaleString('en-IN'),
      icon: <FiEye className="w-6 h-6" />,
      color: 'bg-purple-500',
      link: '/admin/articles'
    },
    {
      title: 'श्रेणी',
      value: stats.totalCategories,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-indigo-500',
      link: '/admin/categories'
    },
    {
      title: 'लेखक',
      value: stats.totalAuthors,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-pink-500',
      link: '/admin/authors'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">डॅशबोर्ड</h1>
            {connected && (
              <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Real-time
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">आपल्या वेबसाइटचा अवलोकन</p>
        </div>
        <Link
          to="/admin/articles/create"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
        >
          <FiPlusCircle className="w-5 h-5" />
          <span>नवीन लेख</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">द्रुत क्रिया</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/articles/create"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiPlusCircle className="w-5 h-5 text-gray-900" />
            <span className="font-medium">नवीन लेख</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium">श्रेणी व्यवस्थापन</span>
          </Link>
          <Link
            to="/admin/media"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiImage className="w-5 h-5 text-green-600" />
            <span className="font-medium">मीडिया लायब्ररी</span>
          </Link>
          <Link
            to="/admin/epaper2"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFile className="w-5 h-5 text-purple-600" />
            <span className="font-medium">ई-पेपर</span>
          </Link>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">अलीकडील लेख</h2>
          <Link
            to="/admin/articles"
            className="text-gray-900 hover:text-black text-sm font-medium"
          >
            सर्व पहा →
          </Link>
        </div>
        {recentArticles.length > 0 ? (
          <div className="space-y-3">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                to={`/admin/articles/edit/${article.id}`}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {new Date(article.createdAt).toLocaleDateString('mr-IN')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">अजून कोणतेही लेख नाहीत</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
