import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiX, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

const EMappingInterface = ({ epaper, onSave, onCancel }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [drawingStart, setDrawingStart] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [localEpaper, setLocalEpaper] = useState(epaper);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Update local epaper when prop changes (from parent updates)
  useEffect(() => {
    setLocalEpaper(epaper);
  }, [epaper]);

  const currentPage = localEpaper.pages[currentPageIndex];
  const currentPageNews = currentPage.news || [];

  // Load existing news articles from localStorage (in production, from API)
  useEffect(() => {
    const saved = localStorage.getItem('newsArticles');
    if (saved) {
      setNewsArticles(JSON.parse(saved));
    }
  }, []);

  // Calculate relative coordinates based on image display size
  const getRelativeCoordinates = (clientX, clientY) => {
    if (!imageRef.current || !containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    
    // Calculate scale factors
    const scaleX = currentPage.width / imgRect.width;
    const scaleY = currentPage.height / imgRect.height;
    
    // Get position relative to image
    const x = (clientX - imgRect.left) * scaleX;
    const y = (clientY - imgRect.top) * scaleY;
    
    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (e.target !== imageRef.current) return;
    
    const coords = getRelativeCoordinates(e.clientX, e.clientY);
    if (!coords) return;
    
    setIsDrawing(true);
    setDrawingStart(coords);
    setCurrentRect({ ...coords, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !drawingStart) return;
    
    const coords = getRelativeCoordinates(e.clientX, e.clientY);
    if (!coords) return;
    
    const width = coords.x - drawingStart.x;
    const height = coords.y - drawingStart.y;
    
    setCurrentRect({
      x: Math.min(drawingStart.x, coords.x),
      y: Math.min(drawingStart.y, coords.y),
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect || currentRect.width < 10 || currentRect.height < 10) {
      setIsDrawing(false);
      setCurrentRect(null);
      setDrawingStart(null);
      return;
    }
    
    // Create new area
    setSelectedArea(currentRect);
    setShowArticleForm(true);
    setIsDrawing(false);
    setDrawingStart(null);
  };

  const handleSaveArea = (articleData) => {
    if (!selectedArea) return;

    const newNewsItem = {
      id: Date.now(),
      ...selectedArea,
      title: articleData.title,
      content: articleData.content,
      articleId: articleData.articleId || null
    };

    // Update current page with new news item
    const updatedPages = localEpaper.pages.map((page, index) => {
      if (index === currentPageIndex) {
        return {
          ...page,
          news: [...(page.news || []), newNewsItem]
        };
      }
      return page;
    });

    const updatedEpaper = {
      ...localEpaper,
      pages: updatedPages
    };

    // Update local state immediately to show the new mapping
    setLocalEpaper(updatedEpaper);

    // Don't save to localStorage - data too large with base64 images
    // Parent component will save to API via onSave callback

    setSelectedArea(null);
    setShowArticleForm(false);
    setCurrentRect(null);
    toast.success('क्षेत्र जोडले गेले! आपण आणखी क्षेत्रे जोडू शकता.');
    
    // Update parent component (this keeps the interface open and saves to API)
    onSave(updatedEpaper);
  };

  const handleDeleteArea = (newsId) => {
    const updatedPages = localEpaper.pages.map((page, index) => {
      if (index === currentPageIndex) {
        return {
          ...page,
          news: (page.news || []).filter(n => n.id !== newsId)
        };
      }
      return page;
    });

    const updatedEpaper = {
      ...localEpaper,
      pages: updatedPages
    };

    // Update local state immediately
    setLocalEpaper(updatedEpaper);

    // Don't save to localStorage - data too large with base64 images
    // Parent component will save to API via onSave callback
    
    onSave(updatedEpaper);
    toast.success('क्षेत्र हटवले गेले!');
  };

  const handleEditArea = (newsItem) => {
    setEditingArticle(newsItem);
    setSelectedArea({
      x: newsItem.x,
      y: newsItem.y,
      width: newsItem.width,
      height: newsItem.height
    });
    setShowArticleForm(true);
  };

  // Calculate display coordinates for rectangles
  const getDisplayCoords = (rect) => {
    if (!imageRef.current) return null;
    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    const scaleX = imgRect.width / currentPage.width;
    const scaleY = imgRect.height / currentPage.height;
    
    return {
      left: rect.x * scaleX,
      top: rect.y * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{localEpaper.title}</h2>
            <p className="text-sm text-gray-600">ई-मॅपिंग: पृष्ठ {currentPageIndex + 1} / {localEpaper.pages.length}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <FiX />
              <span>रद्द करा</span>
            </button>
            <button
              onClick={() => {
                // Save latest data to API (parent component handles this)
                onSave(localEpaper);
                toast.success('सर्व मॅपिंग सेव्ह केले!');
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <FiSave />
              <span>सेव्ह करा</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4">
              {/* Page Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                  disabled={currentPageIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  मागील
                </button>
                <span className="text-sm text-gray-600">
                  पृष्ठ {currentPageIndex + 1} / {localEpaper.pages.length}
                </span>
                <button
                  onClick={() => setCurrentPageIndex(Math.min(localEpaper.pages.length - 1, currentPageIndex + 1))}
                  disabled={currentPageIndex === localEpaper.pages.length - 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  पुढील
                </button>
              </div>

              {/* Image with Drawing Area */}
              <div
                ref={containerRef}
                className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100"
                style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={currentPage.image}
                  alt={`Page ${currentPage.pageNo}`}
                  className="w-full h-auto"
                  draggable={false}
                />

                {/* Existing News Areas */}
                {currentPageNews.map((newsItem) => {
                  const coords = getDisplayCoords(newsItem);
                  if (!coords) return null;
                  
                  return (
                    <div
                      key={`news-${newsItem.id || Date.now()}-${newsItem.x}-${newsItem.y}`}
                      className="absolute border-2 border-orange-500 bg-orange-500 bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer group"
                      style={{
                        left: `${coords.left}px`,
                        top: `${coords.top}px`,
                        width: `${coords.width}px`,
                        height: `${coords.height}px`,
                      }}
                      title={newsItem.title}
                    >
                      <div className="absolute -top-8 left-0 bg-orange-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {newsItem.title}
                      </div>
                      <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditArea(newsItem);
                          }}
                          className="bg-blue-600 text-white p-1 rounded text-xs"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArea(newsItem.id);
                          }}
                          className="bg-red-600 text-white p-1 rounded text-xs"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Current Drawing Rectangle */}
                {currentRect && (
                  (() => {
                    const coords = getDisplayCoords(currentRect);
                    if (!coords) return null;
                    return (
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                        style={{
                          left: `${coords.left}px`,
                          top: `${coords.top}px`,
                          width: `${coords.width}px`,
                          height: `${coords.height}px`,
                        }}
                      />
                    );
                  })()
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>सूचना:</strong> पृष्ठावर ड्रॅग करून आयताकृती क्षेत्र निवडा. निवडलेल्या क्षेत्राशी बातमी जोडा.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - News Areas List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">बातमी क्षेत्रे</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {currentPageNews.length}
                </span>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {currentPageNews.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    अजून कोणतीही बातमी जोडलेली नाही
                  </p>
                ) : (
                  currentPageNews.map((newsItem) => (
                    <div
                      key={newsItem.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                        {newsItem.title}
                      </h4>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleEditArea(newsItem)}
                          className="flex-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          संपादन
                        </button>
                        <button
                          onClick={() => handleDeleteArea(newsItem.id)}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Form Modal */}
      {showArticleForm && (
        <ArticleFormModal
          area={selectedArea}
          existingArticle={editingArticle}
          newsArticles={newsArticles}
          onSave={(data) => {
            if (editingArticle) {
              // Update existing
              const updatedPages = localEpaper.pages.map((page, index) => {
                if (index === currentPageIndex) {
                  return {
                    ...page,
                    news: page.news.map(n => 
                      n.id === editingArticle.id 
                        ? { ...n, ...data, ...selectedArea }
                        : n
                    )
                  };
                }
                return page;
              });
              const updatedEpaper = { ...localEpaper, pages: updatedPages };
              // Update local state immediately
              setLocalEpaper(updatedEpaper);
              // Don't save to localStorage - data too large with base64 images
              // Parent component will save to API via onSave callback
              onSave(updatedEpaper);
              toast.success('बातमी अपडेट केली!');
            } else {
              handleSaveArea(data);
            }
            setShowArticleForm(false);
            setEditingArticle(null);
            setSelectedArea(null);
          }}
          onCancel={() => {
            setShowArticleForm(false);
            setEditingArticle(null);
            setSelectedArea(null);
          }}
        />
      )}
    </div>
  );
};

// Article Form Modal Component
const ArticleFormModal = ({ area, existingArticle, newsArticles, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: existingArticle?.title || '',
    content: existingArticle?.content || '',
    articleId: existingArticle?.articleId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('कृपया शीर्षक आणि सामग्री भरा');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {existingArticle ? 'बातमी संपादन करा' : 'नवीन बातमी जोडा'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                शीर्षक *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="बातमीचे शीर्षक"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                सामग्री *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="बातमीची सामग्री"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                बातमी ID (ऐच्छिक)
              </label>
              <input
                type="text"
                value={formData.articleId}
                onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="अस्तित्वातील बातमीशी जोडण्यासाठी ID"
              />
            </div>

            {area && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>क्षेत्र:</strong> X: {Math.round(area.x)}, Y: {Math.round(area.y)}, 
                  Width: {Math.round(area.width)}, Height: {Math.round(area.height)}
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                सेव्ह करा
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                रद्द करा
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EMappingInterface;

