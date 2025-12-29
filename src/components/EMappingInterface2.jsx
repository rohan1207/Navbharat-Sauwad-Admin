import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiX, FiTrash2 } from 'react-icons/fi';

const EMappingInterface2 = ({ epaper, onSave, onCancel }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const [localEpaper, setLocalEpaper] = useState(epaper);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Ensure pages are sorted by sortOrder when setting local epaper
    const sortedEpaper = { ...epaper };
    if (sortedEpaper.pages && Array.isArray(sortedEpaper.pages)) {
      sortedEpaper.pages = [...sortedEpaper.pages].sort((a, b) => {
        const orderA = a.sortOrder !== undefined ? a.sortOrder : a.pageNo;
        const orderB = b.sortOrder !== undefined ? b.sortOrder : b.pageNo;
        return orderA - orderB;
      });
    }
    setLocalEpaper(sortedEpaper);
  }, [epaper]);

  const currentPage = localEpaper.pages[currentPageIndex];
  const currentPageNews = currentPage?.news || [];

  // Calculate relative coordinates based on image display size
  const getRelativeCoordinates = (clientX, clientY) => {
    if (!imageRef.current || !containerRef.current) return null;
    
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
    
    // AUTO-SAVE - No form needed! Just save coordinates
    const newNewsItem = {
      id: Date.now(),
      x: Math.round(currentRect.x),
      y: Math.round(currentRect.y),
      width: Math.round(currentRect.width),
      height: Math.round(currentRect.height),
      // Optional fields for backward compatibility (empty strings)
      title: '',
      content: '',
      articleId: null
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

    setLocalEpaper(updatedEpaper);
    onSave(updatedEpaper); // Auto-save immediately
    
    setIsDrawing(false);
    setCurrentRect(null);
    setDrawingStart(null);
    toast.success('क्षेत्र जोडले गेले!');
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

    setLocalEpaper(updatedEpaper);
    onSave(updatedEpaper);
    toast.success('क्षेत्र हटवले गेले!');
  };

  // Calculate display coordinates for rectangles
  const getDisplayCoords = (rect) => {
    if (!imageRef.current || !currentPage) return null;
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

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">पृष्ठ सापडले नाही</p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            परत जा
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{localEpaper.title}</h2>
            <p className="text-sm text-gray-600">ई-मॅपिंग 2: पृष्ठ {currentPageIndex + 1} / {localEpaper.pages.length}</p>
            <p className="text-xs text-blue-600 mt-1">✨ सरलीकृत: फक्त ड्रॅग करा, स्वयंचलित सेव्ह होईल</p>
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
                onSave(localEpaper);
                toast.success('सर्व मॅपिंग सेव्ह केले!');
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors flex items-center space-x-2"
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

                {/* Existing Marked Areas */}
                {currentPageNews.map((newsItem) => {
                  const coords = getDisplayCoords(newsItem);
                  if (!coords) return null;
                  
                  return (
                    <div
                      key={newsItem.id}
                      className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer group"
                      style={{
                        left: `${coords.left}px`,
                        top: `${coords.top}px`,
                        width: `${coords.width}px`,
                        height: `${coords.height}px`,
                      }}
                    >
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArea(newsItem.id);
                          }}
                          className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700"
                          title="हटवा"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Current Drawing Rectangle */}
                {currentRect && (() => {
                  const coords = getDisplayCoords(currentRect);
                  if (!coords) return null;
                  return (
                    <div
                      className="absolute border-2 border-green-500 bg-green-500 bg-opacity-20"
                      style={{
                        left: `${coords.left}px`,
                        top: `${coords.top}px`,
                        width: `${coords.width}px`,
                        height: `${coords.height}px`,
                      }}
                    />
                  );
                })()}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>सूचना:</strong> पृष्ठावर ड्रॅग करून आयताकृती क्षेत्र निवडा. क्षेत्र स्वयंचलित सेव्ह होईल.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Marked Areas List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">मार्क केलेले क्षेत्र</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {currentPageNews.length}
                </span>
              </div>
              
              {currentPageNews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    अजून कोणतेही क्षेत्र मार्क केलेले नाही
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {currentPageNews.map((newsItem) => (
                    <div
                      key={newsItem.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-xs text-gray-600 mb-2">
                        <div className="font-medium">क्षेत्र #{newsItem.id}</div>
                        <div className="text-gray-400 mt-1">
                          {Math.round(newsItem.width)} × {Math.round(newsItem.height)}px
                        </div>
                        <div className="text-gray-400 text-xs">
                          ({Math.round(newsItem.x)}, {Math.round(newsItem.y)})
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteArea(newsItem.id)}
                        className="w-full text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 flex items-center justify-center space-x-1"
                      >
                        <FiTrash2 />
                        <span>हटवा</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMappingInterface2;



