import React, { useState } from 'react'
import {
  Microscope, Package, Wrench, AlertTriangle, Search, Plus,
  X, Trash2, Download, Edit, CheckCircle, Clock, XCircle,
  Calendar, FileText, Gauge, Trash
} from 'lucide-react'

// ===== 类型定义 =====
type DeviceStatus = '在用' | '空闲' | '维保中' | '已报废' | '计量到期' | '待报废'
type RepairType = '故障维修' | '预防性维修'
type MaintenanceType = '日常保养' | '季度保养' | '年度保养'
type CalibrationResult = '合格' | '不合格'
type ScrapStatus = '待审批' | '已批准' | '已拒绝'

interface PurchaseInfo {
  purchaseDate: string
  supplier: string
  contractNo: string
  warrantyExpiry: string
}

interface RepairRecord {
  date: string
  repairType: RepairType
  vendor: string
  cost: number
  nextPlan: string
  description: string
}

interface MaintenanceRecord {
  date: string
  maintenanceType: MaintenanceType
  responsible: string
  items: string[]
  nextDate: string
}

interface CalibrationRecord {
  date: string
  institution: string
  result: CalibrationResult
  certificateNo: string
  validUntil: string
}

interface ScrapInfo {
  condition: string
  applyDate: string
  status: ScrapStatus
  residualValue: number
}

interface Device {
  id: string
  name: string
  model: string
  serial: string
  vendor: string
  purchaseDate: string
  dept: string
  status: DeviceStatus
  useCount: number
  lastUse: string
  nextMaint: string
  lifeMonth: number
  deptRate: number
  totalCost: number
  maintCost: number
  spareCost: number
  purchaseInfo: PurchaseInfo
  repairRecords: RepairRecord[]
  maintenanceRecords: MaintenanceRecord[]
  calibrationRecords: CalibrationRecord[]
  scrapInfo: ScrapInfo | null
}

// ===== 演示数据：设备全生命周期数据 =====
const mockDevices: Device[] = [
  {
    id: 'EQ001', name: '迈瑞超声诊断系统 Resona 7', model: 'Mindray Resona 7', serial: 'SN2021RM7001',
    vendor: '迈瑞', purchaseDate: '2021-03-15', dept: '腹部超声室', status: '在用', useCount: 4821,
    lastUse: '2026-04-30', nextMaint: '2026-05-15', lifeMonth: 58, deptRate: 87, totalCost: 168000,
    maintCost: 12500, spareCost: 3200,
    purchaseInfo: { purchaseDate: '2021-03-15', supplier: '迈瑞医疗科技', contractNo: 'CT-2021-0398', warrantyExpiry: '2026-03-14' },
    repairRecords: [
      { date: '2026-03-10', repairType: '预防性维修', vendor: '迈瑞维修站', cost: 2800, nextPlan: '2026-09-10', description: '探头线缆更换' },
      { date: '2025-11-22', repairType: '故障维修', vendor: '迈瑞维修站', cost: 4500, nextPlan: '-', description: '主板故障维修' },
    ],
    maintenanceRecords: [
      { date: '2026-04-10', maintenanceType: '季度保养', responsible: '张工程师', items: ['探头清洁', '软件校准', '硬件检测'], nextDate: '2026-07-10' },
      { date: '2026-01-18', maintenanceType: '日常保养', responsible: '李技师', items: ['表面消毒', '探头清洁'], nextDate: '2026-05-18' },
    ],
    calibrationRecords: [
      { date: '2026-01-15', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2026-00856', validUntil: '2027-01-14' },
      { date: '2025-01-10', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2025-00721', validUntil: '2026-01-09' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ002', name: '飞利浦超声系统 EPIQ 7C', model: 'Philips EPIQ 7C', serial: 'SN2021EP7C001',
    vendor: '飞利浦', purchaseDate: '2021-03-15', dept: '心脏超声室', status: '在用', useCount: 3890,
    lastUse: '2026-04-30', nextMaint: '2026-06-01', lifeMonth: 58, deptRate: 72, totalCost: 185000,
    maintCost: 9800, spareCost: 2800,
    purchaseInfo: { purchaseDate: '2021-03-15', supplier: '飞利浦医疗', contractNo: 'PH-2021-0156', warrantyExpiry: '2026-03-14' },
    repairRecords: [
      { date: '2026-03-01', repairType: '故障维修', vendor: '飞利浦维修站', cost: 4800, nextPlan: '2026-09-01', description: '电源模块更换' },
    ],
    maintenanceRecords: [
      { date: '2026-03-15', maintenanceType: '季度保养', responsible: '王工程师', items: ['探头校准', '图像质量检测'], nextDate: '2026-06-15' },
    ],
    calibrationRecords: [
      { date: '2025-12-20', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2025-00689', validUntil: '2026-12-19' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ003', name: 'GE超声系统 Voluson E10', model: 'GE Voluson E10', serial: 'SN2022VE1001',
    vendor: 'GE医疗', purchaseDate: '2022-07-20', dept: '妇产科超声室', status: '维保中', useCount: 1245,
    lastUse: '2026-04-28', nextMaint: '2026-05-01', lifeMonth: 46, deptRate: 45, totalCost: 320000,
    maintCost: 8500, spareCost: 1500,
    purchaseInfo: { purchaseDate: '2022-07-20', supplier: 'GE医疗中国', contractNo: 'GE-2022-0288', warrantyExpiry: '2027-07-19' },
    repairRecords: [
      { date: '2026-03-28', repairType: '故障维修', vendor: 'GE维修站', cost: 6200, nextPlan: '2026-06-28', description: '波束形成器故障' },
    ],
    maintenanceRecords: [
      { date: '2026-04-01', maintenanceType: '日常保养', responsible: '赵技师', items: ['表面清洁', '探头消毒'], nextDate: '2026-05-01' },
    ],
    calibrationRecords: [
      { date: '2026-02-10', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2026-00412', validUntil: '2027-02-09' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ004', name: '西门子超声系统 Acuson Sequoia', model: 'Siemens Acuson Sequoia', serial: 'SN2020ASQ001',
    vendor: '西门子', purchaseDate: '2020-11-08', dept: '浅表器官超声室', status: '计量到期', useCount: 6234,
    lastUse: '2026-04-30', nextMaint: '2026-05-20', lifeMonth: 70, deptRate: 95, totalCost: 145000,
    maintCost: 18200, spareCost: 5600,
    purchaseInfo: { purchaseDate: '2020-11-08', supplier: '西门子医疗', contractNo: 'SIE-2020-0388', warrantyExpiry: '2025-11-07' },
    repairRecords: [
      { date: '2026-02-20', repairType: '故障维修', vendor: '西门子维修站', cost: 3200, nextPlan: '2026-05-20', description: '显示器故障' },
    ],
    maintenanceRecords: [
      { date: '2026-04-20', maintenanceType: '季度保养', responsible: '刘工程师', items: ['探头清洁', '图像校准', '功能检测'], nextDate: '2026-07-20' },
    ],
    calibrationRecords: [
      { date: '2025-04-15', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2025-00321', validUntil: '2026-04-14' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ005', name: '迈瑞便携超声 M9', model: 'Mindray M9', serial: 'SN2019M9001',
    vendor: '迈瑞', purchaseDate: '2019-06-01', dept: 'ICU超声室', status: '在用', useCount: 8920,
    lastUse: '2026-04-29', nextMaint: '2026-05-05', lifeMonth: 82, deptRate: 88, totalCost: 198000,
    maintCost: 24600, spareCost: 7800,
    purchaseInfo: { purchaseDate: '2019-06-01', supplier: '迈瑞医疗科技', contractNo: 'MR-2019-0088', warrantyExpiry: '2024-05-31' },
    repairRecords: [
      { date: '2026-03-15', repairType: '预防性维修', vendor: '迈瑞维修站', cost: 3500, nextPlan: '2026-09-15', description: '电池更换' },
    ],
    maintenanceRecords: [
      { date: '2026-03-15', maintenanceType: '年度保养', responsible: '陈工程师', items: ['全面检测', '软件升级', '硬件维护'], nextDate: '2027-03-15' },
    ],
    calibrationRecords: [
      { date: '2026-03-01', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2026-00556', validUntil: '2027-03-01' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ006', name: '日立超声系统 Arietta 850', model: 'Hitachi Arietta 850', serial: 'SN2021HA85001',
    vendor: '日立医疗', purchaseDate: '2021-08-22', dept: '介入超声室', status: '在用', useCount: 3201,
    lastUse: '2026-04-25', nextMaint: '2026-06-15', lifeMonth: 56, deptRate: 58, totalCost: 175000,
    maintCost: 7200, spareCost: 2100,
    purchaseInfo: { purchaseDate: '2021-08-22', supplier: '日立医疗中国', contractNo: 'HIT-2021-0218', warrantyExpiry: '2026-08-21' },
    repairRecords: [
      { date: '2026-01-05', repairType: '预防性维修', vendor: '日立维修站', cost: 500, nextPlan: '2026-07-05', description: '常规检修' },
    ],
    maintenanceRecords: [
      { date: '2026-04-25', maintenanceType: '日常保养', responsible: '周技师', items: ['探头清洁', '机器表面消毒'], nextDate: '2026-05-25' },
    ],
    calibrationRecords: [
      { date: '2026-04-10', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2026-00789', validUntil: '2027-04-09' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ007', name: '飞利浦超声系统 CX50', model: 'Philips CX50', serial: 'SN2018CX5001',
    vendor: '飞利浦', purchaseDate: '2018-09-30', dept: '急诊超声室', status: '待报废', useCount: 5230,
    lastUse: '2026-04-30', nextMaint: '2026-06-10', lifeMonth: 88, deptRate: 78, totalCost: 128000,
    maintCost: 4200, spareCost: 1800,
    purchaseInfo: { purchaseDate: '2018-09-30', supplier: '飞利浦医疗', contractNo: 'PH-2018-0318', warrantyExpiry: '2023-09-29' },
    repairRecords: [
      { date: '2025-12-10', repairType: '故障维修', vendor: '飞利浦维修站', cost: 8500, nextPlan: '-', description: '主板严重老化，维修费用过高' },
    ],
    maintenanceRecords: [
      { date: '2026-04-10', maintenanceType: '季度保养', responsible: '吴工程师', items: ['基本清洁'], nextDate: '2026-07-10' },
    ],
    calibrationRecords: [
      { date: '2025-09-15', institution: '东华区计量测试所', result: '不合格', certificateNo: 'JL-2025-00521', validUntil: '2025-09-14' },
    ],
    scrapInfo: { condition: '维修费用超过原价50%（维修费8500元 > 原价128000元的50%）', applyDate: '2026-04-15', status: '待审批', residualValue: 12000 },
  },
  {
    id: 'EQ008', name: 'GE便携超声 Vivid iq', model: 'GE Vivid iq', serial: 'SN2018VIQ001',
    vendor: 'GE医疗', purchaseDate: '2018-09-30', dept: '床旁超声室', status: '计量到期', useCount: 11230,
    lastUse: '2024-12-31', nextMaint: '-', lifeMonth: 91, deptRate: 100, totalCost: 128000,
    maintCost: 42000, spareCost: 18500,
    purchaseInfo: { purchaseDate: '2018-09-30', supplier: 'GE医疗中国', contractNo: 'GE-2018-0298', warrantyExpiry: '2023-09-29' },
    repairRecords: [
      { date: '2025-06-15', repairType: '故障维修', vendor: 'GE维修站', cost: 12000, nextPlan: '-', description: '核心部件更换' },
    ],
    maintenanceRecords: [
      { date: '2025-12-31', maintenanceType: '日常保养', responsible: '孙技师', items: ['简单清洁'], nextDate: '-' },
    ],
    calibrationRecords: [
      { date: '2025-03-10', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2025-00156', validUntil: '2026-03-09' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ009', name: '迈瑞高端超声 Nuewa I9', model: 'Mindray Nuewa I9', serial: 'SN2022NI9001',
    vendor: '迈瑞', purchaseDate: '2022-11-11', dept: '体检超声室', status: '在用', useCount: 2890,
    lastUse: '2026-04-30', nextMaint: '2026-05-28', lifeMonth: 41, deptRate: 68, totalCost: 192000,
    maintCost: 5600, spareCost: 1900,
    purchaseInfo: { purchaseDate: '2022-11-11', supplier: '迈瑞医疗科技', contractNo: 'MR-2022-0388', warrantyExpiry: '2027-11-10' },
    repairRecords: [
      { date: '2026-02-28', repairType: '预防性维修', vendor: '迈瑞维修站', cost: 1800, nextPlan: '2026-08-28', description: '软件升级' },
    ],
    maintenanceRecords: [
      { date: '2026-04-28', maintenanceType: '季度保养', responsible: '黄工程师', items: ['探头校准', '图像优化'], nextDate: '2026-07-28' },
    ],
    calibrationRecords: [
      { date: '2026-01-20', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2026-00123', validUntil: '2027-01-19' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ010', name: '西门子超声 Acuson Juniper', model: 'Siemens Acuson Juniper', serial: 'SN2021AJN001',
    vendor: '西门子', purchaseDate: '2021-03-15', dept: '血管超声室', status: '在用', useCount: 0,
    lastUse: '2026-04-30', nextMaint: '2026-08-01', lifeMonth: 61, deptRate: 92, totalCost: 280000,
    maintCost: 8000, spareCost: 0,
    purchaseInfo: { purchaseDate: '2021-03-15', supplier: '西门子医疗', contractNo: 'SIE-2021-0118', warrantyExpiry: '2026-03-14' },
    repairRecords: [],
    maintenanceRecords: [
      { date: '2026-04-01', maintenanceType: '日常保养', responsible: '林工程师', items: ['常规检测'], nextDate: '2026-05-01' },
    ],
    calibrationRecords: [
      { date: '2026-03-15', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2026-00578', validUntil: '2027-03-14' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ011', name: '超声探头洗消机 C70', model: '迈瑞 C70', serial: 'SN2020C70001',
    vendor: '迈瑞', purchaseDate: '2020-07-01', dept: '洗消中心', status: '维保中', useCount: 0,
    lastUse: '2026-04-29', nextMaint: '2026-05-03', lifeMonth: 69, deptRate: 78, totalCost: 135000,
    maintCost: 18000, spareCost: 4200,
    purchaseInfo: { purchaseDate: '2020-07-01', supplier: '迈瑞医疗科技', contractNo: 'MR-2020-0218', warrantyExpiry: '2025-06-30' },
    repairRecords: [
      { date: '2026-02-05', repairType: '故障维修', vendor: '迈瑞维修站', cost: 3500, nextPlan: '2026-05-03', description: '泵体更换' },
    ],
    maintenanceRecords: [
      { date: '2026-04-03', maintenanceType: '日常保养', responsible: '徐技师', items: ['管路清洗', '消毒测试'], nextDate: '2026-05-03' },
    ],
    calibrationRecords: [
      { date: '2025-12-01', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2025-00789', validUntil: '2026-11-30' },
    ],
    scrapInfo: null,
  },
  {
    id: 'EQ012', name: '超声记录仪 DS8000', model: '迈瑞 DS8000', serial: 'SN2019DS80001',
    vendor: '迈瑞', purchaseDate: '2019-11-20', dept: '手术室', status: '在用', useCount: 0,
    lastUse: '2026-04-30', nextMaint: '2026-06-20', lifeMonth: 77, deptRate: 65, totalCost: 98000,
    maintCost: 11200, spareCost: 3600,
    purchaseInfo: { purchaseDate: '2019-11-20', supplier: '迈瑞医疗科技', contractNo: 'MR-2019-0368', warrantyExpiry: '2024-11-19' },
    repairRecords: [
      { date: '2025-10-15', repairType: '故障维修', vendor: '迈瑞维修站', cost: 2800, nextPlan: '2026-06-20', description: '记录模块维修' },
    ],
    maintenanceRecords: [
      { date: '2026-03-20', maintenanceType: '季度保养', responsible: '马工程师', items: ['存储检测', '系统维护'], nextDate: '2026-06-20' },
    ],
    calibrationRecords: [
      { date: '2026-02-15', institution: '东华区计量测试所', result: '合格', certificateNo: 'JL-2026-00345', validUntil: '2027-02-14' },
    ],
    scrapInfo: null,
  },
]

const maintenanceRecords = [
  { date: '2026-04-10', device: 'EQ001', type: '预防性维修', cost: 2800, vendor: '迈瑞维修站', result: '合格' },
  { date: '2026-03-28', device: 'EQ003', type: '故障维修', cost: 6200, vendor: 'GE维修站', result: '已修复' },
  { date: '2026-03-15', device: 'EQ005', type: '常规保养', cost: 3500, vendor: '迈瑞维修站', result: '合格' },
  { date: '2026-03-01', device: 'EQ002', type: '配件更换', cost: 4800, vendor: '飞利浦维修站', result: '已修复' },
  { date: '2026-02-20', device: 'EQ004', type: '故障维修', cost: 3200, vendor: '西门子维修站', result: '已修复' },
  { date: '2026-02-05', device: 'EQ011', type: '评估报告', cost: 0, vendor: '设备科', result: '建议报废' },
  { date: '2026-01-18', device: 'EQ001', type: '常规保养', cost: 700, vendor: '迈瑞维修站', result: '合格' },
  { date: '2026-01-05', device: 'EQ006', type: '常规保养', cost: 500, vendor: '日立维修站', result: '合格' },
]

// ===== 样式 =====
const s: Record<string, React.CSSProperties> = {
  root: { padding: 32 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a365d', marginBottom: 24 },
  // 统计卡片区
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  statLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a365d' },
  statSub: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  statGreen: { color: '#16a34a' },
  statOrange: { color: '#d97706' },
  statRed: { color: '#dc2626' },
  statBlue: { color: '#2563eb' },
  // 操作区
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const, alignItems: 'center' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', flex: '0 0 280px' },
  searchInput: { border: 'none', outline: 'none', fontSize: 15, flex: 1, background: 'transparent' },
  select: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none' },
  btn: { padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', minHeight: 44 },
  btnPrimary: { background: '#1a365d', color: '#fff' },
  btnSuccess: { background: '#16a34a', color: '#fff' },
  btnWarning: { background: '#d97706', color: '#fff' },
  btnDanger: { background: '#dc2626', color: '#fff' },
  btnGhost: { background: '#f1f5f9', color: '#475569' },
  // 表格
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { background: '#f8fafc', padding: '12px 16px', textAlign: 'left' as const, fontSize: 14, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  // 状态标签
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeGreen: { background: '#dcfce7', color: '#16a34a' },
  badgeBlue: { background: '#dbeafe', color: '#2563eb' },
  badgeOrange: { background: '#fef3c7', color: '#d97706' },
  badgeGray: { background: '#f1f5f9', color: '#64748b' },
  badgeRed: { background: '#fee2e2', color: '#dc2626' },
  badgeDarkRed: { background: '#b91c1c', color: '#fff' },
  // 详情弹窗
  modal: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalContent: { background: '#fff', borderRadius: 12, padding: 28, width: 900, maxHeight: '85vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#1a365d', marginBottom: 20 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  detailItem: { padding: '10px 14px', background: '#f8fafc', borderRadius: 8 },
  detailLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: 600, color: '#1a365d' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a365d', marginTop: 20, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' },
  progressBar: { height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  costRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
  // 维保计划
  maintAlert: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
  alertTitle: { fontSize: 16, fontWeight: 700, color: '#1a365d', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  alertGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  alertCard: { padding: '14px 16px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  alertName: { fontSize: 14, fontWeight: 600, color: '#1a365d' },
  alertDate: { fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 4 },
  // 标签页
  tabs: { display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' },
  tab: { padding: '10px 24px', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#64748b', borderBottom: '3px solid transparent', transition: 'all 0.2s' },
  tabActive: { color: '#1a365d', borderBottomColor: '#1a365d' },
  empty: { textAlign: 'center' as const, padding: 40, color: '#94a3b8', fontSize: 15 },
  // 计量预警
  calibrationAlert: { background: '#fee2e2', borderRadius: 10, padding: 20, marginBottom: 24, border: '2px solid #dc2626' },
  calibrationAlertOverdue: { background: '#b91c1c', borderRadius: 10, padding: 20, marginBottom: 24, border: '2px solid #7f1d1d' },
  calibrationAlertTitle: { fontSize: 16, fontWeight: 700, color: '#dc2626', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  calibrationAlertTitleOverdue: { fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  calibrationGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  calibrationCard: { padding: '14px 16px', borderRadius: 8, background: '#fff', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  calibrationCardOverdue: { padding: '14px 16px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  // 设备卡片标签
  cardStatusTag: { position: 'absolute' as const, top: 12, right: 12, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  // 生命周期时间轴
  timeline: { display: 'flex', gap: 0, marginTop: 20, position: 'relative' as const },
  timelineNode: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', position: 'relative' as const },
  timelineIcon: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 1 },
  timelineLine: { position: 'absolute' as const, top: 20, left: '50%', width: '100%', height: 2, background: '#e2e8f0', zIndex: 0 },
  timelineLabel: { fontSize: 12, fontWeight: 600, color: '#1a365d', marginTop: 8, textAlign: 'center' as const },
  timelineContent: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' as const },
  // 设备卡片
  deviceCard: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', position: 'relative' as const },
  deviceCardTitle: { fontSize: 15, fontWeight: 700, color: '#1a365d', marginBottom: 8 },
  deviceCardSub: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  deviceCardGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
  deviceCardItem: { padding: '8px 10px', background: '#f8fafc', borderRadius: 6 },
  deviceCardItemLabel: { fontSize: 11, color: '#94a3b8' },
  deviceCardItemValue: { fontSize: 13, fontWeight: 600, color: '#1a365d', marginTop: 2 },
  // 里程碑详情
  milestoneSection: { marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8 },
  milestoneTitle: { fontSize: 14, fontWeight: 700, color: '#1a365d', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  milestoneGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
  milestoneItem: { padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' },
  milestoneItemLabel: { fontSize: 11, color: '#64748b' },
  milestoneItemValue: { fontSize: 13, fontWeight: 600, color: '#1a365d', marginTop: 2 },
  // 设备列表网格
  deviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { style: React.CSSProperties; label: string }> = {
    '在用': { style: s.badgeGreen, label: '在用' },
    '空闲': { style: s.badgeBlue, label: '空闲' },
    '维保中': { style: s.badgeOrange, label: '维保中' },
    '已报废': { style: s.badgeGray, label: '已报废' },
    '计量到期': { style: s.badgeRed, label: '计量到期' },
    '待报废': { style: s.badgeGray, label: '待报废' },
  }
  const b = map[status] || { style: s.badgeGray, label: status }
  return <span style={{ ...s.badge, ...b.style }}>{b.label}</span>
}

function CardStatusTag({ device }: { device: Device }) {
  const now = new Date('2026-04-30')
  const warrantyExpiry = new Date(device.purchaseInfo.warrantyExpiry)
  const inWarranty = warrantyExpiry > now

  const calibrationValid = device.calibrationRecords.length > 0
    && new Date(device.calibrationRecords[0].validUntil) > now

  const isOverdue = device.status === '计量到期'
  const isScrapped = device.status === '待报废' || device.status === '已报废'
  const isInMaintenance = device.status === '维保中'

  let tagStyle: React.CSSProperties
  let tagLabel: string

  if (isScrapped) {
    tagStyle = { ...s.cardStatusTag, background: '#f1f5f9', color: '#64748b' }
    tagLabel = '待报废'
  } else if (isOverdue) {
    tagStyle = { ...s.cardStatusTag, background: '#dc2626', color: '#fff' }
    tagLabel = '计量到期'
  } else if (isInMaintenance) {
    tagStyle = { ...s.cardStatusTag, background: '#d97706', color: '#fff' }
    tagLabel = '维保中'
  } else if (inWarranty) {
    tagStyle = { ...s.cardStatusTag, background: '#16a34a', color: '#fff' }
    tagLabel = '正常（在保）'
  } else {
    tagStyle = { ...s.cardStatusTag, background: '#94a3b8', color: '#fff' }
    tagLabel = '过保'
  }

  return <span style={tagStyle}>{tagLabel}</span>
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={s.progressBar}>
      <div style={{ ...s.progressFill, width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  )
}

function MilestoneNode({ icon, label, content, color }: { icon: string; label: string; content: string; color: string }) {
  return (
    <div style={s.timelineNode}>
      <div style={{ ...s.timelineLine, background: color }} />
      <div style={{ ...s.timelineIcon, background: color, color: '#fff' }}>{icon}</div>
      <div style={s.timelineLabel}>{label}</div>
      <div style={s.timelineContent}>{content}</div>
    </div>
  )
}

function CalibrationWarningSection({ devices }: { devices: Device[] }) {
  const now = new Date('2026-04-30')
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const overdueDevices = devices.filter(d => {
    if (d.status === '已报废' || d.status === '待报废') return false
    if (d.calibrationRecords.length === 0) return false
    return new Date(d.calibrationRecords[0].validUntil) < now
  })

  const soonExpireDevices = devices.filter(d => {
    if (d.status === '已报废' || d.status === '待报废') return false
    if (d.calibrationRecords.length === 0) return false
    const validUntil = new Date(d.calibrationRecords[0].validUntil)
    return validUntil >= now && validUntil <= thirtyDaysLater
  })

  return (
    <>
      {overdueDevices.length > 0 && (
        <div style={s.calibrationAlertOverdue}>
          <div style={s.calibrationAlertTitleOverdue}>
            <AlertTriangle size={18} color="#fff" />
            超期未检 — {overdueDevices.length} 台设备计量检定已超期，请立即安排送检
          </div>
          <div style={s.calibrationGrid}>
            {overdueDevices.map(d => {
              const latest = d.calibrationRecords[0]
              const expiredDate = new Date(latest.validUntil)
              const daysOverdue = Math.ceil((now.getTime() - expiredDate.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={d.id} style={s.calibrationCardOverdue}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 2 }}>{d.id} · {d.dept}</div>
                    <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 4 }}>
                      已超期 {daysOverdue} 天 · 证书: {latest.certificateNo}
                    </div>
                  </div>
                  <button style={{ ...s.btn, ...s.btnDanger, fontSize: 12, padding: '6px 12px' }}>
                    立即送检
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {soonExpireDevices.length > 0 && (
        <div style={s.calibrationAlert}>
          <div style={s.calibrationAlertTitle}>
            <Gauge size={18} color="#dc2626" />
            计量到期预警 — {soonExpireDevices.length} 台设备将在30天内到期，请提前安排检定
          </div>
          <div style={s.calibrationGrid}>
            {soonExpireDevices.map(d => {
              const latest = d.calibrationRecords[0]
              const validUntil = new Date(latest.validUntil)
              const daysLeft = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={d.id} style={s.calibrationCard}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a365d' }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{d.id} · {d.dept}</div>
                    <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                      还剩 {daysLeft} 天 · {latest.certificateNo}
                    </div>
                  </div>
                  <button style={{ ...s.btn, ...s.btnWarning, fontSize: 12, padding: '6px 12px' }}>
                    预约检定
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function DeviceLifecycleCard({ device }: { device: Device }) {
  const [expanded, setExpanded] = useState(false)

  const latestRepair = device.repairRecords[0]
  const latestMaintenance = device.maintenanceRecords[0]
  const latestCalibration = device.calibrationRecords[0]

  const timelineItems = [
    {
      icon: '📋',
      label: '采购入库',
      content: device.purchaseInfo.purchaseDate,
      color: '#1a365d',
    },
    {
      icon: '🔧',
      label: '维修记录',
      content: latestRepair ? `${latestRepair.date} · ¥${latestRepair.cost.toLocaleString()}` : '暂无记录',
      color: latestRepair ? '#d97706' : '#e2e8f0',
    },
    {
      icon: '📅',
      label: '保养计划',
      content: latestMaintenance ? `${latestMaintenance.maintenanceType} · ${latestMaintenance.responsible}` : '暂无记录',
      color: latestMaintenance ? '#16a34a' : '#e2e8f0',
    },
    {
      icon: '📐',
      label: '计量检测',
      content: latestCalibration ? `${latestCalibration.result} · ${latestCalibration.validUntil}` : '暂无记录',
      color: latestCalibration && new Date(latestCalibration.validUntil) > new Date('2026-04-30') ? '#2563eb' : '#dc2626',
    },
    {
      icon: '🗑️',
      label: '报废申请',
      content: device.scrapInfo ? `${device.scrapInfo.status} · ¥${device.scrapInfo.residualValue.toLocaleString()}` : '未申请',
      color: device.scrapInfo ? '#64748b' : '#e2e8f0',
    },
  ]

  return (
    <div style={s.deviceCard}>
      <CardStatusTag device={device} />

      <div style={s.deviceCardTitle}>{device.name}</div>
      <div style={s.deviceCardSub}>{device.id} · {device.model} · {device.dept}</div>

      <div style={s.deviceCardGrid}>
        <div style={s.deviceCardItem}>
          <div style={s.deviceCardItemLabel}>使用次数</div>
          <div style={s.deviceCardItemValue}>{device.useCount > 0 ? device.useCount.toLocaleString() : '-'}</div>
        </div>
        <div style={s.deviceCardItem}>
          <div style={s.deviceCardItemLabel}>使用率</div>
          <div style={s.deviceCardItemValue}>{device.deptRate}%</div>
        </div>
        <div style={s.deviceCardItem}>
          <div style={s.deviceCardItemLabel}>下次维保</div>
          <div style={{ ...s.deviceCardItemValue, color: device.nextMaint === '-' ? '#94a3b8' : '#1a365d' }}>
            {device.nextMaint === '-' ? '无计划' : device.nextMaint}
          </div>
        </div>
        <div style={s.deviceCardItem}>
          <div style={s.deviceCardItemLabel}>资产价值</div>
          <div style={s.deviceCardItemValue}>¥{device.totalCost.toLocaleString()}</div>
        </div>
      </div>

      {/* 横向时间轴 */}
      <div style={s.timeline}>
        {timelineItems.map((item, idx) => (
          <React.Fragment key={item.label}>
            <MilestoneNode {...item} />
            {idx < timelineItems.length - 1 && <div style={{ position: 'absolute', left: `${(idx + 1) * 20}%`, top: 20, width: 'calc(20% - 40px)', height: 2, background: '#e2e8f0', zIndex: 0 }} />}
          </React.Fragment>
        ))}
      </div>

      {/* 展开详情 */}
      <div style={{ marginTop: 16, textAlign: 'center' as const }}>
        <button
          style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 16px' }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起详情' : '查看详情'}
        </button>
      </div>

      {expanded && (
        <div style={s.milestoneSection}>
          {/* 采购信息 */}
          <div style={s.milestoneTitle}>
            <Package size={16} color="#1a365d" />
            📋 采购入库
          </div>
          <div style={s.milestoneGrid}>
            <div style={s.milestoneItem}>
              <div style={s.milestoneItemLabel}>采购日期</div>
              <div style={s.milestoneItemValue}>{device.purchaseInfo.purchaseDate}</div>
            </div>
            <div style={s.milestoneItem}>
              <div style={s.milestoneItemLabel}>供应商</div>
              <div style={s.milestoneItemValue}>{device.purchaseInfo.supplier}</div>
            </div>
            <div style={s.milestoneItem}>
              <div style={s.milestoneItemLabel}>合同号</div>
              <div style={s.milestoneItemValue}>{device.purchaseInfo.contractNo}</div>
            </div>
            <div style={s.milestoneItem}>
              <div style={s.milestoneItemLabel}>保修期截止</div>
              <div style={{ ...s.milestoneItemValue, color: new Date(device.purchaseInfo.warrantyExpiry) > new Date('2026-04-30') ? '#16a34a' : '#dc2626' }}>
                {device.purchaseInfo.warrantyExpiry}
              </div>
            </div>
          </div>

          {/* 维修记录 */}
          {device.repairRecords.length > 0 && (
            <>
              <div style={{ ...s.milestoneTitle, marginTop: 16 }}>
                <Wrench size={16} color="#d97706" />
                🔧 维修记录
              </div>
              {device.repairRecords.map((r, idx) => (
                <div key={idx} style={{ ...s.milestoneGrid, marginBottom: 8 }}>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>最近维修日期</div>
                    <div style={s.milestoneItemValue}>{r.date}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>维修类型</div>
                    <div style={s.milestoneItemValue}>{r.repairType}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>维修厂商</div>
                    <div style={s.milestoneItemValue}>{r.vendor}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>维修费用</div>
                    <div style={s.milestoneItemValue}>¥{r.cost.toLocaleString()}</div>
                  </div>
                  <div style={{ ...s.milestoneItem, gridColumn: '1 / -1' }}>
                    <div style={s.milestoneItemLabel}>维修说明</div>
                    <div style={s.milestoneItemValue}>{r.description}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>下次维修计划</div>
                    <div style={{ ...s.milestoneItemValue, color: r.nextPlan === '-' ? '#94a3b8' : '#1a365d' }}>
                      {r.nextPlan === '-' ? '无' : r.nextPlan}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* 保养计划 */}
          {device.maintenanceRecords.length > 0 && (
            <>
              <div style={{ ...s.milestoneTitle, marginTop: 16 }}>
                <Calendar size={16} color="#16a34a" />
                📅 保养计划
              </div>
              {device.maintenanceRecords.map((m, idx) => (
                <div key={idx} style={{ ...s.milestoneGrid, marginBottom: 8 }}>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>最近保养日期</div>
                    <div style={s.milestoneItemValue}>{m.date}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>保养类型</div>
                    <div style={s.milestoneItemValue}>{m.maintenanceType}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>保养负责人</div>
                    <div style={s.milestoneItemValue}>{m.responsible}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>下次保养日期</div>
                    <div style={{ ...s.milestoneItemValue, color: m.nextDate === '-' ? '#94a3b8' : '#16a34a' }}>
                      {m.nextDate === '-' ? '无计划' : m.nextDate}
                    </div>
                  </div>
                  <div style={{ ...s.milestoneItem, gridColumn: '1 / -1' }}>
                    <div style={s.milestoneItemLabel}>保养项目清单</div>
                    <div style={s.milestoneItemValue}>{m.items.join(' · ')}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* 计量检测 */}
          {device.calibrationRecords.length > 0 && (
            <>
              <div style={{ ...s.milestoneTitle, marginTop: 16 }}>
                <Gauge size={16} color="#2563eb" />
                📐 计量检测
              </div>
              {device.calibrationRecords.map((c, idx) => (
                <div key={idx} style={{ ...s.milestoneGrid, marginBottom: 8 }}>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>最近计量日期</div>
                    <div style={s.milestoneItemValue}>{c.date}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>计量机构</div>
                    <div style={s.milestoneItemValue}>{c.institution}</div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>检定结论</div>
                    <div style={{ ...s.milestoneItemValue, color: c.result === '合格' ? '#16a34a' : '#dc2626' }}>
                      {c.result}
                    </div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>有效期至</div>
                    <div style={{ ...s.milestoneItemValue, color: new Date(c.validUntil) > new Date('2026-04-30') ? '#1a365d' : '#dc2626' }}>
                      {c.validUntil}
                    </div>
                  </div>
                  <div style={s.milestoneItem}>
                    <div style={s.milestoneItemLabel}>证书编号</div>
                    <div style={s.milestoneItemValue}>{c.certificateNo}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* 报废申请 */}
          {device.scrapInfo && (
            <>
              <div style={{ ...s.milestoneTitle, marginTop: 16 }}>
                <Trash size={16} color="#64748b" />
                🗑️ 报废申请
              </div>
              <div style={s.milestoneGrid}>
                <div style={s.milestoneItem}>
                  <div style={s.milestoneItemLabel}>报废条件</div>
                  <div style={s.milestoneItemValue}>{device.scrapInfo.condition}</div>
                </div>
                <div style={s.milestoneItem}>
                  <div style={s.milestoneItemLabel}>报废申请日期</div>
                  <div style={s.milestoneItemValue}>{device.scrapInfo.applyDate}</div>
                </div>
                <div style={s.milestoneItem}>
                  <div style={s.milestoneItemLabel}>审批状态</div>
                  <div style={{
                    ...s.milestoneItemValue,
                    color: device.scrapInfo.status === '已批准' ? '#16a34a' : device.scrapInfo.status === '已拒绝' ? '#dc2626' : '#d97706'
                  }}>
                    {device.scrapInfo.status}
                  </div>
                </div>
                <div style={s.milestoneItem}>
                  <div style={s.milestoneItemLabel}>残值评估</div>
                  <div style={s.milestoneItemValue}>¥{device.scrapInfo.residualValue.toLocaleString()}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function EquipmentLifecyclePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [activeTab, setActiveTab] = useState('设备列表')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showScrap, setShowScrap] = useState(false)
  const [deviceToScrap, setDeviceToScrap] = useState<Device | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  const filtered = mockDevices.filter(d => {
    const matchSearch = d.name.includes(search) || d.model.includes(search) || d.id.includes(search)
    const matchStatus = statusFilter === '全部' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const now = new Date('2026-04-30')
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const soonExpire = mockDevices.filter(d => {
    if (d.status === '已报废' || d.status === '待报废') return false
    const next = new Date(d.nextMaint)
    if (d.nextMaint === '-') return false
    const diff = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff >= 0
  })

  const calibrationSoonExpire = mockDevices.filter(d => {
    if (d.status === '已报废' || d.status === '待报废') return false
    if (d.calibrationRecords.length === 0) return false
    const validUntil = new Date(d.calibrationRecords[0].validUntil)
    return validUntil >= now && validUntil <= thirtyDaysLater
  })

  const calibrationOverdue = mockDevices.filter(d => {
    if (d.status === '已报废' || d.status === '待报废') return false
    if (d.calibrationRecords.length === 0) return false
    return new Date(d.calibrationRecords[0].validUntil) < now
  })

  const totalValue = mockDevices.filter(d => d.status !== '已报废').reduce((sum, d) => sum + d.totalCost, 0)

  return (
    <div style={s.root}>
      <div style={s.title}>设备全生命周期管理</div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {['设备列表', '维保计划', '维保记录'].map(t => (
          <div
            key={t}
            style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {activeTab === '设备列表' && (
        <>
          {/* 统计卡片 */}
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <div style={s.statLabel}>设备总数</div>
              <div style={s.statValue}>{mockDevices.length}</div>
              <div style={s.statSub}>在用 {mockDevices.filter(d => d.status === '在用').length} 台</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statLabel}>在用设备</div>
              <div style={{ ...s.statValue, ...s.statGreen }}>{mockDevices.filter(d => d.status === '在用').length}</div>
              <div style={s.statSub}>使用率 78%</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statLabel}>维保中</div>
              <div style={{ ...s.statValue, ...s.statOrange }}>{mockDevices.filter(d => d.status === '维保中').length}</div>
              <div style={s.statSub}>含故障处理</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statLabel}>计量预警</div>
              <div style={{ ...s.statValue, ...s.statRed }}>{calibrationSoonExpire.length + calibrationOverdue.length}</div>
              <div style={s.statSub}>到期/超期未检</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statLabel}>资产总值</div>
              <div style={s.statValue}>{Math.round(totalValue / 10000)}万</div>
              <div style={s.statSub}>设备累计折旧</div>
            </div>
          </div>

          {/* 计量到期预警 */}
          <CalibrationWarningSection devices={mockDevices} />

          {/* 维保到期提醒 */}
          {soonExpire.length > 0 && (
            <div style={s.maintAlert}>
              <div style={s.alertTitle}>
                <AlertTriangle size={18} color="#d97706" />
                维保到期提醒 — {soonExpire.length} 台设备将在30天内到期
              </div>
              <div style={s.alertGrid}>
                {soonExpire.map(d => {
                  const next = new Date(d.nextMaint)
                  const days = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={d.id} style={s.alertCard}>
                      <div>
                        <div style={s.alertName}>{d.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{d.id} · {d.dept}</div>
                        <div style={s.alertDate}>还剩 {days} 天</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>预约维保</button>
                        <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }} onClick={() => { setSelectedDevice(d); setActiveTab('维保记录') }}>记录</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 工具栏 */}
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索设备名称/型号/编号" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="全部">全部状态</option>
              <option value="在用">在用</option>
              <option value="空闲">空闲</option>
              <option value="维保中">维保中</option>
              <option value="计量到期">计量到期</option>
              <option value="待报废">待报废</option>
              <option value="已报废">已报废</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...s.btn, ...s.btnGhost, padding: '8px 12px', background: viewMode === 'table' ? '#1a365d' : '#f1f5f9', color: viewMode === 'table' ? '#fff' : '#475569' }}
                onClick={() => setViewMode('table')}
              >
                表格
              </button>
              <button
                style={{ ...s.btn, ...s.btnGhost, padding: '8px 12px', background: viewMode === 'card' ? '#1a365d' : '#f1f5f9', color: viewMode === 'card' ? '#fff' : '#475569' }}
                onClick={() => setViewMode('card')}
              >
                卡片
              </button>
            </div>
            <div style={{ flex: 1 }} />
            <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => setShowAdd(true)}>
              <Plus size={16} /> 添加设备
            </button>
          </div>

          {/* 表格视图 */}
          {viewMode === 'table' && (
            <table style={s.table}>
              <thead>
                <tr>
                  {['设备编号', '设备名称', '型号', '使用科室', '状态', '使用次数', '下次维保', '使用率', '操作'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={s.empty}>暂无设备数据</td></tr>
                )}
                {filtered.map(d => {
                  const calibrationExpired = d.calibrationRecords.length > 0 && new Date(d.calibrationRecords[0].validUntil) < now
                  const isCalibrationWarning = calibrationSoonExpire.includes(d) || calibrationOverdue.includes(d)
                  return (
                    <tr key={d.id} style={{ background: d.status === '已报废' ? '#f8fafc' : '#fff' }}>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>{d.id}</span></td>
                      <td style={s.td}><span style={{ fontWeight: 600 }}>{d.name}</span></td>
                      <td style={s.td}>{d.model}</td>
                      <td style={s.td}>{d.dept}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusBadge status={d.status} />
                          {isCalibrationWarning && <span style={{ fontSize: 12 }}>⚠️</span>}
                        </div>
                      </td>
                      <td style={s.td}>{d.useCount > 0 ? d.useCount.toLocaleString() : '-'}</td>
                      <td style={s.td}>
                        {d.nextMaint === '-' ? '-' : (
                          <span style={{ color: soonExpire.includes(d) ? '#dc2626' : '#334155', fontWeight: soonExpire.includes(d) ? 600 : 400 }}>
                            {d.nextMaint}
                          </span>
                        )}
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80 }}>
                            <ProgressBar value={d.deptRate} color={d.deptRate >= 80 ? '#16a34a' : d.deptRate >= 50 ? '#d97706' : '#94a3b8'} />
                          </div>
                          <span style={{ fontSize: 13, color: '#64748b' }}>{d.deptRate}%</span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }} onClick={() => setSelectedDevice(d)}>详情</button>
                          {d.status !== '已报废' && d.status !== '待报废' && (
                            <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }} onClick={() => { setDeviceToScrap(d); setShowScrap(true) }}>报废</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* 卡片视图 */}
          {viewMode === 'card' && (
            <div style={s.deviceGrid}>
              {filtered.map(d => (
                <DeviceLifecycleCard key={d.id} device={d} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === '维保计划' && (
        <div>
          <div style={s.toolbar}>
            <button style={{ ...s.btn, ...s.btnPrimary }}>
              <Plus size={16} /> 新建维保计划
            </button>
          </div>
          <div style={{ ...s.maintAlert, marginTop: 0 }}>
            <div style={s.alertTitle}>
              <Clock size={18} color="#2563eb" />
              未来90天维保日历
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
              2026年5月—7月维保计划（共 {mockDevices.filter(d => d.status !== '已报废').length} 台设备需维保）
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  {['设备名称', '型号', '维保类型', '计划日期', '距今天数', '服务商', '费用', '操作'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { device: 'EQ001', name: '迈瑞超声诊断系统 Resona 7', model: 'Mindray Resona 7', type: '常规保养', date: '2026-05-15', days: 15, vendor: '迈瑞维修站', cost: 2800 },
                  { device: 'EQ005', name: '迈瑞便携超声 M9', model: 'Mindray M9', type: '常规保养', date: '2026-05-05', days: 5, vendor: '迈瑞维修站', cost: 3500 },
                  { device: 'EQ003', name: 'GE超声系统 Voluson E10', model: 'GE Voluson E10', type: '故障维修', date: '2026-05-01', days: 1, vendor: 'GE维修站', cost: 6200 },
                  { device: 'EQ004', name: '西门子超声系统 Acuson Sequoia', model: 'Siemens Acuson Sequoia', type: '故障维修', date: '2026-05-20', days: 20, vendor: '西门子维修站', cost: 3200 },
                  { device: 'EQ002', name: '飞利浦超声系统 EPIQ 7C', model: 'Philips EPIQ 7C', type: '配件更换', date: '2026-06-01', days: 32, vendor: '飞利浦维修站', cost: 4800 },
                  { device: 'EQ006', name: '日立超声系统 Arietta 850', model: 'Hitachi Arietta 850', type: '常规保养', date: '2026-06-15', days: 46, vendor: '日立维修站', cost: 500 },
                  { device: 'EQ011', name: '超声探头洗消机 C70', model: '迈瑞 C70', type: '评估报告', date: '2026-05-03', days: 3, vendor: '设备科', cost: 0 },
                  { device: 'EQ012', name: '超声记录仪 DS8000', model: '迈瑞 DS8000', type: '常规保养', date: '2026-06-20', days: 51, vendor: '迈瑞维修站', cost: 2200 },
                ].map((m, i) => (
                  <tr key={i}>
                    <td style={s.td}><span style={{ fontWeight: 600 }}>{m.name}</span></td>
                    <td style={s.td}>{m.model}</td>
                    <td style={s.td}><StatusBadge status={m.type === '故障维修' ? '维保中' : '在用'} /></td>
                    <td style={s.td}>{m.date}</td>
                    <td style={s.td}>
                      <span style={{ color: m.days <= 7 ? '#dc2626' : m.days <= 30 ? '#d97706' : '#334155', fontWeight: m.days <= 7 ? 700 : 400 }}>
                        {m.days <= 7 ? `⚠ ${m.days}天后` : `${m.days}天后`}
                      </span>
                    </td>
                    <td style={s.td}>{m.vendor}</td>
                    <td style={s.td}>¥{m.cost.toLocaleString()}</td>
                    <td style={s.td}>
                      <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>确认</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === '维保记录' && (
        <div>
          <div style={s.toolbar}>
            <button style={{ ...s.btn, ...s.btnPrimary }}>
              <Plus size={16} /> 记录维保
            </button>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                {['日期', '设备编号', '设备名称', '维保类型', '费用', '服务商', '结果', '操作'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map((r, i) => {
                const dev = mockDevices.find(d => d.id === r.device)
                return (
                  <tr key={i}>
                    <td style={s.td}>{r.date}</td>
                    <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>{r.device}</span></td>
                    <td style={s.td}>{dev?.name || r.device}</td>
                    <td style={s.td}><StatusBadge status={r.type === '故障维修' ? '维保中' : '在用'} /></td>
                    <td style={s.td}>{r.cost > 0 ? `¥${r.cost.toLocaleString()}` : '-'}</td>
                    <td style={s.td}>{r.vendor}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...(r.result === '合格' || r.result === '已修复' ? s.badgeGreen : r.result === '建议报废' ? s.badgeRed : s.badgeOrange) }}>
                        {r.result}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>详情</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* 成本汇总 */}
          <div style={{ marginTop: 24, background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a365d', marginBottom: 16 }}>维保成本汇总</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: '累计维保费用', value: `¥${maintenanceRecords.filter(r => r.cost > 0).reduce((s, r) => s + r.cost, 0).toLocaleString()}`, color: '#1a365d' },
                { label: '累计配件费用', value: `¥${mockDevices.reduce((s, d) => s + d.spareCost, 0).toLocaleString()}`, color: '#1a365d' },
                { label: '设备总价值', value: `¥${totalValue.toLocaleString()}`, color: '#1a365d' },
                { label: '维保费用占设备比', value: `${Math.round(maintenanceRecords.reduce((s, r) => s + r.cost, 0) / totalValue * 100)}%`, color: '#d97706' },
              ].map(item => (
                <div key={item.label} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center' as const }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 设备详情弹窗 */}
      {selectedDevice && (
        <div style={s.modal} onClick={() => setSelectedDevice(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>设备详情 — {selectedDevice.name}</div>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '6px' }} onClick={() => setSelectedDevice(null)}><X size={18} /></button>
            </div>

            {/* 基本信息 */}
            <div style={s.detailGrid}>
              {[
                { label: '设备编号', value: selectedDevice.id },
                { label: '设备名称', value: selectedDevice.name },
                { label: '型号', value: selectedDevice.model },
                { label: '序列号', value: selectedDevice.serial },
                { label: '厂商', value: selectedDevice.vendor },
                { label: '使用科室', value: selectedDevice.dept },
                { label: '购置日期', value: selectedDevice.purchaseDate },
                { label: '设备状态', value: selectedDevice.status },
              ].map(item => (
                <div key={item.label} style={s.detailItem}>
                  <div style={s.detailLabel}>{item.label}</div>
                  <div style={s.detailValue}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={s.sectionTitle}>使用情况</div>
            <div style={s.detailGrid}>
              {[
                { label: '累计使用次数', value: selectedDevice.useCount > 0 ? `${selectedDevice.useCount.toLocaleString()} 次` : '无统计数据' },
                { label: '最近使用日期', value: selectedDevice.lastUse },
                { label: '使用率', value: `${selectedDevice.deptRate}%` },
                { label: '剩余寿命', value: `${selectedDevice.lifeMonth} 个月` },
              ].map(item => (
                <div key={item.label} style={s.detailItem}>
                  <div style={s.detailLabel}>{item.label}</div>
                  <div style={s.detailValue}>{item.value}</div>
                  {item.label === '使用率' && (
                    <ProgressBar value={selectedDevice.deptRate} color={selectedDevice.deptRate >= 80 ? '#16a34a' : selectedDevice.deptRate >= 50 ? '#d97706' : '#94a3b8'} />
                  )}
                </div>
              ))}
            </div>

            <div style={s.sectionTitle}>采购信息</div>
            <div style={s.detailGrid}>
              {[
                { label: '采购日期', value: selectedDevice.purchaseInfo.purchaseDate },
                { label: '供应商', value: selectedDevice.purchaseInfo.supplier },
                { label: '合同号', value: selectedDevice.purchaseInfo.contractNo },
                { label: '保修期截止', value: selectedDevice.purchaseInfo.warrantyExpiry },
              ].map(item => (
                <div key={item.label} style={s.detailItem}>
                  <div style={s.detailLabel}>{item.label}</div>
                  <div style={{ ...s.detailValue, color: item.label === '保修期截止' && new Date(item.value) < now ? '#dc2626' : '#1a365d' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={s.sectionTitle}>成本分析</div>
            <div style={{ ...s.detailGrid, gridTemplateColumns: '1fr' }}>
              {[
                { label: '设备采购价值', value: `¥${selectedDevice.totalCost.toLocaleString()}` },
                { label: '累计维保费用', value: `¥${selectedDevice.maintCost.toLocaleString()}` },
                { label: '累计配件费用', value: `¥${selectedDevice.spareCost.toLocaleString()}` },
                { label: '综合维护成本', value: `¥${(selectedDevice.maintCost + selectedDevice.spareCost).toLocaleString()}`, highlight: true },
              ].map(item => (
                <div key={item.label} style={{ ...s.detailItem, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={s.detailLabel}>{item.label}</div>
                  <div style={{ ...s.detailValue, color: item.highlight ? '#dc2626' : '#1a365d' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 添加设备弹窗 */}
      {showAdd && (
        <div style={s.modal} onClick={() => setShowAdd(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>添加新设备</div>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '6px' }} onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['设备名称', '设备型号', '序列号', '厂商', '购置日期', '使用科室', '采购金额'].map(field => (
                <div key={field} style={s.detailItem}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{field}</div>
                  <input style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 14, width: '100%', outline: 'none', background: '#fff' }} placeholder={`请输入${field}`} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowAdd(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnSuccess }}>保存设备</button>
            </div>
          </div>
        </div>
      )}

      {/* 报废确认弹窗 */}
      {showScrap && deviceToScrap && (
        <div style={s.modal} onClick={() => setShowScrap(false)}>
          <div style={{ ...s.modalContent, width: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <AlertTriangle size={28} color="#dc2626" />
              <div style={s.modalTitle}>确认报废设备</div>
            </div>
            <div style={{ fontSize: 15, color: '#334155', marginBottom: 20 }}>
              确定要报废以下设备吗？报废后设备将从在用列表移除。<br />
              <strong>{deviceToScrap.name}</strong>（{deviceToScrap.id}）
            </div>
            <div style={{ padding: 14, background: '#fee2e2', borderRadius: 8, fontSize: 14, color: '#dc2626', marginBottom: 20 }}>
              警告：设备报废不可逆。历史使用记录和维保数据将保留。
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowScrap(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => { setShowScrap(false); setDeviceToScrap(null) }}>确认报废</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
