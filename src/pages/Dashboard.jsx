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
    totalArticles: 0,
    publishedToday: 0,
    drafts: 0,
    pendingReview: 0,
    totalViews: 0,
    totalCategories: 0,
    totalAuthors: 0,
    totalMedia: 0,
    totalSubscribers: 0,
    totalEpaper: 0
  });
  
  // Debug: Log stats changes
  useEffect(() => {
    console.log('Stats state updated:', stats);
  }, [stats]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update stats when realtime stats change (but don't overwrite fetched stats with empty/undefined values)
  useEffect(() => {
    // Only update if realtimeStats has meaningful data and we already have initial stats loaded
    // Check if we have initial data by checking if totalCategories is set (it's always > 0 if data loaded)
    if (realtimeStats && Object.keys(realtimeStats).length > 0 && stats.totalCategories > 0) {
      setStats(prev => {
        // Only update fields that exist in realtimeStats and are not undefined/null
        // This prevents overwriting fetched stats with empty realtime updates
        const updated = { ...prev };
        let hasValidUpdates = false;
        
        Object.keys(realtimeStats).forEach(key => {
          const value = realtimeStats[key];
          // Only update if value is a valid number (not undefined, null, or empty)
          if (value !== undefined && value !== null && value !== '' && typeof value === 'number') {
            updated[key] = value;
            hasValidUpdates = true;
          }
        });
        
        // Only update state if we have valid updates
        if (hasValidUpdates) {
          console.log('Realtime stats update:', { realtimeStats, updated });
          return updated;
        }
        return prev; // Return previous state if no valid updates
      });
    }
  }, [realtimeStats, stats.totalCategories]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from admin API
      const statsData = await apiFetch('/admin/stats');
      console.log('Stats API Response:', statsData); // Debug log
      
      if (statsData) {
        // Ensure all values are numbers, not undefined
        const processedStats = {
          totalArticles: statsData.totalArticles !== undefined ? Number(statsData.totalArticles) : 0,
          publishedToday: statsData.publishedToday !== undefined ? Number(statsData.publishedToday) : 0,
          drafts: statsData.drafts !== undefined ? Number(statsData.drafts) : 0,
          pendingReview: statsData.pendingReview !== undefined ? Number(statsData.pendingReview) : 0,
          totalViews: statsData.totalViews !== undefined ? Number(statsData.totalViews) : 0,
          totalCategories: statsData.totalCategories !== undefined ? Number(statsData.totalCategories) : 0,
          totalAuthors: statsData.totalAuthors !== undefined ? Number(statsData.totalAuthors) : 0,
          totalMedia: statsData.totalMedia !== undefined ? Number(statsData.totalMedia) : 0,
          totalSubscribers: statsData.totalSubscribers !== undefined ? Number(statsData.totalSubscribers) : 0,
          totalEpaper: statsData.totalEpaper !== undefined ? Number(statsData.totalEpaper) : 0
        };
        console.log('Processed Stats:', processedStats); // Debug log
        console.log('Setting stats with totalArticles:', processedStats.totalArticles);
        // Use direct setState to ensure values are set correctly
        setStats(processedStats);
        console.log('Stats state should now be:', processedStats);
      } else {
        console.warn('No stats data received from API');
      }
      
      // Stats API already includes subscribers and epapers if backend is updated
      // If not available, fetch separately (fallback)
      if (!statsData.totalSubscribers) {
        try {
          const subscribersData = await apiFetch('/subscribers?limit=1');
          if (subscribersData && subscribersData.pagination) {
            setStats(prev => ({ ...prev, totalSubscribers: subscribersData.pagination.total }));
          } else if (Array.isArray(subscribersData)) {
            setStats(prev => ({ ...prev, totalSubscribers: subscribersData.length }));
          }
        } catch (err) {
          console.error('Error fetching subscribers count:', err);
        }
      }
      
      if (!statsData.totalEpaper) {
        try {
          const epapersData = await apiFetch('/epapers');
          if (epapersData && Array.isArray(epapersData)) {
            setStats(prev => ({ ...prev, totalEpaper: epapersData.length }));
          } else if (epapersData && epapersData.data && Array.isArray(epapersData.data)) {
            setStats(prev => ({ ...prev, totalEpaper: epapersData.data.length }));
          }
        } catch (err) {
          console.error('Error fetching epapers count:', err);
        }
      }
      
      // Merge with realtime stats if available (but don't overwrite fetched stats)
      // This is handled by the useEffect hook above

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

  // Create statCards array - this will re-render when stats change
  const statCards = [
    {
      title: 'एकूण लेख',
      value: typeof stats.totalArticles === 'number' ? stats.totalArticles : 0,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      link: '/admin/articles'
    },
    {
      title: 'आज प्रकाशित',
      value: stats.publishedToday || 0,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      link: '/admin/articles?status=published'
    },
    {
      title: 'ड्राफ्ट',
      value: stats.drafts || 0,
      icon: <FiEdit className="w-6 h-6" />,
      color: 'bg-yellow-500',
      link: '/admin/articles?status=draft'
    },
    {
      title: 'एकूण दृश्ये',
      value: (stats.totalViews || 0).toLocaleString('en-IN'),
      icon: <FiEye className="w-6 h-6" />,
      color: 'bg-purple-500',
      link: '/admin/articles'
    },
    {
      title: 'श्रेणी',
      value: stats.totalCategories || 0,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-indigo-500',
      link: '/admin/categories'
    },
    {
      title: 'लेखक',
      value: stats.totalAuthors || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-pink-500',
      link: '/admin/authors'
    },
    {
      title: 'सबस्क्रायबर',
      value: stats.totalSubscribers || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-teal-500',
      link: '/admin/subscribers'
    },
    {
      title: 'ई-पेपर',
      value: stats.totalEpaper || 0,
      icon: <FiFile className="w-6 h-6" />,
      color: 'bg-orange-500',
      link: '/admin/epaper2'
    },
    {
      title: 'मीडिया',
      value: stats.totalMedia || 0,
      icon: <FiImage className="w-6 h-6" />,
      color: 'bg-cyan-500',
      link: '/admin/media'
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
