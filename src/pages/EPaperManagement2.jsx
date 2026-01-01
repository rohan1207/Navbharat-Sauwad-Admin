import React, { useState } from 'react';
import { toast } from 'react-toastify';
import EMappingInterface2 from '../components/EMappingInterface2';
import { FiUpload, FiFile, FiX, FiEdit2, FiArrowUp, FiArrowDown, FiMenu } from 'react-icons/fi';
import { apiFetch } from '../utils/api';

const EPaperManagement2 = () => {
  const [epapers, setEpapers] = useState([]);
  const [selectedEpaper, setSelectedEpaper] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [uploadMode, setUploadMode] = useState('pdf'); // 'pdf' or 'pages'
  const [newEpaper, setNewEpaper] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    pdfFile: null,
    epaperId: Date.now()
  });
  const [pageUploads, setPageUploads] = useState([]); // For individual page uploads
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    status: '', // 'preparing', 'uploading', 'processing', 'complete'
    currentFileName: ''
  });
  const [editingTitle, setEditingTitle] = useState(null); // Track which epaper title is being edited
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // Load existing epapers from API
  React.useEffect(() => {
    loadEpapers();
  }, []);

  const loadEpapers = async () => {
    try {
      const data = await apiFetch('/epapers/all');
      if (Array.isArray(data)) {
        setEpapers(data);
      }
    } catch (error) {
      console.error('Error loading epapers:', error);
      if (error.isNetworkError || error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('बॅकएंड सर्वर चालू नाही. कृपया सर्वर सुरू करा.', {
          autoClose: 5001
        });
      } else {
        toast.error('ई-पेपर लोड करताना त्रुटी: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleFileChange = (e) => {
    if (uploadMode === 'pdf') {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        setNewEpaper({ ...newEpaper, pdfFile: file });
      } else {
        toast.error('कृपया वैध PDF फाइल निवडा');
      }
    } else {
      // Individual page upload - handle multiple files
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        toast.error('कृपया वैध प्रतिमा फाइल निवडा');
        return;
      }
      
      const newPageUploads = imageFiles.map((file, index) => ({
        file,
        pageNo: pageUploads.length + index + 1,
        sortOrder: pageUploads.length + index + 1 // Add sortOrder for ordering
      }));
      
      setPageUploads([...pageUploads, ...newPageUploads]);
      toast.success(`${imageFiles.length} प्रतिमा जोडल्या`);
    }
  };

  const handlePageFileRemove = (index) => {
    const updated = pageUploads.filter((_, i) => i !== index);
    // Reassign sortOrder after removal
    const reordered = updated.map((page, idx) => ({
      ...page,
      pageNo: idx + 1,
      sortOrder: idx + 1
    }));
    setPageUploads(reordered);
  };

  // Move page up in order
  const handlePageMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...pageUploads];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Reassign sortOrder
    const reordered = updated.map((page, idx) => ({
      ...page,
      pageNo: idx + 1,
      sortOrder: idx + 1
    }));
    setPageUploads(reordered);
  };

  // Move page down in order
  const handlePageMoveDown = (index) => {
    if (index === pageUploads.length - 1) return;
    const updated = [...pageUploads];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // Reassign sortOrder
    const reordered = updated.map((page, idx) => ({
      ...page,
      pageNo: idx + 1,
      sortOrder: idx + 1
    }));
    setPageUploads(reordered);
  };

  // Handle title edit
  const handleEditTitle = (epaper) => {
    setEditingTitle(epaper.id);
    setEditingTitleValue(epaper.title);
  };

  const handleSaveTitle = async (epaperId) => {
    try {
      const epaper = epapers.find(ep => ep.id === epaperId);
      if (!epaper) return;

      const updatedEpaper = await apiFetch(`/epapers/${epaperId}`, {
        method: 'PUT',
        body: {
          ...epaper,
          title: editingTitleValue
        }
      });

      const updated = epapers.map(ep => 
        ep.id === epaperId ? updatedEpaper : ep
      );
      setEpapers(updated);
      setEditingTitle(null);
      toast.success('शीर्षक यशस्वीरित्या अपडेट केले!');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('शीर्षक अपडेट करताना त्रुटी: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCancelTitleEdit = () => {
    setEditingTitle(null);
    setEditingTitleValue('');
  };

  const handleUploadPages = async () => {
    if (!newEpaper.title || !newEpaper.date || pageUploads.length === 0) {
      toast.error('कृपया शीर्षक, तारीख आणि किमान एक पृष्ठ अपलोड करा');
      return;
    }

    const totalPages = pageUploads.length;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting page upload process...');
      console.log(`📊 Total pages to upload: ${totalPages}`);
      console.log(`📝 E-paper title: ${newEpaper.title}`);
      console.log(`📅 E-paper date: ${newEpaper.date}`);
      console.log(`🆔 E-paper ID: ${newEpaper.epaperId}`);
      
      setUploading(true);
      setUploadProgress({
        current: 0,
        total: totalPages,
        percentage: 0,
        status: 'preparing',
        currentFileName: ''
      });
      
      const epaperId = newEpaper.epaperId;
      let createdEpaper = null;

      // Upload each page
      for (let i = 0; i < pageUploads.length; i++) {
        const pageUpload = pageUploads[i];
        const pageNumber = i + 1;
        const fileSizeMB = (pageUpload.file.size / (1024 * 1024)).toFixed(2);
        
        console.log(`\n📤 [${pageNumber}/${totalPages}] Starting upload for page ${pageUpload.pageNo}...`);
        console.log(`   File: ${pageUpload.file.name}`);
        console.log(`   Size: ${fileSizeMB} MB`);
        console.log(`   Type: ${pageUpload.file.type}`);
        
        setUploadProgress({
          current: i,
          total: totalPages,
          percentage: Math.round((i / totalPages) * 100),
          status: 'uploading',
          currentFileName: pageUpload.file.name
        });

        const uploadStartTime = Date.now();
        const formData = new FormData();
        formData.append('image', pageUpload.file);
        formData.append('epaperId', epaperId.toString());
        formData.append('pageNo', pageUpload.pageNo.toString());
        formData.append('sortOrder', pageUpload.sortOrder.toString()); // Send sortOrder
        formData.append('title', newEpaper.title);
        formData.append('date', newEpaper.date);

        console.log(`   ⏳ Sending request to server...`);
        
        try {
          const result = await apiFetch('/epapers/upload-page', {
            method: 'POST',
            body: formData
          });

          const uploadTime = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
          console.log(`   ✅ Page ${pageUpload.pageNo} uploaded successfully in ${uploadTime}s`);
          console.log(`   📊 Progress: ${pageNumber}/${totalPages} (${Math.round((pageNumber / totalPages) * 100)}%)`);

          if (result.epaper) {
            createdEpaper = result.epaper;
            console.log(`   📄 E-paper updated with ${result.epaper.pages?.length || 0} pages`);
          }
          
          setUploadProgress({
            current: pageNumber,
            total: totalPages,
            percentage: Math.round((pageNumber / totalPages) * 100),
            status: pageNumber === totalPages ? 'complete' : 'uploading',
            currentFileName: pageUpload.file.name
          });
        } catch (pageError) {
          console.error(`   ❌ Error uploading page ${pageUpload.pageNo}:`, pageError);
          throw pageError; // Re-throw to be caught by outer catch
        }
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n🎉 All pages uploaded successfully!`);
      console.log(`⏱️  Total time: ${totalTime} seconds`);
      console.log(`📊 Average time per page: ${(parseFloat(totalTime) / totalPages).toFixed(2)} seconds`);

      if (createdEpaper) {
        const updated = [...epapers, createdEpaper];
        setEpapers(updated);
        toast.success(`${pageUploads.length} पृष्ठे यशस्वीरित्या अपलोड झाली! (${totalTime}s)`);
        
        setSelectedEpaper(createdEpaper);
        setShowMapping(true);
        
        // Reset form
        setNewEpaper({
          title: '',
          date: new Date().toISOString().split('T')[0],
          pdfFile: null,
          epaperId: Date.now()
        });
        setPageUploads([]);
        
        const fileInput = document.getElementById('page-upload-2');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error('\n❌ Upload failed after', totalTime, 'seconds');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'पृष्ठ अपलोड करताना त्रुटी';
      
      if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'बॅकएंड सर्वर कनेक्ट होऊ शकत नाही. कृपया सर्वर चालू आहे याची खात्री करा.';
      } else if (error.message && error.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'सर्वर कनेक्शन नाकारले. कृपया बॅकएंड सर्वर चालू आहे याची खात्री करा.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress({
        current: 0,
        total: 0,
        percentage: 0,
        status: '',
        currentFileName: ''
      });
    }
  };

  const handleUpload = async () => {
    if (!newEpaper.title || !newEpaper.date || !newEpaper.pdfFile) {
      toast.error('कृपया सर्व फील्ड भरा');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('pdf', newEpaper.pdfFile);
      formData.append('title', newEpaper.title);
      formData.append('date', newEpaper.date);

      const savedEpaper = await apiFetch('/epapers/upload', {
        method: 'POST',
        body: formData
      });
      
      const updated = [...epapers, savedEpaper];
      setEpapers(updated);
      
      toast.success('ई-पेपर यशस्वीरित्या अपलोड झाले!');
      
      setSelectedEpaper(savedEpaper);
      setShowMapping(true);
      
      setNewEpaper({
        title: '',
        date: new Date().toISOString().split('T')[0],
        pdfFile: null
      });
      
      const fileInput = document.getElementById('pdf-upload-2');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'PDF अपलोड करताना त्रुटी';
      
      if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'बॅकएंड सर्वर कनेक्ट होऊ शकत नाही. कृपया सर्वर चालू आहे याची खात्री करा.';
      } else if (error.message && error.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'सर्वर कनेक्शन नाकारले. कृपया बॅकएंड सर्वर चालू आहे याची खात्री करा.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      toast.error(errorMessage);
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
        toast.success('ई-पेपर हटवला गेला');
      } catch (error) {
        console.error('API delete failed:', error);
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
      const savedEpaper = await apiFetch(`/epapers/${updatedEpaper.id}`, {
        method: 'PUT',
        body: updatedEpaper
      });
      
      const updated = epapers.map(ep => 
        ep.id === updatedEpaper.id ? savedEpaper : ep
      );
      setEpapers(updated);
      setSelectedEpaper(savedEpaper);
      toast.success('ई-मॅपिंग यशस्वीरित्या सेव्ह केले!');
    } catch (error) {
      console.error('API save failed:', error);
      let errorMessage = 'ई-मॅपिंग सेव्ह करताना त्रुटी';
      if (error.body?.errors) {
        const errorDetails = Object.values(error.body.errors).join(', ');
        errorMessage += ': ' + errorDetails;
      } else if (error.body?.details) {
        errorMessage += ': ' + error.body.details;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
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
      <EMappingInterface2
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ई-पेपर व्यवस्थापन </h1>
          <p className="text-gray-600">PDF अपलोड करा आणि सरलीकृत ई-मॅपिंग सेट करा</p>
          <p className="text-sm text-blue-600 mt-2">✨ फक्त ड्रॅग करा - स्वयंचलित सेव्ह होईल</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">नवीन ई-पेपर अपलोड करा</h2>
          
          {/* Upload Mode Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              अपलोड पद्धत निवडा:
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setUploadMode('pdf');
                  setPageUploads([]);
                  setNewEpaper({ ...newEpaper, pdfFile: null });
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMode === 'pdf'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                संपूर्ण PDF अपलोड करा
              </button>
              <button
                onClick={() => {
                  setUploadMode('pages');
                  setNewEpaper({ ...newEpaper, pdfFile: null });
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMode === 'pages'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                वैयक्तिक पृष्ठ अपलोड करा
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ई-पेपर शीर्षक *
              </label>
              <input
                type="text"
                value={newEpaper.title}
                onChange={(e) => setNewEpaper({ ...newEpaper, title: e.target.value })}
                placeholder="उदा: नव मंच - 28 डिसेंबर 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                तारीख *
              </label>
              <input
                type="date"
                value={newEpaper.date}
                onChange={(e) => setNewEpaper({ ...newEpaper, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            {uploadMode === 'pdf' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF फाइल *
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-black transition-colors">
                      <FiUpload className="mr-2" />
                      PDF निवडा
                      <input
                        id="pdf-upload-2"
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
                  disabled={uploading || !newEpaper.title || !newEpaper.date || !newEpaper.pdfFile}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'अपलोड होत आहे...' : 'PDF अपलोड करा आणि रूपांतर करा'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    पृष्ठ प्रतिमा अपलोड करा *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-black transition-colors">
                      <FiUpload className="mr-2" />
                      प्रतिमा निवडा
                      <input
                        id="page-upload-2"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                      />
                    </label>
                    
                    {pageUploads.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">निवडलेली प्रतिमा (क्रम बदलण्यासाठी वर/खाली बटणे वापरा):</p>
                        {pageUploads.map((pageUpload, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => handlePageMoveUp(index)}
                                  disabled={index === 0}
                                  className="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="वर हलवा"
                                >
                                  <FiArrowUp />
                                </button>
                                <button
                                  onClick={() => handlePageMoveDown(index)}
                                  disabled={index === pageUploads.length - 1}
                                  className="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="खाली हलवा"
                                >
                                  <FiArrowDown />
                                </button>
                              </div>
                              <div className="flex items-center space-x-2 flex-1">
                                <FiMenu className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">पृष्ठ {pageUpload.pageNo}:</span>
                                <span className="text-sm text-gray-600 truncate">{pageUpload.file.name}</span>
                                <span className="text-xs text-gray-400">
                                  ({(pageUpload.file.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePageFileRemove(index)}
                              className="text-red-600 hover:text-red-800 ml-2"
                              title="हटवा"
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                        <p className="text-xs text-gray-500 mt-2">
                          💡 टिप: पृष्ठांचा क्रम बदलण्यासाठी वर/खाली बटणे वापरा. हा क्रम अपलोड नंतर देखील राहील.
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      💡 टिप: आपण एकाच वेळी अनेक प्रतिमा निवडू शकता. त्या स्वयंचलितपणे पृष्ठ 1, 2, 3... अशा क्रमाने व्यवस्थापित केल्या जातील.
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {uploading && uploadProgress.total > 0 && (
                  <div className="w-full bg-gray-100 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">
                        {uploadProgress.status === 'preparing' && 'तयार करत आहे...'}
                        {uploadProgress.status === 'uploading' && `अपलोड होत आहे: ${uploadProgress.current}/${uploadProgress.total}`}
                        {uploadProgress.status === 'complete' && 'पूर्ण झाले!'}
                      </span>
                      <span className="text-gray-600 font-semibold">{uploadProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                    {uploadProgress.currentFileName && (
                      <p className="text-xs text-gray-500 truncate">
                        📄 {uploadProgress.currentFileName}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleUploadPages}
                  disabled={uploading || !newEpaper.title || !newEpaper.date || pageUploads.length === 0}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading 
                    ? `अपलोड होत आहे... (${uploadProgress.current}/${uploadProgress.total})` 
                    : `${pageUploads.length > 0 ? pageUploads.length + ' ' : ''}पृष्ठ अपलोड करा`}
                </button>
              </>
            )}
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
                    {editingTitle === epaper.id ? (
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle(epaper.id);
                            if (e.key === 'Escape') handleCancelTitleEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTitle(epaper.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          title="सेव्ह करा"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelTitleEdit}
                          className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          title="रद्द करा"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 flex-1">{epaper.title}</h3>
                        <button
                          onClick={() => handleEditTitle(epaper)}
                          className="text-gray-500 hover:text-gray-700 ml-2"
                          title="शीर्षक संपादित करा"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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

export default EPaperManagement2;

