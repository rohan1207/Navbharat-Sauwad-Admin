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
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Color constants for consistency
const colors = {
  primary: {
    DEFAULT: "#006D5B",
    50: "#E6F4F1",
    100: "#B6E2D3",
    200: "#8AD1B9",
    300: "#5DBF9E",
    400: "#31AE83",
    500: "#006D5B",
    600: "#005A4B",
    700: "#00463B",
    800: "#00332B",
    900: "#00201A"
  },
  background: "#F8FAF9",
  text: {
    primary: "#1A1A1A",
    secondary: "#4B5563",
    light: "#6B7280"
  }
};

const links = [
  { to: "/admin", label: "Dashboard", icon: <FiHome /> },
  { to: "/admin/epaper", label: "ई-पेपर व्यवस्थापन", icon: <FiFileText /> },
  
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const username = localStorage.getItem("adminUsername");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/admin/login");
  };

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
        className="lg:hidden fixed top-6 left-6 z-20 p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-xl"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0, 109, 91, 0.15)'
        }}
      >
        <FiMenu className="w-6 h-6" style={{ color: colors.primary[500] }} />
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
          className="hidden lg:flex flex-col w-[300px] bg-white shadow-xl transition-all duration-300"
          style={{
            backgroundColor: 'white',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Desktop Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: 'rgba(0, 109, 91, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #006D5B 0%, #004B3F 100%)',
                  boxShadow: '0 4px 12px rgba(0, 109, 91, 0.2)'
                }}
              >
                <span className="text-white font-bold text-xl">
                  {username?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {username || "Admin"}
                </h2>
                <p className="text-sm" style={{ color: colors.primary[500] }}>
                  नवभारत संवाद

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
                        ? 'bg-[#006D5B] text-white shadow-sm [&_span]:text-white'
                        : 'text-gray-600 hover:bg-gray-50 [&_span]:text-[#006D5B]'
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 mt-4"
              style={{
                color: colors.primary[500],
                backgroundColor: 'transparent',
                border: `1px solid ${colors.primary[100]}`,
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
              borderColor: 'rgba(0, 109, 91, 0.1)'
            }}
          >
            <p 
              className="text-xs text-center"
              style={{ color: colors.text.secondary }}
            >
              नवभारत संवाद
 © 2025
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <motion.aside
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          exit="closed"
          variants={sidebarVariants}
          className="lg:hidden fixed inset-y-0 left-0 w-full sm:w-80 bg-white shadow-2xl flex flex-col z-40"
          style={{
            backgroundColor: 'white',
            boxShadow: '8px 0 30px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: 'rgba(0, 109, 91, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #006D5B 0%, #004B3F 100%)',
                  boxShadow: '0 4px 12px rgba(0, 109, 91, 0.2)'
                }}
              >
                <span className="text-white font-bold text-xl">
                  {username?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {username || "Admin"}
                </h2>
                <p className="text-sm" style={{ color: colors.primary[500] }}>
                  Administrator
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-50 transition-colors"
              style={{
                color: colors.primary[500],
                border: `1px solid ${colors.primary[100]}`
              }}
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
                        ? 'bg-[#006D5B] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                  style={{
                    margin: '0.25rem 0',
                    color: colors.text.secondary
                  }}
                >
                  <span 
                    className="text-xl"
                    style={{
                      color: colors.primary[500]
                    }}
                  >
                    {l.icon}
                  </span>
                  <span className="text-sm font-medium">{l.label}</span>
                </NavLink>
              ))}
            </div>
            {/* Logout Button for Mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 mt-4"
              style={{
                color: colors.primary[500],
                backgroundColor: 'transparent',
                border: `1px solid ${colors.primary[100]}`,
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
          <div className="p-4 border-t dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Aagaur Admin © 2025
            </p>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
