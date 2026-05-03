// ============================================================
// G003 超声RIS系统 - 洗消追溯管理页面
// 洗消流程记录+各步骤时间线展示+追溯查询
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, X, ChevronLeft, ChevronRight,
  Calendar, Clock, User, Stethoscope, CheckCircle,
  XCircle, AlertCircle, RefreshCw, Eye, Filter,
  Package, Droplets, Wind, Box, ClipboardCheck,
  QrCode, BarChart3, ScanLine, TrendingUp, Activity
} from 'lucide-react'
import type { DisinfectionRecord, DisinfectionStatus } from '../types'
import { initialDisinfectionRecords, initialUltrasoundDevices, initialPatients } from '../data/initialData'

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  statCards: {
    display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap',
  },
  statCard: {
    background: '#fff', borderRadius: 8, padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minWidth: 140,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  statLabel: { fontSize: 12, color: '#64748b' },
  statValue: { fontSize: 20, fontWeight: 700, color: '#1a3a5c' },
  toolbar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '6px 12px', flex: 1, minWidth: 200,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer',
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '7px 12px', fontSize: 13, cursor: 'pointer',
  },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
  },
  badgePending: { background: '#fef3c7', color: '#92400e' },
  badgeCleaning: { background: '#dbeafe', color: '#1d4ed8' },
  badgeDisinfection: { background: '#e0f2fe', color: '#0369a1' },
  badgeDrying: { background: '#f3e8ff', color: '#7c3aed' },
  badgeCompleted: { background: '#dcfce7', color: '#166534' },
  badgeAbnormal: { background: '#fee2e2', color: '#dc2626' },
  badgeQualified: { background: '#dcfce7', color: '#166534' },
  badgeUnqualified: { background: '#fee2e2', color: '#dc2626' },
  badgePendingCheck: { background: '#fef3c7', color: '#92400e' },
  actions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: '12px 16px', background: '#fff',
    borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 8,
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: {
    background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: '#fff', borderRadius: 12, width: '95%', maxWidth: 900,
    maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  modalBody: { padding: 20 },
  timeline: {
    position: 'relative', paddingLeft: 24,
  },
  timelineLine: {
    position: 'absolute', left: 7, top: 0, bottom: 0,
    width: 2, background: '#e2e8f0',
  },
  timelineItem: {
    position: 'relative', marginBottom: 20, paddingLeft: 24,
  },
  timelineDot: {
    position: 'absolute', left: 0, top: 4, width: 16, height: 16,
    borderRadius: '50%', background: '#fff', border: '3px solid #e2e8f0',
    zIndex: 1,
  },
  timelineDotCompleted: {
    borderColor: '#22c55e', background: '#dcfce7',
  },
  timelineDotInProgress: {
    borderColor: '#3b82f6', background: '#dbeafe',
  },
  timelineDotPending: {
    borderColor: '#e2e8f0', background: '#f8fafc',
  },
  timelineContent: {
    background: '#f8fafc', borderRadius: 8, padding: '12px 16px',
    border: '1px solid #e2e8f0',
  },
  timelineTitle: {
    fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 6,
  },
  timelineRow: {
    display: 'flex', gap: 16, fontSize: 12, color: '#64748b', marginBottom: 4,
  },
  timelineLabel: { minWidth: 70, color: '#94a3b8' },
  formGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
  },
  formGroup: {
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  formLabel: {
    fontSize: 12, fontWeight: 600, color: '#475569',
  },
  formInput: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 13, color: '#334155', outline: 'none',
  },
  formTextarea: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical',
    minHeight: 80,
  },
  detailGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16,
  },
  detailCard: {
    background: '#f8fafc', borderRadius: 8, padding: 12,
    border: '1px solid #e2e8f0',
  },
  detailLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  detailValue: { fontSize: 13, color: '#1a3a5c', fontWeight: 500 },
  traceSection: {
    marginTop: 16, padding: 16, background: '#fff',
    borderRadius: 8, border: '1px solid #e2e8f0',
  },
  traceTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  traceItem: {
    display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9',
    fontSize: 13,
  },
  traceItemLast: { borderBottom: 'none' },
  emptyState: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12,
  },
  emptyIcon: { color: '#d1d5db', marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: '#64748b' },
  emptyDesc: { fontSize: 13, color: '#94a3b8' },
  emptyBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '10px 18px', fontSize: 13, cursor: 'pointer', height: 44,
  },
  // 扫码追溯
  scanBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#059669', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  scanInputWrap: {
    position: 'relative', display: 'flex', alignItems: 'center',
  },
  scanInput: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 12px',
    fontSize: 13, color: '#334155', outline: 'none', width: 200,
  },
  scanFlash: {
    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
    animation: 'scanFlash 1.5s infinite',
  },
  // 追溯统计
  traceStats: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16,
  },
  traceStatCard: {
    background: '#fff', borderRadius: 8, padding: '14px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  traceStatHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  traceStatIcon: {
    width: 32, height: 32, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  traceStatLabel: { fontSize: 12, color: '#64748b' },
  traceStatValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c' },
  traceStatSub: { fontSize: 11, color: '#94a3b8' },
  // 6步洗消时间线
  sixStepTimeline: {
    marginTop: 20, padding: '16px 0',
  },
  sixStepTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  sixStepTrack: {
    position: 'relative', padding: '0 40px',
  },
  sixStepProgress: {
    position: 'absolute', top: 20, left: 40, right: 40, height: 4,
    background: '#e2e8f0', borderRadius: 2,
  },
  sixStepProgressBar: {
    position: 'absolute', top: 0, left: 0, height: '100%',
    background: 'linear-gradient(90deg, #22c55e, #10b981)',
    borderRadius: 2, transition: 'width 0.3s ease',
  },
  sixStepNodes: {
    position: 'relative', display: 'flex', justifyContent: 'space-between',
  },
  sixStepNode: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    zIndex: 1,
  },
  sixStepDot: {
    width: 40, height: 40, borderRadius: '50%', background: '#fff',
    border: '3px solid #e2e8f0', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.3s ease',
  },
  sixStepDotActive: {
    borderColor: '#10b981', background: '#dcfce7',
    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.15)',
  },
  sixStepDotCompleted: {
    borderColor: '#22c55e', background: '#dcfce7',
  },
  sixStepLabel: { fontSize: 12, fontWeight: 500, color: '#64748b', textAlign: 'center' },
  sixStepTime: { fontSize: 10, color: '#94a3b8', textAlign: 'center' },
  sixStepDetail: {
    marginTop: 16, background: '#f8fafc', borderRadius: 8,
    border: '1px solid #e2e8f0', padding: 16,
  },
  sixStepDetailTitle: {
    fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  sixStepDetailGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
  },
  sixStepDetailItem: {
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  sixStepDetailLabel: { fontSize: 11, color: '#94a3b8' },
  sixStepDetailValue: { fontSize: 13, color: '#334155' },
  scanTip: {
    marginTop: 8, padding: '8px 12px', background: '#eff6ff',
    borderRadius: 6, fontSize: 12, color: '#3b82f6',
    display: 'flex', alignItems: 'center', gap: 6,
  },
}

// ---------- 状态颜色映射 ----------
const statusBadgeStyles: Record<DisinfectionStatus, React.CSSProperties> = {
  '待清洗': s.badgePending,
  '清洗中': s.badgeCleaning,
  '消毒中': s.badgeDisinfection,
  '干燥中': s.badgeDrying,
  '已完成': s.badgeCompleted,
  '异常': s.badgeAbnormal,
}

const resultBadgeStyles: Record<string, React.CSSProperties> = {
  '合格': s.badgeQualified,
  '不合格': s.badgeUnqualified,
  '待复检': s.badgePendingCheck,
  '未做': s.badgePending,
}

// ---------- 洗消流程步骤 ----------
interface TimelineStep {
  key: string
  label: string
  icon: React.ReactNode
  timeKey: string
  endTimeKey?: string
  resultKey?: string
  personKey?: string
  notesKey?: string
}

const timelineSteps: TimelineStep[] = [
  {
    key: 'collection', label: '回收', icon: <Package size={14} />,
    timeKey: 'collectionTime',
  },
  {
    key: 'cleaning', label: '清洗', icon: <Droplets size={14} />,
    timeKey: 'cleaningStartTime', endTimeKey: 'cleaningEndTime',
    resultKey: 'cleaningResult', personKey: 'cleaningPerson', notesKey: 'cleaningNotes',
  },
  {
    key: 'disinfection', label: '消毒', icon: <AlertCircle size={14} />,
    timeKey: 'disinfectionStartTime', endTimeKey: 'disinfectionEndTime',
    resultKey: 'disinfectionResult',
  },
  {
    key: 'drying', label: '干燥', icon: <Wind size={14} />,
    timeKey: 'dryingStartTime', endTimeKey: 'dryingEndTime',
    resultKey: 'dryingResult',
  },
  {
    key: 'storage', label: '储存', icon: <Box size={14} />,
    timeKey: 'storageTime',
  },
]

// ---------- 完整6步洗消时间线 ----------
interface SixStep {
  key: string
  label: string
  icon: React.ReactNode
  startKey: string
  endKey?: string
  resultKey?: string
  personKey?: string
}

const sixSteps: SixStep[] = [
  {
    key: 'leak_test', label: '测漏', icon: <Activity size={16} />,
    startKey: 'leakTestTime',
  },
  {
    key: 'pre_wash', label: '初洗', icon: <Droplets size={16} />,
    startKey: 'preWashTime', endKey: 'preWashEndTime',
    personKey: 'preWashPerson',
  },
  {
    key: 'enzyme_wash', label: '酶洗', icon: <Droplets size={16} />,
    startKey: 'enzymeWashTime', endKey: 'enzymeWashEndTime',
    personKey: 'enzymeWashPerson',
  },
  {
    key: 'disinfection', label: '消毒', icon: <AlertCircle size={16} />,
    startKey: 'disinfectionStartTime', endKey: 'disinfectionEndTime',
    resultKey: 'disinfectionResult', personKey: 'disinfectionPerson',
  },
  {
    key: 'final_rinse', label: '末洗', icon: <Droplets size={16} />,
    startKey: 'finalRinseTime', endKey: 'finalRinseEndTime',
    personKey: 'finalRinsePerson',
  },
  {
    key: 'drying', label: '干燥', icon: <Wind size={16} />,
    startKey: 'dryingStartTime', endKey: 'dryingEndTime',
    resultKey: 'dryingResult', personKey: 'dryingPerson',
  },
]

// ---------- 生成额外洗消记录（扩充至30条） ----------
const generateExtraDisinfectionRecords = (base: DisinfectionRecord[]): DisinfectionRecord[] => {
  if (base.length >= 30) return base.slice(0, 30)
  const extra: DisinfectionRecord[] = []
  const endoscopes = [
    { id: 'USP001', name: '迈瑞 凸阵探头 C5-2', code: 'C5-2' },
    { id: 'USP002', name: '迈瑞 线阵探头 L12-4E', code: 'L12-4E' },
    { id: 'USP003', name: '飞利浦 相控阵探头 P4-2', code: 'P4-2' },
    { id: 'USP004', name: 'GE 凸阵探头 CA1-5A', code: 'CA1-5A' },
    { id: 'USP005', name: '西门子 腔内探头 EC4-9', code: 'EC4-9' },
    { id: 'USP006', name: '迈瑞 线阵探头 ML6-15', code: 'ML6-15' },
  ]
  const persons = ['王海涛', '李娜', '张伟', '刘洋', '陈静']
  const results: DisinfectionRecord['finalResult'][] = ['合格', '合格', '合格', '合格', '合格', '合格', '合格', '合格', '不合格', '待复检']
  const statuses: DisinfectionRecord['status'][] = ['已完成', '已完成', '已完成', '已完成', '已完成', '清洗中', '消毒中', '干燥中', '已完成', '已完成']
  const processes: DisinfectionRecord['processType'][] = ['机洗', '机洗', '手工清洗']

  let idx = base.length + 1
  while (extra.length < 30 - base.length) {
    const e = endoscopes[(idx - 1) % endoscopes.length]
    const dayOffset = Math.floor((idx - 1) / 6)
    const hourBlock = (idx - 1) % 6
    const baseDate = new Date(2026, 3, 28 - dayOffset, 8 + hourBlock * 2, 0)
    const collectionTime = baseDate.toISOString().replace('T', ' ').substring(0, 16)
    const cleaningStartTime = new Date(baseDate.getTime() + 5 * 60000).toISOString().replace('T', ' ').substring(0, 16)
    const cleaningEndTime = new Date(baseDate.getTime() + 35 * 60000).toISOString().replace('T', ' ').substring(0, 16)
    const disinfectionStartTime = new Date(baseDate.getTime() + 40 * 60000).toISOString().replace('T', ' ').substring(0, 16)
    const disinfectionEndTime = new Date(baseDate.getTime() + 65 * 60000).toISOString().replace('T', ' ').substring(0, 16)
    const dryingStartTime = new Date(baseDate.getTime() + 70 * 60000).toISOString().replace('T', ' ').substring(0, 16)
    const dryingEndTime = new Date(baseDate.getTime() + 85 * 60000).toISOString().replace('T', ' ').substring(0, 16)
    const storageTime = new Date(baseDate.getTime() + 90 * 60000).toISOString().replace('T', ' ').substring(0, 16)
    const status = statuses[(idx - 1) % statuses.length]
    const finalResult = status === '已完成' ? results[(idx - 1) % results.length] : '待复检'
    const cleaningPerson = persons[(idx - 1) % persons.length]

    extra.push({
      id: `DR${String(idx).padStart(3, '0')}`,
      deviceId: e.id,
      deviceName: e.name,
      deviceCode: e.code,
      processType: processes[(idx - 1) % processes.length],
      collectionTime,
      cleaningStartTime,
      cleaningEndTime,
      cleaningPerson,
      cleaningResult: status === '已完成' ? '合格' : '待复检',
      cleaningNotes: '管道通畅，冲洗彻底',
      disinfectionStartTime,
      disinfectionEndTime,
      disinfectantName: '邻苯二甲醛',
      disinfectantLot: 'GL-20260401',
      disinfectionTemperature: 25,
      disinfectionDuration: 12,
      disinfectionResult: status === '已完成' ? '合格' : '待复检',
      dryingStartTime,
      dryingEndTime,
      dryingResult: status === '已完成' ? '合格' : '待复检',
      storageTime,
      storageLocation: '超声探头储存柜' + (((idx - 1) % 3) + 1),
      storagePerson: cleaningPerson,
      expirationDate: new Date(new Date(storageTime).getTime() + 7 * 86400000).toISOString().split('T')[0],
      finalResult,
      biologicalMonitoring: status === '已完成' && finalResult === '合格' ? '合格' : '未做',
      status,
    })
    idx++
  }
  return [...base, ...extra]
}

// ---------- 主组件 ----------
export default function DisinfectionPage() {
  const baseRecords = useMemo(() => initialDisinfectionRecords, [])
  const [endoscopes] = useState(initialUltrasoundDevices)
  const [patients] = useState(initialPatients)
  const [records, setRecords] = useState<DisinfectionRecord[]>(() => generateExtraDisinfectionRecords(baseRecords))

  // 扫码追溯
  const [scanCode, setScanCode] = useState('')
  const [scanActive, setScanActive] = useState(false)

  // 查询状态
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterEndoscope, setFilterEndoscope] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterPatient, setFilterPatient] = useState('')

  // 分页
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 详情弹窗
  const [detailModal, setDetailModal] = useState<{ show: boolean; record: DisinfectionRecord | null }>({
    show: false,
    record: null,
  })

  // 新增弹窗
  const [addModal, setAddModal] = useState(false)
  const [newRecord, setNewRecord] = useState<Partial<DisinfectionRecord>>({
    deviceId: '',
    processType: '机洗',
    status: '待清洗',
    finalResult: '待复检',
    cleaningPerson: '',
    cleaningResult: '待复检',
  })

  // 统计数据
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      todayTotal: records.filter(r => r.collectionTime?.startsWith(today)).length,
      completed: records.filter(r => r.status === '已完成').length,
      inProgress: records.filter(r => ['清洗中', '消毒中', '干燥中'].includes(r.status)).length,
      abnormal: records.filter(r => r.status === '异常' || r.finalResult === '不合格').length,
    }
  }, [records])

  // 追溯查询统计
  const traceStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthStart = new Date().toISOString().substring(0, 7)
    const completed = records.filter(r => r.status === '已完成')
    const qualified = completed.filter(r => r.finalResult === '合格')
    const weekRecords = records.filter(r => r.collectionTime && r.collectionTime >= weekAgo)
    const withPatient = records.filter(r => r.relatedPatientId)
    const bioMonitored = records.filter(r => r.biologicalMonitoring && r.biologicalMonitoring !== '未做')
    return {
      totalRecords: records.length,
      completedCount: completed.length,
      qualifiedCount: qualified.length,
      passRate: completed.length > 0 ? Math.round((qualified.length / completed.length) * 100) : 0,
      weekCount: weekRecords.length,
      tracedCount: withPatient.length,
      tracedRate: records.length > 0 ? Math.round((withPatient.length / records.length) * 100) : 0,
      bioMonitorCount: bioMonitored.length,
      bioMonitorRate: completed.length > 0 ? Math.round((bioMonitored.length / completed.length) * 100) : 0,
    }
  }, [records])

  // 扫码追溯搜索
  const handleScanSearch = () => {
    if (!scanCode.trim()) return
    setScanActive(true)
    const code = scanCode.trim().toUpperCase()
    const found = records.find(r =>
      r.id.toUpperCase() === code ||
      r.deviceCode.toUpperCase() === code ||
      r.deviceName.toUpperCase().includes(code)
    )
    if (found) {
      handleShowDetail(found)
    } else {
      alert(`未找到匹配 "${scanCode}" 的洗消记录`)
    }
    setScanActive(false)
  }

  // 模拟扫码输入（扫码枪输入后自动回车）
  const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScanSearch()
    }
  }

  // 筛选后的记录
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 关键词搜索
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase()
        const matchSearch =
          r.deviceName.toLowerCase().includes(kw) ||
          r.deviceCode.toLowerCase().includes(kw) ||
          r.id.toLowerCase().includes(kw) ||
          (r.relatedPatientName?.toLowerCase().includes(kw) ?? false)
        if (!matchSearch) return false
      }
      // 超声探头筛选
      if (filterEndoscope && r.deviceId !== filterEndoscope) return false
      // 状态筛选
      if (filterStatus && r.status !== filterStatus) return false
      // 日期筛选
      if (filterDateFrom && r.collectionTime && r.collectionTime < filterDateFrom) return false
      if (filterDateTo && r.collectionTime && r.collectionTime > filterDateTo) return false
      // 患者筛选
      if (filterPatient && r.relatedPatientId !== filterPatient) return false
      return true
    })
  }, [records, searchKeyword, filterEndoscope, filterStatus, filterDateFrom, filterDateTo, filterPatient])

  // 分页数据
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, currentPage])

  const totalPages = Math.ceil(filteredRecords.length / pageSize)

  // 重置分页
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // 打开详情
  const handleShowDetail = (record: DisinfectionRecord) => {
    setDetailModal({ show: true, record })
  }

  // 关闭详情
  const handleCloseDetail = () => {
    setDetailModal({ show: false, record: null })
  }

  // 新增洗消记录
  const handleAddRecord = () => {
    if (!newRecord.deviceId) {
      alert('请选择超声探头')
      return
    }
    const endoscope = endoscopes.find(e => e.id === newRecord.deviceId)
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const record: DisinfectionRecord = {
      id: `DR${String(records.length + 1).padStart(3, '0')}`,
      deviceId: newRecord.deviceId,
      deviceName: endoscope?.name || '',
      deviceCode: endoscope?.code || '',
      processType: newRecord.processType as DisinfectionRecord['processType'],
      collectionTime: now,
      cleaningPerson: newRecord.cleaningPerson || '',
      cleaningResult: '待复检',
      finalResult: '待复检',
      status: '待清洗',
      relatedPatientId: newRecord.relatedPatientId,
      relatedPatientName: patients.find(p => p.id === newRecord.relatedPatientId)?.name,
    }
    setRecords([record, ...records])
    setAddModal(false)
    setNewRecord({
      deviceId: '',
      processType: '机洗',
      status: '待清洗',
      finalResult: '待复检',
      cleaningPerson: '',
      cleaningResult: '待复检',
    })
  }

  // 获取时间线状态
  const getTimelineStepStatus = (record: DisinfectionRecord, step: TimelineStep): 'completed' | 'in-progress' | 'pending' => {
    const time = record[step.timeKey as keyof DisinfectionRecord] as string | undefined
    if (!time) return 'pending'
    const stepOrder = timelineSteps.findIndex(s => s.key === step.key)
    const statusOrder: Record<DisinfectionStatus, number> = {
      '待清洗': 0, '清洗中': 1, '消毒中': 2, '干燥中': 3, '已完成': 4, '异常': -1
    }
    const currentOrder = statusOrder[record.status]
    if (currentOrder === -1) return 'pending'
    if (stepOrder < currentOrder) return 'completed'
    if (stepOrder === currentOrder) return 'in-progress'
    return 'pending'
  }

  return (
    <div style={{ padding: 20 }}>
      {/* 标题 */}
      <div style={s.pageHeader}>
        <div style={s.title}>洗消追溯管理</div>
        <button style={s.btnPrimary} onClick={() => setAddModal(true)}>
          <Plus size={14} /> 新增洗消记录
        </button>
      </div>

      {/* 统计卡片 */}
      <div style={s.statCards}>
        <div style={s.statCard}>
          <div style={s.statLabel}>今日洗消</div>
          <div style={s.statValue}>{stats.todayTotal}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已完成</div>
          <div style={{ ...s.statValue, color: '#166534' }}>{stats.completed}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>进行中</div>
          <div style={{ ...s.statValue, color: '#0369a1' }}>{stats.inProgress}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>异常/不合格</div>
          <div style={{ ...s.statValue, color: '#dc2626' }}>{stats.abnormal}</div>
        </div>
      </div>

      {/* 追溯查询统计 */}
      <div style={s.traceStats}>
        <div style={s.traceStatCard}>
          <div style={s.traceStatHeader}>
            <div style={{ ...s.traceStatIcon, background: '#eff6ff' }}>
              <BarChart3 size={16} color="#3b82f6" />
            </div>
            <div style={s.traceStatLabel}>本周洗消</div>
          </div>
          <div style={s.traceStatValue}>{traceStats.weekCount}</div>
          <div style={s.traceStatSub}>累计 {traceStats.totalRecords} 条记录</div>
        </div>
        <div style={s.traceStatCard}>
          <div style={s.traceStatHeader}>
            <div style={{ ...s.traceStatIcon, background: '#f0fdf4' }}>
              <TrendingUp size={16} color="#16a34a" />
            </div>
            <div style={s.traceStatLabel}>合格率</div>
          </div>
          <div style={{ ...s.traceStatValue, color: '#16a34a' }}>{traceStats.passRate}%</div>
          <div style={s.traceStatSub}>合格 {traceStats.qualifiedCount} / 完成 {traceStats.completedCount}</div>
        </div>
        <div style={s.traceStatCard}>
          <div style={s.traceStatHeader}>
            <div style={{ ...s.traceStatIcon, background: '#faf5ff' }}>
              <ScanLine size={16} color="#9333ea" />
            </div>
            <div style={s.traceStatLabel}>患者追溯</div>
          </div>
          <div style={{ ...s.traceStatValue, color: '#9333ea' }}>{traceStats.tracedRate}%</div>
          <div style={s.traceStatSub}>已追溯 {traceStats.tracedCount} 条记录</div>
        </div>
        <div style={s.traceStatCard}>
          <div style={s.traceStatHeader}>
            <div style={{ ...s.traceStatIcon, background: '#fef2f2' }}>
              <Activity size={16} color="#dc2626" />
            </div>
            <div style={s.traceStatLabel}>生物监测</div>
          </div>
          <div style={s.traceStatValue}>{traceStats.bioMonitorRate}%</div>
          <div style={s.traceStatSub}>已完成 {traceStats.bioMonitorCount} 次监测</div>
        </div>
      </div>

      {/* 工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索超声探头/患者/记录号..."
            value={searchKeyword}
            onChange={e => { setSearchKeyword(e.target.value); handleFilterChange() }}
          />
        </div>
        {/* 扫码追溯 */}
        <div style={s.scanInputWrap}>
          <input
            style={s.scanInput}
            placeholder="扫码追溯..."
            value={scanCode}
            onChange={e => setScanCode(e.target.value)}
            onKeyDown={handleScanKeyDown}
          />
          {scanActive && (
            <div style={s.scanFlash}>
              <ScanLine size={14} color="#059669" />
            </div>
          )}
        </div>
        <button
          style={s.scanBtn}
          onClick={handleScanSearch}
          title="输入记录编号/探头编号后按回车或点击此按钮追溯"
        >
          <QrCode size={14} /> 扫码追溯
        </button>
        <select
          style={s.select}
          value={filterEndoscope}
          onChange={e => { setFilterEndoscope(e.target.value); handleFilterChange() }}
        >
          <option value="">全部超声探头</option>
          {endoscopes.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
          ))}
        </select>
        <select
          style={s.select}
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); handleFilterChange() }}
        >
          <option value="">全部状态</option>
          <option value="待清洗">待清洗</option>
          <option value="清洗中">清洗中</option>
          <option value="消毒中">消毒中</option>
          <option value="干燥中">干燥中</option>
          <option value="已完成">已完成</option>
          <option value="异常">异常</option>
        </select>
        <input
          type="date"
          style={s.select}
          value={filterDateFrom}
          onChange={e => { setFilterDateFrom(e.target.value); handleFilterChange() }}
        />
        <span style={{ color: '#94a3b8', fontSize: 12 }}>至</span>
        <input
          type="date"
          style={s.select}
          value={filterDateTo}
          onChange={e => { setFilterDateTo(e.target.value); handleFilterChange() }}
        />
        <select
          style={s.select}
          value={filterPatient}
          onChange={e => { setFilterPatient(e.target.value); handleFilterChange() }}
        >
          <option value="">全部患者</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          style={s.btnSecondary}
          onClick={() => {
            setSearchKeyword('')
            setFilterEndoscope('')
            setFilterStatus('')
            setFilterDateFrom('')
            setFilterDateTo('')
            setFilterPatient('')
            handleFilterChange()
          }}
        >
          <RefreshCw size={14} /> 重置
        </button>
      </div>

      {/* 表格 */}
      {paginatedRecords.length === 0 ? (
        <div style={s.emptyState}>
          <ClipboardCheck size={48} style={s.emptyIcon} />
          <div style={s.emptyTitle}>暂无洗消记录</div>
          <div style={s.emptyDesc}>当前没有符合条件的洗消记录，请调整筛选条件或新增洗消记录</div>
          <button style={s.emptyBtn} onClick={() => setAddModal(true)}>
            <Plus size={16} /> 新增洗消记录
          </button>
        </div>
      ) : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>记录编号</th>
                <th style={s.th}>超声探头信息</th>
                <th style={s.th}>流程类型</th>
                <th style={s.th}>当前状态</th>
                <th style={s.th}>清洗结果</th>
                <th style={s.th}>最终结果</th>
                <th style={s.th}>生物监测</th>
                <th style={s.th}>回收时间</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map(record => (
                <tr key={record.id}>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {record.id}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 500 }}>{record.deviceName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.deviceCode}</div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      background: '#f1f5f9', padding: '2px 8px',
                      borderRadius: 4, fontSize: 12,
                    }}>
                      {record.processType}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...statusBadgeStyles[record.status] }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(resultBadgeStyles[record.cleaningResult] || s.badgePending) }}>
                      {record.cleaningResult}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(resultBadgeStyles[record.finalResult] || s.badgePending) }}>
                      {record.finalResult}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      ...(resultBadgeStyles[record.biologicalMonitoring || '未做'] || s.badgePending),
                    }}>
                      {record.biologicalMonitoring || '未做'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontSize: 12 }}>{record.collectionTime?.split(' ')[0] || '-'}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {record.collectionTime?.split(' ')[1] || ''}
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button
                        style={s.btnSecondary}
                        onClick={() => handleShowDetail(record)}
                      >
                        <Eye size={12} /> 查看详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div style={s.pagination}>
            <div style={s.pageInfo}>
              共 {filteredRecords.length} 条记录，第 {currentPage}/{totalPages} 页
            </div>
            <div style={s.pageBtns}>
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} /><ChevronLeft size={14} />
              </button>
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3
                  ? i + 1
                  : currentPage + i - 2
                if (page > totalPages) return null
                return (
                  <button
                    key={page}
                    style={{
                      ...s.pageBtn,
                      ...(page === currentPage ? s.pageBtnActive : {}),
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </button>
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} /><ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 详情弹窗 */}
      {detailModal.show && detailModal.record && (
        <div style={s.modal} onClick={handleCloseDetail}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>洗消详情 - {detailModal.record.id}</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                onClick={handleCloseDetail}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div style={s.modalBody}>
              {/* 基本信息 */}
              <div style={s.detailGrid}>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>超声探头名称</div>
                  <div style={s.detailValue}>{detailModal.record.deviceName}</div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>探头编号</div>
                  <div style={s.detailValue}>{detailModal.record.deviceCode}</div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>流程类型</div>
                  <div style={s.detailValue}>{detailModal.record.processType}</div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>当前状态</div>
                  <div style={s.detailValue}>
                    <span style={{ ...s.badge, ...statusBadgeStyles[detailModal.record.status] }}>
                      {detailModal.record.status}
                    </span>
                  </div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>清洗人员</div>
                  <div style={s.detailValue}>{detailModal.record.cleaningPerson}</div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>储存位置</div>
                  <div style={s.detailValue}>{detailModal.record.storageLocation || '-'}</div>
                </div>
              </div>

              {/* 消毒信息 */}
              {detailModal.record.disinfectantName && (
                <div style={s.detailGrid}>
                  <div style={s.detailCard}>
                    <div style={s.detailLabel}>消毒剂</div>
                    <div style={s.detailValue}>{detailModal.record.disinfectantName}</div>
                  </div>
                  <div style={s.detailCard}>
                    <div style={s.detailLabel}>消毒剂批号</div>
                    <div style={s.detailValue}>{detailModal.record.disinfectantLot || '-'}</div>
                  </div>
                  <div style={s.detailCard}>
                    <div style={s.detailLabel}>消毒温度</div>
                    <div style={s.detailValue}>
                      {detailModal.record.disinfectionTemperature
                        ? `${detailModal.record.disinfectionTemperature}°C`
                        : '-'}
                    </div>
                  </div>
                  <div style={s.detailCard}>
                    <div style={s.detailLabel}>消毒时长</div>
                    <div style={s.detailValue}>
                      {detailModal.record.disinfectionDuration
                        ? `${detailModal.record.disinfectionDuration}分钟`
                        : '-'}
                    </div>
                  </div>
                </div>
              )}

              {/* 最终结果 */}
              <div style={s.detailGrid}>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>清洗结果</div>
                  <div style={s.detailValue}>
                    <span style={{ ...s.badge, ...(resultBadgeStyles[detailModal.record.cleaningResult] || s.badgePending) }}>
                      {detailModal.record.cleaningResult}
                    </span>
                  </div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>消毒结果</div>
                  <div style={s.detailValue}>
                    <span style={{ ...s.badge, ...(resultBadgeStyles[detailModal.record.disinfectionResult || '未做'] || s.badgePending) }}>
                      {detailModal.record.disinfectionResult || '未做'}
                    </span>
                  </div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>干燥结果</div>
                  <div style={s.detailValue}>
                    <span style={{ ...s.badge, ...(resultBadgeStyles[detailModal.record.dryingResult || '未做'] || s.badgePending) }}>
                      {detailModal.record.dryingResult || '未做'}
                    </span>
                  </div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>最终结果</div>
                  <div style={s.detailValue}>
                    <span style={{ ...s.badge, ...(resultBadgeStyles[detailModal.record.finalResult] || s.badgePending) }}>
                      {detailModal.record.finalResult}
                    </span>
                  </div>
                </div>
              </div>

              {/* 生物监测 */}
              <div style={s.detailGrid}>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>生物监测</div>
                  <div style={s.detailValue}>
                    <span style={{ ...s.badge, ...(resultBadgeStyles[detailModal.record.biologicalMonitoring || '未做'] || s.badgePending) }}>
                      {detailModal.record.biologicalMonitoring || '未做'}
                    </span>
                  </div>
                </div>
                <div style={s.detailCard}>
                  <div style={s.detailLabel}>有效截止日期</div>
                  <div style={s.detailValue}>{detailModal.record.expirationDate || '-'}</div>
                </div>
              </div>

              {/* 追溯信息 */}
              {detailModal.record.relatedPatientName && (
                <div style={s.traceSection}>
                  <div style={s.traceTitle}>
                    <User size={14} /> 追溯信息
                  </div>
                  <div style={s.traceItem}>
                    <span style={{ color: '#94a3b8', minWidth: 80 }}>患者姓名:</span>
                    <span style={{ color: '#1a3a5c' }}>{detailModal.record.relatedPatientName}</span>
                  </div>
                  {detailModal.record.relatedPatientId && (
                    <div style={{ ...s.traceItem, ...s.traceItemLast }}>
                      <span style={{ color: '#94a3b8', minWidth: 80 }}>患者ID:</span>
                      <span style={{ color: '#1a3a5c' }}>{detailModal.record.relatedPatientId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 洗消流程时间线 */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 }}>
                  洗消流程时间线
                </div>
                <div style={s.timeline}>
                  <div style={s.timelineLine} />
                  {timelineSteps.map(step => {
                    if (!detailModal.record) return null
                    const record = detailModal.record
                    const time = record[step.timeKey as keyof DisinfectionRecord] as string | undefined
                    const endTime = step.endTimeKey
                      ? (record[step.endTimeKey as keyof DisinfectionRecord] as string | undefined)
                      : undefined
                    const result = step.resultKey
                      ? (record[step.resultKey as keyof DisinfectionRecord] as string | undefined)
                      : undefined
                    const person = step.personKey
                      ? (record[step.personKey as keyof DisinfectionRecord] as string | undefined)
                      : undefined
                    const notes = step.notesKey
                      ? (record[step.notesKey as keyof DisinfectionRecord] as string | undefined)
                      : undefined
                    const stepStatus = getTimelineStepStatus(record, step)

                    return (
                      <div key={step.key} style={s.timelineItem}>
                        <div style={{
                          ...s.timelineDot,
                          ...(stepStatus === 'completed' ? s.timelineDotCompleted :
                              stepStatus === 'in-progress' ? s.timelineDotInProgress :
                              s.timelineDotPending),
                        }}>
                          {stepStatus === 'completed' && (
                            <CheckCircle size={10} color="#166534" style={{ position: 'absolute', top: -1, left: -1 }} />
                          )}
                        </div>
                        <div style={s.timelineContent}>
                          <div style={s.timelineTitle}>
                            {step.icon}
                            <span style={{ marginLeft: 6 }}>{step.label}</span>
                            {result && (
                              <span style={{
                                ...s.badge,
                                ...(resultBadgeStyles[result] || s.badgePending),
                                marginLeft: 8,
                              }}>
                                {result}
                              </span>
                            )}
                          </div>
                          {time && (
                            <div style={s.timelineRow}>
                              <span style={s.timelineLabel}>开始时间:</span>
                              <span>{time}</span>
                            </div>
                          )}
                          {endTime && (
                            <div style={s.timelineRow}>
                              <span style={s.timelineLabel}>结束时间:</span>
                              <span>{endTime}</span>
                            </div>
                          )}
                          {person && (
                            <div style={s.timelineRow}>
                              <span style={s.timelineLabel}>操作人员:</span>
                              <span>{person}</span>
                            </div>
                          )}
                          {notes && (
                            <div style={{ ...s.timelineRow, flexDirection: 'column', gap: 2 }}>
                              <span style={s.timelineLabel}>备注:</span>
                              <span>{notes}</span>
                            </div>
                          )}
                          {!time && (
                            <div style={{ ...s.timelineRow, color: '#cbd5e1' }}>
                              暂未开始
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 完整6步洗消时间线 */}
              <div style={s.sixStepTimeline}>
                <div style={s.sixStepTitle}>
                  <QrCode size={16} color="#059669" />
                  完整6步洗消流程
                </div>
                <div style={s.sixStepTrack}>
                  <div style={s.sixStepProgress}>
                    <div style={{
                      ...s.sixStepProgressBar,
                      width: detailModal.record?.status === '已完成' ? '100%'
                        : detailModal.record?.status === '干燥中' ? '83%'
                        : detailModal.record?.status === '消毒中' ? '67%'
                        : detailModal.record?.status === '清洗中' ? '33%'
                        : detailModal.record?.status === '待清洗' ? '0%'
                        : '100%',
                    }} />
                  </div>
                  <div style={s.sixStepNodes}>
                    {sixSteps.map((step, idx) => {
                      if (!detailModal.record) return null
                      const rec = detailModal.record
                      const startTime = rec[step.startKey as keyof DisinfectionRecord] as string | undefined
                      const endTime = step.endKey
                        ? (rec[step.endKey as keyof DisinfectionRecord] as string | undefined)
                        : undefined
                      const result = step.resultKey
                        ? (rec[step.resultKey as keyof DisinfectionRecord] as string | undefined)
                        : undefined
                      const person = step.personKey
                        ? (rec[step.personKey as keyof DisinfectionRecord] as string | undefined)
                        : undefined
                      const isCompleted = !!startTime && (step.endKey ? !!endTime : true)
                      const isActive = !!startTime && !isCompleted
                      const statusOrder: Record<DisinfectionStatus, number> = {
                        '待清洗': 0, '清洗中': 1, '消毒中': 2, '干燥中': 3, '已完成': 4, '异常': -1
                      }
                      const currentOrder = statusOrder[rec.status]
                      const isPending = idx > currentOrder

                      return (
                        <div key={step.key} style={s.sixStepNode}>
                          <div style={{
                            ...s.sixStepDot,
                            ...(isCompleted ? s.sixStepDotCompleted
                              : isActive ? s.sixStepDotActive
                              : {}),
                            opacity: isPending ? 0.4 : 1,
                          }}>
                            {isCompleted
                              ? <CheckCircle size={18} color="#16a34a" />
                              : <span style={{ color: isActive ? '#10b981' : '#94a3b8', fontSize: 12 }}>{idx + 1}</span>
                            }
                          </div>
                          <div style={{ ...s.sixStepLabel, color: isCompleted ? '#16a34a' : isActive ? '#10b981' : '#94a3b8' }}>
                            {step.label}
                          </div>
                          {startTime && (
                            <div style={s.sixStepTime}>
                              {startTime.split(' ')[1] || startTime}
                            </div>
                          )}
                          {!startTime && !isPending && (
                            <div style={{ ...s.sixStepTime, color: '#cbd5e1' }}>—</div>
                          )}
                          {isPending && (
                            <div style={{ ...s.sixStepTime, color: '#e2e8f0' }}>未开始</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 6步详情 */}
                {(() => {
                  const rec = detailModal.record
                  if (!rec) return null
                  const activeStepIdx = sixSteps.findIndex(step => {
                    const st = rec[step.startKey as keyof DisinfectionRecord] as string | undefined
                    const en = step.endKey
                      ? (rec[step.endKey as keyof DisinfectionRecord] as string | undefined)
                      : undefined
                    return st && !en
                  })
                  return (
                    <div style={s.sixStepDetail}>
                      <div style={s.sixStepDetailTitle}>
                        {sixSteps[Math.max(0, activeStepIdx)]?.icon}
                        <span>{sixSteps[Math.max(0, activeStepIdx)]?.label}详情</span>
                      </div>
                      <div style={s.sixStepDetailGrid}>
                        {sixSteps.map(step => {
                          const st = rec[step.startKey as keyof DisinfectionRecord] as string | undefined
                          const en = step.endKey
                            ? (rec[step.endKey as keyof DisinfectionRecord] as string | undefined)
                            : undefined
                          const rs = step.resultKey
                            ? (rec[step.resultKey as keyof DisinfectionRecord] as string | undefined)
                            : undefined
                          const ps = step.personKey
                            ? (rec[step.personKey as keyof DisinfectionRecord] as string | undefined)
                            : undefined
                          return (
                            <div key={step.key} style={s.sixStepDetailItem}>
                              <span style={s.sixStepDetailLabel}>{step.label}时间</span>
                              <span style={s.sixStepDetailValue}>
                                {st ? `${st.split(' ')[1] || st}${en ? ` ~ ${en.split(' ')[1] || en}` : ''}` : '—'}
                              </span>
                              {rs && (
                                <span style={{ ...s.sixStepDetailLabel, marginTop: 4 }}>结果</span>
                              )}
                              {rs && (
                                <span style={{
                                  ...s.sixStepDetailValue,
                                  color: rs === '合格' ? '#16a34a' : rs === '不合格' ? '#dc2626' : '#64748b',
                                }}>{rs}</span>
                              )}
                              {ps && (
                                <span style={{ ...s.sixStepDetailLabel, marginTop: 4 }}>操作人</span>
                              )}
                              {ps && (
                                <span style={s.sixStepDetailValue}>{ps}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新增弹窗 */}
      {addModal && (
        <div style={s.modal} onClick={() => setAddModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>新增洗消记录</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                onClick={() => setAddModal(false)}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>超声设备 *</label>
                  <select
                    style={s.formInput}
                    value={newRecord.deviceId}
                    onChange={e => setNewRecord({ ...newRecord, deviceId: e.target.value })}
                  >
                    <option value="">请选择超声探头</option>
                    {endoscopes.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>流程类型</label>
                  <select
                    style={s.formInput}
                    value={newRecord.processType}
                    onChange={e => setNewRecord({ ...newRecord, processType: e.target.value as '手工清洗' | '机洗' | 'EOG灭菌' | '高温高压灭菌' })}
                  >
                    <option value="机洗">机洗</option>
                    <option value="手工清洗">手工清洗</option>
                    <option value="EOG灭菌">EOG灭菌</option>
                    <option value="高温高压灭菌">高温高压灭菌</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>清洗人员</label>
                  <input
                    type="text"
                    style={s.formInput}
                    value={newRecord.cleaningPerson}
                    onChange={e => setNewRecord({ ...newRecord, cleaningPerson: e.target.value })}
                    placeholder="请输入清洗人员姓名"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>关联患者</label>
                  <select
                    style={s.formInput}
                    value={newRecord.relatedPatientId || ''}
                    onChange={e => setNewRecord({ ...newRecord, relatedPatientId: e.target.value })}
                  >
                    <option value="">无关联患者</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                <button style={s.btnSecondary} onClick={() => setAddModal(false)}>
                  取消
                </button>
                <button style={s.btnPrimary} onClick={handleAddRecord}>
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
