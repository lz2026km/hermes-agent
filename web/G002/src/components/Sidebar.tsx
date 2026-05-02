import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, ClipboardList, Calendar, Users, CalendarCheck,
  Scan, FileText, Pill, Radio, ShieldCheck,
  GraduationCap, BarChart3, Settings, ChevronLeft, ChevronRight,
  Activity, ScanLine, Stethoscope
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: '工作台',
    items: [
      { key: 'home', label: '首页概览', icon: Home, path: '/' },
      { key: 'worklist', label: '检查工作台', icon: ClipboardList, path: '/worklist' },
      { key: 'schedule', label: '排班管理', icon: Calendar, path: '/schedule' },
    ],
  },
  {
    label: '患者与预约',
    items: [
      { key: 'patients', label: '患者管理', icon: Users, path: '/patients' },
      { key: 'appointments', label: '检查预约', icon: CalendarCheck, path: '/appointments' },
    ],
  },
  {
    label: '检查与报告',
    items: [
      { key: 'exams', label: '检查执行', icon: Scan, path: '/exams' },
      { key: 'reports', label: '报告管理', icon: FileText, path: '/reports' },
      { key: 'report-write', label: '报告书写', icon: Stethoscope, path: '/report-write' },
    ],
  },
  {
    label: '核素药品管理',
    items: [
      { key: 'drugs', label: '药品库存', icon: Pill, path: '/drugs' },
      { key: 'drug-distribution', label: '药品分发', icon: Activity, path: '/drug-distribution' },
    ],
  },
  {
    label: '辐射防护',
    items: [
      { key: 'radiation', label: '剂量监测', icon: ShieldCheck, path: '/radiation' },
    ],
  },
  {
    label: '质控与教学',
    items: [
      { key: 'qc', label: '质量控制', icon: ScanLine, path: '/qc' },
      { key: 'education', label: '教育培训', icon: GraduationCap, path: '/education' },
    ],
  },
  {
    label: '系统管理',
    items: [
      { key: 'statistics', label: '统计分析', icon: BarChart3, path: '/statistics' },
      { key: 'admin', label: '系统管理', icon: Settings, path: '/admin' },
    ],
  },
];

const styles = {
  sidebar: (collapsed: boolean): React.CSSProperties => ({
    width: collapsed ? '60px' : '220px',
    minWidth: collapsed ? '60px' : '220px',
    background: '#1e3a5f',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease, min-width 0.2s ease',
    overflow: 'hidden',
    height: '100vh',
  }),
  logo: { padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { width: '32px', height: '32px', background: '#1e40af', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: (collapsed: boolean): React.CSSProperties => ({
    fontSize: '13px',
    fontWeight: 700,
    color: '#93c5fd',
    whiteSpace: 'nowrap',
    opacity: collapsed ? 0 : 1,
    transition: 'opacity 0.2s',
    overflow: 'hidden',
  }),
  nav: { flex: 1, overflowY: 'auto' as const, padding: '8px 0' },
  group: { marginBottom: '8px' },
  groupLabel: (collapsed: boolean): React.CSSProperties => ({
    fontSize: '10px',
    fontWeight: 600,
    color: '#93c5fd',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '8px 16px 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    opacity: collapsed ? 0 : 1,
  }),
  item: (active: boolean, collapsed: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 16px',
    cursor: 'pointer',
    background: active ? '#1e40af' : 'transparent',
    borderLeft: active ? '3px solid #60a5fa' : '3px solid transparent',
    color: active ? '#fff' : '#cbd5e1',
    fontSize: '13px',
    fontWeight: active ? 500 : 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: 'background 0.15s',
  }),
  toggle: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' },
  toggleBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default function Sidebar({ collapsed: initialCollapsed, onToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={styles.sidebar(collapsed)}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Radio size={18} color="#60a5fa" />
        </div>
        <span style={styles.logoText(collapsed)}>核医学信息系统</span>
      </div>

      <nav style={styles.nav}>
        {navGroups.map(group => (
          <div key={group.label} style={styles.group}>
            <div style={styles.groupLabel(collapsed)}>{group.label}</div>
            {group.items.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <div
                  key={item.key}
                  style={styles.item(active, collapsed)}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={styles.toggle}>
        <button style={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );
}
