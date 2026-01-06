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

  // Update stats when realtime stats change (but don't overwrite fetched stats with empty/zero values)
  useEffect(() => {
    // Only update if realtimeStats has meaningful data and we already have initial stats loaded
    // Check if we have initial data by checking if totalCategories is set (it's always > 0 if data loaded)
    if (realtimeStats && Object.keys(realtimeStats).length > 0 && stats.totalCategories > 0) {
      setStats(prev => {
        // Only update fields that exist in realtimeStats and are not undefined/null/zero
        // This prevents overwriting fetched stats with empty/zero realtime updates
        const updated = { ...prev };
        let hasValidUpdates = false;
        
        Object.keys(realtimeStats).forEach(key => {
          const value = realtimeStats[key];
          const currentValue = prev[key];
          
          // CRITICAL: Don't overwrite valid data with zeros!
          // Only update if:
          // 1. Value is a valid number (not undefined, null, or empty)
          // 2. Value is greater than 0 (don't overwrite with 0)
          // 3. OR if current value is 0 and new value is also 0 (both are 0, no harm)
          if (
            value !== undefined && 
            value !== null && 
            value !== '' && 
            typeof value === 'number'
          ) {
            // Don't overwrite valid data (> 0) with zeros
            if (value === 0 && currentValue > 0) {
              console.log(`⚠️ Skipping realtime update for ${key}: trying to overwrite ${currentValue} with 0`);
              return; // Skip this update - don't overwrite valid data
            }
            
            // Only update if value is > 0 OR both are 0
            if (value > 0 || (value === 0 && currentValue === 0)) {
              updated[key] = value;
              hasValidUpdates = true;
            }
          }
        });
        
        // Only update state if we have valid updates that don't overwrite with zeros
        if (hasValidUpdates) {
          console.log('✅ Realtime stats update (valid):', { realtimeStats, updated });
          return updated;
        } else {
          console.log('⚠️ Realtime stats update skipped (would overwrite with zeros)');
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
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Create statCards array - this will re-render when stats change
  const statCards = [
    {
      title: 'Total Articles',
      value: typeof stats.totalArticles === 'number' ? stats.totalArticles : 0,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      link: '/admin/articles'
    },
    {
      title: 'Published Today',
      value: stats.publishedToday || 0,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      link: '/admin/articles?status=published'
    },
    {
      title: 'Drafts',
      value: stats.drafts || 0,
      icon: <FiEdit className="w-6 h-6" />,
      color: 'bg-yellow-500',
      link: '/admin/articles?status=draft'
    },
    {
      title: 'Total Views',
      value: (stats.totalViews || 0).toLocaleString('en-IN'),
      icon: <FiEye className="w-6 h-6" />,
      color: 'bg-purple-500',
      link: '/admin/articles'
    },
    {
      title: 'Categories',
      value: stats.totalCategories || 0,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-indigo-500',
      link: '/admin/categories'
    },
    {
      title: 'Authors',
      value: stats.totalAuthors || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-pink-500',
      link: '/admin/authors'
    },
    {
      title: 'Subscribers',
      value: stats.totalSubscribers || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-teal-500',
      link: '/admin/subscribers'
    },
    {
      title: 'E-Papers',
      value: stats.totalEpaper || 0,
      icon: <FiFile className="w-6 h-6" />,
      color: 'bg-orange-500',
      link: '/admin/epaper'
    },
    {
      title: 'Media',
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            {connected && (
              <span className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Real-time
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Overview of your website</p>
        </div>
        <Link
          to="/admin/articles/create"
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm text-sm sm:text-base"
        >
          <FiPlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-2 sm:p-3 rounded-lg`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6">{stat.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/admin/articles/create"
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiPlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">New Article</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Categories Management</span>
          </Link>
          <Link
            to="/admin/media"
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiImage className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Media Library</span>
          </Link>
          <Link
            to="/admin/epaper"
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFile className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">E-Paper</span>
          </Link>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Articles</h2>
          <Link
            to="/admin/articles"
            className="text-gray-900 hover:text-black text-xs sm:text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        {recentArticles.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                to={`/admin/articles/edit/${article.id}`}
                className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">{article.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {new Date(article.createdAt).toLocaleDateString('mr-IN')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No articles yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
