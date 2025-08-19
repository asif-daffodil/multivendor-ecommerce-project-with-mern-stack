import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { toggleTheme } from "../utils/theme";

const DashboardSidebar = ({ links, color = "blue" }) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  return (
  <aside className={`min-h-screen w-64 p-6 flex flex-col shadow-xl rounded-r-2xl bg-white dark:bg-gray-900`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-bold">Admin</div>
        <button
          onClick={() => { toggleTheme(); setIsDark(document.documentElement.classList.contains('dark')); }}
          aria-label="Toggle theme"
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title={isDark ? 'Switch to light' : 'Switch to dark'}
        >
          <span>{isDark ? '🌞' : '🌙'}</span>
        </button>
      </div>
      <nav className="flex flex-col gap-4">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={
                `px-4 py-2 rounded-lg font-semibold transition-colors duration-150 shadow-sm ` +
                (isActive
                  ? `bg-${color}-600 text-white`
                  : `bg-${color}-100 dark:bg-gray-800 text-${color}-700 dark:text-${color}-200`) +
                ` hover:bg-${color}-200 dark:hover:bg-${color}-800`
              }
            >
              {link.icon && <span className="mr-2">{link.icon}</span>}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
