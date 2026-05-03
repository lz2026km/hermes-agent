// ============================================================
// G003 超声RIS系统 - 超声设备管理页面
// 增强：超声设备全生命周期（位置/状态/使用记录/维护预警）
// 扩充：实时超声参数监控面板 + 探头信息卡片
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, Eye, Edit2, X, ChevronLeft, ChevronRight,
  Activity, MapPin, Calendar, Wrench, AlertCircle, Clock,
  Package, AlertTriangle, CheckCircle, History
} from 'lucide-react'
import type { UltrasoundDevice, EquipmentStatus } from '../types'
import { initialUltrasoundDevices } from '../data/initialData'

// ---------- 探头信息类型 ----------
interface ProbeInfo {
  probeModel: string
  probeSerial: string
  frequencyRange: string
  supportedModes: string[]
  lastUsedTime: string
  probeStatus: '正常' | '需消毒' | '损坏'
}

// ---------- 超声实时参数类型 ----------
interface UltrasoundParams {
  deviceId: string
  deviceName: string
  depth: number
  gain: number
  frequency: number
  tgc: number[]
  probeModel: string
  applicationPart: string
}

// ---------- 模拟超声实时参数数据 ----------
const mockUltrasoundParams: UltrasoundParams[] = [
  {
    deviceId: 'US001',
    deviceName: '飞利浦EPIQ 7C',
    depth: 8.0,
    gain: 72,
    frequency: 3.5,
    tgc: [80, 70, 60, 50, 40, 30, 20, 10],
    probeModel: 'C5-2 convex',
    applicationPart: '腹部',
  },
  {
    deviceId: 'US002',
    deviceName: 'GE Voluson E10',
    depth: 12.0,
    gain: 65,
    frequency: 5.0,
    tgc: [75, 68, 58, 48, 38, 28, 18, 8],
    probeModel: 'L6-12 linear',
    applicationPart: '浅表',
  },
]

// ---------- 模拟探头信息数据 ----------
const mockProbeInfos: Record<string, ProbeInfo> = {
  'US001': {
    probeModel: 'C5-2 convex',
    probeSerial: 'SN-C52-20240001',
    frequencyRange: '2-5 MHz',
    supportedModes: ['腹部', '浅表', '心脏', '血管'],
    lastUsedTime: '2026-05-03 14:30',
    probeStatus: '正常',
  },
  'US002': {
    probeModel: 'L6-12 linear',
    probeSerial: 'SN-L612-20240015',
    frequencyRange: '6-12 MHz',
    supportedModes: ['浅表', '血管', '肌肉'],
    lastUsedTime: '2026-05-03 10:15',
    probeStatus: '正常',
  },
  'US003': {
    probeModel: 'P4-2 phased',
    probeSerial: 'SN-P42-20230088',
    frequencyRange: '2-4 MHz',
    supportedModes: ['心脏', '腹部'],
    lastUsedTime: '2026-05-02 16:45',
    probeStatus: '需消毒',
  },
  'US004': {
    probeModel: 'E8-4 microconvex',
    probeSerial: 'SN-E84-20240102',
    frequencyRange: '4-8 MHz',
    supportedModes: ['腹部', '妇产', '血管'],
    lastUsedTime: '2026-04-28 09:00',
    probeStatus: '正常',
  },
  'EN001': {
    probeModel: 'C5-2 convex',
    probeSerial: 'SN-C52-20230156',
    frequencyRange: '2-5 MHz',
    supportedModes: ['腹部', '浅表'],
    lastUsedTime: '2026-05-01 11:20',
    probeStatus: '正常',
  },
  'EN002': {
    probeModel: 'L12-5 linear',
    probeSerial: 'SN-L125-20220456',
    frequencyRange: '5-12 MHz',
    supportedModes: ['浅表', '血管'],
    lastUsedTime: '2026-04-25 08:30',
    probeStatus: '损坏',
  },
}

// ---------- 使用记录类型 ----------
interface UseRecord {
  id: string;
  probeId: string;
  patientName: string;
  patientId: string;
  examType: string;
  doctorName: string;
  nurseName: string;
  examRoom: string;
  examDate: string;
  examTime: string;
  endTime: string;
  findings: string;
  status: '已完成' | '检查中' | '已取消';
}

// ---------- 模拟使用记录数据 ----------
const mockUseRecords: UseRecord[] = [
  { id: 'UR001', probeId: 'US001', patientName: '王建国', patientId: 'P001', examType: '腹部超声检查', doctorName: '张建国', nurseName: '李娟', examRoom: '腹部超声室1', examDate: '2026-04-29', examTime: '09:00', endTime: '09:25', findings: '肝右叶见22×18mm无回声区，边界清，后方回声增强，考虑肝囊肿；胆囊壁光滑，胆总管内径4mm未见扩张', status: '已完成' },
  { id: 'UR002', probeId: 'US001', patientName: '李美华', patientId: 'P002', examType: '浅表器官超声', doctorName: '张建国', nurseName: '李娟', examRoom: '浅表超声室', examDate: '2026-04-28', examTime: '14:00', endTime: '14:30', findings: '甲状腺左叶见6×5mm低回声结节，边界清，内见点状强回声，TI-RADS 3类；余腺体回声均匀', status: '已完成' },
  { id: 'UR003', probeId: 'US001', patientName: '赵大力', patientId: 'P003', examType: '腹部超声检查', doctorName: '周明', nurseName: '王芳', examRoom: '腹部超声室1', examDate: '2026-04-27', examTime: '10:30', endTime: '11:00', findings: '胆囊形态大小正常，壁厚2mm光滑，腔内透声好，肝外胆管上段内径5mm，走行正常', status: '已完成' },
  { id: 'UR004', probeId: 'US001', patientName: '孙小燕', patientId: 'P004', examType: '泌尿系统超声', doctorName: '张建国', nurseName: '李娟', examRoom: '泌尿超声室', examDate: '2026-04-26', examTime: '15:00', endTime: '15:28', findings: '右肾下极见8×7mm强回声，后方伴声影，考虑肾结石；余双肾皮髓质分界清', status: '已完成' },
  { id: 'UR005', probeId: 'US002', patientName: '周国强', patientId: 'P005', examType: '心脏超声', doctorName: '周明', nurseName: '王芳', examRoom: '心脏超声室', examDate: '2026-04-29', examTime: '10:30', endTime: '11:05', findings: '心脏各房室大小正常，左室射血分数62%，各瓣膜启闭可，未见明显反流', status: '已完成' },
  { id: 'UR006', probeId: 'US003', patientName: '吴婷', patientId: 'P006', examType: '妇产科超声', doctorName: '张建国', nurseName: '李娟', examRoom: '妇产超声室', examDate: '2026-04-28', examTime: '08:30', endTime: '09:15', findings: '子宫前位，大小正常，子宫内膜厚6mm，宫颈光滑，双侧卵巢大小正常，未见明显异常', status: '已完成' },
  { id: 'UR007', probeId: 'US003', patientName: '郑伟', patientId: 'P007', examType: '腹部超声检查', doctorName: '周明', nurseName: '王芳', examRoom: '腹部超声室2', examDate: '2026-04-27', examTime: '14:00', endTime: '14:50', findings: '腹膜后见28×22mm低回声团，边界清，内回声均匀，腹腔大血管周围未见明显肿大淋巴结', status: '已完成' },
  { id: 'UR008', probeId: 'US004', patientName: '陈静', patientId: 'P008', examType: '腹部超声检查', doctorName: '张建国', nurseName: '李娟', examRoom: '腹部超声室1', examDate: '2026-04-29', examTime: '08:00', endTime: '08:40', findings: '肝脾肋下未及，胆囊位于肋间，壁欠光滑，肝内外胆管轻度扩张，上段内径6mm', status: '已完成' },
];

// ---------- 超声设备（含扩展字段） ----------
// channelCount 是扩展字段，不在 UltrasoundDevice 类型定义中
interface UltrasoundDeviceEx extends Omit<UltrasoundDevice, 'imageSensor'> {
  channelCount?: number;
  imageSensor?: string;
}

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a365d' },
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
    background: '#1a365d', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
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
    display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11,
  },
  badgeIdle: { background: '#dcfce7', color: '#15803d' },
  badgeInUse: { background: '#dbeafe', color: '#1d4ed8' },
  badgeCleaning: { background: '#fef3c7', color: '#b45309' },
  badgeDisinfecting: { background: '#e0e7ff', color: '#4338ca' },
  badgeRepair: { background: '#fee2e2', color: '#dc2626' },
  badgeScrapped: { background: '#f1f5f9', color: '#64748b' },
  actions: { display: 'flex', gap: 6 },
  btnIcon: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: '12px 16px', background: '#fff',
    borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: {
    background: '#1a365d', color: '#fff', border: '1px solid #1a365d',
  },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 600, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#1a365d' },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
    display: 'flex', alignItems: 'center', padding: 4,
  },
  modalBody: {
    padding: 20, overflowY: 'auto', flex: 1,
  },
  modalFooter: {
    padding: '12px 20px', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#475569' },
  required: { color: '#dc2626', marginLeft: 2 },
  input: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', outline: 'none',
  },
  btnCancel: {
    padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer',
  },
  btnSubmit: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#1a365d', fontSize: 13, color: '#fff', cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  emptyIcon: { marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: '#64748b' },
  emptyDesc: { fontSize: 13, color: '#94a3b8' },
  // Overview stat cards
  overviewStatRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20,
  },
  overviewStatCard: {
    background: '#fff', borderRadius: 10, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14,
  },
  overviewStatIcon: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  overviewStatInfo: { flex: 1 },
  overviewStatValue: { fontSize: 22, fontWeight: 700, color: '#1a365d', lineHeight: 1.2 },
  overviewStatLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  overviewStatSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 13, fontWeight: 700, color: '#1a365d',
    marginBottom: 10, paddingBottom: 6,
    borderBottom: '1px solid #e2e8f0',
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
  },
  infoItem: {
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  infoLabel: { fontSize: 11, color: '#94a3b8' },
  infoValue: { fontSize: 13, color: '#334155', fontWeight: 500 },
  statusBadgeLarge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 14, fontSize: 12, fontWeight: 600,
  },
  // ---------- 生命周期增强样式 ----------
  lifecycleStats: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16,
  },
  lifecycleCard: {
    background: '#f8fafc', borderRadius: 8, padding: '12px 14px',
    border: '1px solid #e2e8f0',
  },
  lifecycleCardLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  lifecycleCardValue: { fontSize: 20, fontWeight: 700, color: '#1a365d' },
  lifecycleCardSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  // 预警卡片
  alertCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8, marginBottom: 8,
  },
  alertCardOverdue: { background: '#fef2f2', border: '1px solid #fecaca' },
  alertCardWarning: { background: '#fffbeb', border: '1px solid #fde68a' },
  alertCardOk: { background: '#f0fdf4', border: '1px solid #bbf7d0' },
  alertIcon: { flexShrink: 0 },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: 600 },
  alertDesc: { fontSize: 11, marginTop: 2 },
  // 详情弹窗tab
  tabBar: {
    display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 16, gap: 4,
  },
  tab: {
    padding: '8px 16px', fontSize: 13, cursor: 'pointer', borderBottom: '2px solid transparent',
    color: '#64748b', fontWeight: 500, background: 'none', border: 'none',
  },
  tabActive: {
    color: '#1a365d', borderBottom: '2px solid #1a365d', fontWeight: 600,
  },
  // 使用记录列表
  recordList: { display: 'flex', flexDirection: 'column', gap: 8 },
  recordItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 12px', background: '#f8fafc', borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  recordDate: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: 44, background: '#1a365d', color: '#fff', borderRadius: 6,
    padding: '4px 8px',
  },
  recordDay: { fontSize: 16, fontWeight: 700, lineHeight: 1 },
  recordMonth: { fontSize: 10 },
  recordInfo: { flex: 1 },
  recordPatient: { fontSize: 13, fontWeight: 600, color: '#1a365d' },
  recordMeta: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  recordFindings: { fontSize: 12, color: '#475569', marginTop: 4 },
  recordBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500,
  },
  recordBadgeDone: { background: '#dcfce7', color: '#15803d' },
  recordBadgeCancel: { background: '#fee2e2', color: '#dc2626' },
  // 位置状态行
  locationRow: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
    padding: '8px 12px', background: '#f0f9ff', borderRadius: 8,
    border: '1px solid #bae6fd',
  },
  locationIcon: { color: '#0284c7' },
  locationText: { fontSize: 13, color: '#0369a1', flex: 1 },
  // ---------- 超声参数监控面板 ----------
  paramsPanel: {
    background: '#1a365d',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 20,
    color: '#fff',
  },
  paramsPanelTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  paramsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
  paramsCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '16px 18px',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  paramsCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paramsCardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2e8f0',
  },
  paramsCardDevice: {
    fontSize: 11,
    color: '#94a3b8',
  },
  paramsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  paramsLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    minWidth: 70,
  },
  paramsValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
  },
  progressBar: {
    width: 100,
    height: 8,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#60a5fa',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  knobDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  knobCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '3px solid #60a5fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#fff',
  },
  freqBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    background: '#3b82f6',
    color: '#fff',
  },
  tgcContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  tgcBar: {
    width: 10,
    borderRadius: 2,
    background: '#60a5fa',
  },
  tgcEmpty: {
    width: 10,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.15)',
  },
  appTag: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    background: '#22c55e',
    color: '#fff',
  },
  // ---------- 探头信息卡片 ----------
  probeCard: {
    background: '#f8fafc',
    borderRadius: 10,
    padding: '16px 18px',
    border: '1px solid #e2e8f0',
    marginTop: 12,
  },
  probeCardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1a365d',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  probeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  probeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  probeLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  probeValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: 500,
  },
  probeModes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  probeModeTag: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 500,
    background: '#e0e7ff',
    color: '#4338ca',
  },
  probeStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
  },
  probeStatusOk: { background: '#dcfce7', color: '#15803d' },
  probeStatusDisinfect: { background: '#fef3c7', color: '#b45309' },
  probeStatusBroken: { background: '#fee2e2', color: '#dc2626' },
}

// ---------- 状态徽章样式 ----------
const statusBadgeStyle = (status: EquipmentStatus): React.CSSProperties => {
  const base = s.statusBadgeLarge
  switch (status) {
    case '空闲': return { ...base, background: '#dcfce7', color: '#15803d' }
    case '使用中': return { ...base, background: '#dbeafe', color: '#1d4ed8' }
    case '维护中': return { ...base, background: '#fef3c7', color: '#b45309' }
    case '维修中': return { ...base, background: '#fee2e2', color: '#dc2626' }
    case '已报废': return { ...base, background: '#f1f5f9', color: '#64748b' }
    default: return { ...base, background: '#f1f5f9', color: '#64748b' }
  }
}

// ---------- 工具函数 ----------
const statusLabel = (status: EquipmentStatus): string => {
  const labels: Record<EquipmentStatus, string> = {
    '空闲': '空闲',
    '使用中': '使用中',
    '维护中': '维护中',
    '维修中': '维修中',
    '已报废': '已报废',
  }
  return labels[status] || status
}

// ---------- 空超声设备对象 ----------
const emptyEndoscope = (): Partial<UltrasoundDevice> => ({
  code: '', name: '', model: '', manufacturer: '',
  category: '腹部超声',
  purchaseDate: new Date().toISOString().split('T')[0],
  warrantyEnd: '',
  status: '空闲',
  totalUseCount: 0,
  location: '',
  probeType: 'convex',
  imageSensor: 'CMOS',
})

// ---------- 校验 ----------
const validateEndoscope = (e: Partial<UltrasoundDevice>): string[] => {
  const errs: string[] = []
  if (!(e.code ?? "").trim()) errs.push('设备编号不能为空')
  if (!(e.name ?? "").trim()) errs.push('设备名称不能为空')
  if (!(e.model ?? "").trim()) errs.push('型号不能为空')
  if (!(e.manufacturer ?? "").trim()) errs.push('厂商不能为空')
  if (!(e.location ?? "").trim()) errs.push('所在位置不能为空')
  return errs
}

// ---------- 生命周期工具函数 ----------
const getDaysInService = (purchaseDate: string): number => {
  if (!purchaseDate) return 0
  const purchased = new Date(purchaseDate)
  const today = new Date()
  const diff = today.getTime() - purchased.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const getMaintenanceStatus = (nextMaintenanceDate?: string): 'overdue' | 'warning' | 'ok' => {
  if (!nextMaintenanceDate) return 'ok'
  const today = new Date()
  const next = new Date(nextMaintenanceDate)
  const diffDays = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'warning'
  return 'ok'
}

const getWarrantyStatus = (warrantyEnd?: string): 'overdue' | 'warning' | 'ok' => {
  if (!warrantyEnd) return 'ok'
  const today = new Date()
  const end = new Date(warrantyEnd)
  const diffDays = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 30) return 'warning'
  return 'ok'
}

const getUseRecordsForEndoscope = (endoscopeId: string): UseRecord[] => {
  return mockUseRecords.filter(r => r.probeId === endoscopeId)
}

// ---------- 扩充超声设备数据（扩充至30条） ----------
const generateExtraEndoscopes = (base: UltrasoundDeviceEx[]): UltrasoundDeviceEx[] => {
  if (base.length >= 30) return base
  const extra: UltrasoundDeviceEx[] = []
  const names: Array<{ name: string; model: string; manufacturer: string; category: UltrasoundDevice['category'] }> = [
    { name: 'Fujifilm彩色多普勒超声', model: 'EL-7000', manufacturer: 'Fujifilm', category: '腹部超声' },
    { name: 'Fujifilm腹部超声', model: 'EC-7000', manufacturer: 'Fujifilm', category: '腹部超声' },
    { name: 'Pentax彩色多普勒超声', model: 'EG-2990i', manufacturer: 'Pentax', category: '心血管超声' },
    { name: 'Pentax腹部超声', model: 'EC-3890i', manufacturer: 'Pentax', category: '腹部超声' },
    { name: 'Boston超声设备', model: 'SU-9000', manufacturer: 'Boston Scientific', category: '其他' },
    { name: 'Cook气囊小超声', model: 'SB-900', manufacturer: 'Cook Medical', category: '其他' },
  ]
  const statuses: EquipmentStatus[] = ['空闲', '空闲', '空闲', '使用中', '维护中', '维护中', '维修中', '空闲']
  const locations = ['超声设备室1', '超声设备室2', '超声设备室3', '超声设备储存室', '超声设备室1', '超声设备室2']

  let idx = base.length + 1
  while (extra.length < 30 - base.length) {
    const t = names[(idx - 1) % names.length]
    const year = 2018 + ((idx - 1) % 6)
    const month = ((idx - 1) % 12) + 1
    const day = ((idx - 1) % 28) + 1
    extra.push({
      id: `EN${String(idx).padStart(3, '0')}`,
      code: `${t.model}-${String(idx).padStart(3, '0')}`,
      name: t.name,
      model: `${t.manufacturer} ${t.model}`,
      manufacturer: t.manufacturer,
      category: t.category,
      purchaseDate: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      warrantyEnd: `${year + 5}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      status: statuses[(idx - 1) % statuses.length],
      totalUseCount: 100 + ((idx - 1) * 37) % 2000,
      lastMaintenanceDate: '2026-03-01',
      nextMaintenanceDate: '2026-06-01',
      location: locations[(idx - 1) % locations.length],
      probeType: 'convex',
      imageSensor: (idx - 1) % 2 === 0 ? 'CMOS' : 'CCD',
      channelCount: ((idx - 1) % 3) + 2,
    })
    idx++
  }
  return [...base as UltrasoundDeviceEx[], ...extra]
}

// ---------- 设备排序：空闲→使用中→维护中 ----------
type DeviceGroup = 'idle' | 'inUse' | 'maintenance'
const getDeviceGroup = (status: EquipmentStatus): DeviceGroup => {
  if (status === '空闲') return 'idle'
  if (status === '使用中') return 'inUse'
  return 'maintenance'
}

const sortDevices = (devices: UltrasoundDeviceEx[]): UltrasoundDeviceEx[] => {
  return [...devices].sort((a, b) => {
    const order: Record<DeviceGroup, number> = { idle: 0, inUse: 1, maintenance: 2 }
    return order[getDeviceGroup(a.status)] - order[getDeviceGroup(b.status)]
  })
}

// ---------- 主组件 ----------
export default function EndoscopePage() {
  const baseEndoscopes = useMemo(() => initialUltrasoundDevices as UltrasoundDeviceEx[], [])
  const [endoscopes, setEndoscopes] = useState<UltrasoundDeviceEx[]>(() => generateExtraEndoscopes(baseEndoscopes))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | ''>('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null)
  const [editingEndoscope, setEditingEndoscope] = useState<Partial<UltrasoundDevice>>({})
  const [viewingEndoscope, setViewingEndoscope] = useState<UltrasoundDeviceEx | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'records' | 'alerts'>('info')

  // 过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return endoscopes.filter(e => {
      const matchSearch = !kw ||
        (e.name ?? "").toLowerCase().includes(kw) ||
        (e.code ?? "").toLowerCase().includes(kw) ||
        (e.model ?? "").toLowerCase().includes(kw) ||
        (e.manufacturer ?? "").toLowerCase().includes(kw) ||
        (e.location ?? "").toLowerCase().includes(kw)
      const matchStatus = !statusFilter || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [endoscopes, search, statusFilter])

  // 排序后分页
  const sortedFiltered = useMemo(() => sortDevices(filtered), [filtered])
  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize))
  const paged = sortedFiltered.slice((page - 1) * pageSize, page * pageSize)

  const openAdd = () => {
    setEditingEndoscope(emptyEndoscope())
    setFormErrors([])
    setModalMode('add')
  }

  const openEdit = (e: UltrasoundDeviceEx) => {
    setEditingEndoscope({ ...e })
    setFormErrors([])
    setModalMode('edit')
  }

  const openView = (e: UltrasoundDeviceEx) => {
    setViewingEndoscope(e)
    setActiveTab('info')
    setModalMode('view')
  }

  const closeModal = () => setModalMode(null)

  const handleSubmit = () => {
    const errs = validateEndoscope(editingEndoscope)
    if (errs.length > 0) { setFormErrors(errs); return }
    if (modalMode === 'add') {
      const id = 'EN' + String(Date.now()).slice(-6)
      setEndoscopes(prev => [{ ...editingEndoscope, id } as UltrasoundDeviceEx, ...prev])
    } else if (modalMode === 'edit') {
      setEndoscopes(prev => prev.map(e => e.id === editingEndoscope.id ? { ...editingEndoscope, id: e.id } as UltrasoundDeviceEx : e))
    }
    closeModal()
  }

  const handleField = (field: keyof Partial<UltrasoundDevice>, value: string | number) => {
    setEditingEndoscope(prev => ({ ...prev, [field]: value }))
  }

  // 深度进度条（0-20cm范围）
  const depthPercent = Math.min(100, (8.0 / 20) * 100)

  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div style={s.title}>超声设备设备管理</div>
      </div>

      {/* 统计概览卡片 */}
      <div style={s.overviewStatRow}>
        <div style={s.overviewStatCard}>
          <div style={{ ...s.overviewStatIcon, background: '#eff6ff' }}>
            <Activity size={20} color="#3b82f6" />
          </div>
          <div style={s.overviewStatInfo}>
            <div style={s.overviewStatValue}>{endoscopes.length}</div>
            <div style={s.overviewStatLabel}>设备总数</div>
            <div style={s.overviewStatSub}>超声设备 {endoscopes.filter(e => ['腹部超声','浅表器官超声','心血管超声','妇产科超声','介入超声','其他'].includes(e.category)).length} 台</div>
          </div>
        </div>
        <div style={s.overviewStatCard}>
          <div style={{ ...s.overviewStatIcon, background: '#f0fdf4' }}>
            <CheckCircle size={20} color="#22c55e" />
          </div>
          <div style={s.overviewStatInfo}>
            <div style={s.overviewStatValue}>{endoscopes.filter(e => e.status === '空闲').length}</div>
            <div style={s.overviewStatLabel}>空闲设备</div>
            <div style={s.overviewStatSub}>可立即使用</div>
          </div>
        </div>
        <div style={s.overviewStatCard}>
          <div style={{ ...s.overviewStatIcon, background: '#fff7ed' }}>
            <Wrench size={20} color="#f97316" />
          </div>
          <div style={s.overviewStatInfo}>
            <div style={s.overviewStatValue}>{endoscopes.filter(e => e.status === '维护中').length}</div>
            <div style={s.overviewStatLabel}>维护保养中</div>
            <div style={s.overviewStatSub}>正在处理中</div>
          </div>
        </div>
        <div style={s.overviewStatCard}>
          <div style={{ ...s.overviewStatIcon, background: '#fef2f2' }}>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <div style={s.overviewStatInfo}>
            <div style={s.overviewStatValue}>{endoscopes.filter(e => ['维修中','已报废'].includes(e.status)).length}</div>
            <div style={s.overviewStatLabel}>维修/报废</div>
            <div style={s.overviewStatSub}>需关注设备</div>
          </div>
        </div>
      </div>

      {/* 实时超声参数监控面板 */}
      <div style={s.paramsPanel}>
        <div style={s.paramsPanelTitle}>
          <Activity size={18} color="#60a5fa" />
          实时超声参数监控
        </div>
        <div style={s.paramsGrid}>
          {mockUltrasoundParams.map(params => (
            <div key={params.deviceId} style={s.paramsCard}>
              <div style={s.paramsCardHeader}>
                <div>
                  <div style={s.paramsCardTitle}>{params.deviceName}</div>
                  <div style={s.paramsCardDevice}>设备ID: {params.deviceId}</div>
                </div>
                <span style={s.appTag}>{params.applicationPart}</span>
              </div>

              {/* 深度 */}
              <div style={s.paramsRow}>
                <span style={s.paramsLabel}>深度 depth</span>
                <span style={s.paramsValue}>{params.depth} cm</span>
                <div style={s.progressBar}>
                  <div style={{ ...s.progressFill, width: `${depthPercent}%` }} />
                </div>
              </div>

              {/* 增益 */}
              <div style={s.paramsRow}>
                <span style={s.paramsLabel}>增益 gain</span>
                <span style={s.paramsValue}>{params.gain} dB</span>
                <div style={s.knobDisplay}>
                  <div style={s.knobCircle}>◐</div>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>旋钮</span>
                </div>
              </div>

              {/* 频率 */}
              <div style={s.paramsRow}>
                <span style={s.paramsLabel}>频率 frequency</span>
                <span style={s.paramsValue}>{params.frequency} MHz</span>
                <span style={s.freqBadge}>{params.frequency} MHz</span>
              </div>

              {/* TGC */}
              <div style={s.paramsRow}>
                <span style={s.paramsLabel}>TGC</span>
                <div style={s.tgcContainer}>
                  {params.tgc.map((val, i) => (
                    <div
                      key={i}
                      style={{
                        ...(val > 0 ? s.tgcBar : s.tgcEmpty),
                        height: Math.max(6, (val / 100) * 28),
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 探头型号 */}
              <div style={s.paramsRow}>
                <span style={s.paramsLabel}>探头型号</span>
                <span style={{ ...s.paramsValue, fontSize: 13 }}>{params.probeModel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 工具栏：搜索 + 状态筛选 + 新增 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索名称、编号、型号、厂商、位置..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          style={s.select}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as EquipmentStatus | ''); setPage(1) }}
        >
          <option value="">全部状态</option>
          <option value="空闲">空闲</option>
          <option value="使用中">使用中</option>
          <option value="维护中">维护中</option>
          <option value="维修中">维修中</option>
          <option value="已报废">已报废</option>
        </select>
        <button style={s.btnPrimary} onClick={openAdd}>
          <Plus size={14} /> 新增设备
        </button>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ ...s.table, padding: '40px 0' }}>
          <div style={s.emptyState}>
            <Activity size={48} color="#d1d5db" style={s.emptyIcon} />
            <div style={s.emptyTitle}>暂无超声设备设备</div>
            <div style={s.emptyDesc}>当前没有符合条件的超声设备设备，请检查筛选条件或添加新设备</div>
            <button style={{ ...s.btnPrimary, marginTop: 8, height: 44 }} onClick={openAdd}>
              <Plus size={16} /> 新增超声设备设备
            </button>
          </div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>设备名称</th>
              <th style={s.th}>设备编号</th>
              <th style={s.th}>型号</th>
              <th style={s.th}>厂商</th>
              <th style={s.th}>类型</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>位置</th>
              <th style={s.th}>累计使用</th>
              <th style={s.th}>下次保养</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(e => (
              <tr key={e.id} style={{ background: '#fff' }}>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1a365d' }}>{e.name ?? ""}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{e.id}</div>
                </td>
                <td style={s.td}>
                  <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.code ?? ""}</div>
                </td>
                <td style={s.td}>{e.model ?? ""}</td>
                <td style={s.td}>{e.manufacturer ?? ""}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: '#f0f9ff', color: '#0369a1' }}>
                    {e.category}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={statusBadgeStyle(e.status)}>
                    {statusLabel(e.status)}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} color="#94a3b8" />
                    {e.location ?? ""}
                  </div>
                </td>
                <td style={s.td}>
                  <span style={{ fontWeight: 600, color: '#1a365d' }}>{e.totalUseCount}</span>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}> 次</span>
                </td>
                <td style={s.td}>
                  {e.nextMaintenanceDate ? (() => {
                    const ms = getMaintenanceStatus(e.nextMaintenanceDate)
                    const ws = getWarrantyStatus(e.warrantyEnd)
                    const hasAlert = ms === 'overdue' || ms === 'warning' || ws === 'overdue' || ws === 'warning'
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} color={hasAlert ? (ms === 'overdue' || ws === 'overdue' ? '#dc2626' : '#b45309') : '#94a3b8'} />
                        <span style={{ color: hasAlert ? (ms === 'overdue' || ws === 'overdue' ? '#dc2626' : '#b45309') : '#334155' }}>
                          {e.nextMaintenanceDate}
                        </span>
                        {ms === 'overdue' && <AlertTriangle size={11} color="#dc2626" />}
                        {ms === 'warning' && <AlertCircle size={11} color="#b45309" />}
                        {ws === 'overdue' && <AlertTriangle size={11} color="#dc2626" />}
                        {ws === 'warning' && <AlertCircle size={11} color="#b45309" />}
                      </div>
                    )
                  })() : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnIcon} onClick={() => openView(e)} title="查看详情">
                      <Eye size={13} /> 查看
                    </button>
                    <button style={s.btnIcon} onClick={() => openEdit(e)} title="编辑">
                      <Edit2 size={13} /> 修改
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 分页 */}
      <div style={s.pagination}>
        <div style={s.pageInfo}>
          共 <strong>{filtered.length}</strong> 条记录，第 <strong>{page}</strong> / <strong>{totalPages}</strong> 页
        </div>
        <div style={s.pageBtns}>
          <button
            style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let num = i + 1
            if (totalPages > 5) {
              if (page > 3) num = page - 2 + i
              if (page > totalPages - 2) num = totalPages - 4 + i
            }
            return (
              <button
                key={num}
                style={{ ...s.pageBtn, ...(page === num ? s.pageBtnActive : {}) }}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            )
          })}
          <button
            style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 弹窗 */}
      {modalMode && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            {/* 详情弹窗 - 全生命周期视图 */}
            {modalMode === 'view' && viewingEndoscope && (() => {
              const e = viewingEndoscope
              const days = getDaysInService(e.purchaseDate)
              const maintStatus = getMaintenanceStatus(e.nextMaintenanceDate)
              const warrantySt = getWarrantyStatus(e.warrantyEnd)
              const records = getUseRecordsForEndoscope(e.id)
              const monthCount = records.filter(r => r.status === '已完成').length
              const recentCount = records.filter(r => {
                const d = new Date(r.examDate)
                const cutoff = new Date()
                cutoff.setDate(cutoff.getDate() - 30)
                return d >= cutoff
              }).length

              const probeInfo = mockProbeInfos[e.id]

              return (
              <>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>超声设备设备详情</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  {/* 位置状态行 */}
                  <div style={s.locationRow}>
                    <MapPin size={15} style={s.locationIcon} />
                    <span style={s.locationText}>
                      <strong>{e.location ?? '未知位置'}</strong>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      当前状态：{statusLabel(e.status)}
                      {e.currentPatientId && <span style={{ color: '#0284c7' }}>（患者：{e.currentPatientId}）</span>}
                    </span>
                  </div>

                  {/* Tab栏 */}
                  <div style={s.tabBar}>
                    <button
                      style={{ ...s.tab, ...(activeTab === 'info' ? s.tabActive : {}) }}
                      onClick={() => setActiveTab('info')}
                    >基本信息</button>
                    <button
                      style={{ ...s.tab, ...(activeTab === 'records' ? s.tabActive : {}) }}
                      onClick={() => setActiveTab('records')}
                    >使用记录</button>
                    <button
                      style={{ ...s.tab, ...(activeTab === 'alerts' ? s.tabActive : {}) }}
                      onClick={() => setActiveTab('alerts')}
                    >维护预警</button>
                  </div>

                  {/* Tab: 基本信息 */}
                  {activeTab === 'info' && (
                    <>
                      {/* 生命周期统计卡片 */}
                      <div style={s.lifecycleStats}>
                        <div style={s.lifecycleCard}>
                          <div style={s.lifecycleCardLabel}>在用天数</div>
                          <div style={s.lifecycleCardValue}>{days}</div>
                          <div style={s.lifecycleCardSub}>天</div>
                        </div>
                        <div style={s.lifecycleCard}>
                          <div style={s.lifecycleCardLabel}>累计使用</div>
                          <div style={s.lifecycleCardValue}>{e.totalUseCount}</div>
                          <div style={s.lifecycleCardSub}>次</div>
                        </div>
                        <div style={s.lifecycleCard}>
                          <div style={s.lifecycleCardLabel}>本月使用</div>
                          <div style={s.lifecycleCardValue}>{monthCount}</div>
                          <div style={s.lifecycleCardSub}>次</div>
                        </div>
                        <div style={s.lifecycleCard}>
                          <div style={s.lifecycleCardLabel}>近30天</div>
                          <div style={s.lifecycleCardValue}>{recentCount}</div>
                          <div style={s.lifecycleCardSub}>次</div>
                        </div>
                      </div>

                      {/* 基本信息 */}
                      <div style={s.infoSection}>
                        <div style={s.infoSectionTitle}>基本信息</div>
                        <div style={s.infoGrid}>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>设备名称</span>
                            <span style={s.infoValue}>{e.name ?? ""}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>设备编号</span>
                            <span style={s.infoValue}>{e.code ?? ""}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>型号</span>
                            <span style={s.infoValue}>{e.model ?? ""}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>厂商</span>
                            <span style={s.infoValue}>{e.manufacturer ?? ""}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>类型</span>
                            <span style={s.infoValue}>{e.category}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>探头类型</span>
                            <span style={s.infoValue}>{e.probeType}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>图像传感器</span>
                            <span style={s.infoValue}>{e.imageSensor}</span>
                          </div>
                        </div>
                      </div>

                      {/* 使用与维护 */}
                      <div style={s.infoSection}>
                        <div style={s.infoSectionTitle}>使用与维护</div>
                        <div style={s.infoGrid}>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>购买日期</span>
                            <span style={s.infoValue}>{e.purchaseDate}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>保修截止</span>
                            <span style={{ ...s.infoValue, color: warrantySt === 'overdue' ? '#dc2626' : warrantySt === 'warning' ? '#b45309' : '#334155' }}>
                              {e.warrantyEnd || '—'}
                              {warrantySt === 'overdue' ? ' [已过保]' : warrantySt === 'warning' ? ' [即将过保]' : null}
                            </span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>最近保养</span>
                            <span style={s.infoValue}>{e.lastMaintenanceDate || '—'}</span>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoLabel}>下次保养</span>
                            <span style={{ ...s.infoValue, color: maintStatus === 'overdue' ? '#dc2626' : maintStatus === 'warning' ? '#b45309' : '#334155' }}>
                              {e.nextMaintenanceDate || '—'}
                              {maintStatus === 'overdue' ? ' [已逾期]' : maintStatus === 'warning' ? ' [即将到期]' : null}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 探头信息卡片 */}
                      {probeInfo && (
                        <div style={s.infoSection}>
                          <div style={s.probeCardTitle}>
                            <Package size={15} color="#1a365d" />
                            探头信息
                          </div>
                          <div style={s.probeCard}>
                            <div style={s.probeGrid}>
                              <div style={s.probeItem}>
                                <span style={s.probeLabel}>探头型号</span>
                                <span style={s.probeValue}>{probeInfo.probeModel}</span>
                              </div>
                              <div style={s.probeItem}>
                                <span style={s.probeLabel}>序列号</span>
                                <span style={s.probeValue}>{probeInfo.probeSerial}</span>
                              </div>
                              <div style={s.probeItem}>
                                <span style={s.probeLabel}>频率范围</span>
                                <span style={s.probeValue}>{probeInfo.frequencyRange}</span>
                              </div>
                              <div style={s.probeItem}>
                                <span style={s.probeLabel}>最近使用</span>
                                <span style={s.probeValue}>{probeInfo.lastUsedTime}</span>
                              </div>
                              <div style={s.probeItem}>
                                <span style={s.probeLabel}>探头状态</span>
                                <span style={{
                                  ...s.probeStatusBadge,
                                  ...(probeInfo.probeStatus === '正常' ? s.probeStatusOk :
                                      probeInfo.probeStatus === '需消毒' ? s.probeStatusDisinfect :
                                      s.probeStatusBroken)
                                }}>
                                  {probeInfo.probeStatus === '正常' ? <CheckCircle size={10} /> :
                                   probeInfo.probeStatus === '需消毒' ? <AlertCircle size={10} /> :
                                   <AlertTriangle size={10} />}
                                  {probeInfo.probeStatus}
                                </span>
                              </div>
                              <div style={{ ...s.probeItem, gridColumn: '1 / -1' }}>
                                <span style={s.probeLabel}>支持扫查模式</span>
                                <div style={s.probeModes}>
                                  {probeInfo.supportedModes.map(mode => (
                                    <span key={mode} style={s.probeModeTag}>{mode}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Tab: 使用记录 */}
                  {activeTab === 'records' && (
                    <div style={s.recordList}>
                      {records.length === 0 ? (
                        <div style={s.emptyState}>
                          <History size={32} color="#cbd5e1" style={{ marginBottom: 10 }} />
                          <div>暂无使用记录</div>
                        </div>
                      ) : records.map(r => {
                        const d = new Date(r.examDate)
                        const day = d.getDate()
                        const month = d.toLocaleString('zh-CN', { month: 'short' })
                        return (
                          <div key={r.id} style={s.recordItem}>
                            <div style={s.recordDate}>
                              <span style={s.recordDay}>{day}</span>
                              <span style={s.recordMonth}>{month}</span>
                            </div>
                            <div style={s.recordInfo}>
                              <div style={s.recordPatient}>{r.patientName}（{r.patientId}）</div>
                              <div style={s.recordMeta}>
                                {r.examType} | {r.doctorName}（医生）| {r.nurseName}（护士）| {r.examRoom}
                              </div>
                              <div style={s.recordMeta}>
                                <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {r.examTime} - {r.endTime}
                              </div>
                              {r.findings && <div style={s.recordFindings}>所见：{r.findings}</div>}
                            </div>
                            <span style={{ ...s.recordBadge, ...(r.status === '已完成' ? s.recordBadgeDone : s.recordBadgeCancel) }}>
                              {r.status === '已完成' ? <CheckCircle size={10} /> : null}
                              {r.status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Tab: 维护预警 */}
                  {activeTab === 'alerts' && (
                    <div>
                      {/* 保养预警 */}
                      {maintStatus === 'overdue' && (
                        <div style={{ ...s.alertCard, ...s.alertCardOverdue }}>
                          <AlertTriangle size={18} color="#dc2626" style={s.alertIcon} />
                          <div style={s.alertText}>
                            <div style={{ ...s.alertTitle, color: '#dc2626' }}>保养已逾期！</div>
                            <div style={s.alertDesc}>
                              下次保养日期为 {e.nextMaintenanceDate}，已超过预定时间，请尽快安排保养。
                            </div>
                          </div>
                        </div>
                      )}
                      {maintStatus === 'warning' && (
                        <div style={{ ...s.alertCard, ...s.alertCardWarning }}>
                          <AlertCircle size={18} color="#b45309" style={s.alertIcon} />
                          <div style={s.alertText}>
                            <div style={{ ...s.alertTitle, color: '#b45309' }}>保养即将到期</div>
                            <div style={s.alertDesc}>
                              下次保养日期为 {e.nextMaintenanceDate}，请在7天内完成保养。
                            </div>
                          </div>
                        </div>
                      )}
                      {maintStatus === 'ok' && (
                        <div style={{ ...s.alertCard, ...s.alertCardOk }}>
                          <CheckCircle size={18} color="#15803d" style={s.alertIcon} />
                          <div style={s.alertText}>
                            <div style={{ ...s.alertTitle, color: '#15803d' }}>保养状态正常</div>
                            <div style={s.alertDesc}>
                              下次保养日期为 {e.nextMaintenanceDate || '未设置'}，距今还有{Math.floor((new Date(e.nextMaintenanceDate!).getTime() - new Date().getTime()) / (1000*60*60*24))}天。
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 保修预警 */}
                      {warrantySt === 'overdue' && (
                        <div style={{ ...s.alertCard, ...s.alertCardOverdue }}>
                          <AlertTriangle size={18} color="#dc2626" style={s.alertIcon} />
                          <div style={s.alertText}>
                            <div style={{ ...s.alertTitle, color: '#dc2626' }}>保修已过期！</div>
                            <div style={s.alertDesc}>
                              保修截止日期为 {e.warrantyEnd}，设备已过保，维修将产生费用。
                            </div>
                          </div>
                        </div>
                      )}
                      {warrantySt === 'warning' && (
                        <div style={{ ...s.alertCard, ...s.alertCardWarning }}>
                          <AlertCircle size={18} color="#b45309" style={s.alertIcon} />
                          <div style={s.alertText}>
                            <div style={{ ...s.alertTitle, color: '#b45309' }}>保修即将到期</div>
                            <div style={s.alertDesc}>
                              保修截止日期为 {e.warrantyEnd}，请注意保修期即将结束。
                            </div>
                          </div>
                        </div>
                      )}
                      {warrantySt === 'ok' && e.warrantyEnd && (
                        <div style={{ ...s.alertCard, ...s.alertCardOk }}>
                          <CheckCircle size={18} color="#15803d" style={s.alertIcon} />
                          <div style={s.alertText}>
                            <div style={{ ...s.alertTitle, color: '#15803d' }}>保修状态正常</div>
                            <div style={s.alertDesc}>
                              保修截止日期为 {e.warrantyEnd}，设备在保。
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 使用频率预警 */}
                      <div style={{ ...s.alertCard, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Package size={18} color="#64748b" style={s.alertIcon} />
                        <div style={s.alertText}>
                          <div style={{ ...s.alertTitle, color: '#475569' }}>使用频率统计</div>
                          <div style={s.alertDesc}>
                            累计使用 <strong>{e.totalUseCount}</strong> 次，近30天使用 <strong>{recentCount}</strong> 次，
                            所在位置：<strong>{e.location}</strong>，状态：<strong>{statusLabel(e.status)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>关闭</button>
                  <button style={s.btnSubmit} onClick={() => { closeModal(); openEdit(viewingEndoscope) }}>
                    编辑信息
                  </button>
                </div>
              </>
              )
            })()}

            {/* 新增/编辑表单 */}
            {(modalMode === 'add' || modalMode === 'edit') && (
              <>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>{modalMode === 'add' ? '新增超声设备设备' : '编辑超声设备设备'}</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  {formErrors.length > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
                      {formErrors.map((e, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#dc2626' }}>• {e}</div>
                      ))}
                    </div>
                  )}
                  <div style={s.formGrid}>
                    {/* 设备名称 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>设备名称<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        value={editingEndoscope.name ?? ""}
                        onChange={e => handleField('name', e.target.value)}
                        placeholder="如：Olympus彩色多普勒超声"
                      />
                    </div>
                    {/* 设备编号 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>设备编号<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        value={editingEndoscope.code ?? ""}
                        onChange={e => handleField('code', e.target.value)}
                        placeholder="如：GIF-H290"
                      />
                    </div>
                    {/* 型号 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>型号<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        value={editingEndoscope.model ?? ""}
                        onChange={e => handleField('model', e.target.value)}
                        placeholder="如：EVIS EXERA III GIF-H290"
                      />
                    </div>
                    {/* 厂商 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>厂商<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        value={editingEndoscope.manufacturer ?? ""}
                        onChange={e => handleField('manufacturer', e.target.value)}
                        placeholder="如：Olympus"
                      />
                    </div>
                    {/* 类型 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>类型</label>
                      <select
                        style={s.input}
                        value={editingEndoscope.category}
                        onChange={e => handleField('category', e.target.value as UltrasoundDevice['category'])}
                      >
                        <option value="腹部超声">腹部超声</option>
                        <option value="浅表器官超声">浅表器官超声</option>
                        <option value="心血管超声">心血管超声</option>
                        <option value="妇产科超声">妇产科超声</option>
                        <option value="介入超声">介入超声</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                    {/* 状态 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>状态</label>
                      <select
                        style={s.input}
                        value={editingEndoscope.status}
                        onChange={e => handleField('status', e.target.value as EquipmentStatus)}
                      >
                        <option value="空闲">空闲</option>
                        <option value="使用中">使用中</option>
                        <option value="维护中">维护中</option>
                        <option value="维修中">维修中</option>
                        <option value="已报废">已报废</option>
                      </select>
                    </div>
                    {/* 所在位置 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>所在位置<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        value={editingEndoscope.location ?? ""}
                        onChange={e => handleField('location', e.target.value)}
                        placeholder="如：超声设备室1"
                      />
                    </div>
                    {/* 探头类型 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>探头类型</label>
                      <input
                        style={s.input}
                        value={editingEndoscope.probeType ?? ""}
                        onChange={e => handleField('probeType', e.target.value)}
                        placeholder="如：convex"
                      />
                    </div>
                    {/* 图像传感器 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>图像传感器</label>
                      <select
                        style={s.input}
                        value={editingEndoscope.imageSensor}
                        onChange={e => handleField('imageSensor', e.target.value)}
                      >
                        <option value="CMOS">CMOS</option>
                        <option value="CCD">CCD</option>
                      </select>
                    </div>
                    {/* 累计使用次数 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>累计使用次数</label>
                      <input
                        style={s.input}
                        type="number"
                        min={0}
                        value={editingEndoscope.totalUseCount ?? 0}
                        onChange={e => handleField('totalUseCount', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    {/* 购买日期 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>购买日期</label>
                      <input
                        style={s.input}
                        type="date"
                        value={editingEndoscope.purchaseDate ?? ""}
                        onChange={e => handleField('purchaseDate', e.target.value)}
                      />
                    </div>
                    {/* 保修截止 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>保修截止日期</label>
                      <input
                        style={s.input}
                        type="date"
                        value={editingEndoscope.warrantyEnd ?? ""}
                        onChange={e => handleField('warrantyEnd', e.target.value)}
                      />
                    </div>
                    {/* 最近保养 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>最近保养日期</label>
                      <input
                        style={s.input}
                        type="date"
                        value={editingEndoscope.lastMaintenanceDate || ''}
                        onChange={e => handleField('lastMaintenanceDate', e.target.value)}
                      />
                    </div>
                    {/* 下次保养 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>下次保养日期</label>
                      <input
                        style={s.input}
                        type="date"
                        value={editingEndoscope.nextMaintenanceDate || ''}
                        onChange={e => handleField('nextMaintenanceDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>取消</button>
                  <button style={s.btnSubmit} onClick={handleSubmit}>
                    {modalMode === 'add' ? '确认添加' : '保存修改'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
