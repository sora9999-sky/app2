import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { AppProvider, useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import SafePage from '@/pages/SafePage';
import SuppliersPage from '@/pages/SuppliersPage';
import SupplierAccountPage from '@/pages/SupplierAccountPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ExpensesPage from '@/pages/ExpensesPage';
import SettingsPage from '@/pages/SettingsPage';

function Shell() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-sky-600 font-semibold">Loading…</div>
      </div>
    );
  }
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/safe" replace />} />
        <Route path="/safe" element={<SafePage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/suppliers/:id" element={<SupplierAccountPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/safe" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
