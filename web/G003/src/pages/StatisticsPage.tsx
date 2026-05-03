// ============================================================
// G003 超声RIS系统 - 统计分析页面
// 多图表数据展示 · 深度优化版
// 新增：预测分析 | 医生绩效 | 同比环比 | 时段热力图 | SVG图表升级
// 新增：医生工作量统计 | 追踪符合率统计 | 设备使用效率
// ============================================================
import type { LucideIcon } from 'lucide-react'
import { useState, useMemo } from 'react'
import {
  Activity, FileText, ShieldCheck, AlertTriangle,
  TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar,
  Microscope, Clock, CheckCircle, XCircle, Users,
  Droplets, Filter, TrendingDown, Star, Zap,
  ArrowUpRight, ArrowDownRight, Target, Award,
  ShieldAlert, Eye, AlertCircle, TrendingDown as TrendDownIcon,
  Bell, CheckSquare, XSquare, ClipboardCheck, Search,
  Inbox, RefreshCw, Download, FileUp, Stethoscope,
  Image as ImageIcon, Monitor, Cpu
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ComposedChart, ReferenceLine
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {},
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  filterBar: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: 10,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 13,
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#1a3a5c',
    background: '#fff',
    cursor: 'pointer',
    minHeight: 44,
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#1a3a5c',
    background: '#fff',
    outline: 'none',
    minHeight: 44,
    flex: 1,
    minWidth: 180,
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: '#64748b',
    minHeight: 44,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    minHeight: 44,
  },
  // Tab导航
  tabNav: {
    display: 'flex',
    gap: 4,
    marginBottom: 24,
    background: '#f8fafc',
    padding: 6,
    borderRadius: 10,
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#64748b',
    transition: 'all 0.2s',
    minHeight: 44,
  },
  tabBtnActive: {
    background: '#fff',
    color: '#1a365d',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  // 今日指标行
  todayRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  todayCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  todayIconWrap: {
    width: 48, height: 48, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  todayInfo: { flex: 1, minWidth: 0 },
  todayValue: {
    fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  todayLabel: {
    fontSize: 12, color: '#64748b', marginTop: 2,
  },
  todayTrend: {
    fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2,
  },
  // 图表区域
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  sectionTitleAction: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#f1f5f9',
    cursor: 'pointer',
    fontSize: 12,
    color: '#64748b',
    minHeight: 36,
  },
  // 空状态
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  emptyStateIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  emptyStateAction: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    minHeight: 40,
  },
  chartRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  chartRowWide: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 16,
  },
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chartIcon: { color: '#64748b' },
  // 月度指标行
  monthRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
  monthCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderTop: '3px solid',
    textAlign: 'center' as const,
  },
  monthValue: {
    fontSize: 22, fontWeight: 700, color: '#1a3a5c',
  },
  monthLabel: {
    fontSize: 11, color: '#64748b', marginTop: 4,
  },
  monthUnit: {
    fontSize: 11, color: '#94a3b8', marginTop: 2,
  },
  // 质控卡片
  qcRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  qcCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  qcHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qcTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c',
  },
  qcBadge: {
    fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500,
  },
  qcBar: {
    height: 8, borderRadius: 4, background: '#f1f5f9', marginBottom: 6, overflow: 'hidden',
  },
  qcBarFill: {
    height: '100%', borderRadius: 4, transition: 'width 0.3s',
  },
  qcBarLabel: {
    fontSize: 11, color: '#64748b', display: 'flex', justifyContent: 'space-between',
  },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },

  // ===== 新增样式：预测分析 =====
  predictCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  predictHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  predictTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  predictBadge: {
    fontSize: 11, padding: '3px 8px', borderRadius: 10,
    fontWeight: 500, background: '#f0fdf4', color: '#22c55e',
  },
  predictMetricRow: {
    display: 'flex',
    gap: 24,
    marginBottom: 16,
  },
  predictMetric: {
    flex: 1,
    background: '#f8fafc',
    borderRadius: 8,
    padding: '12px 16px',
  },
  predictMetricLabel: {
    fontSize: 11, color: '#64748b', marginBottom: 4,
  },
  predictMetricValue: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c',
  },
  predictMetricTrend: {
    fontSize: 11, marginTop: 2, display: 'flex', alignItems: 'center', gap: 2,
  },
  predictChartArea: {
    marginTop: 12,
  },

  // ===== 新增样式：医生绩效 =====
  perfRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  perfCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  perfCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  perfDoctorName: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  perfRank: {
    width: 24, height: 24, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#fff',
  },
  perfStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 12,
  },
  perfStat: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '10px 12px',
  },
  perfStatLabel: {
    fontSize: 10, color: '#64748b', marginBottom: 2,
  },
  perfStatValue: {
    fontSize: 16, fontWeight: 700, color: '#1a3a5c',
  },
  perfBar: {
    height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden',
  },
  perfBarFill: {
    height: '100%', borderRadius: 3, transition: 'width 0.3s',
  },
  perfScore: {
    fontSize: 11, color: '#64748b', marginTop: 6, display: 'flex', justifyContent: 'space-between',
  },

  // ===== 新增样式：同比环比 =====
  compareRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
  compareCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderLeft: '3px solid',
  },
  compareLabel: {
    fontSize: 11, color: '#64748b', marginBottom: 6,
  },
  compareValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  compareValue: {
    fontSize: 22, fontWeight: 700, color: '#1a3a5c',
  },
  compareUnit: {
    fontSize: 12, color: '#64748b',
  },
  compareChange: {
    fontSize: 11, display: 'flex', alignItems: 'center', gap: 2,
  },

  // ===== 新增样式：时段热力图 =====
  heatmapContainer: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 24,
  },
  heatmapTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  heatmapGrid: {
    display: 'grid',
    gridTemplateColumns: '60px repeat(7, 1fr)',
    gap: 3,
    fontSize: 11,
  },
  heatmapHeaderCell: {
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: 10,
    padding: '4px 0',
  },
  heatmapTimeLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
    color: '#64748b',
    fontSize: 10,
  },
  heatmapCell: {
    borderRadius: 4,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#fff',
    fontWeight: 500,
    cursor: 'default',
    transition: 'transform 0.1s',
  },
  heatmapLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  heatmapLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 10,
    color: '#64748b',
  },

  // ===== 新增样式：SVG图表升级 =====
  svgGaugeContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  svgGaugeTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 12,
  },
  svgGaugeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 24,
  },

  // ===== 新增样式：雷达图 =====
  radarCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },

  // ===== 新增样式：ADR专项趋势图 =====
  adrTrendCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 24,
    border: '1px solid #fef3c7',
  },
  adrTrendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adrTrendTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  adrBadge: {
    fontSize: 11, padding: '3px 8px', borderRadius: 10,
    fontWeight: 500, background: '#fef3c7', color: '#d97706',
  },
  adrMetricRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 16,
  },
  adrMetricCard: {
    background: '#fefefe',
    borderRadius: 8,
    padding: '12px 16px',
    border: '1px solid #fef3c7',
  },
  adrMetricLabel: {
    fontSize: 11, color: '#64748b', marginBottom: 4,
  },
  adrMetricValue: {
    fontSize: 22, fontWeight: 700, color: '#1a3a5c',
  },
  adrMetricTrend: {
    fontSize: 11, marginTop: 2, display: 'flex', alignItems: 'center', gap: 2,
  },
  adrChartArea: {
    marginTop: 12,
  },

  // ===== 新增样式：反监督指标 =====
  antiSuperRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  antiSuperCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  antiSuperCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  antiSuperCardTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  antiSuperTag: {
    fontSize: 10, padding: '2px 6px', borderRadius: 6,
    fontWeight: 500,
  },
  antiSuperStatRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 12,
  },
  antiSuperStat: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '10px 12px',
  },
  antiSuperStatLabel: {
    fontSize: 10, color: '#64748b', marginBottom: 2,
  },
  antiSuperStatValue: {
    fontSize: 18, fontWeight: 700, color: '#1a3a5c',
  },
  antiSuperProgressBar: {
    height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden',
  },
  antiSuperProgressFill: {
    height: '100%', borderRadius: 3, transition: 'width 0.3s',
  },
  antiSuperFooter: {
    fontSize: 11, color: '#64748b', marginTop: 6, display: 'flex', justifyContent: 'space-between',
  },

  // ===== 新增样式：综合达标率 =====
  overallRateCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 12,
    padding: 20,
    color: '#fff',
    marginBottom: 24,
  },
  overallRateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallRateTitle: {
    fontSize: 14, fontWeight: 600, color: '#fff',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  overallRateValue: {
    fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2,
  },
  overallRateBar: {
    height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.3)',
    overflow: 'hidden', marginTop: 8,
  },
  overallRateBarFill: {
    height: '100%', borderRadius: 4, background: '#fff',
    transition: 'width 0.6s ease-out',
  },
  overallRateFooter: {
    display: 'flex',
    gap: 24,
    marginTop: 12,
  },
  overallRateFooterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    opacity: 0.9,
  },

  // ===== 新增样式：医生工作量统计 =====
  workloadTabContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  },
  workloadStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 12,
    marginBottom: 8,
  },
  workloadStatCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    textAlign: 'center' as const,
  },
  workloadStatValue: {
    fontSize: 22, fontWeight: 700, color: '#1a3a5c',
  },
  workloadStatLabel: {
    fontSize: 11, color: '#64748b', marginTop: 4,
  },
  workloadTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  workloadTh: {
    padding: '14px 16px',
    textAlign: 'left' as const,
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  workloadTd: {
    padding: '14px 16px',
    fontSize: 13,
    color: '#1a3a5c',
    borderBottom: '1px solid #f1f5f9',
  },
  medalBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    marginRight: 8,
  },
  positiveRateBar: {
    height: 6,
    borderRadius: 3,
    background: '#f1f5f9',
    overflow: 'hidden',
    marginTop: 4,
  },
  positiveRateFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s',
  },

  // ===== 新增样式：追踪符合率统计 =====
  complianceTabContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  },
  complianceMetricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 8,
  },
  complianceMetricCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  complianceMetricLabel: {
    fontSize: 11, color: '#64748b', marginBottom: 4,
  },
  complianceMetricValue: {
    fontSize: 22, fontWeight: 700, color: '#1a3a5c',
  },
  complianceMetricTrend: {
    fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2,
  },
  baselineLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    flexWrap: 'wrap' as const,
  },
  baselineLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#64748b',
  },
  baselineDot: {
    width: 12,
    height: 3,
    borderRadius: 2,
  },

  // ===== 新增样式：设备使用效率 =====
  equipmentTabContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  },
  equipmentStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 8,
  },
  equipmentMetricCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  equipmentMetricLabel: {
    fontSize: 11, color: '#64748b', marginBottom: 4,
  },
  equipmentMetricValue: {
    fontSize: 22, fontWeight: 700, color: '#1a3a5c',
  },
  equipmentChartCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  equipmentTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6']

const tooltipStyle = {
  contentStyle: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 12,
  },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// Tab类型
type TabType = 'overview' | 'workload' | 'compliance' | 'equipment'

// ============ 统计分析页面 ============
export default function StatisticsPage() {
  const stats = initialStatisticsData
  const [timeRange, setTimeRange] = useState('7d')
  const [deptFilter, setDeptFilter] = useState('全部')
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // 合并趋势数据
  const trendData = stats.examTrend.map((item, i) => ({
    date: item.date.slice(5),
    检查数: item.count,
    报告数: stats.reportTrend[i]?.count ?? 0,
  }))

  // 计算总计
  const totalExams = stats.examTypeDistribution.reduce((sum, d) => sum + d.value, 0)

  // 洗消合格率数据
  const disinfectionData = [
    { name: '合格', value: stats.monthDisinfectionPassRate, color: '#22c55e' },
    { name: '不合格', value: 100 - stats.monthDisinfectionPassRate, color: '#ef4444' },
  ]

  // ========== 医生工作量统计数据 ==========
  const doctorWorkloadData = useMemo(() => [
    { name: '张明', exams: 328, reports: 315, positiveRate: 42.5, modifyCount: 12, modifyRate: 3.7 },
    { name: '李娜', exams: 296, reports: 289, positiveRate: 38.2, modifyCount: 8, modifyRate: 2.7 },
    { name: '王强', exams: 275, reports: 268, positiveRate: 45.8, modifyCount: 15, modifyRate: 5.5 },
    { name: '赵丽', exams: 258, reports: 252, positiveRate: 35.6, modifyCount: 6, modifyRate: 2.3 },
    { name: '孙伟', exams: 234, reports: 228, positiveRate: 40.1, modifyCount: 10, modifyRate: 4.3 },
    { name: '周芳', exams: 212, reports: 208, positiveRate: 33.9, modifyCount: 5, modifyRate: 2.4 },
    { name: '吴涛', exams: 198, reports: 192, positiveRate: 37.5, modifyCount: 9, modifyRate: 4.5 },
    { name: '郑雪', exams: 185, reports: 181, positiveRate: 41.2, modifyCount: 7, modifyRate: 3.8 },
  ], [])

  const sortedByExams = useMemo(() =>
    [...doctorWorkloadData].sort((a, b) => b.exams - a.exams),
    [doctorWorkloadData]
  )

  // ========== 追踪符合率数据 ==========
  const complianceData = useMemo(() => [
    { month: '1月', concordanceRate: 82.5, misdiagnosisRate: 5.2, firstVisitCount: 1208 },
    { month: '2月', concordanceRate: 83.1, misdiagnosisRate: 4.8, firstVisitCount: 1085 },
    { month: '3月', concordanceRate: 84.2, misdiagnosisRate: 4.5, firstVisitCount: 1320 },
    { month: '4月', concordanceRate: 84.8, misdiagnosisRate: 4.3, firstVisitCount: 1245 },
    { month: '5月', concordanceRate: 85.5, misdiagnosisRate: 4.1, firstVisitCount: 1380 },
    { month: '6月', concordanceRate: 86.2, misdiagnosisRate: 3.9, firstVisitCount: 1298 },
    { month: '7月', concordanceRate: 85.8, misdiagnosisRate: 4.0, firstVisitCount: 1356 },
    { month: '8月', concordanceRate: 86.5, misdiagnosisRate: 3.7, firstVisitCount: 1420 },
    { month: '9月', concordanceRate: 87.1, misdiagnosisRate: 3.5, firstVisitCount: 1385 },
    { month: '10月', concordanceRate: 86.8, misdiagnosisRate: 3.6, firstVisitCount: 1452 },
    { month: '11月', concordanceRate: 87.5, misdiagnosisRate: 3.4, firstVisitCount: 1510 },
    { month: '12月', concordanceRate: 88.2, misdiagnosisRate: 3.2, firstVisitCount: 1498 },
  ], [])

  // ========== 设备使用效率数据 ==========
  const equipmentData = useMemo(() => [
    { name: '超声仪-01', model: 'Philips EPIC7', hoursPerDay: 6.5, maxHours: 8, utilization: 81.2, examCount: 186 },
    { name: '超声仪-02', model: 'Samsung HM70', hoursPerDay: 7.2, maxHours: 8, utilization: 90.0, examCount: 205 },
    { name: '超声仪-03', model: 'Mindray Resona7', hoursPerDay: 5.8, maxHours: 8, utilization: 72.5, examCount: 162 },
    { name: '超声仪-04', model: 'Siemens ACUSON', hoursPerDay: 6.8, maxHours: 8, utilization: 85.0, examCount: 194 },
    { name: '超声仪-05', model: 'GE Voluson E8', hoursPerDay: 7.5, maxHours: 8, utilization: 93.8, examCount: 218 },
    { name: '超声仪-06', model: 'Toshiba Aplio', hoursPerDay: 4.2, maxHours: 8, utilization: 52.5, examCount: 98 },
  ], [])

  const avgUtilization = useMemo(() =>
    (equipmentData.reduce((sum, e) => sum + e.utilization, 0) / equipmentData.length).toFixed(1),
    [equipmentData]
  )

  const tabButtons: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: '综合概览', icon: <BarChart3 size={14} /> },
    { key: 'workload', label: '医生工作量统计', icon: <Stethoscope size={14} /> },
    { key: 'compliance', label: '追踪符合率统计', icon: <ImageIcon size={14} /> },
    { key: 'equipment', label: '设备使用效率', icon: <Monitor size={14} /> },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workload':
        return <DoctorWorkloadTab data={doctorWorkloadData} sortedData={sortedByExams} />
      case 'compliance':
        return <ComplianceTab data={complianceData} />
      case 'equipment':
        return <EquipmentTab data={equipmentData} avgUtilization={avgUtilization} />
      default:
        return <OverviewContent
          stats={stats}
          trendData={trendData}
          totalExams={totalExams}
          disinfectionData={disinfectionData}
        />
    }
  }

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div style={s.titleSection}>
          <h1 style={s.title}>数据统计分析</h1>
          <p style={s.subtitle}>智慧消化专科诊疗平台 · 多维度数据统计</p>
        </div>
      </div>

      {/* Tab导航 */}
      <div style={s.tabNav}>
        {tabButtons.map((tab) => (
          <button
            key={tab.key}
            style={{
              ...s.tabBtn,
              ...(activeTab === tab.key ? s.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 筛选栏 - 仅概览显示 */}
      {activeTab === 'overview' && (
        <div style={s.filterBar}>
          <div style={s.filterLabel}>
            <Calendar size={14} />
            时间范围
          </div>
          <select
            style={s.filterSelect}
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
            <option value="90d">近90天</option>
            <option value="year">本年度</option>
          </select>

          <div style={{ ...s.filterLabel, marginLeft: 16 }}>
            <Filter size={14} />
            科室筛选
          </div>
          <select
            style={s.filterSelect}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="全部">全部科室</option>
            <option value="消化内科">消化内科</option>
            <option value="超声中心">超声中心</option>
          </select>
        </div>
      )}

      {/* Tab内容 */}
      {renderTabContent()}
    </div>
  )
}

// ================================================================
// Overview内容（原有内容封装）
// ================================================================
interface OverviewContentProps {
  stats: typeof initialStatisticsData
  trendData: { date: string; 检查数: number; 报告数: number }[]
  totalExams: number
  disinfectionData: { name: string; value: number; color: string }[]
}

function OverviewContent({ stats, trendData, totalExams, disinfectionData }: OverviewContentProps) {
  return (
    <>
      {/* 今日概览卡片 */}
      <div style={s.todayRow}>
        <TodayCard
          icon={Activity}
          iconBg={s.blue.backgroundColor as string}
          iconColor={s.blue.color as string}
          value={stats.todayExamCount}
          label="今日检查"
          trend="↑ 12%"
          trendUp
        />
        <TodayCard
          icon={FileText}
          iconBg={s.green.backgroundColor as string}
          iconColor={s.green.color as string}
          value={stats.todayReportCount}
          label="今日报告"
          trend="↑ 8%"
          trendUp
        />
        <TodayCard
          icon={ShieldCheck}
          iconBg={s.teal.backgroundColor as string}
          iconColor={s.teal.color as string}
          value={stats.todayDisinfectionCount}
          label="今日洗消"
          trend="↑ 5%"
          trendUp
        />
        <TodayCard
          icon={AlertTriangle}
          iconBg={stats.todayCriticalValueCount > 0 ? (s.red.backgroundColor as string) : '#f1f5f9'}
          iconColor={stats.todayCriticalValueCount > 0 ? (s.red.color as string) : '#94a3b8'}
          value={stats.todayCriticalValueCount}
          label="今日危急值"
          trend={stats.todayCriticalValueCount > 0 ? '⚠ 待处理' : '无异常'}
          isAlert={stats.todayCriticalValueCount > 0}
        />
      </div>

      {/* 趋势分析区 */}
      <div style={s.chartSection}>
        <div style={s.sectionTitle}>
          <TrendingUp size={18} color="#3b82f6" />
          趋势分析
        </div>
        <div style={s.chartRowWide}>
          {/* 折线面积图 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <Activity size={16} style={s.chartIcon} />
              检查与报告趋势
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="examGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="检查数"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#examGrad)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="报告数"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#reportGrad)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 饼图 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <PieChartIcon size={16} style={s.chartIcon} />
              检查类型分布
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.examTypeDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.examTypeDistribution.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} 例`, '']}
                  contentStyle={{
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                共 <strong style={{ color: '#1a3a5c' }}>{totalExams}</strong> 例检查
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 工作量分析 */}
      <div style={s.chartSection}>
        <div style={s.sectionTitle}>
          <BarChart3 size={18} color="#8b5cf6" />
          工作量分析
        </div>
        <div style={s.chartRow}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <BarChart3 size={16} style={s.chartIcon} />
              各检查室工作量
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.roomWorkload} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="room" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <Users size={16} style={s.chartIcon} />
              医生工作量
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.doctorWorkload} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="doctor" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 月度关键指标 */}
      <div style={s.chartSection}>
        <div style={s.sectionTitle}>
          <CheckCircle size={18} color="#22c55e" />
          本月关键指标
        </div>
        <div style={s.monthRow}>
          <MonthCard
            label="本月检查总量"
            value={stats.monthExamCount}
            unit="例"
            borderColor={s.blue.color as string}
          />
          <MonthCard
            label="报告完成率"
            value={stats.monthReportCompletionRate}
            unit="%"
            borderColor={s.green.color as string}
          />
          <MonthCard
            label="腹部超声平均拍照"
            value={stats.monthUltrasoundAvgPhotos}
            unit="张"
            borderColor={s.purple.color as string}
          />
          <MonthCard
            label="洗消合格率"
            value={stats.monthDisinfectionPassRate}
            unit="%"
            borderColor={s.teal.color as string}
          />
          <MonthCard
            label="本月危急值"
            value={stats.monthCriticalValueCount}
            unit="例"
            borderColor={s.red.color as string}
            isAlert={stats.monthCriticalValueCount > 0}
          />
        </div>
      </div>

      {/* ===== 综合达标率 ===== */}
      <OverallRateCard stats={stats} />

      {/* ===== 同比环比分析 ===== */}
      <YoYMoMCompare stats={stats} />

      {/* ===== 时段热力图 ===== */}
      <TimeHeatmap />

      {/* ===== ADR专项趋势图 ===== */}
      <ADRSection stats={stats} />

      {/* ===== 反监督指标 ===== */}
      <AntiSupervisionSection stats={stats} />

      {/* ===== 预测分析 ===== */}
      <PredictionSection stats={stats} />

      {/* ===== 医生绩效分析 ===== */}
      <DoctorPerformanceSection stats={stats} />

      {/* ===== SVG仪表盘升级 ===== */}
      <SVGUpgradeSection stats={stats} />

      {/* ===== 雷达图综合评估 ===== */}
      <div style={s.chartSection}>
        <div style={s.sectionTitle}>
          <Target size={18} color="#8b5cf6" />
          综合能力雷达图
        </div>
        <div style={s.chartRow}>
          <div style={s.radarCard}>
            <div style={s.chartTitle}>
              <Target size={16} style={s.chartIcon} />
              科室综合能力对比
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.departmentRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Radar name="消化内科" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Radar name="超声中心" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={s.radarCard}>
            <div style={s.chartTitle}>
              <Award size={16} style={s.chartIcon} />
              医生综合能力雷达
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.doctorRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Radar name="张明" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Radar name="李娜" dataKey="B" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 质控达标分析 */}
      <div style={s.qcRow}>
        <QCCard
          title="腹部超声拍照质控"
          value={stats.monthUltrasoundAvgPhotos}
          minValue={22}
          unit="张"
          desc="≥22张为达标"
          color={s.blue.color as string}
          icon={Microscope}
        />
        <QCCard
          title="洗消流程质控"
          value={stats.monthDisinfectionPassRate}
          minValue={95}
          unit="%"
          desc="目标≥95%"
          color={s.teal.color as string}
          icon={ShieldCheck}
        />
      </div>
    </>
  )
}

// ================================================================
// 新增Tab：医生工作量统计
// ================================================================
interface DoctorWorkloadTabProps {
  data: { name: string; exams: number; reports: number; positiveRate: number; modifyCount: number; modifyRate: number }[]
  sortedData: { name: string; exams: number; reports: number; positiveRate: number; modifyCount: number; modifyRate: number }[]
}

function DoctorWorkloadTab({ data, sortedData }: DoctorWorkloadTabProps) {
  const totalExams = data.reduce((sum, d) => sum + d.exams, 0)
  const totalReports = data.reduce((sum, d) => sum + d.reports, 0)
  const avgPositiveRate = (data.reduce((sum, d) => sum + d.positiveRate, 0) / data.length).toFixed(1)
  const totalModifies = data.reduce((sum, d) => sum + d.modifyCount, 0)
  const avgModifyRate = (data.reduce((sum, d) => sum + d.modifyRate, 0) / data.length).toFixed(1)

  const medalColors = ['#fbbf24', '#9ca3af', '#cd7c2d']
  const medalLabels = ['🥇', '🥈', '🥉']

  return (
    <div style={s.workloadTabContainer}>
      {/* 汇总指标 */}
      <div style={s.workloadStatsRow}>
        <div style={s.workloadStatCard}>
          <div style={s.workloadStatValue}>{totalExams}</div>
          <div style={s.workloadStatLabel}>总检查量</div>
        </div>
        <div style={s.workloadStatCard}>
          <div style={s.workloadStatValue}>{totalReports}</div>
          <div style={s.workloadStatLabel}>总报告数</div>
        </div>
        <div style={s.workloadStatCard}>
          <div style={s.workloadStatValue}>{avgPositiveRate}%</div>
          <div style={s.workloadStatLabel}>平均阳性检出率</div>
        </div>
        <div style={s.workloadStatCard}>
          <div style={s.workloadStatValue}>{totalModifies}</div>
          <div style={s.workloadStatLabel}>总修改次数</div>
        </div>
        <div style={s.workloadStatCard}>
          <div style={s.workloadStatValue}>{avgModifyRate}%</div>
          <div style={s.workloadStatLabel}>平均修改率</div>
        </div>
        <div style={s.workloadStatCard}>
          <div style={s.workloadStatValue}>{data.length}</div>
          <div style={s.workloadStatLabel}>参与医生</div>
        </div>
      </div>

      {/* 横向柱状图 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}>
          <Stethoscope size={16} style={s.chartIcon} />
          医生工作量排名（按检查数量）
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={sortedData}
            layout="vertical"
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#64748b' }}
              width={60}
            />
            <Tooltip {...tooltipStyle} />
            <Bar
              dataKey="exams"
              fill="#1a365d"
              radius={[0, 4, 4, 0]}
              name="检查数量"
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index < 3 ? medalColors[index] : '#1a365d'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 数据表格 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}>
          <FileText size={16} style={s.chartIcon} />
          医生工作量详细数据
        </div>
        <table style={s.workloadTable}>
          <thead>
            <tr>
              <th style={s.workloadTh}>排名</th>
              <th style={s.workloadTh}>医生姓名</th>
              <th style={s.workloadTh}>检查数量</th>
              <th style={s.workloadTh}>报告数量</th>
              <th style={s.workloadTh}>阳性检出率</th>
              <th style={s.workloadTh}>修改报告次数</th>
              <th style={s.workloadTh}>修改率</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((doc, idx) => (
              <tr key={doc.name}>
                <td style={s.workloadTd}>
                  {idx < 3 ? (
                    <span style={{
                      ...s.medalBadge,
                      background: medalColors[idx],
                    }}>
                      {idx + 1}
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      width: 24,
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#64748b',
                    }}>
                      {idx + 1}
                    </span>
                  )}
                </td>
                <td style={{ ...s.workloadTd, fontWeight: 500 }}>
                  {idx < 3 && (
                    <span style={{ marginRight: 6 }}>{medalLabels[idx]}</span>
                  )}
                  {doc.name}
                </td>
                <td style={s.workloadTd}>{doc.exams}</td>
                <td style={s.workloadTd}>{doc.reports}</td>
                <td style={s.workloadTd}>
                  <span style={{ color: doc.positiveRate >= 40 ? '#22c55e' : '#64748b' }}>
                    {doc.positiveRate}%
                  </span>
                  <div style={s.positiveRateBar}>
                    <div style={{
                      ...s.positiveRateFill,
                      width: `${doc.positiveRate}%`,
                      background: doc.positiveRate >= 40 ? '#22c55e' : '#94a3b8',
                    }} />
                  </div>
                </td>
                <td style={s.workloadTd}>{doc.modifyCount}</td>
                <td style={{
                  ...s.workloadTd,
                  color: doc.modifyRate > 4 ? '#ef4444' : doc.modifyRate > 3 ? '#f97316' : '#22c55e',
                }}>
                  {doc.modifyRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ================================================================
// 新增Tab：追踪符合率统计
// ================================================================
interface ComplianceTabProps {
  data: { month: string; concordanceRate: number; misdiagnosisRate: number; firstVisitCount: number }[]
}

function ComplianceTab({ data }: ComplianceTabProps) {
  const latestRate = data[data.length - 1].concordanceRate
  const avgRate = (data.reduce((sum, d) => sum + d.concordanceRate, 0) / data.length).toFixed(1)
  const latestMisRate = data[data.length - 1].misdiagnosisRate
  const totalFirstVisits = data.reduce((sum, d) => sum + d.firstVisitCount, 0)

  return (
    <div style={s.complianceTabContainer}>
      {/* 汇总指标 */}
      <div style={s.complianceMetricsRow}>
        <div style={s.complianceMetricCard}>
          <div style={s.complianceMetricLabel}>最新符合率</div>
          <div style={{ ...s.complianceMetricValue, color: latestRate >= 85 ? '#22c55e' : '#f97316' }}>
            {latestRate}%
          </div>
          <div style={{
            ...s.complianceMetricTrend,
            color: latestRate >= 85 ? '#22c55e' : '#f97316',
          }}>
            {latestRate >= 85 ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
            {latestRate >= 85 ? '高于标准' : '低于标准85%'}
          </div>
        </div>
        <div style={s.complianceMetricCard}>
          <div style={s.complianceMetricLabel}>平均符合率</div>
          <div style={s.complianceMetricValue}>{avgRate}%</div>
          <div style={{ ...s.complianceMetricTrend, color: '#3b82f6' }}>
            <Activity size={11} />
            年度均值
          </div>
        </div>
        <div style={s.complianceMetricCard}>
          <div style={s.complianceMetricLabel}>最新误诊率</div>
          <div style={{ ...s.complianceMetricValue, color: latestMisRate < 4 ? '#22c55e' : '#f97316' }}>
            {latestMisRate}%
          </div>
          <div style={{
            ...s.complianceMetricTrend,
            color: latestMisRate < 4 ? '#22c55e' : '#f97316',
          }}>
            {latestMisRate < 4 ? <TrendingDown size={11} /> : <AlertCircle size={11} />}
            {latestMisRate < 4 ? '控制良好' : '需关注'}
          </div>
        </div>
        <div style={s.complianceMetricCard}>
          <div style={s.complianceMetricLabel}>年度初诊总量</div>
          <div style={s.complianceMetricValue}>{totalFirstVisits.toLocaleString()}</div>
          <div style={{ ...s.complianceMetricTrend, color: '#64748b' }}>
            <Users size={11} />
            12个月累计
          </div>
        </div>
      </div>

      {/* 折线图 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}>
          <ImageIcon size={16} style={s.chartIcon} />
          追踪符合率趋势分析
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis
              yAxisId="left"
              domain={[75, 95]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{ value: '符合率(%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 2000]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{ value: '初诊数量', angle: 90, position: 'insideRight', fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {/* 行业基准线 */}
            <ReferenceLine
              yAxisId="left"
              y={85}
              stroke="#ef4444"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{ value: '行业标准85%', position: 'right', fontSize: 11, fill: '#ef4444' }}
            />
            {/* 初诊→复诊影像符合率 */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="concordanceRate"
              stroke="#1a365d"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#1a365d' }}
              activeDot={{ r: 6 }}
              name="初诊→复诊影像符合率(%)"
            />
            {/* 初诊误诊率趋势 */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="misdiagnosisRate"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 2"
              dot={{ r: 3, fill: '#f97316' }}
              activeDot={{ r: 5 }}
              name="初诊误诊率(%)"
            />
            {/* 初诊数量 */}
            <Bar
              yAxisId="right"
              dataKey="firstVisitCount"
              fill="#e2e8f0"
              radius={[4, 4, 0, 0]}
              name="初诊数量"
              opacity={0.6}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* 图例说明 */}
        <div style={s.baselineLegend}>
          <div style={s.baselineLegendItem}>
            <div style={{ ...s.baselineDot, background: '#1a365d' }} />
            初诊→复诊影像符合率趋势
          </div>
          <div style={s.baselineLegendItem}>
            <div style={{ ...s.baselineDot, background: '#f97316' }} />
            初诊误诊率趋势
          </div>
          <div style={s.baselineLegendItem}>
            <div style={{ ...s.baselineDot, background: '#e2e8f0' }} />
            初诊数量
          </div>
          <div style={s.baselineLegendItem}>
            <div style={{ ...s.baselineDot, background: '#ef4444' }} />
            行业标准基准线(85%)
          </div>
        </div>
      </div>

      {/* 月度明细表 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}>
          <FileText size={16} style={s.chartIcon} />
          月度符合率明细
        </div>
        <table style={s.workloadTable}>
          <thead>
            <tr>
              <th style={s.workloadTh}>月份</th>
              <th style={s.workloadTh}>符合率</th>
              <th style={s.workloadTh}>误诊率</th>
              <th style={s.workloadTh}>初诊数量</th>
              <th style={s.workloadTh}>与标准差</th>
              <th style={s.workloadTh}>状态</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const diff = (row.concordanceRate - 85).toFixed(1)
              const isAbove = row.concordanceRate >= 85
              return (
                <tr key={row.month}>
                  <td style={s.workloadTd}>{row.month}</td>
                  <td style={{ ...s.workloadTd, fontWeight: 600, color: isAbove ? '#22c55e' : '#ef4444' }}>
                    {row.concordanceRate}%
                  </td>
                  <td style={{ ...s.workloadTd, color: row.misdiagnosisRate < 4 ? '#22c55e' : '#f97316' }}>
                    {row.misdiagnosisRate}%
                  </td>
                  <td style={s.workloadTd}>{row.firstVisitCount.toLocaleString()}</td>
                  <td style={{ ...s.workloadTd, color: isAbove ? '#22c55e' : '#ef4444' }}>
                    {isAbove ? '+' : ''}{diff}%
                  </td>
                  <td style={s.workloadTd}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 500,
                      background: isAbove ? '#f0fdf4' : '#fef2f2',
                      color: isAbove ? '#22c55e' : '#ef4444',
                    }}>
                      {isAbove ? '达标' : '未达标'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ================================================================
// 新增Tab：设备使用效率
// ================================================================
interface EquipmentTabProps {
  data: { name: string; model: string; hoursPerDay: number; maxHours: number; utilization: number; examCount: number }[]
  avgUtilization: string
}

function EquipmentTab({ data, avgUtilization }: EquipmentTabProps) {
  const totalExamCount = data.reduce((sum, d) => sum + d.examCount, 0)
  const avgHours = (data.reduce((sum, d) => sum + d.hoursPerDay, 0) / data.length).toFixed(1)
  const maxUtilization = Math.max(...data.map(d => d.utilization))

  return (
    <div style={s.equipmentTabContainer}>
      {/* 汇总指标 */}
      <div style={s.equipmentStatsRow}>
        <div style={s.equipmentMetricCard}>
          <div style={s.equipmentMetricLabel}>设备总数</div>
          <div style={s.equipmentMetricValue}>{data.length}</div>
        </div>
        <div style={s.equipmentMetricCard}>
          <div style={s.equipmentMetricLabel}>平均利用率</div>
          <div style={{ ...s.equipmentMetricValue, color: Number(avgUtilization) >= 80 ? '#22c55e' : '#f97316' }}>
            {avgUtilization}%
          </div>
        </div>
        <div style={s.equipmentMetricCard}>
          <div style={s.equipmentMetricLabel}>日均使用时长</div>
          <div style={s.equipmentMetricValue}>{avgHours}h</div>
        </div>
        <div style={s.equipmentMetricCard}>
          <div style={s.equipmentMetricLabel}>年度检查总量</div>
          <div style={s.equipmentMetricValue}>{totalExamCount.toLocaleString()}</div>
        </div>
      </div>

      {/* 柱状图 */}
      <div style={s.equipmentChartCard}>
        <div style={s.chartTitle}>
          <Monitor size={16} style={s.chartIcon} />
          各超声设备日均使用时长
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value} 小时/日`, '']} />
            <Bar
              dataKey="hoursPerDay"
              fill="#1a365d"
              radius={[4, 4, 0, 0]}
              name="使用时长(h/日)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.utilization >= 90 ? '#22c55e' : entry.utilization >= 70 ? '#1a365d' : '#f97316'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 12,
          justifyContent: 'center',
          fontSize: 11,
          color: '#64748b',
        }}>
          <span style={{ color: '#22c55e' }}>● 高利用率(≥90%)</span>
          <span style={{ color: '#1a365d' }}>● 正常(70-90%)</span>
          <span style={{ color: '#f97316' }}>● 低利用率(&lt;70%)</span>
        </div>
      </div>

      {/* 利用率排名表 */}
      <div style={s.equipmentChartCard}>
        <div style={s.chartTitle}>
          <Cpu size={16} style={s.chartIcon} />
          设备使用效率详细数据
        </div>
        <table style={s.equipmentTable}>
          <thead>
            <tr>
              <th style={s.workloadTh}>设备名称</th>
              <th style={s.workloadTh}>型号</th>
              <th style={s.workloadTh}>日均时长</th>
              <th style={s.workloadTh}>日最大时长</th>
              <th style={s.workloadTh}>利用率</th>
              <th style={s.workloadTh}>年度检查量</th>
              <th style={s.workloadTh}>状态</th>
            </tr>
          </thead>
          <tbody>
            {[...data].sort((a, b) => b.utilization - a.utilization).map((eq, idx) => (
              <tr key={eq.name}>
                <td style={s.workloadTd}>
                  {idx === 0 && <span style={{ marginRight: 4 }}>👑</span>}
                  {eq.name}
                </td>
                <td style={s.workloadTd}>{eq.model}</td>
                <td style={s.workloadTd}>{eq.hoursPerDay}h</td>
                <td style={s.workloadTd}>{eq.maxHours}h</td>
                <td style={s.workloadTd}>
                  <span style={{
                    fontWeight: 600,
                    color: eq.utilization >= 90 ? '#22c55e' : eq.utilization >= 70 ? '#1a365d' : '#f97316',
                  }}>
                    {eq.utilization}%
                  </span>
                  <div style={s.positiveRateBar}>
                    <div style={{
                      ...s.positiveRateFill,
                      width: `${eq.utilization}%`,
                      background: eq.utilization >= 90 ? '#22c55e' : eq.utilization >= 70 ? '#1a365d' : '#f97316',
                    }} />
                  </div>
                </td>
                <td style={s.workloadTd}>{eq.examCount}</td>
                <td style={s.workloadTd}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 500,
                    background: eq.utilization >= 85 ? '#f0fdf4' : '#fff7ed',
                    color: eq.utilization >= 85 ? '#22c55e' : '#f97316',
                  }}>
                    {eq.utilization >= 85 ? '优良' : eq.utilization >= 70 ? '正常' : '低效'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ================================================================
// 新增子组件：ADR专项趋势图
// ================================================================
interface ADRSectionProps {
  stats: typeof initialStatisticsData
}
function ADRSection({ stats }: ADRSectionProps) {
  const adrTrendData = useMemo(() => {
    const dates = []
    const mild = []
    const moderate = []
    const severe = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
      mild.push(Math.floor(Math.random() * 5 + 2))
      moderate.push(Math.floor(Math.random() * 3))
      severe.push(Math.floor(Math.random() * 2))
    }
    return { dates, mild, moderate, severe }
  }, [])

  const adrCombined = adrTrendData.dates.map((date, i) => ({
    date,
    轻度: adrTrendData.mild[i],
    中度: adrTrendData.moderate[i],
    重度: adrTrendData.severe[i],
    total: adrTrendData.mild[i] + adrTrendData.moderate[i] + adrTrendData.severe[i],
  }))

  const totalADR = adrCombined.reduce((sum, d) => sum + d.total, 0)
  const severeCount = adrCombined.reduce((sum, d) => sum + d.重度, 0)
  const reportRate = 98.2
  const avgHandleTime = 4.2

  return (
    <div style={s.adrTrendCard}>
      <div style={s.adrTrendHeader}>
        <div style={s.adrTrendTitle}>
          <ShieldAlert size={16} color="#d97706" />
          ADR不良反应专项监测
        </div>
        <div style={s.adrBadge}>
          <AlertCircle size={10} style={{ marginRight: 2 }} />
          月度追踪
        </div>
      </div>

      <div style={s.adrMetricRow}>
        <div style={s.adrMetricCard}>
          <div style={s.adrMetricLabel}>本月ADR上报</div>
          <div style={s.adrMetricValue}>{totalADR}</div>
          <div style={{ ...s.adrMetricTrend, color: '#22c55e' }}>
            <ArrowUpRight size={11} /> 较上月 +3.2%
          </div>
        </div>
        <div style={s.adrMetricCard}>
          <div style={s.adrMetricLabel}>重度反应</div>
          <div style={{ ...s.adrMetricValue, color: severeCount > 5 ? '#ef4444' : '#1a3a5c' }}>{severeCount}</div>
          <div style={{ ...s.adrMetricTrend, color: '#ef4444' }}>
            <AlertCircle size={11} /> 需重点关注
          </div>
        </div>
        <div style={s.adrMetricCard}>
          <div style={s.adrMetricLabel}>上报及时率</div>
          <div style={s.adrMetricValue}>{reportRate}%</div>
          <div style={{ ...s.adrMetricTrend, color: reportRate >= 95 ? '#22c55e' : '#ef4444' }}>
            <CheckCircle size={11} /> 已达标
          </div>
        </div>
        <div style={s.adrMetricCard}>
          <div style={s.adrMetricLabel}>平均处置时间</div>
          <div style={s.adrMetricValue}>{avgHandleTime}h</div>
          <div style={{ ...s.adrMetricTrend, color: avgHandleTime <= 6 ? '#22c55e' : '#f97316' }}>
            <Clock size={11} /> 目标≤6h
          </div>
        </div>
      </div>

      <div style={s.adrChartArea}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
          近30天不良反应趋势（按严重程度分层）
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={adrCombined.slice(-14)}>
            <defs>
              <linearGradient id="adrSevereGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="轻度" stackId="a" fill="#fde68a" name="轻度" radius={[0, 0, 0, 0]} />
            <Bar dataKey="中度" stackId="a" fill="#fb923c" name="中度" radius={[0, 0, 0, 0]} />
            <Bar dataKey="重度" stackId="a" fill="#ef4444" name="重度" radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="total" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} name="合计" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ================================================================
// 新增子组件：反监督指标
// ================================================================
interface AntiSupervisionSectionProps {
  stats: typeof initialStatisticsData
}
function AntiSupervisionSection({ stats }: AntiSupervisionSectionProps) {
  const antiSuperData = useMemo(() => [
    {
      title: '报告抽查审核',
      icon: ClipboardCheck,
      color: '#3b82f6',
      bg: '#eff6ff',
      total: 187,
      checked: 156,
      rate: 83.4,
      pending: 31,
      target: 90,
      unit: '%',
    },
    {
      title: '洗消流程监督',
      icon: Eye,
      color: '#22c55e',
      bg: '#f0fdf4',
      total: 156,
      checked: 148,
      rate: 94.9,
      pending: 8,
      target: 95,
      unit: '%',
    },
    {
      title: '危急值追踪',
      icon: Bell,
      color: '#f97316',
      bg: '#fff7ed',
      total: 3,
      handled: 3,
      rate: 100,
      pending: 0,
      target: 100,
      unit: '%',
    },
  ], [])

  return (
    <div style={s.antiSuperRow}>
      {antiSuperData.map((item, idx) => (
        <div key={idx} style={s.antiSuperCard}>
          <div style={s.antiSuperCardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={16} color={item.color} />
              </div>
              <span style={s.antiSuperCardTitle}>{item.title}</span>
            </div>
            <span style={{
              ...s.antiSuperTag,
              background: item.bg,
              color: item.rate >= item.target ? '#22c55e' : '#f97316',
            }}>
              {item.rate >= item.target ? '达标' : '待提升'}
            </span>
          </div>

          <div style={s.antiSuperStatRow}>
            <div style={s.antiSuperStat}>
              <div style={s.antiSuperStatLabel}>总量</div>
              <div style={s.antiSuperStatValue}>{item.total}</div>
            </div>
            <div style={s.antiSuperStat}>
              <div style={s.antiSuperStatLabel}>
                {idx === 2 ? '已处理' : '已抽查'}
              </div>
              <div style={{ ...s.antiSuperStatValue, color: item.color }}>
                {idx === 2 ? item.handled : item.checked}
              </div>
            </div>
          </div>

          <div style={s.antiSuperProgressBar}>
            <div style={{
              ...s.antiSuperProgressFill,
              width: `${Math.min(item.rate, 100)}%`,
              background: item.rate >= item.target ? item.color : '#f97316',
            }} />
          </div>
          <div style={s.antiSuperFooter}>
            <span style={{ color: item.rate >= item.target ? '#22c55e' : '#f97316' }}>
              当前 {item.rate}{item.unit}
            </span>
            <span>目标 {item.target}{item.unit}</span>
          </div>

          {item.pending > 0 && (
            <div style={{
              marginTop: 10,
              padding: '8px 12px',
              background: '#fef2f2',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#ef4444',
            }}>
              <XCircle size={12} />
              待处理 {item.pending} 项
            </div>
          )}
          {item.pending === 0 && idx !== 2 && (
            <div style={{
              marginTop: 10,
              padding: '8px 12px',
              background: '#f0fdf4',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#22c55e',
            }}>
              <CheckCircle size={12} />
              已全部完成监督
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ================================================================
// 新增子组件：综合达标率
// ================================================================
interface OverallRateCardProps {
  stats: typeof initialStatisticsData
}
function OverallRateCard({ stats }: OverallRateCardProps) {
  const overallRate = Math.round(
    (stats.monthReportCompletionRate +
      stats.monthDisinfectionPassRate +
      (stats.monthUltrasoundAvgPhotos / 22) * 100 +
      (stats.monthUltrasoundAvgPhotos / 6) * 100) /
      4
  )

  return (
    <div style={s.overallRateCard}>
      <div style={s.overallRateHeader}>
        <div style={s.overallRateTitle}>
          <Award size={16} color="#fff" />
          本月综合达标率
        </div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          更新于 {new Date().toLocaleDateString('zh-CN')}
        </div>
      </div>
      <div style={s.overallRateValue}>{overallRate}%</div>
      <div style={s.overallRateBar}>
        <div style={{ ...s.overallRateBarFill, width: `${overallRate}%` }} />
      </div>
      <div style={s.overallRateFooter}>
        <div style={s.overallRateFooterItem}>
          <CheckCircle size={12} />
          报告完成 {stats.monthReportCompletionRate}%
        </div>
        <div style={s.overallRateFooterItem}>
          <CheckCircle size={12} />
          洗消合格 {stats.monthDisinfectionPassRate}%
        </div>
        <div style={s.overallRateFooterItem}>
          <CheckCircle size={12} />
          腹部超声质控 {((stats.monthUltrasoundAvgPhotos / 22) * 100).toFixed(0)}%
        </div>
        <div style={s.overallRateFooterItem}>
          <CheckCircle size={12} />
          超声质控 {((stats.monthUltrasoundAvgPhotos / 6) * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  )
}

// ================================================================
// 新增子组件：同比环比分析
// ================================================================
interface YoYMoMCompareProps {
  stats: typeof initialStatisticsData
}
function YoYMoMCompare({ stats }: YoYMoMCompareProps) {
  const compareData = [
    {
      label: '检查量',
      current: stats.monthExamCount,
      yoy: 12.5,
      mom: 5.2,
      unit: '例',
      color: s.blue.color,
      borderColor: s.blue.color,
    },
    {
      label: '报告完成率',
      current: stats.monthReportCompletionRate,
      yoy: 3.2,
      mom: 1.8,
      unit: '%',
      color: s.green.color,
      borderColor: s.green.color,
    },
    {
      label: '洗消合格率',
      current: stats.monthDisinfectionPassRate,
      yoy: 0.5,
      mom: 0.2,
      unit: '%',
      color: s.teal.color,
      borderColor: s.teal.color,
    },
    {
      label: '腹部超声平均拍照',
      current: stats.monthUltrasoundAvgPhotos,
      yoy: 4.1,
      mom: 2.3,
      unit: '张',
      color: s.purple.color,
      borderColor: s.purple.color,
    },
  ]

  return (
    <div style={s.compareRow}>
      {compareData.map((item, idx) => (
        <div
          key={idx}
          style={{
            ...s.compareCard,
            borderLeftColor: item.borderColor,
          }}
        >
          <div style={s.compareLabel}>{item.label}</div>
          <div style={s.compareValueRow}>
            <div style={s.compareValue}>{item.current}</div>
            <div style={s.compareUnit}>{item.unit}</div>
          </div>
          <div style={s.compareChange}>
            <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={12} />
              同比 {item.yoy}%
            </span>
            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 2, marginLeft: 8 }}>
              <ArrowUpRight size={12} />
              环比 {item.mom}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ================================================================
// 新增子组件：时段热力图
// ================================================================
function TimeHeatmap() {
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00',
  ]

  const heatmapData = useMemo(() => [
    [12, 18, 25, 22, 15, 8, 5],
    [18, 28, 35, 32, 20, 12, 8],
    [22, 32, 38, 35, 25, 15, 10],
    [15, 25, 30, 28, 18, 10, 6],
    [20, 30, 36, 33, 22, 14, 9],
    [25, 35, 42, 38, 28, 18, 12],
    [18, 28, 33, 30, 20, 12, 8],
    [10, 18, 22, 20, 12, 6, 3],
  ], [])

  const getHeatColor = (value: number) => {
    if (value >= 35) return '#ef4444'
    if (value >= 28) return '#f97316'
    if (value >= 20) return '#eab308'
    if (value >= 12) return '#22c55e'
    if (value >= 5) return '#86efac'
    return '#f1f5f9'
  }

  return (
    <div style={s.heatmapContainer}>
      <div style={s.heatmapTitle}>
        <Activity size={16} color="#3b82f6" />
        时段热力图 · 检查量分布
      </div>
      <div style={s.heatmapGrid}>
        <div />
        {weekDays.map((day) => (
          <div key={day} style={s.heatmapHeaderCell}>{day}</div>
        ))}

        {timeSlots.map((slot, rowIdx) => (
          <div key={rowIdx} style={{ display: 'contents' }}>
            <div style={s.heatmapTimeLabel}>{slot}</div>
            {heatmapData[rowIdx].map((value, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                style={{
                  ...s.heatmapCell,
                  backgroundColor: getHeatColor(value),
                  color: value >= 20 ? '#fff' : '#64748b',
                }}
                title={`${weekDays[colIdx]} ${slot}: ${value} 例`}
              >
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={s.heatmapLegend}>
        <span style={{ fontSize: 10, color: '#64748b', marginRight: 4 }}>检查量:</span>
        {[
          { label: '低', color: '#f1f5f9' },
          { label: '5+', color: '#86efac' },
          { label: '12+', color: '#22c55e' },
          { label: '20+', color: '#eab308' },
          { label: '28+', color: '#f97316' },
          { label: '35+', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label} style={s.heatmapLegendItem}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: item.color,
              border: '1px solid rgba(0,0,0,0.1)',
            }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ================================================================
// 新增子组件：预测分析
// ================================================================
interface PredictionSectionProps {
  stats: typeof initialStatisticsData
}
function PredictionSection({ stats }: PredictionSectionProps) {
  const trendData = stats.examTrend
  const last7 = trendData.slice(-7)
  const avgGrowth = last7.reduce((sum, d, i) => {
    if (i === 0) return sum
    return sum + (d.count - trendData[trendData.length - 7 + i - 1].count)
  }, 0) / 6

  const baseCount = last7[last7.length - 1].count
  const predictedNextWeek = Array.from({ length: 7 }, (_, i) => ({
    date: `预测${i + 1}`,
    检查数: Math.round(baseCount + avgGrowth * (i + 1) * (1 + Math.random() * 0.1)),
    上限: Math.round(baseCount + avgGrowth * (i + 1) * 1.2),
    下限: Math.round(baseCount + avgGrowth * (i + 1) * 0.8),
  }))

  const predictedMonth = Math.round(
    last7.reduce((sum, d) => sum + d.count, 0) / 7 * 30 * 1.08
  )
  const predictedReport = Math.round(predictedMonth * 0.95)
  const growthRate = ((avgGrowth / baseCount) * 100).toFixed(1)

  const combinedTrend = [...last7.map(d => ({ date: d.date.slice(5), 检查数: d.count })),
    ...predictedNextWeek]

  return (
    <div style={s.chartSection}>
      <div style={s.sectionTitle}>
        <Zap size={18} color="#f97316" />
        AI预测分析
      </div>
      <div style={s.predictCard}>
        <div style={s.predictHeader}>
          <div style={s.predictTitle}>
            <Zap size={16} color="#f97316" />
            下月检查量预测
          </div>
          <div style={s.predictBadge}>
            <TrendingUp size={10} style={{ marginRight: 2 }} />
            AI智能预测
          </div>
        </div>

        <div style={s.predictMetricRow}>
          <div style={s.predictMetric}>
            <div style={s.predictMetricLabel}>预测月检查量</div>
            <div style={s.predictMetricValue}>{predictedMonth}</div>
            <div style={{ ...s.predictMetricTrend, color: '#22c55e' }}>
              <ArrowUpRight size={11} />
              预计增长 {growthRate}%
            </div>
          </div>
          <div style={s.predictMetric}>
            <div style={s.predictMetricLabel}>预测月报告量</div>
            <div style={s.predictMetricValue}>{predictedReport}</div>
            <div style={{ ...s.predictMetricTrend, color: '#22c55e' }}>
              <ArrowUpRight size={11} />
              完成率 95%
            </div>
          </div>
          <div style={s.predictMetric}>
            <div style={s.predictMetricLabel}>日均检查量</div>
            <div style={s.predictMetricValue}>{Math.round(predictedMonth / 30)}</div>
            <div style={{ ...s.predictMetricTrend, color: '#3b82f6' }}>
              <Activity size={11} />
              近7日均值
            </div>
          </div>
        </div>

        <div style={s.predictChartArea}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
            历史趋势 + 未来7日预测
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={combinedTrend}>
              <defs>
                <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="上限"
                stroke="none"
                fill="#f1f5f9"
                name="预测上限"
              />
              <Area
                type="monotone"
                dataKey="下限"
                stroke="none"
                fill="#fff"
                name="预测下限"
              />
              <Area
                type="monotone"
                dataKey="检查数"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#predictGrad)"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// 新增子组件：医生绩效分析
// ================================================================
interface DoctorPerformanceSectionProps {
  stats: typeof initialStatisticsData
}
function DoctorPerformanceSection({ stats }: DoctorPerformanceSectionProps) {
  const doctorPerf = useMemo(() => {
    return stats.doctorWorkload.slice(0, 6).map((d, idx) => {
      const baseScore = 70 + Math.random() * 25
      const qualityScore = 80 + Math.random() * 18
      const efficiencyScore = 65 + Math.random() * 30
      const safetyScore = 90 + Math.random() * 8
      const composite = (baseScore + qualityScore + efficiencyScore + safetyScore) / 4
      return {
        name: d.doctor,
        exams: d.count,
        quality: qualityScore,
        efficiency: efficiencyScore,
        safety: safetyScore,
        composite,
        rank: idx + 1,
      }
    }).sort((a, b) => b.composite - a.composite)
      .map((d, idx) => ({ ...d, rank: idx + 1 }))
  }, [stats.doctorWorkload])

  const rankColors = ['#f97316', '#94a3b8', '#cd7c2d', '#64748b', '#64748b', '#64748b']

  return (
    <div style={s.chartSection}>
      <div style={s.sectionTitle}>
        <Star size={18} color="#f97316" />
        医生绩效分析
      </div>
      <div style={s.perfRow}>
        {doctorPerf.slice(0, 3).map((doc, idx) => (
          <div key={doc.name} style={s.perfCard}>
            <div style={s.perfCardHeader}>
              <div style={s.perfDoctorName}>
                <div style={{
                  ...s.perfRank,
                  background: rankColors[idx],
                }}>
                  {doc.rank}
                </div>
                <Users size={14} color="#64748b" />
                {doc.name}
              </div>
              {idx === 0 && (
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 6,
                  background: '#fff7ed', color: '#f97316', fontWeight: 600,
                }}>
                  TOP
                </span>
              )}
            </div>

            <div style={s.perfStats}>
              <div style={s.perfStat}>
                <div style={s.perfStatLabel}>检查量</div>
                <div style={s.perfStatValue}>{doc.exams}</div>
              </div>
              <div style={s.perfStat}>
                <div style={s.perfStatLabel}>综合评分</div>
                <div style={{ ...s.perfStatValue, color: rankColors[idx] }}>
                  {doc.composite.toFixed(1)}
                </div>
              </div>
              <div style={s.perfStat}>
                <div style={s.perfStatLabel}>质量分</div>
                <div style={s.perfStatValue}>{doc.quality.toFixed(1)}</div>
              </div>
              <div style={s.perfStat}>
                <div style={s.perfStatLabel}>效率分</div>
                <div style={s.perfStatValue}>{doc.efficiency.toFixed(1)}</div>
              </div>
            </div>

            <div style={s.perfBar}>
              <div style={{
                ...s.perfBarFill,
                width: `${doc.composite}%`,
                background: rankColors[idx],
              }} />
            </div>
            <div style={s.perfScore}>
              <span>综合评分 {doc.composite.toFixed(1)}</span>
              <span style={{ color: doc.safety > 95 ? '#22c55e' : '#ef4444' }}>
                安全 {doc.safety.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={s.chartCard}>
        <div style={s.chartTitle}>
          <BarChart3 size={16} style={s.chartIcon} />
          医生工作量与综合评分对比
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart
            data={doctorPerf.map(d => ({
              name: d.name,
              检查量: d.exams,
              综合评分: d.composite,
            }))}
            barCategoryGap="35%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="检查量" fill="#3b82f6" radius={[4, 4, 0, 0]} name="检查量(例)" />
            <Line yAxisId="right" type="monotone" dataKey="综合评分" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="综合评分" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ================================================================
// 新增子组件：SVG仪表盘升级
// ================================================================
interface SVGUpgradeSectionProps {
  stats: typeof initialStatisticsData
}
function SVGUpgradeSection({ stats }: SVGUpgradeSectionProps) {
  const metrics = [
    {
      label: '报告完成率',
      value: stats.monthReportCompletionRate,
      max: 100,
      color: '#22c55e',
      unit: '%',
    },
    {
      label: '洗消合格率',
      value: stats.monthDisinfectionPassRate,
      max: 100,
      color: '#3b82f6',
      unit: '%',
    },
    {
      label: '腹部超声质控达标',
      value: (stats.monthUltrasoundAvgPhotos / 22) * 100,
      max: 100,
      color: '#8b5cf6',
      unit: '%',
    },
  ]

  return (
    <div style={s.svgGaugeRow}>
      {metrics.map((metric, idx) => (
        <GaugeChart
          key={idx}
          label={metric.label}
          value={metric.value}
          max={metric.max}
          color={metric.color}
          unit={metric.unit}
        />
      ))}
    </div>
  )
}

interface GaugeChartProps {
  label: string
  value: number
  max: number
  color: string
  unit: string
}
function GaugeChart({ label, value, max, color, unit }: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const angle = (percentage / 100) * 180

  const radius = 70
  const centerX = 90
  const centerY = 80
  const startAngle = 180
  const endAngle = 0

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    }
  }

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  }

  const trackPath = describeArc(startAngle, endAngle)
  const valueAngle = startAngle - angle
  const valuePath = percentage > 0 ? describeArc(startAngle, valueAngle) : ''

  const ticks = [0, 25, 50, 75, 100]

  return (
    <div style={s.svgGaugeContainer}>
      <div style={s.svgGaugeTitle}>{label}</div>
      <svg width="180" height="110" viewBox="0 0 180 110">
        <path
          d={trackPath}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {percentage > 0 && (
          <path
            d={valuePath}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            style={{ transition: 'all 0.6s ease-out' }}
          />
        )}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 24, fontWeight: 700, fill: '#1a3a5c' }}
        >
          {value.toFixed(1)}
        </text>
        <text
          x={centerX}
          y={centerY + 18}
          textAnchor="middle"
          style={{ fontSize: 12, fill: '#64748b' }}
        >
          {unit}
        </text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px', marginTop: 4 }}>
        {ticks.map(t => (
          <span key={t} style={{ fontSize: 9, color: '#94a3b8' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ---------- TodayCard 子组件 ----------
interface TodayCardProps {
  icon: LucideIcon
  iconBg: React.CSSProperties['background']
  iconColor: string
  value: number
  label: string
  trend: string
  trendUp?: boolean
  isAlert?: boolean
}

function TodayCard({ icon: Icon, iconBg, iconColor, value, label, trend, trendUp, isAlert }: TodayCardProps) {
  return (
    <div style={s.todayCard}>
      <div style={{ ...s.todayIconWrap, background: iconBg }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div style={s.todayInfo}>
        <div style={{
          ...s.todayValue,
          color: isAlert && typeof value === 'number' && value > 0 ? s.red.color : '#1a3a5c',
        }}>
          {value}
        </div>
        <div style={s.todayLabel}>{label}</div>
        <div style={{
          ...s.todayTrend,
          color: trendUp ? '#22c55e' : isAlert ? '#ef4444' : '#94a3b8',
        }}>
          {trend}
        </div>
      </div>
    </div>
  )
}

// ---------- MonthCard 子组件 ----------
interface MonthCardProps {
  label: string
  value: number
  unit: string
  borderColor: string
  isAlert?: boolean
}

function MonthCard({ label, value, unit, borderColor, isAlert }: MonthCardProps) {
  return (
    <div style={{
      ...s.monthCard,
      borderTopColor: isAlert ? s.red.color : borderColor,
    }}>
      <div style={{
        ...s.monthValue,
        color: isAlert && value > 0 ? s.red.color : '#1a3a5c',
      }}>
        {value}
      </div>
      <div style={s.monthUnit}>{unit}</div>
      <div style={s.monthLabel}>{label}</div>
    </div>
  )
}

// ---------- QCCard 子组件 ----------
interface QCCardProps {
  title: string
  value: number
  minValue: number
  unit: string
  desc: string
  color: string
  icon: LucideIcon
}

function QCCard({ title, value, minValue, unit, desc, color, icon: Icon }: QCCardProps) {
  const passRate = Math.min((value / minValue) * 100, 100)
  const isPass = value >= minValue

  return (
    <div style={s.qcCard}>
      <div style={s.qcHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} color={color} />
          <span style={s.qcTitle}>{title}</span>
        </div>
        <span style={{
          ...s.qcBadge,
          background: isPass ? '#f0fdf4' : '#fef2f2',
          color: isPass ? '#22c55e' : '#ef4444',
        }}>
          {isPass ? '达标' : '未达标'}
        </span>
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, color: isPass ? color : s.red.color, marginBottom: 12 }}>
        {value}
        <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b', marginLeft: 4 }}>{unit}</span>
      </div>

      <div style={s.qcBar}>
        <div style={{
          ...s.qcBarFill,
          width: `${passRate}%`,
          background: isPass ? color : '#ef4444',
        }} />
      </div>
      <div style={s.qcBarLabel}>
        <span>{desc}</span>
        <span>{passRate.toFixed(0)}%</span>
      </div>
    </div>
  )
}
