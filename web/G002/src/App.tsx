import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import WorklistPage from './pages/WorklistPage';
import SchedulePage from './pages/SchedulePage';
import PatientPage from './pages/PatientPage';
import AppointmentPage from './pages/AppointmentPage';
import ExamPage from './pages/ExamPage';
import ReportPage from './pages/ReportPage';
import ReportWritePage from './pages/ReportWritePage';
import DrugPage from './pages/DrugPage';
import DrugDistributionPage from './pages/DrugDistributionPage';
import RadiationPage from './pages/RadiationPage';
import QCPage from './pages/QCPage';
import EducationPage from './pages/EducationPage';
import StatisticsPage from './pages/StatisticsPage';
import AdminPage from './pages/AdminPage';

const styles: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', height: '100vh', background: '#f4f6f9', fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif' },
  main: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
  topbar: { background: '#fff', padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  topbarTitle: { fontSize: '16px', fontWeight: 600, color: '#1e40af' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  topbarBadge: { background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 },
  content: { flex: 1, overflow: 'auto', padding: '20px' },
};

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div style={styles.layout}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main style={styles.main}>
          <header style={styles.topbar}>
            <span style={styles.topbarTitle}>G002 核医学信息管理系统</span>
            <div style={styles.topbarRight}>
              <span style={styles.topbarBadge}>v0.1.0</span>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>2026-05-02</span>
            </div>
          </header>
          <div style={styles.content}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/worklist" element={<WorklistPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/patients" element={<PatientPage />} />
              <Route path="/appointments" element={<AppointmentPage />} />
              <Route path="/exams" element={<ExamPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/report-write" element={<ReportWritePage />} />
              <Route path="/drugs" element={<DrugPage />} />
              <Route path="/drug-distribution" element={<DrugDistributionPage />} />
              <Route path="/radiation" element={<RadiationPage />} />
              <Route path="/qc" element={<QCPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
