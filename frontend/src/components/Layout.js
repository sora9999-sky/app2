import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Wallet,
  Users,
  Bell,
  Receipt,
  Settings as SettingsIcon,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeNotifications } from '../lib/notifications';

export default function Layout({ children }) {
  const { tr, lang, setLanguage, state, toast } = useApp();
  const notifCount = computeNotifications(state).length;
  const location = useLocation();

  const navItems = [
    { to: '/safe', label: tr('nav.safe'), icon: Wallet },
    { to: '/suppliers', label: tr('nav.suppliers'), icon: Users },
    {
      to: '/notifications',
      label: tr('nav.notifications'),
      icon: Bell,
      badge: notifCount,
    },
    { to: '/expenses', label: tr('nav.expenses'), icon: Receipt },
    { to: '/settings', label: tr('nav.settings'), icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-sky-100 flex flex-col shadow-sm">
          <div className="px-6 py-6 border-b border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                D
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">{tr('appName')}</div>
                <div className="text-xs text-slate-500">{tr('tagline')}</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  data-testid={`nav-${item.to.slice(1)}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                        : 'text-slate-600 hover:bg-sky-100 hover:text-sky-700'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-sky-100">
            <button
              data-testid="lang-toggle"
              onClick={() => setLanguage(lang === 'en' ? 'ar' : 'en')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition"
            >
              <Globe size={16} />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-8 py-8" key={location.pathname}>
            {children}
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          data-testid="toast"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg font-medium text-white ${
            toast.type === 'error'
              ? 'bg-rose-500'
              : toast.type === 'success'
              ? 'bg-emerald-500'
              : 'bg-sky-500'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
