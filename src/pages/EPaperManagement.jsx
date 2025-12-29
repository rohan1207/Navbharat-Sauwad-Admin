import React, { useState } from 'react';
import { toast } from 'react-toastify';
import EMappingInterface from '../components/EMappingInterface';
import { FiUpload, FiFile, FiX, FiEdit2, FiEye } from 'react-icons/fi';
import { apiFetch } from '../utils/api';

const EPaperManagement = () => {
  const [epapers, setEpapers] = useState([]);
  const [selectedEpaper, setSelectedEpaper] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [newEpaper, setNewEpaper] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    pdfFile: null
  });

  // Load existing epapers from API
  React.useEffect(() => {
    loadEpapers();
  }, []);

  const loadEpapers = async () => {
    try {
      // Use /all endpoint for admin panel to see all epapers including drafts
      const data = await apiFetch('/epapers/all');
      if (Array.isArray(data)) {
        setEpapers(data);
      }
    } catch (error) {
      console.error('Error loading epapers:', error);
      toast.error('ई-पेपर लोड करताना त्रुटी');
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewEpaper({ ...newEpaper, pdfFile: file });
    } else {
      toast.error('कृपया वैध PDF फाइल निवडा');
    }
  };

  const handleUpload = async () => {
    if (!newEpaper.title || !newEpaper.date || !newEpaper.pdfFile) {
      toast.error('कृपया सर्व फील्ड भरा');
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', newEpaper.pdfFile);
      formData.append('title', newEpaper.title);
      formData.append('date', newEpaper.date);

      // Upload PDF to backend - backend will convert and upload to Cloudinary
      const savedEpaper = await apiFetch('/epapers/upload', {
        method: 'POST',
        body: formData
      });
      
      // Update state with saved epaper
      const updated = [...epapers, savedEpaper];
      setEpapers(updated);
      
      toast.success('ई-पेपर यशस्वीरित्या अपलोड झाले!');
      
      // Automatically open mapping interface for the newly uploaded epaper
      setSelectedEpaper(savedEpaper);
      setShowMapping(true);
      
      // Reset form
      setNewEpaper({
        title: '',
        date: new Date().toISOString().split('T')[0],
        pdfFile: null
      });
      
      // Clear file input
      const fileInput = document.getElementById('pdf-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('PDF अपलोड करताना त्रुटी: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('तुम्हाला खात्री आहे की तुम्ही हा ई-पेपर हटवू इच्छिता?')) {
      try {
        await apiFetch(`/epapers/${id}`, { method: 'DELETE' });
        const updated = epapers.filter(ep => ep.id !== id);
        setEpapers(updated);
        // Don't save to localStorage - data too large
        toast.success('ई-पेपर हटवला गेला');
      } catch (error) {
        console.error('API delete failed:', error);
        // Update local state for UI
        const updated = epapers.filter(ep => ep.id !== id);
        setEpapers(updated);
        toast.error('ई-पेपर हटवताना त्रुटी: ' + (error.message || 'API error'));
      }
    }
  };

  const handleEditMapping = (epaper) => {
    setSelectedEpaper(epaper);
    setShowMapping(true);
  };

  const handleSaveMapping = async (updatedEpaper) => {
    try {
      // Save to API
      const savedEpaper = await apiFetch(`/epapers/${updatedEpaper.id}`, {
        method: 'PUT',
        body: updatedEpaper
      });
      
      const updated = epapers.map(ep => 
        ep.id === updatedEpaper.id ? savedEpaper : ep
      );
      setEpapers(updated);
      // Don't save to localStorage - data too large with base64 images
      setSelectedEpaper(savedEpaper);
      toast.success('ई-मॅपिंग यशस्वीरित्या सेव्ह केले!');
    } catch (error) {
      console.error('API save failed:', error);
      console.error('Error details:', error.body);
      
      // Show specific validation errors if available
      let errorMessage = 'ई-मॅपिंग सेव्ह करताना त्रुटी';
      if (error.body?.errors) {
        const errorDetails = Object.values(error.body.errors).join(', ');
        errorMessage += ': ' + errorDetails;
      } else if (error.body?.details) {
        errorMessage += ': ' + error.body.details;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      // Update local state for UI, but don't save to localStorage (too large)
      const updated = epapers.map(ep => 
        ep.id === updatedEpaper.id ? updatedEpaper : ep
      );
      setEpapers(updated);
      setSelectedEpaper(updatedEpaper);
      toast.error(errorMessage);
    }
  };

  if (showMapping && selectedEpaper) {
    return (
      <EMappingInterface
        epaper={selectedEpaper}
        onSave={handleSaveMapping}
        onCancel={() => {
          setShowMapping(false);
          setSelectedEpaper(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ई-पेपर व्यवस्थापन</h1>
          <p className="text-gray-600">PDF अपलोड करा आणि ई-मॅपिंग सेट करा</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">नवीन ई-पेपर अपलोड करा</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ई-पेपर शीर्षक
              </label>
              <input
                type="text"
                value={newEpaper.title}
                onChange={(e) => setNewEpaper({ ...newEpaper, title: e.target.value })}
                placeholder="उदा: नवभारत संवाद - 15 जानेवारी 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                तारीख
              </label>
              <input
                type="date"
                value={newEpaper.date}
                onChange={(e) => setNewEpaper({ ...newEpaper, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF फाइल
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-black transition-colors">
                  <FiUpload className="mr-2" />
                  PDF निवडा
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {newEpaper.pdfFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiFile />
                    <span>{newEpaper.pdfFile.name}</span>
                    <button
                      onClick={() => setNewEpaper({ ...newEpaper, pdfFile: null })}
                      className="text-gray-900 hover:text-black"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'अपलोड होत आहे...' : 'PDF अपलोड करा आणि रूपांतर करा'}
            </button>
          </div>
        </div>

        {/* Existing E-Papers List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">अस्तित्वातील ई-पेपर</h2>
          
          {epapers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiFile className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>अजून कोणतेही ई-पेपर अपलोड केलेले नाहीत</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {epapers.map((epaper) => (
                <div
                  key={epaper.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">{epaper.title}</h3>
                    <p className="text-sm text-gray-600">{epaper.date}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {epaper.pages.length} पृष्ठे
                    </p>
                  </div>
                  
                  {epaper.pages[0] && (
                    <div className="mb-3">
                      <img
                        src={epaper.pages[0].image}
                        alt="First page"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMapping(epaper)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-black transition-colors text-sm"
                    >
                      <FiEdit2 />
                      <span>ई-मॅपिंग</span>
                    </button>
                    <button
                      onClick={() => handleDelete(epaper.id)}
                      className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black transition-colors"
                    >
                      <FiX />
                    </button>
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

export default EPaperManagement;

