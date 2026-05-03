import { useState, lazy, Suspense, createContext, useContext } from 'react'
import { Routes, Route, Navigate, BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import { MWLProvider } from './context/MWLContext'

// Navigate context — 让菜单点击更新 URL
const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = () => useContext(NavigateCtx)
import {
  LayoutDashboard, Users, CalendarClock, Activity, FileText, Microscope,
  ShieldCheck, BarChart3, ClipboardCheck, BookOpen, Shield, ListChecks,
  Menu, X,  Stethoscope, LogOut, Bell, Package, Scissors, ShieldAlert, AlertTriangle,
  Camera, UserCheck, AlertCircle, Video, GraduationCap, UsersRound, Database
} from 'lucide-react'

// 页面组件 — 代码分割（按需加载）
const HomePage = lazy(() => import('./pages/HomePage'))
const PatientPage = lazy(() => import('./pages/PatientPage'))
const AppointmentPage = lazy(() => import('./pages/AppointmentPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const ReportWritePage = lazy(() => import('./pages/ReportWritePage'))
import TestPage from './pages/TestPage'
const EndoscopePage = lazy(() => import('./pages/EndoscopePage'))
const DisinfectionPage = lazy(() => import('./pages/DisinfectionPage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))
const QCPage = lazy(() => import('./pages/QCPage'))
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'))
const AuditPage = lazy(() => import('./pages/AuditPage'))
const WorklistPage = lazy(() => import('./pages/WorklistPage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const CriticalValuePage = lazy(() => import('./pages/CriticalValuePage'))
const CriticalAlertPage = lazy(() => import('./pages/CriticalAlertPage'))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'))
const FollowUpPage = lazy(() => import('./pages/FollowUpPage'))
const SurgeryPage = lazy(() => import('./pages/SurgeryPage'))
const AuthorityPage = lazy(() => import('./pages/AuthorityPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ImagePage = lazy(() => import('./pages/ImagePage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const TemplatePage = lazy(() => import('./pages/TemplatePage'))
const NursingPage = lazy(() => import('./pages/NursingPage'))
const PreOpPage = lazy(() => import('./pages/PreOpPage'))
const SurgeryLivePage = lazy(() => import('./pages/SurgeryLivePage'))
const AIQCPage = lazy(() => import('./pages/AIQCPage'))
const CancerScreenPage = lazy(() => import('./pages/CancerScreenPage'))
const StatsEnhancedPage = lazy(() => import('./pages/StatsEnhancedPage'))
const DisinfectionTracePage = lazy(() => import('./pages/DisinfectionTracePage'))
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'))
const InfectionPage = lazy(() => import('./pages/InfectionPage'))
const SurgeryRecordPage = lazy(() => import('./pages/SurgeryRecordPage'))
const NationalReportPage = lazy(() => import('./pages/NationalReportPage'))
const InsuranceAuditPage = lazy(() => import('./pages/InsuranceAuditPage'))
const ResearchPage = lazy(() => import('./pages/ResearchPage'))
const TrainingPage = lazy(() => import('./pages/TrainingPage'))
const QueueCallPage = lazy(() => import('./pages/QueueCallPage'))
const DataReportCenterPage = lazy(() => import('./pages/DataReportCenterPage'))
const EquipmentLifecyclePage = lazy(() => import('./pages/EquipmentLifecyclePage'))
const OperationsCenterPage = lazy(() => import('./pages/OperationsCenterPage'))
const DicomViewerPage = lazy(() => import('./pages/DicomViewerPage'))
const CostAnalysisPage = lazy(() => import('./pages/CostAnalysisPage'))
const ImagingModesPage = lazy(() => import('./pages/ImagingModesPage'))

// 骨架屏 Loading 组件
const SkeletonBlock = ({ width = '100%', height = 20, style = {} }: { width?: string | number, height?: number, style?: React.CSSProperties }) => (
  <div style={{
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
    borderRadius: 4,
    ...style,
    width,
    height,
  }} />
)

const Loading = () => (
  <div style={{ padding: 24 }}>
    {/* 顶部卡片骨架 */}
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SkeletonBlock height={28} width="40%" style={{ marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 6 }}>
            <SkeletonBlock height={14} width="60%" style={{ marginBottom: 10 }} />
            <SkeletonBlock height={22} width="80%" />
          </div>
        ))}
      </div>
    </div>
    {/* 主内容骨架 */}
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <SkeletonBlock height={36} width={120} />
        <SkeletonBlock height={36} width={120} />
        <SkeletonBlock height={36} width={120} />
      </div>
      <SkeletonBlock height={400} />
    </div>
    <style>{`@keyframes skeleton-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
  </div>
)

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  sidebar: {
    width: 280, background: '#1a3a5c', color: '#fff', display: 'flex',
    flexDirection: 'column', position: 'fixed', height: '100vh', overflowY: 'auto',
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  logo: {
    padding: '28px 24px 24px', fontSize: 22, fontWeight: 700,
    borderBottom: '1px solid rgba(255,255,255,0.1)', letterSpacing: 1,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  nav: { flex: 1, padding: '20px 0', overflowY: 'auto' },
  navSection: { marginBottom: 8 },
  navSectionTitle: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
    letterSpacing: 1.5, padding: '14px 24px 8px', fontWeight: 700, lineHeight: 1.4,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
    cursor: 'pointer', borderRadius: 0, transition: 'all 0.2s',
    fontSize: 16, color: '#ffffff', borderLeft: '4px solid transparent', lineHeight: 1.5,
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)', color: '#ffffff',
    borderLeft: '4px solid #4ade80',
  },
  navIcon: { flexShrink: 0, opacity: 0.9 },
  sidebarFooter: {
    borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px',
  },
  userInfo: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  main: {
    marginLeft: 280, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh',
  },
  topbar: {
    background: '#fff', padding: '0 32px', height: 72,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10,
  },
  topbarTitle: { fontSize: 20, fontWeight: 600, color: '#1a3a5c' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 24 },
  topbarBadge: {
    position: 'relative', cursor: 'pointer', color: '#64748b', display: 'flex',
  },
  badge: {
    position: 'absolute', top: -8, right: -8, background: '#ef4444',
    color: '#fff', borderRadius: '50%', width: 20, height: 20,
    fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  page: { padding: 32, flex: 1, overflowX: 'auto' },
  mobileMenuBtn: {
    display: 'flex', background: 'none', border: 'none', cursor: 'pointer',
    color: '#1a3a5c', padding: 8, minWidth: 44, minHeight: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, display: 'block',
    overflow: 'auto',
  },
}

const NAV_ITEMS = [
  {
    section: '工作台',
    items: [
      { path: '/', icon: LayoutDashboard, label: '首页概览' },
      { path: '/worklist', icon: ListChecks, label: '检查工作台' },
      { path: '/schedule', icon: CalendarClock, label: '排班管理' },
    ],
  },
  {
    section: '患者与预约',
    items: [
      { path: '/patients', icon: Users, label: '患者管理' },
      { path: '/appointments', icon: CalendarClock, label: '预约管理' },
    ],
  },
  {
    section: '检查与报告',
    items: [
      { path: '/exams', icon: Activity, label: '检查执行' },
      { path: '/queue-call', icon: Bell, label: '叫号管理' },
      { path: '/reports', icon: FileText, label: '报告管理' },
      { path: '/report-write', icon: Stethoscope, label: '报告书写' },
      { path: '/critical-value', icon: Bell, label: '危急值' },
      { path: '/critical-alert', icon: AlertTriangle, label: '危机预警' },
      { path: '/images', icon: Camera, label: '影像管理' },
      { path: '/dicom', icon: Camera, label: 'DICOM浏览器' },
      { path: '/imaging-modes', icon: Camera, label: '成像模式介绍' },
      { path: '/templates', icon: FileText, label: '检查模板' },
      { path: '/nursing', icon: ClipboardCheck, label: '护理记录' },
      { path: '/preop', icon: ClipboardCheck, label: '术前评估' },
    ],
  },
  {
    section: '内镜与洗消',
    items: [
      { path: '/endoscopes', icon: Microscope, label: '内镜设备' },
      { path: '/disinfection', icon: ShieldCheck, label: '洗消追溯' },
      { path: '/disinfection-trace', icon: ShieldCheck, label: '洗消追溯增强' },
    ],
  },
  {
    section: '手术与示教',
    items: [
      { path: '/surgery', icon: Scissors, label: '手术预约' },
      { path: '/surgery-live', icon: Camera, label: '手术示教' },
      { path: '/surgery-records', icon: Video, label: '手术录像管理' },
    ],
  },
  {
    section: '质量与安全',
    items: [
      { path: '/ai-qc', icon: BarChart3, label: 'AI质控中心' },
      { path: '/qc', icon: ClipboardCheck, label: '质量控制' },
      { path: '/infection', icon: AlertCircle, label: '感染管理' },
      { path: '/consultation', icon: UserCheck, label: '会诊管理' },
    ],
  },
  {
    section: '管理与统计',
    items: [
      { path: '/statistics', icon: BarChart3, label: '数据统计' },
      { path: '/stats-enhanced', icon: BarChart3, label: '统计分析' },
      { path: '/dashboard', icon: BarChart3, label: '科室看板' },
      { path: '/operations', icon: BarChart3, label: '运营指挥中心' },
      { path: '/cost-analysis', icon: BarChart3, label: '成本效益分析' },
      { path: '/authority', icon: ShieldAlert, label: '权限管理' },
      { path: '/dictionary', icon: BookOpen, label: '数据字典' },
      { path: '/audit', icon: Shield, label: '审计日志' },
      { path: '/materials', icon: Package, label: '耗材管理' },
      { path: '/equipment-lifecycle', icon: Microscope, label: '设备全生命周期' },
      { path: '/followup', icon: Activity, label: '随访管理' },
      { path: '/cancer-screen', icon: AlertTriangle, label: '早癌筛查' },
      { path: '/national-report', icon: ShieldAlert, label: '国家数据上报' },
      { path: '/data-report', icon: Database, label: '数据上报中心' },
      { path: '/insurance-audit', icon: ShieldCheck, label: '医保审核' },
      { path: '/research', icon: Database, label: '临床数据中心' },
    ],
  },
  {
    section: '教育与培训',
    items: [
      { path: '/education', icon: GraduationCap, label: '教育培训' },
      { path: '/training', icon: BookOpen, label: '技能培训中心' },
    ],
  },
]

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

// AppShell 在 BrowserRouter 内部，可安全使用 useNavigate / useLocation
function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const currentPath = location.pathname

  const navTo = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const renderNavItem = (item: typeof NAV_ITEMS[0]['items'][0]) => {
    const isActive = currentPath === item.path
    return (
      <div
        key={item.path}
        style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}
        onClick={() => navTo(item.path)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navTo(item.path)}
      >
        <item.icon size={16} style={s.navIcon} />
        <span>{item.label}</span>
      </div>
    )
  }

  return (
    <div style={s.root}>
      {/* 侧边栏 */}
      <aside style={{ ...s.sidebar, ...((!sidebarOpen) ? {} : { transform: 'translateX(0)', transition: 'transform 0.2s' }) }}>
        <div style={s.logo}>
          <Microscope size={22} color="#4ade80" />
          <span>G004 · 内镜系统</span>
        </div>
        <nav style={s.nav}>
          {NAV_ITEMS.map((group) => (
            <div key={group.section} style={s.navSection}>
              <div style={s.navSectionTitle}>{group.section}</div>
              {group.items.map(renderNavItem)}
            </div>
          ))}
        </nav>
          <div style={s.sidebarFooter}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>内镜诊疗信息管理系统</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#4ade80', fontWeight: 700 }}>v0.12.0</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }} onClick={() => alert('版本历史：\\n\\nv0.12.0 — UI适配Win10/模拟数据扩充/竞品精细化对标增强\\nv0.10.0 — DICOM浏览器/成本分析/成像模式/权限管理增强\\nv0.9.0 — 38个页面精细化/AI质控增强\\nv0.8.0 — 排班增强/洗消追溯/报告书写\\nv0.7.0 — 手术管理增强/数据上报\\nv0.6.0 — 核心功能完善\\nv0.5.0 — 基础框架搭建')}>历史版本 ▾</div>
          </div>
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div style={{ ...s.overlay, display: 'block' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* 主内容 */}
      <div style={s.main}>
        {/* 顶部栏 */}
        <header style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              style={s.mobileMenuBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span style={s.topbarTitle}>
              {NAV_ITEMS.flatMap(g => g.items).find(i => i.path === currentPath)?.label ?? '内镜管理系统'}
            </span>
          </div>
          <div style={s.topbarRight}>
            <div style={{ fontSize: 11, color: '#3b82f6', fontFamily: 'monospace', background: '#eff6ff', padding: '3px 8px', borderRadius: 10, border: '1px solid #bfdbfe', fontWeight: 600, minWidth: 44, minHeight: 22, display: 'flex', alignItems: 'center' }}>v0.12.0</div>
            <div style={s.topbarBadge}>
              <Bell size={20} />
              <span style={s.badge}>1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#1a3a5c',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
              }}>
                张
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>张建国</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>消化内科 · 医生</div>
              </div>
            </div>
          </div>
        </header>

        {/* 路由 */}
        <div style={s.page}>
          <Suspense fallback={<Loading />}>
          <MWLProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/worklist" element={<WorklistPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/patients" element={<PatientPage />} />
            <Route path="/appointments" element={<AppointmentPage />} />
            <Route path="/exams" element={<ExamPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/report-write" element={<ReportWritePage />} />
            <Route path="/report-write/:reportId" element={<ReportWritePage />} />
            <Route path="/critical-value" element={<CriticalValuePage />} />
            <Route path="/critical-alert" element={<CriticalAlertPage />} />
            <Route path="/endoscopes" element={<EndoscopePage />} />
            <Route path="/disinfection" element={<DisinfectionPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/qc" element={<QCPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/followup" element={<FollowUpPage />} />
            <Route path="/surgery" element={<SurgeryPage />} />
            <Route path="/authority" element={<AuthorityPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/images" element={<ImagePage />} />
            <Route path="/templates" element={<TemplatePage />} />
            <Route path="/nursing" element={<NursingPage />} />
            <Route path="/preop" element={<PreOpPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/cancer-screen" element={<CancerScreenPage />} />
            <Route path="/ai-qc" element={<AIQCPage />} />
            <Route path="/stats-enhanced" element={<StatsEnhancedPage />} />
            <Route path="/surgery-live" element={<SurgeryLivePage />} />
            <Route path="/disinfection-trace" element={<DisinfectionTracePage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/infection" element={<InfectionPage />} />
            <Route path="/surgery-records" element={<SurgeryRecordPage />} />
            <Route path="/national-report" element={<NationalReportPage />} />
            <Route path="/insurance-audit" element={<InsuranceAuditPage />} />
            <Route path="/dicom" element={<DicomViewerPage />} />
            <Route path="/cost-analysis" element={<CostAnalysisPage />} />
            <Route path="/imaging-modes" element={<ImagingModesPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/queue-call" element={<QueueCallPage />} />
            <Route path="/data-report" element={<DataReportCenterPage />} />
            <Route path="/equipment-lifecycle" element={<EquipmentLifecyclePage />} />
            <Route path="/operations" element={<OperationsCenterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </MWLProvider>
          </Suspense>
        </div>
      </div>

      {/* 版本历史弹窗 */}
      {showVersionModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowVersionModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '24px 28px', maxWidth: 520, width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#1a3a5c' }}>版本升级日志</h2>
              <button onClick={() => setShowVersionModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#94a3b8',
                lineHeight: 1,
              }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                  v0.9.0 <span style={{ fontSize: 12, fontWeight: 400, color: '#15803d' }}>（当前版本）</span>
                </div>
                <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                  新增运营指挥中心（科室主任驾驶舱，6大看板区，KPI实时指标）；新增叫号管理系统（实时叫号大屏/诊室状态/候诊队列/模拟呼叫按钮）；新增数据上报中心（多格式报表生成/Excel+CSV+PDF导出/历史报表记录/数据脱敏）；新增设备全生命周期管理（设备资产台账/维保计划/维保记录/到期预警/成本分析/报废管理）；新增运营指挥中心（科室主任驾驶舱大屏）；对标东软EIS/开立医疗/卫软信息三大竞品，全新功能超越同类产品；所有版本日志页About区域同步更新v0.9.0
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '#e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  v0.8.0 <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>（上一版本）</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  新增国家数据上报系统（对接国家消化内镜质控中心/省级平台/上报流程）；新增医保审核系统（限制类药品审核/适应证校验/智能提示）。大幅升级耗材管理系统（库存看板/效期预警/申领审批流）；升级报告管理（DICOM缩略图浏览器/图像标注）；升级AI质控中心（CADe息肉检测模拟/实时警报）；升级早癌筛查（地图分布/ADR趋势/高危追踪）；扩充演示数据至2000+患者、3000+检查记录、5000+预约，演示规模超越东软、美迪康同类产品
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '#e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 6 }}>v0.2.0</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  新增检查模板、护理记录、术前评估、患者教育、影像管理、危机预警看板六大模块；扩充演示数据至50+患者、100+检查记录；优化界面细节与交互体验
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '#e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 6 }}>v0.1.0</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  基础框架搭建，包含首页概览、患者管理、预约管理、检查执行、报告书写、耗材管理、随访管理等核心功能
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setShowVersionModal(false)} style={{
                background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
                padding: '8px 24px', fontSize: 13, cursor: 'pointer',
              }}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
