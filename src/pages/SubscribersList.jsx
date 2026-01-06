import React, { useState, useEffect } from 'react';
import { FiDownload, FiUsers, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';

const SubscribersList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      // Fetch all subscribers (no pagination for simplicity)
      const response = await apiFetch('/subscribers?limit=10000');
      if (response && response.data) {
        setSubscribers(response.data);
      } else if (Array.isArray(response)) {
        setSubscribers(response);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Error loading subscribers');
    } finally {
      setLoading(false);
    }
  };

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(sub => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sub.name?.toLowerCase().includes(searchLower) ||
      sub.email?.toLowerCase().includes(searchLower) ||
      sub.phone?.includes(searchTerm)
    );
  });

  // Download as CSV
  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Mobile Number', 'Subscription Date', 'Status'];
    const rows = filteredSubscribers.map(sub => [
      sub.name || '',
      sub.email || '',
      sub.phone || '',
      sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-IN') : '',
      sub.isActive ? 'Active' : 'Inactive'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV file downloaded');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('mr-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 rounded-lg">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Subscribers
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {filteredSubscribers.length} subscribers
                </p>
              </div>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base"
            >
              <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">CSV डाउनलोड करा</span>
              <span className="sm:hidden">डाउनलोड</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="नाव, ईमेल किंवा मोबाइल नंबर शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base"
            />
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Subscribers List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">लोड होत आहे...</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'कोणतेही सबस्क्रायबर सापडले नाहीत' : 'अजून कोणतेही सबस्क्रायबर नाहीत'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      नाव
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ईमेल
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      मोबाइल नंबर
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      सबस्क्रिप्शन तारीख
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      स्थिती
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber._id || subscriber.id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {subscriber.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <span>{subscriber.email || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span>{subscriber.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(subscriber.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscriber.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subscriber.isActive !== false ? 'सक्रिय' : 'निष्क्रिय'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber, index) => (
                <div
                  key={subscriber._id || subscriber.id || index}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {subscriber.name || '-'}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                            subscriber.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subscriber.isActive !== false ? 'सक्रिय' : 'निष्क्रिय'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FiMail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{subscriber.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FiPhone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{subscriber.phone || '-'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(subscriber.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribersList;





