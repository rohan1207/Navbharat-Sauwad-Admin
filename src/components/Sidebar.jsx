import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiPlusCircle,
  FiBookOpen,
  FiList,
  FiMenu,
  FiX,
  FiLogOut,
  FiFileText,
  FiClipboard,
  FiUsers,
  FiImage,
  FiSettings,
  FiTag,
  FiCamera,
  FiVideo,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Color constants for consistency - Black/White theme
const colors = {
  primary: {
    DEFAULT: "#000000",
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827"
  },
  background: "#FFFFFF",
  text: {
    primary: "#000000",
    secondary: "#4B5563",
    light: "#6B7280"
  }
};

const links = [
  { to: "/admin", label: "Dashboard", icon: <FiHome /> },
  { to: "/admin/articles", label: "लेख व्यवस्थापन", icon: <FiBookOpen /> },
  { to: "/admin/categories", label: "श्रेणी व्यवस्थापन", icon: <FiTag /> },
  { to: "/admin/authors", label: "लेखक व्यवस्थापन", icon: <FiUsers /> },
  { to: "/admin/media", label: "मीडिया लायब्ररी", icon: <FiImage /> },
  { to: "/admin/epaper2", label: "ई-पेपर व्यवस्थापन", icon: <FiFileText /> },
  { to: "/admin/ads", label: "जाहिरात व्यवस्थापन", icon: <FiImage /> },
  { to: "/admin/photo-of-the-day", label: "आजचे फोटो", icon: <FiCamera /> },
  { to: "/admin/shorts", label: "YouTube Shorts", icon: <FiVideo /> },
  { to: "/admin/settings", label: "सेटिंग्ज", icon: <FiSettings /> },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/admin/login");
  };

  const displayName = "Admin Panel";

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-20 p-3 rounded-full bg-gray-900 shadow-lg hover:bg-black transition-all duration-300 hover:shadow-xl"
        style={{
          backgroundColor: '#111827',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <FiMenu className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence>
        {/* Overlay */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />
        )}

        {/* Sidebar for Desktop */}
        <aside 
          className="hidden lg:flex flex-col w-[300px] bg-gray-900 shadow-xl transition-all duration-300"
          style={{
            backgroundColor: '#111827',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Desktop Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span className="text-gray-900 font-bold text-xl">
                  A
                </span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-400">
                  NAV MANCH
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  PRGI: MHMAR/25/A4153
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 flex flex-col">
            <div className="flex-grow">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                  style={{
                    margin: '0.25rem 0'
                  }}
                >
                  <span className="text-xl">
                    {l.icon}
                  </span>
                  <span className="text-sm font-medium">{l.label}</span>
                </NavLink>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 mt-4 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              style={{
                margin: '1rem 0.5rem',
                fontWeight: 500
              }}
            >
              <span className="text-xl">
                <FiLogOut />
              </span>
              <span className="text-sm">Logout</span>
            </button>
          </nav>

          <div 
            className="p-4 border-t"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="text-xs text-center text-gray-400 space-y-1">
              <p>NAV MANCH © 2025</p>
              <p className="text-[10px] text-gray-500">PRGI: MHMAR/25/A4153</p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <motion.aside
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          exit="closed"
          variants={sidebarVariants}
          className="lg:hidden fixed inset-y-0 left-0 w-full sm:w-80 bg-gray-900 shadow-2xl flex flex-col z-40"
          style={{
            backgroundColor: '#111827',
            boxShadow: '8px 0 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span className="text-gray-900 font-bold text-xl">
                  A
                </span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-400">
                  NAV MANCH
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  PRGI: MHMAR/25/A4153
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-800 transition-colors text-white border border-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 flex flex-col">
            <div className="flex-grow">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                  style={{
                    margin: '0.25rem 0'
                  }}
                >
                  <span className="text-xl">
                    {l.icon}
                  </span>
                  <span className="text-sm font-medium">{l.label}</span>
                </NavLink>
              ))}
            </div>
            {/* Logout Button for Mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 mt-4 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              style={{
                margin: '1rem 0.5rem',
                fontWeight: 500
              }}
            >
              <span className="text-xl">
                <FiLogOut />
              </span>
              <span className="text-sm">Logout</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="text-xs text-center text-gray-400 space-y-1">
              <p>NAV MANCH © 2025</p>
              <p className="text-[10px] text-gray-500">PRGI: MHMAR/25/A4153</p>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
