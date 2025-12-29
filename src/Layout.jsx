import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto bg-white">
        <Outlet />
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Layout;
