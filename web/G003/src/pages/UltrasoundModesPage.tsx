// ============================================================
// G003 超声RIS系统 - 超声专科模式页面
// 专科模式管理 / 专业记录 / 模式切换
// ============================================================
import { useState } from 'react'
import {
  Search, Filter, Download, Plus, Settings, Eye,
  Activity, Radio, Waves, BarChart3, Sliders,
  ChevronRight, ChevronLeft, RefreshCw, CheckCircle,
  Monitor, Camera, Layers, Zap, Clock, Stethoscope,
  Target, AlertTriangle, Bone, Heart, Smartphone
} from 'lucide-react'

// ---------- 类型定义 ----------
interface SpecialtyRecord {
  id: string
  patientId: string
  patientName: string
  examTime: string
  findings: Record<string, string | number>
  imageCount: number
  operator: string
  note?: string
}

interface SpecialtyMode {
  id: string
  name: string
  icon: React.ElementType
  color: string
  bg: string
  lastExam: string
  totalCount: number
  indications: string[]
  keyFields: { label: string; key: string; unit?: string }[]
  records: SpecialtyRecord[]
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a365d', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // Tab样式
  tabContainer: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: 0,
  },
  tab: {
    padding: '12px 20px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s',
    background: '#f8fafc',
    color: '#64748b',
  },
  tabActive: {
    padding: '12px 20px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s',
    background: '#1a365d',
    color: '#fff',
  },
  // 记录卡片
  recordCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 16,
    border: '1px solid #e2e8f0',
  },
  recordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #f1f5f9',
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a365d',
  },
  recordMeta: {
    fontSize: 12,
    color: '#64748b',
    display: 'flex',
    gap: 16,
  },
  recordGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
  },
  recordField: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '10px 12px',
  },
  fieldLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a365d',
  },
  // 专业卡片
  specialtySection: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a365d',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  indicationTag: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    background: '#eff6ff',
    color: '#3b82f6',
    marginRight: 6,
    marginBottom: 6,
  },
  // 统计栏
  statsBar: {
    display: 'flex',
    gap: 24,
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a365d',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  // 按钮
  btn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s',
  },
  btnPrimary: {
    background: '#1a365d',
    color: '#fff',
  },
  btnOutline: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#fff',
    color: '#475569',
  },
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

// ---------- 6种专科模式数据 ----------
const SPECIALTY_MODES: SpecialtyMode[] = [
  {
    id: 'prenatal',
    name: '产筛专用',
    icon: Stethoscope,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    lastExam: '2026-05-03 14:30',
    totalCount: 128,
    indications: ['早孕筛查', '中孕筛查', '晚孕评估', '胎儿生长监测', '高危妊娠'],
    keyFields: [
      { label: 'NT测量', key: 'nt', unit: 'mm' },
      { label: 'CRL记录', key: 'crl', unit: 'mm' },
      { label: '羊水指数', key: 'afi', unit: '' },
      { label: '胎心率', key: 'fhr', unit: 'bpm' },
    ],
    records: [
      {
        id: 'P001',
        patientId: 'F20260001',
        patientName: '李某某',
        examTime: '2026-05-03 14:30',
        findings: { nt: 1.2, crl: 62, afi: 12.5, fhr: 156 },
        imageCount: 8,
        operator: '张医生',
        note: 'NT值正常，CRL符合孕周',
      },
      {
        id: 'P002',
        patientId: 'F20260002',
        patientName: '王某某',
        examTime: '2026-05-02 09:15',
        findings: { nt: 1.8, crl: 58, afi: 10.2, fhr: 148 },
        imageCount: 12,
        operator: '张医生',
        note: '建议复查NT',
      },
    ],
  },
  {
    id: 'anesthesia',
    name: '麻醉疼痛',
    icon: Target,
    color: '#22c55e',
    bg: '#f0fdf4',
    lastExam: '2026-05-03 11:20',
    totalCount: 86,
    indications: ['臂丛神经阻滞', '股神经阻滞', '坐骨神经阻滞', '硬膜外置管', '疼痛治疗'],
    keyFields: [
      { label: '穿刺深度', key: 'depth', unit: 'cm' },
      { label: '用药剂量', key: 'dose', unit: 'ml' },
      { label: '目标神经', key: 'nerve', unit: '' },
      { label: '显影时间', key: 'onset', unit: 's' },
    ],
    records: [
      {
        id: 'A001',
        patientId: 'A20260001',
        patientName: '赵某某',
        examTime: '2026-05-03 11:20',
        findings: { depth: 3.5, dose: 20, nerve: '股神经', onset: 45 },
        imageCount: 6,
        operator: '李医生',
        note: '阻滞效果良好',
      },
      {
        id: 'A002',
        patientId: 'A20260002',
        patientName: '孙某某',
        examTime: '2026-05-01 16:45',
        findings: { depth: 4.2, dose: 25, nerve: '臂丛', onset: 38 },
        imageCount: 8,
        operator: '王医生',
        note: '术后镇痛效果满意',
      },
    ],
  },
  {
    id: 'emergency',
    name: '急诊超声',
    icon: AlertTriangle,
    color: '#ef4444',
    bg: '#fef2f2',
    lastExam: '2026-05-03 15:45',
    totalCount: 234,
    indications: ['创伤FAST扫描', '腹腔大血管', '心功能快速评估', '气胸检测', '腹腔积液'],
    keyFields: [
      { label: 'FAST评分', key: 'fast', unit: '' },
      { label: 'EF值', key: 'ef', unit: '%' },
      { label: '主动脉直径', key: 'aorta', unit: 'mm' },
      { label: '心包积液', key: 'pericardial', unit: '' },
    ],
    records: [
      {
        id: 'E001',
        patientId: 'E20260001',
        patientName: '周某某',
        examTime: '2026-05-03 15:45',
        findings: { fast: '阴性', ef: 58, aorta: 28, pericardial: '无' },
        imageCount: 14,
        operator: '急诊科刘医生',
        note: '排除腹腔大血管损伤',
      },
      {
        id: 'E002',
        patientId: 'E20260002',
        patientName: '吴某某',
        examTime: '2026-05-03 02:30',
        findings: { fast: '阳性', ef: 45, aorta: 32, pericardial: '少量' },
        imageCount: 18,
        operator: '急诊科陈医生',
        note: '肝肾隐窝积液，紧急处理中',
      },
    ],
  },
  {
    id: 'rehab',
    name: '康复肌骨',
    icon: Bone,
    color: '#f97316',
    bg: '#fff7ed',
    lastExam: '2026-05-03 10:00',
    totalCount: 156,
    indications: ['肌腱探查', '关节评估', '治疗前后对比', '网球肘', '肩周炎'],
    keyFields: [
      { label: '肌腱厚度', key: 'tendon', unit: 'mm' },
      { label: '关节间隙', key: 'joint', unit: 'mm' },
      { label: '血流信号', key: 'flow', unit: '' },
      { label: '治疗前评分', key: 'before', unit: '' },
    ],
    records: [
      {
        id: 'R001',
        patientId: 'R20260001',
        patientName: '郑某某',
        examTime: '2026-05-03 10:00',
        findings: { tendon: 4.2, joint: 3.8, flow: 'I级', before: '疼痛6分' },
        imageCount: 10,
        operator: '康复科王医生',
        note: '肩袖损伤治疗后复查',
      },
      {
        id: 'R002',
        patientId: 'R20260002',
        patientName: '冯某某',
        examTime: '2026-04-28 14:20',
        findings: { tendon: 5.8, joint: 2.1, flow: 'II级', before: '疼痛8分' },
        imageCount: 8,
        operator: '康复科赵医生',
        note: '跟腱炎治疗中',
      },
    ],
  },
  {
    id: 'cardio',
    name: '心血管',
    icon: Heart,
    color: '#ef4444',
    bg: '#fef2f2',
    lastExam: '2026-05-03 16:10',
    totalCount: 312,
    indications: ['心功能评估', '瓣膜病诊断', '左室壁运动', '心包疾病', '先心病筛查'],
    keyFields: [
      { label: 'EF值', key: 'ef', unit: '%' },
      { label: 'LVEDD', key: 'lvedd', unit: 'mm' },
      { label: '室壁运动', key: 'wall', unit: '' },
      { label: 'E/A比值', key: 'ea', unit: '' },
    ],
    records: [
      {
        id: 'C001',
        patientId: 'C20260001',
        patientName: '钱某某',
        examTime: '2026-05-03 16:10',
        findings: { ef: 62, lvedd: 48, wall: '正常', ea: '1.2' },
        imageCount: 16,
        operator: '心内科孙医生',
        note: '心脏结构及功能未见异常',
      },
      {
        id: 'C002',
        patientId: 'C20260002',
        patientName: '沈某某',
        examTime: '2026-05-02 11:30',
        findings: { ef: 38, lvedd: 58, wall: '节段性运动减弱', ea: '0.8' },
        imageCount: 22,
        operator: '心内科孙医生',
        note: '左室功能减低，建议进一步检查',
      },
    ],
  },
  {
    id: 'portable',
    name: '床旁便携',
    icon: Smartphone,
    color: '#14b8a6',
    bg: '#f0fdfa',
    lastExam: '2026-05-03 16:55',
    totalCount: 89,
    indications: ['ICU床旁', '急诊抢救', '手术室监测', '隔离病房', '院前急救'],
    keyFields: [
      { label: '设备编号', key: 'device', unit: '' },
      { label: '检查场景', key: 'scene', unit: '' },
      { label: '操作人员', key: 'operator', unit: '' },
      { label: '图像数量', key: 'images', unit: '' },
    ],
    records: [
      {
        id: 'B001',
        patientId: 'B20260001',
        patientName: '卫某某',
        examTime: '2026-05-03 16:55',
        findings: { device: 'SonoSite EDGE II', scene: 'ICU床旁', operator: '李护士', images: 6 },
        imageCount: 6,
        operator: '李护士',
        note: '中心静脉置管定位',
      },
      {
        id: 'B002',
        patientId: 'B20260002',
        patientName: '蒋某某',
        examTime: '2026-05-03 03:20',
        findings: { device: 'SonoSite M-Turbo', scene: '急诊抢救', operator: '值班医生', images: 10 },
        imageCount: 10,
        operator: '值班医生',
        note: '宫外孕破裂快速评估',
      },
    ],
  },
]

export default function UltrasoundModesPage() {
  const [activeTab, setActiveTab] = useState<string>(SPECIALTY_MODES[0].id)
  const activeMode = SPECIALTY_MODES.find(m => m.id === activeTab) || SPECIALTY_MODES[0]

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>超声专科模式</h1>
            <p style={s.subtitle}>专科模式管理 · 专业记录 · 模式切换</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}>
              <Download size={14} /> 导出记录
            </button>
            <button style={{ ...s.btn, ...s.btnPrimary }}>
              <Plus size={14} /> 新建记录
            </button>
          </div>
        </div>
      </div>

      {/* 横向Tab导航 */}
      <div style={s.tabContainer}>
        {SPECIALTY_MODES.map((mode) => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              style={activeTab === mode.id ? s.tabActive : s.tab}
              onClick={() => setActiveTab(mode.id)}
            >
              <Icon size={16} style={{ color: activeTab === mode.id ? '#fff' : mode.color }} />
              {mode.name}
            </button>
          )
        })}
      </div>

      {/* 统计栏 */}
      <div style={s.statsBar}>
        <div style={s.statItem}>
          <Clock size={16} style={{ color: '#64748b' }} />
          <span style={s.statLabel}>最近检查:</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a365d' }}>{activeMode.lastExam}</span>
        </div>
        <div style={s.statItem}>
          <Activity size={16} style={{ color: '#64748b' }} />
          <span style={s.statLabel}>累计检查:</span>
          <span style={s.statValue}>{activeMode.totalCount}</span>
          <span style={s.statLabel}>次</span>
        </div>
        <div style={s.statItem}>
          <Camera size={16} style={{ color: '#64748b' }} />
          <span style={s.statLabel}>今日图像:</span>
          <span style={s.statValue}>
            {activeMode.records.reduce((sum, r) => sum + r.imageCount, 0)}
          </span>
          <span style={s.statLabel}>张</span>
        </div>
      </div>

      {/* 适应症标签 */}
      <div style={s.specialtySection}>
        <div style={s.sectionTitle}>
          <Stethoscope size={16} style={{ color: activeMode.color }} />
          适应症范围
        </div>
        <div>
          {activeMode.indications.map((ind, i) => (
            <span key={i} style={{ ...s.indicationTag, background: activeMode.bg, color: activeMode.color }}>
              {ind}
            </span>
          ))}
        </div>
      </div>

      {/* 专业记录卡片 */}
      <div style={s.sectionTitle}>
        <Layers size={16} style={{ color: activeMode.color }} />
        专业记录 ({activeMode.records.length} 条)
      </div>

      {activeMode.records.map((record) => (
        <div key={record.id} style={s.recordCard}>
          <div style={s.recordHeader}>
            <div style={s.recordTitle}>
              {record.patientName}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>
                ID: {record.patientId}
              </span>
            </div>
            <div style={s.recordMeta}>
              <span><Clock size={12} style={{ marginRight: 4 }} />{record.examTime}</span>
              <span><Camera size={12} style={{ marginRight: 4 }} />{record.imageCount}张</span>
              <span>操作: {record.operator}</span>
            </div>
          </div>

          <div style={s.recordGrid}>
            {activeMode.keyFields.map((field) => (
              <div key={field.key} style={s.recordField}>
                <div style={s.fieldLabel}>{field.label}</div>
                <div style={s.fieldValue}>
                  {record.findings[field.key]}
                  {field.unit && <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{field.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          {record.note && (
            <div style={{
              marginTop: 12,
              padding: '10px 12px',
              background: '#fffbeb',
              borderRadius: 6,
              borderLeft: `3px solid ${activeMode.color}`,
              fontSize: 13,
              color: '#92400e',
            }}>
              <strong style={{ marginRight: 6 }}>备注:</strong>{record.note}
            </div>
          )}
        </div>
      ))}

      {/* 底部说明 */}
      <div style={{
        marginTop: 20,
        padding: 16,
        background: '#f8fafc',
        borderRadius: 8,
        fontSize: 12,
        color: '#64748b',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: '#1a365d' }}>提示：</strong>
        当前显示为 <strong>{activeMode.name}</strong> 模式的专业记录。
        可通过上方Tab切换不同专科模式，每种模式显示其特有的检查参数和临床适应症。
        所有数据为虚构示例，仅供演示使用。
      </div>
    </div>
  )
}
