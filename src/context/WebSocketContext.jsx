import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    totalArticles: 0,
    publishedToday: 0,
    drafts: 0,
    totalViews: 0
  });
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return;
    }

    // Check if WebSocket is enabled (optional feature)
    // Disabled by default since backend doesn't have Socket.IO configured
    const enableWebSocket = import.meta.env.VITE_ENABLE_WEBSOCKET === 'true';
    if (!enableWebSocket) {
      // WebSocket is disabled - this is normal
      return;
    }

    // Connect to WebSocket server (use same URL as API)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const wsUrl = API_URL.replace(/^http/, 'ws');
    
    const newSocket = io(API_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 5001,
      // Don't show errors if connection fails - it's optional
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      reconnectAttempts.current = 0;
      // Only show success toast in development
      if (import.meta.env.DEV) {
        toast.success('Real-time connection established', { autoClose: 2000 });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      // Silently handle connection errors - WebSocket is optional
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.warn('WebSocket connection failed after multiple attempts. Real-time features disabled.');
        // Don't show error toast - WebSocket is optional
        newSocket.disconnect();
      }
    });

    // Listen for article updates
    newSocket.on('article:created', (data) => {
      console.log('New article created:', data);
      toast.info(`नवीन लेख तयार केला: ${data.title}`, { autoClose: 3000 });
      setRealtimeStats(prev => ({
        ...prev,
        totalArticles: prev.totalArticles + 1,
        drafts: data.status === 'draft' ? prev.drafts + 1 : prev.drafts
      }));
    });

    newSocket.on('article:updated', (data) => {
      console.log('Article updated:', data);
      toast.info(`लेख अपडेट केला: ${data.title}`, { autoClose: 3000 });
    });

    newSocket.on('article:published', (data) => {
      console.log('Article published:', data);
      toast.success(`लेख प्रकाशित केला: ${data.title}`, { autoClose: 3000 });
      setRealtimeStats(prev => ({
        ...prev,
        publishedToday: prev.publishedToday + 1,
        drafts: prev.drafts > 0 ? prev.drafts - 1 : 0
      }));
    });

    newSocket.on('article:deleted', (data) => {
      console.log('Article deleted:', data);
      toast.warning(`लेख हटवला: ${data.title}`, { autoClose: 3000 });
      setRealtimeStats(prev => ({
        ...prev,
        totalArticles: prev.totalArticles > 0 ? prev.totalArticles - 1 : 0
      }));
    });

    // Listen for stats updates
    newSocket.on('stats:updated', (stats) => {
      console.log('Stats updated:', stats);
      setRealtimeStats(prev => ({ ...prev, ...stats }));
    });

    // Listen for view count updates
    newSocket.on('views:updated', (data) => {
      console.log('Views updated:', data);
      setRealtimeStats(prev => ({
        ...prev,
        totalViews: data.totalViews || prev.totalViews
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    realtimeStats,
    emit
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};


