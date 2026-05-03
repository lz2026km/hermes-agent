// ============================================================
// G003 超声RIS系统 - 洗消追溯增强页面
// 超越美迪康基础版：全流程追溯+设备管理+质控预警+RFID+生物监测+超声患者关联
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Calendar, Clock, User, Activity, AlertTriangle,
  Package, Droplets, Wind, Box, ClipboardCheck, CheckCircle,
  XCircle, RefreshCw, Eye, Filter, TrendingUp, Wrench,
  Monitor, AlertCircle, ScanLine, BarChart3, Plus,
  Radio, Thermometer, FlaskConical, TestTube, Layers,
  ArrowRight, FileText, Download, Printer, CheckSquare,
  Clock3, AlertOctagon, ShieldCheck, Leaf, X, Edit
} from 'lucide-react'

// ---------- 数据类型 ----------
type DisinfectionStepStatus = 'qualified' | 'unqualified' | 'abnormal' | 'pending'

interface DisinfectionStep {
  name: string
  timestamp: string
  operator: string
  equipment: string
  result: DisinfectionStepStatus
  details?: Record<string, string | number | undefined>
}

interface RFIDScan {
  scanTime: string
  scanLocation: string
  operator: string
  tagId: string
  ultrasoundDeviceId: string
  result: 'success' | 'fail'
}

interface DisinfectantRecord {
  id: string
  disinfectantName: string
  concentration: number
  standardMin: number
  standardMax: number
  testTime: string
  operator: string
  equipment: string
  result: 'qualified' | 'unqualified'
  validUntil: string
}

interface CleaningStaffRecord {
  id: string
  name: string
  certificateNo: string
  certificateType: string
  issueDate: string
  expireDate: string
  lastTrainingDate: string
  status: 'valid' | 'expired' | 'training'
}

interface BiologicalMonitoringRecord {
  id: string
  ultrasoundDeviceId: string
  testTime: string
  testType: '培养法' | 'PCR法' | '快速检测'
  testResult: 'negative' | 'positive' | 'pending'
  reportNo: string
  tester: string
  auditor: string
  conclusion: string
}

interface DevicePatientLink {
  id: string
  ultrasoundDeviceId: string
  patientName: string
  patientId: string
  procedureType: string
  procedureTime: string
  doctor: string
  room: string
  previousPatientName?: string
  previousPatientId?: string
  previousProcedureTime?: string
  bioResult?: 'negative' | 'positive'
}

interface AirCultureRecord {
  id: string
  location: string
  sampleTime: string
  testResult: string
  cfu: number
  standard: string
  conclusion: 'qualified' | 'unqualified' | 'pending'
  tester: string
  remark?: string
}

interface DisinfectionRecord {
  id: string
  ultrasoundDeviceId: string
  ultrasoundDeviceModel: string
  patientName: string
  procedureType: string
  startTime: string
  endTime: string
  steps: DisinfectionStep[]
  finalResult: 'qualified' | 'unqualified' | 'abnormal'
  operator: string
  rfidScans: RFIDScan[]
  disinfectantRecords: DisinfectantRecord[]
  biologicalMonitoring?: BiologicalMonitoringRecord
  ultrasoundDevicePatientLink?: DevicePatientLink
  airCulture?: AirCultureRecord
}

interface DeviceUsage {
  id: string
  ultrasoundDeviceId: string
  model: string
  patientName: string
  checkType: string
  useTime: string
  status: 'in_use' | 'pending' | 'cleaning' | 'ready' | 'maintenance'
  nextCleanTime: string
  useCount: number
}

interface DisinfectionEquipment {
  id: string
  name: string
  model: string
  todayUses: number
  weekUses: number
  lastMaintenance: string
  status: 'running' | 'idle' | 'maintenance' | 'fault'
  temperature?: number
  pressure?: number
}

interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  maintenanceType: string
  date: string
  engineer: string
  result: string
}

interface QualityAlert {
  id: string
  alertTime: string
  ultrasoundDeviceId: string
  alertType: 'concentration' | 'time' | 'equipment' | 'missing' | 'biological' | 'rfid'
  detail: string
  handleStatus: 'pending' | 'processing' | 'resolved'
}

// ---------- 模拟数据生成函数 ----------
const generateDisinfectionRecords = (): DisinfectionRecord[] => {
  const stepsTemplate = [
    { name: '回收', icon: Package, sub: '' },
    { name: '测漏', icon: ScanLine, sub: '' },
    { name: '预处理', icon: Droplets, sub: '' },
    { name: '清洗', icon: Layers, sub: '(机器)' },
    { name: '消毒', icon: Activity, sub: '(高水平)' },
    { name: '干燥', icon: Wind, sub: '' },
    { name: '储存', icon: Box, sub: '' },
    { name: '发放', icon: ClipboardCheck, sub: '' },
  ]

  const records: DisinfectionRecord[] = []
  const operators = ['张伟', '李娜', '王芳', '刘洋', '陈静', '赵鹏', '孙磊']
  const ultrasoundDeviceModels = ['Mindray C5-2', 'Philips L12-4E', 'GE P4-2', 'Siemens CA1-5A', 'Mindray EC4-9', 'Philips ML6-15']
  const patients = ['王建国', '李秀英', '张德明', '刘玉兰', '陈志强', '杨桂花', '赵文博', '吴晓燕', '周伟平', '郑美华', '孙立新', '朱红梅', '马文涛', '胡丽娜', '郭永强']
  const procedures = ['腹部超声检查', '浅表超声检查', '介入超声', '肺部超声', '心脏超声', '妇产科超声', '血管超声']
  const disinfectantNames = ['戊二醛 2%', '过氧乙酸 0.2%', '邻苯二甲醛 0.55%', '次氯酸钠 5%']

  for (let i = 0; i < 60; i++) {
    const baseTime = new Date(2026, 3, 28 - Math.floor(i / 8), 8 + (i % 12), 30 - (i % 30))
    const ultrasoundDeviceModel = ultrasoundDeviceModels[i % ultrasoundDeviceModels.length]
    const ultrasoundDeviceId = `ES-${String(100 + (i % 12)).padStart(4, '0')}`

    const steps: DisinfectionStep[] = stepsTemplate.map((step, idx) => {
      const stepTime = new Date(baseTime.getTime() + idx * 20 * 60000)
      const hasAbnormal = i === 3 || i === 15 || i === 27 || i === 45
      const stepResult = hasAbnormal && idx === 4 ? 'abnormal' : (i === 7 && idx === 5 ? 'unqualified' : 'qualified')
      const stepDuration = step.name === '清洗' ? 15 + (i % 10) : step.name === '消毒' ? 20 : step.name === '干燥' ? 10 : 5

      return {
        name: step.name + (step.sub || ''),
        timestamp: stepTime.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        operator: operators[idx % operators.length],
        equipment: `洗消机-${(i % 4) + 1}号`,
        result: stepResult,
        details: step.name === '回收' ? { patientName: patients[i % patients.length], procedure: procedures[i % procedures.length] } :
                 step.name === '测漏' ? { pressure: 180 + (i % 20), result: '正常' } :
                 step.name === '预处理' ? { temperature: 25 + (i % 10), detergent: '中性清洗剂', waterTemp: 22 } :
                 step.name === '清洗' ? { waterTemp: 35 + (i % 8), cycle: '标准', duration: stepDuration } :
                 step.name === '消毒' ? { disinfectant: disinfectantNames[i % disinfectantNames.length], concentration: 2.0 + (i % 10) * 0.1, time: stepDuration, temperature: 25 + (i % 5) } :
                 step.name === '干燥' ? { duration: stepDuration, method: '高压气枪干燥' } :
                 step.name === '储存' ? { cabinetTemp: 22 + (i % 5), humidity: 40 + (i % 10), validHours: 240 } :
                 { approvalDoctor: operators[idx % operators.length], approvalResult: '放行' }
      }
    })

    // RFID扫描记录
    const rfidScans: RFIDScan[] = [
      { scanTime: steps[0].timestamp, scanLocation: '超声室1', operator: operators[0], tagId: `RFID-${ultrasoundDeviceId}-${i}-01`, ultrasoundDeviceId, result: 'success' },
      { scanTime: steps[3].timestamp, scanLocation: '清洗区入口', operator: operators[1], tagId: `RFID-${ultrasoundDeviceId}-${i}-02`, ultrasoundDeviceId, result: 'success' },
      { scanTime: steps[7].timestamp, scanLocation: '储存柜', operator: operators[2], tagId: `RFID-${ultrasoundDeviceId}-${i}-03`, ultrasoundDeviceId, result: 'success' },
    ]

    // 消毒液浓度记录
    const disinfectantRecords: DisinfectantRecord[] = [
      {
        id: `DIS-${1000 + i}`,
        disinfectantName: disinfectantNames[i % disinfectantNames.length],
        concentration: 2.0 + (i % 10) * 0.1,
        standardMin: 1.8,
        standardMax: 2.5,
        testTime: steps[4].timestamp,
        operator: operators[i % operators.length],
        equipment: `洗消机-${(i % 4) + 1}号`,
        result: (i === 15 || i === 27) ? 'unqualified' : 'qualified',
        validUntil: new Date(new Date(steps[4].timestamp).getTime() + 24 * 3600000).toLocaleDateString('zh-CN'),
      }
    ]

    // 生物监测记录 (每5条有1条)
    const biologicalMonitoring: BiologicalMonitoringRecord | undefined = i % 5 === 0 ? {
      id: `BIO-${2000 + i}`,
      ultrasoundDeviceId,
      testTime: new Date(baseTime.getTime() + stepsTemplate.length * 20 * 60000 + 30 * 60000).toLocaleString('zh-CN'),
      testType: i % 3 === 0 ? '培养法' : i % 3 === 1 ? 'PCR法' : '快速检测',
      testResult: i % 12 === 0 ? 'pending' : 'negative',
      reportNo: `BM-${String(5000 + i).padStart(6, '0')}`,
      tester: operators[i % operators.length],
      auditor: '质量负责人',
      conclusion: i % 12 === 0 ? '待发布' : '合格',
    } : undefined

    // 超声探头-患者关联
    const ultrasoundDevicePatientLink: DevicePatientLink = {
      id: `EPL-${3000 + i}`,
      ultrasoundDeviceId,
      patientName: patients[i % patients.length],
      patientId: `P${String(1000 + i).padStart(5, '0')}`,
      procedureType: procedures[i % procedures.length],
      procedureTime: baseTime.toLocaleString('zh-CN'),
      doctor: operators[i % operators.length],
      room: `超声室${(i % 3) + 1}`,
      previousPatientName: i > 0 ? patients[(i - 1) % patients.length] : undefined,
      previousPatientId: i > 0 ? `P${String(999 + i).padStart(5, '0')}` : undefined,
      previousProcedureTime: i > 0 ? new Date(baseTime.getTime() - 2 * 3600000).toLocaleString('zh-CN') : undefined,
      bioResult: biologicalMonitoring?.testResult === 'pending' ? undefined : 'negative',
    }

    // 空气培养记录 (每周2条)
    const airCulture: AirCultureRecord | undefined = i % 4 === 0 ? {
      id: `AIR-${4000 + i}`,
      location: i % 2 === 0 ? '清洗区' : '储存区',
      sampleTime: new Date(baseTime.getTime() - 60 * 60000).toLocaleString('zh-CN'),
      testResult: i % 15 === 0 ? '超标' : '合格',
      cfu: i % 15 === 0 ? 180 + (i % 50) : 10 + (i % 30),
      standard: '≤100 CFU/m³',
      conclusion: i % 15 === 0 ? 'unqualified' : 'qualified',
      tester: operators[i % operators.length],
      remark: i % 15 === 0 ? '已通知相关部门整改' : undefined,
    } : undefined

    records.push({
      id: `DTR-${String(1000 + i).padStart(5, '0')}`,
      ultrasoundDeviceId,
      ultrasoundDeviceModel,
      patientName: patients[i % patients.length],
      procedureType: procedures[i % procedures.length],
      startTime: baseTime.toLocaleString('zh-CN'),
      endTime: new Date(baseTime.getTime() + stepsTemplate.length * 20 * 60000).toLocaleString('zh-CN'),
      steps,
      finalResult: steps.some(s => s.result === 'abnormal') ? 'abnormal' : steps.some(s => s.result === 'unqualified') ? 'unqualified' : 'qualified',
      operator: operators[i % operators.length],
      rfidScans,
      disinfectantRecords,
      biologicalMonitoring,
      ultrasoundDevicePatientLink,
      airCulture,
    })
  }
  return records
}

const generateDeviceUsage = (): DeviceUsage[] => {
  const usage: DeviceUsage[] = []
  const models = ['Mindray C5-2', 'Philips L12-4E', 'GE P4-2', 'Siemens CA1-5A']
  const patients = ['王建国', '李秀英', '张德明', '刘玉兰', '陈志强', '杨桂花', '赵文博', '吴晓燕', '周伟平', '郑美华', '孙立新', '朱红梅', '马文涛', '胡丽娜', '郭永强', '林晓峰', '何秀英', '高建国', '罗玉兰', '谢志明']
  const checkTypes = ['腹部超声检查', '浅表超声检查', '介入超声', '肺部超声', '心脏超声', '妇产科超声', '血管超声']
  const statuses: DeviceUsage['status'][] = ['in_use', 'pending', 'cleaning', 'ready', 'maintenance']

  for (let i = 0; i < 20; i++) {
    const baseTime = new Date(2026, 3, 28, 8 + i, 30)
    usage.push({
      id: `EU-${String(2000 + i).padStart(5, '0')}`,
      ultrasoundDeviceId: `ES-${String(100 + (i % 12)).padStart(4, '0')}`,
      model: models[i % models.length],
      patientName: patients[i],
      checkType: checkTypes[i % checkTypes.length],
      useTime: baseTime.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      status: statuses[i % statuses.length],
      nextCleanTime: new Date(baseTime.getTime() + 45 * 60000).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      useCount: 25 + (i * 3) % 40,
    })
  }
  return usage
}

const generateEquipment = (): DisinfectionEquipment[] => [
  { id: 'EQ-001', name: '迈瑞 C70', model: 'C70-超声探头洗消机', todayUses: 12, weekUses: 68, lastMaintenance: '2026-04-20', status: 'running', temperature: 37.5, pressure: 0.8 },
  { id: 'EQ-002', name: '飞利浦 IU22配套', model: 'IU22-SC', todayUses: 8, weekUses: 45, lastMaintenance: '2026-04-25', status: 'idle', temperature: 22.0 },
  { id: 'EQ-003', name: 'GE LOGIQ系列配套', model: 'LOGIQ-e', todayUses: 15, weekUses: 72, lastMaintenance: '2026-04-15', status: 'maintenance' },
  { id: 'EQ-004', name: '西门子 ACUSON配套', model: 'ACUSON-500', todayUses: 5, weekUses: 32, lastMaintenance: '2026-04-28', status: 'fault' },
]

const generateMaintenanceRecords = (): MaintenanceRecord[] => {
  const records: MaintenanceRecord[] = []
  const equipment = ['迈瑞 C70', '飞利浦 IU22配套', 'GE LOGIQ系列配套', '西门子 ACUSON配套']
  const types = ['日常保养', '故障维修', '性能校准', '滤芯更换', '高温灭菌', '探头更换', '管路清洗', '年度检修']
  const engineers = ['李工程师', '王技师', '张高级工程师', '刘技师', '陈工程师', '周技师', '吴高级工程师', '郑技师']

  for (let i = 0; i < 8; i++) {
    records.push({
      id: `MR-${String(3000 + i).padStart(5, '0')}`,
      equipmentId: `EQ-00${i % 4 + 1}`,
      equipmentName: equipment[i % equipment.length],
      maintenanceType: types[i],
      date: new Date(2026, 3, 28 - i * 3).toLocaleDateString('zh-CN'),
      engineer: engineers[i],
      result: '完成',
    })
  }
  return records
}

const generateQualityAlerts = (): QualityAlert[] => {
  const alerts: QualityAlert[] = []
  const ultrasoundDeviceIds = ['ES-0100', 'ES-0103', 'ES-0105', 'ES-0107', 'ES-0109', 'ES-0111']
  const alertTypes: QualityAlert['alertType'][] = ['concentration', 'time', 'equipment', 'missing', 'biological', 'rfid']
  const alertTypeNames: Record<string, string> = {
    concentration: '浓度不达标',
    time: '时间不足',
    equipment: '设备故障',
    missing: '记录缺失',
    biological: '生物监测阳性',
    rfid: 'RFID扫描异常',
  }
  const details: Record<string, string> = {
    concentration: '消毒剂浓度2.1%低于标准值2.2%',
    time: '高水平消毒时间18分钟低于标准20分钟',
    equipment: '洗消机2号高温灭菌模块异常',
    missing: '2026-04-26 14:30预处理记录缺失',
    biological: '超声探头ES-0107生物监测培养阳性',
    rfid: '超声探头ES-0103在清洗区入口RFID扫描失败',
  }
  const handleStatuses: QualityAlert['handleStatus'][] = ['pending', 'processing', 'resolved']

  for (let i = 0; i < 15; i++) {
    alerts.push({
      id: `QA-${String(4000 + i).padStart(5, '0')}`,
      alertTime: new Date(2026, 3, 28, 8 + Math.floor(i / 2), 30 + (i % 3) * 10).toLocaleString('zh-CN'),
      ultrasoundDeviceId: ultrasoundDeviceIds[i % ultrasoundDeviceIds.length],
      alertType: alertTypes[i % alertTypes.length],
      detail: details[alertTypes[i % alertTypes.length]],
      handleStatus: handleStatuses[i % handleStatuses.length],
    })
  }
  return alerts
}

const generateCleaningStaff = (): CleaningStaffRecord[] => [
  { id: 'CS-001', name: '张伟', certificateNo: 'CSS-2024-001', certificateType: '超声清洗消毒证', issueDate: '2024-03-15', expireDate: '2027-03-14', lastTrainingDate: '2026-03-10', status: 'valid' },
  { id: 'CS-002', name: '李娜', certificateNo: 'CSS-2023-015', certificateType: '超声清洗消毒证', issueDate: '2023-06-20', expireDate: '2026-06-19', lastTrainingDate: '2026-02-28', status: 'expired' },
  { id: 'CS-003', name: '王芳', certificateNo: 'CSS-2025-008', certificateType: '超声清洗消毒证', issueDate: '2025-01-10', expireDate: '2028-01-09', lastTrainingDate: '2026-04-05', status: 'valid' },
  { id: 'CS-004', name: '刘洋', certificateNo: 'CSS-2024-022', certificateType: '超声清洗消毒证', issueDate: '2024-08-01', expireDate: '2027-07-31', lastTrainingDate: '2026-03-20', status: 'valid' },
  { id: 'CS-005', name: '陈静', certificateNo: 'CSS-2025-011', certificateType: '超声清洗消毒证', issueDate: '2025-04-22', expireDate: '2028-04-21', lastTrainingDate: '2026-04-12', status: 'training' },
]

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  page: { padding: '20px', background: '#f5f7fa', minHeight: '100vh' },
  header: { marginBottom: 20 },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statCards: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 },
  statCard: {
    background: '#fff', borderRadius: 10, padding: '14px 18px', flex: 1, minWidth: 150,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 6,
  },
  statLabel: { fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c' },
  statValueAlert: { color: '#dc2626' },
  section: { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  traceContainer: { display: 'flex', gap: 16 },
  filterPanel: { width: 260, flexShrink: 0 },
  filterGroup: { marginBottom: 16 },
  filterLabel: { fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 },
  filterInput: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  },
  filterSelect: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none', cursor: 'pointer',
  },
  timelinePanel: { flex: 1 },
  recordCard: {
    border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, overflow: 'hidden', cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  recordCardHover: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  recordHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
  },
  recordInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  recordId: { fontSize: 14, fontWeight: 700, color: '#1a3a5c' },
  recordModel: { fontSize: 12, color: '#64748b' },
  recordMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#64748b' },
  recordResult: {
    padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  recordExpanded: { padding: 16 },
  // Steps timeline
  stepsTimeline: { display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 },
  stepItem: {
    flex: 1, minWidth: 90, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, padding: '10px 4px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
    position: 'relative',
  },
  stepIcon: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepName: { fontSize: 11, fontWeight: 600, color: '#475569', textAlign: 'center' },
  stepTime: { fontSize: 9, color: '#94a3b8', textAlign: 'center' },
  stepConnector: { position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', width: 8, height: 2, background: '#e2e8f0' },
  // Sub records
  subRecordGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 },
  subRecord: {
    background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0',
  },
  subRecordTitle: { fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  subRecordRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginBottom: 4 },
  subRecordLabel: { color: '#64748b' },
  // RFID section
  rfidBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 10, background: '#ede9fe', color: '#5b21b6' },
  // Biological
  bioTag: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 10 },
  // Air culture
  airTag: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 10 },
  // Patient link
  patientLinkCard: { background: '#fff7ed', borderRadius: 8, padding: 12, border: '1px solid #fed7aa', marginTop: 8 },
  patientLinkTitle: { fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 },
  patientLinkRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  arrowIcon: { color: '#d97706' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  statusTag: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  equipmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  equipmentCard: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#fff',
  },
  equipmentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  equipmentName: { fontSize: 14, fontWeight: 700, color: '#1a3a5c' },
  equipmentStatus: { padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 },
  equipmentStats: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  equipmentStat: { background: '#f8fafc', padding: 8, borderRadius: 6 },
  equipmentStatLabel: { fontSize: 10, color: '#64748b' },
  equipmentStatValue: { fontSize: 14, fontWeight: 700, color: '#1a3a5c' },
  alertRow: {
    display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9',
  },
  alertTime: { width: 140, fontSize: 12, color: '#64748b' },
  alertEndoscope: { width: 100, fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  alertType: { width: 110 },
  alertDetail: { flex: 1, fontSize: 12, color: '#475569' },
  alertStatus: { width: 80, textAlign: 'center' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
  // Status colors
  inUse: { background: '#dbeafe', color: '#1d4ed8' },
  pending: { background: '#fef3c7', color: '#92400e' },
  cleaning: { background: '#ffe4c4', color: '#c2410c' },
  ready: { background: '#dcfce7', color: '#166534' },
  maintenance: { background: '#fee2e2', color: '#dc2626' },
  running: { background: '#dcfce7', color: '#166534' },
  idle: { background: '#dbeafe', color: '#1d4ed8' },
  fault: { background: '#fee2e2', color: '#dc2626' },
  concentration: { background: '#fee2e2', color: '#dc2626' },
  time: { background: '#ffe4c4', color: '#c2410c' },
  equipmentAlert: { background: '#fef3c7', color: '#92400e' },
  missing: { background: '#dbeafe', color: '#1d4ed8' },
  biological: { background: '#fce7f3', color: '#9d174d' },
  rfid: { background: '#ede9fe', color: '#5b21b6' },
  pendingHandle: { background: '#fee2e2', color: '#dc2626' },
  processing: { background: '#fef3c7', color: '#92400e' },
  resolved: { background: '#dcfce7', color: '#166534' },
  qualified: { background: '#dcfce7', color: '#166534' },
  unqualified: { background: '#fee2e2', color: '#dc2626' },
  abnormal: { background: '#fee2e2', color: '#dc2626' },
  valid: { background: '#dcfce7', color: '#166534' },
  expired: { background: '#fee2e2', color: '#dc2626' },
  training: { background: '#dbeafe', color: '#1d4ed8' },
  negative: { background: '#dcfce7', color: '#166534' },
  positive: { background: '#fee2e2', color: '#dc2626' },
  btn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnSmall: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 4,
    padding: '4px 8px', fontSize: 11, cursor: 'pointer',
  },
  btnSuccess: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  rankList: { display: 'flex', flexDirection: 'column', gap: 8 },
  rankItem: { display: 'flex', alignItems: 'center', gap: 12 },
  rankNumber: { width: 24, height: 24, borderRadius: '50%', background: '#1a3a5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  rankBar: { flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  rankBarFill: { height: '100%', background: '#1a3a5c', borderRadius: 4 },
  rankValue: { fontSize: 12, fontWeight: 600, color: '#1a3a5c', minWidth: 40, textAlign: 'right' },
  // Detail expanded
  detailSection: { marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8 },
  detailSectionTitle: { fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 8 },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  detailItem: { background: '#fff', padding: 8, borderRadius: 6, textAlign: 'center' as const },
  detailItemLabel: { fontSize: 10, color: '#64748b', marginBottom: 4 },
  detailItemValue: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  // Staff
  staffCard: { display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid #f1f5f9' },
  staffAvatar: { width: 48, height: 48, borderRadius: '50%', background: '#1a3a5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  staffMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  staffCert: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' as const },
  // Info alert
  infoAlert: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, marginBottom: 12, background: '#f0f9ff', border: '1px solid #bae6fd' },
}

// ---------- 辅助组件 ----------
const StatusBadge: React.FC<{ status: string; type: string }> = ({ status, type }) => {
  const getStyle = (): React.CSSProperties => {
    if (type === 'handle') {
      const handleStyles: Record<string, React.CSSProperties> = {
        pending: s.pendingHandle, processing: s.processing, resolved: s.resolved,
      }
      return handleStyles[status] || s.badge
    }
    if (type === 'result') {
      const resultStyles: Record<string, React.CSSProperties> = {
        qualified: s.qualified, unqualified: s.unqualified, abnormal: s.abnormal,
      }
      return resultStyles[status] || s.badge
    }
    const allStyles: Record<string, React.CSSProperties> = {
      in_use: s.inUse, pending: s.pending, cleaning: s.cleaning, ready: s.ready, maintenance: s.maintenance,
      running: s.running, idle: s.idle, fault: s.fault,
      concentration: s.concentration, time: s.time, equipment: s.equipmentAlert, missing: s.missing,
      biological: s.biological, rfid: s.rfid,
      pending_h: s.pendingHandle, processing: s.processing, resolved: s.resolved,
      qualified: s.qualified, unqualified: s.unqualified, abnormal: s.abnormal,
      valid: s.valid, expired: s.expired, training: s.training,
      negative: s.negative, positive: s.positive,
    }
    return allStyles[status] || s.badge
  }
  const getLabel = (): string => {
    if (type === 'handle') {
      const handleLabels: Record<string, string> = {
        pending: '待处理', processing: '处理中', resolved: '已解决',
      }
      return handleLabels[status] || status
    }
    if (type === 'usage') {
      const usageLabels: Record<string, string> = {
        in_use: '在用', pending: '待洗消', cleaning: '洗消中', ready: '已就绪', maintenance: '维修中',
      }
      return usageLabels[status] || status
    }
    if (type === 'equipment') {
      const equipmentLabels: Record<string, string> = {
        running: '运行中', idle: '空闲', maintenance: '维护中', fault: '故障',
      }
      return equipmentLabels[status] || status
    }
    if (type === 'alert') {
      const alertLabels: Record<string, string> = {
        concentration: '浓度不达标', time: '时间不足', equipment: '设备故障', missing: '记录缺失',
        biological: '生物监测', rfid: 'RFID异常',
      }
      return alertLabels[status] || status
    }
    if (type === 'result') {
      const resultLabels: Record<string, string> = {
        qualified: '合格', unqualified: '不合格', abnormal: '异常',
      }
      return resultLabels[status] || status
    }
    if (type === 'staff') {
      const staffLabels: Record<string, string> = {
        valid: '有效', expired: '已过期', training: '培训中',
      }
      return staffLabels[status] || status
    }
    if (type === 'bio') {
      const bioLabels: Record<string, string> = {
        negative: '阴性', positive: '阳性', pending: '待出结果',
      }
      return bioLabels[status] || status
    }
    if (type === 'air') {
      const airLabels: Record<string, string> = {
        qualified: '合格', unqualified: '不合格', pending: '待检测',
      }
      return airLabels[status] || status
    }
    return status
  }
  return <span style={{ ...s.badge, ...getStyle() }}>{getLabel()}</span>
}

const StepIcon: React.FC<{ name: string; result: string }> = ({ name, result }) => {
  const color = result === 'qualified' ? '#22c55e' : result === 'unqualified' ? '#ef4444' : result === 'abnormal' ? '#f97316' : '#94a3b8'
  const iconSize = 16
  let Icon = Activity
  if (name.includes('回收')) Icon = Package
  else if (name.includes('测漏')) Icon = ScanLine
  else if (name.includes('预')) Icon = Droplets
  else if (name.includes('清洗')) Icon = Layers
  else if (name.includes('消毒')) Icon = Activity
  else if (name.includes('干燥')) Icon = Wind
  else if (name.includes('储存')) Icon = Box
  else if (name.includes('发放')) Icon = ClipboardCheck

  return (
    <div style={{ ...s.stepIcon, background: color + '20' }}>
      <Icon size={iconSize} color={color} />
    </div>
  )
}

// ---------- 主组件 ----------
export default function DisinfectionTracePage() {
  const [filterDateStart, setFilterDateStart] = useState('2026-04-01')
  const [filterDateEnd, setFilterDateEnd] = useState('2026-04-30')
  const [filterEndoscope, setFilterEndoscope] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'trace' | 'usage' | 'equipment' | 'alert' | 'staff'>('trace')

  const disinfectionRecords = useMemo(() => generateDisinfectionRecords(), [])
  const ultrasoundDeviceUsage = useMemo(() => generateDeviceUsage(), [])
  const equipment = useMemo(() => generateEquipment(), [])
  const maintenanceRecords = useMemo(() => generateMaintenanceRecords(), [])
  const qualityAlerts = useMemo(() => generateQualityAlerts(), [])
  const cleaningStaff = useMemo(() => generateCleaningStaff(), [])

  const filteredRecords = useMemo(() => {
    return disinfectionRecords.filter(r => {
      const recordDate = new Date(r.startTime)
      const startOk = !filterDateStart || recordDate >= new Date(filterDateStart)
      const endOk = !filterDateEnd || recordDate <= new Date(filterDateEnd + 'T23:59:59')
      const ultrasoundDeviceOk = !filterEndoscope || r.ultrasoundDeviceId.includes(filterEndoscope)
      const typeOk = filterType === 'all' || r.procedureType.includes(filterType)
      const statusOk = filterStatus === 'all' || r.finalResult === filterStatus
      return startOk && endOk && ultrasoundDeviceOk && typeOk && statusOk
    })
  }, [disinfectionRecords, filterDateStart, filterDateEnd, filterEndoscope, filterType, filterStatus])

  const rankData = useMemo(() => {
    const counts: Record<string, number> = {}
    ultrasoundDeviceUsage.forEach(u => {
      counts[u.ultrasoundDeviceId] = (counts[u.ultrasoundDeviceId] || 0) + u.useCount
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([id, count]) => ({ id, count }))
  }, [ultrasoundDeviceUsage])

  const maxCount = rankData[0]?.count || 1

  // Statistics
  const stats = useMemo(() => {
    const todayRecords = disinfectionRecords.filter(r => r.startTime.includes('2026-04-28'))
    const qualifiedCount = disinfectionRecords.filter(r => r.finalResult === 'qualified').length
    const abnormalCount = disinfectionRecords.filter(r => r.finalResult === 'abnormal' || r.finalResult === 'unqualified').length
    const bioPending = disinfectionRecords.filter(r => r.biologicalMonitoring?.testResult === 'pending').length
    const airUnqualified = disinfectionRecords.filter(r => r.airCulture?.conclusion === 'unqualified').length
    return {
      todayCount: todayRecords.length,
      totalCount: disinfectionRecords.length,
      equipmentCount: equipment.length,
      qualifiedRate: Math.round((qualifiedCount / disinfectionRecords.length) * 1000) / 10,
      abnormalCount,
      bioPending,
      airUnqualified,
      avgDuration: 28,
    }
  }, [disinfectionRecords, equipment])

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <div>
            <div style={s.title}>洗消追溯增强系统</div>
            <div style={s.subtitle}>超越美迪康基础版 · 全流程追溯管理 · RFID追踪 · 生物监测 · 超声患者关联</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.btn}>
              <Download size={14} /> 导出报告
            </button>
            <button style={s.btn}>
              <Printer size={14} /> 打印
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={s.statCards}>
          <div style={s.statCard}>
            <div style={s.statLabel}><ClipboardCheck size={14} /> 今日洗消数</div>
            <div style={s.statValue}>{stats.todayCount}<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 条</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><BarChart3 size={14} /> 本月洗消总量</div>
            <div style={s.statValue}>{stats.totalCount}<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 条</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><Monitor size={14} /> 设备总数</div>
            <div style={s.statValue}>{stats.equipmentCount}<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 台</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><ShieldCheck size={14} /> 洗消合格率</div>
            <div style={{ ...s.statValue, color: '#16a34a' }}>{stats.qualifiedRate}<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> %</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><AlertTriangle size={14} /> 异常/不合格</div>
            <div style={{ ...s.statValue, ...s.statValueAlert }}>{stats.abnormalCount}<span style={{ fontSize: 13, fontWeight: 400 }}> 例</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><TestTube size={14} /> 生物监测待出</div>
            <div style={{ ...s.statValue, color: stats.bioPending > 0 ? '#d97706' : '#1a3a5c' }}>{stats.bioPending}<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 例</span></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([
          { key: 'trace', label: '洗消流程追溯', icon: Search },
          { key: 'usage', label: '超声使用追踪', icon: Activity },
          { key: 'equipment', label: '洗消设备管理', icon: Wrench },
          { key: 'staff', label: '洗消人员资质', icon: User },
          { key: 'alert', label: '质控预警', icon: AlertCircle },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...s.btn,
              background: activeTab === tab.key ? '#1a3a5c' : '#f1f5f9',
              color: activeTab === tab.key ? '#fff' : '#475569',
            }}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 功能区1：洗消流程追溯 ===== */}
      {activeTab === 'trace' && (
        <div style={s.section}>
          <div style={s.sectionTitle}><Search size={16} /> 洗消流程追溯（完整8步流程 + RFID + 生物监测）</div>
          <div style={s.traceContainer}>
            {/* Filter Panel */}
            <div style={s.filterPanel}>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>日期范围</div>
                <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} style={s.filterInput} />
                <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} style={{ ...s.filterInput, marginTop: 6 }} />
              </div>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>探头编号</div>
                <input
                  type="text"
                  placeholder="如 ES-0100"
                  value={filterEndoscope}
                  onChange={e => setFilterEndoscope(e.target.value)}
                  style={s.filterInput}
                />
              </div>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>洗消类型</div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={s.filterSelect}>
                  <option value="all">全部类型</option>
                  <option value="腹部超声">腹部超声检查</option>
                  <option value="浅表超声">浅表超声检查</option>
                  <option value="介入超声">介入超声</option>
                  <option value="肺部超声">肺部超声</option>
                  <option value="心脏超声">心脏超声</option>
                </select>
              </div>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>状态</div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.filterSelect}>
                  <option value="all">全部状态</option>
                  <option value="qualified">合格</option>
                  <option value="unqualified">不合格</option>
                  <option value="abnormal">异常</option>
                </select>
              </div>
              <button
                onClick={() => { setFilterDateStart('2026-04-01'); setFilterDateEnd('2026-04-30'); setFilterEndoscope(''); setFilterType('all'); setFilterStatus('all') }}
                style={{ ...s.btnSmall, width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={12} /> 重置筛选
              </button>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
                共 {filteredRecords.length} 条记录
              </div>

              {/* Legend */}
              <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>图例说明</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { color: '#22c55e', label: '合格' },
                    { color: '#ef4444', label: '不合格' },
                    { color: '#f97316', label: '异常' },
                    { color: '#94a3b8', label: '待处理' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: 11, color: '#475569' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Panel */}
            <div style={s.timelinePanel}>
              {filteredRecords.slice(0, 10).map(record => (
                <div
                  key={record.id}
                  style={{
                    ...s.recordCard,
                    ...(expandedRecord === record.id ? s.recordCardHover : {}),
                    borderColor: record.finalResult === 'abnormal' ? '#f97316' : record.finalResult === 'unqualified' ? '#ef4444' : '#e2e8f0',
                  }}
                  onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                >
                  <div style={s.recordHeader}>
                    <div style={s.recordInfo}>
                      <div style={s.recordId}>
                        {record.ultrasoundDeviceId}
                        {record.finalResult === 'abnormal' && (
                          <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626', marginLeft: 8, fontSize: 10 }}>
                            <AlertTriangle size={10} /> 异常
                          </span>
                        )}
                        {record.finalResult === 'unqualified' && (
                          <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626', marginLeft: 8, fontSize: 10 }}>
                            <XCircle size={10} /> 不合格
                          </span>
                        )}
                      </div>
                      <div style={s.recordModel}>{record.ultrasoundDeviceModel}</div>
                      <div style={s.recordMeta}>
                        <span>{record.patientName}</span>
                        <span>{record.procedureType}</span>
                        <span>{record.startTime}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {record.biologicalMonitoring && (
                        <span style={{ ...s.bioTag, background: record.biologicalMonitoring.testResult === 'positive' ? '#fee2e2' : record.biologicalMonitoring.testResult === 'pending' ? '#fef3c7' : '#dcfce7', color: record.biologicalMonitoring.testResult === 'positive' ? '#dc2626' : record.biologicalMonitoring.testResult === 'pending' ? '#92400e' : '#166534' }}>
                          <TestTube size={10} /> 生物监测
                        </span>
                      )}
                      {record.airCulture && (
                        <span style={{ ...s.airTag, background: record.airCulture.conclusion === 'unqualified' ? '#fee2e2' : '#dcfce7', color: record.airCulture.conclusion === 'unqualified' ? '#dc2626' : '#166534' }}>
                          <Leaf size={10} /> 空气培养
                        </span>
                      )}
                      <StatusBadge status={record.finalResult} type="result" />
                      <Eye size={16} color="#94a3b8" />
                    </div>
                  </div>

                  {/* Quick step indicators */}
                  <div style={{ padding: '8px 16px', display: 'flex', gap: 4, overflowX: 'auto', background: '#fafafa' }}>
                    {record.steps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: step.result === 'qualified' ? '#22c55e' : step.result === 'unqualified' ? '#ef4444' : step.result === 'abnormal' ? '#f97316' : '#94a3b8',
                        }} title={`${step.name}: ${step.result}`} />
                        {idx < record.steps.length - 1 && (
                          <div style={{ width: 12, height: 1, background: '#e2e8f0' }} />
                        )}
                      </div>
                    ))}
                  </div>

                  {expandedRecord === record.id && (
                    <div style={s.recordExpanded}>
                      {/* 8步流程时间线 */}
                      <div style={s.stepsTimeline}>
                        {record.steps.map((step, idx) => (
                          <div key={idx} style={{
                            ...s.stepItem,
                            background: step.result === 'qualified' ? '#f0fdf4' : step.result === 'unqualified' ? '#fef2f2' : step.result === 'abnormal' ? '#fff7ed' : '#f8fafc',
                            borderColor: step.result === 'qualified' ? '#bbf7d0' : step.result === 'unqualified' ? '#fecaca' : step.result === 'abnormal' ? '#fed7aa' : '#e2e8f0',
                          }}>
                            <StepIcon name={step.name} result={step.result} />
                            <div style={s.stepName}>{step.name}</div>
                            <div style={s.stepTime}>{step.timestamp.split(' ')[1] || step.timestamp}</div>
                            {step.result !== 'qualified' && (
                              <div style={{ fontSize: 9, color: '#dc2626', fontWeight: 600 }}>
                                {step.result === 'abnormal' ? '异常' : '不合格'}
                              </div>
                            )}
                            {idx < record.steps.length - 1 && <div style={s.stepConnector} />}
                          </div>
                        ))}
                      </div>

                      {/* 详细信息区 */}
                      <div style={s.detailSection}>
                        <div style={s.detailSectionTitle}><FileText size={12} /> 各步骤详细信息</div>
                        <div style={s.detailGrid}>
                          {record.steps.map((step, idx) => (
                            <div key={idx} style={s.detailItem}>
                              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{step.name}</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: step.result === 'qualified' ? '#166534' : '#dc2626' }}>
                                {step.result === 'qualified' ? '合格' : step.result === 'abnormal' ? '异常' : '不合格'}
                              </div>
                              {step.details && Object.entries(step.details).slice(0, 2).map(([k, v]) => (
                                <div key={k} style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{k}: {v}</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RFID扫描记录 */}
                      <div style={s.subRecord}>
                        <div style={s.subRecordTitle}>
                          <Radio size={12} color="#5b21b6" /> RFID标签扫描记录
                          <span style={s.rfidBadge}><Radio size={8} /> {record.rfidScans.length} 次</span>
                        </div>
                        {record.rfidScans.map((scan, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '6px 8px', background: '#f5f3ff', borderRadius: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: scan.result === 'success' ? '#22c55e' : '#ef4444' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#5b21b6' }}>{scan.tagId}</div>
                              <div style={{ fontSize: 10, color: '#64748b' }}>{scan.scanLocation} · {scan.operator} · {scan.scanTime}</div>
                            </div>
                            <span style={{ fontSize: 10, color: scan.result === 'success' ? '#166534' : '#dc2626' }}>
                              {scan.result === 'success' ? '成功' : '失败'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* 消毒液浓度记录 */}
                      <div style={s.subRecord}>
                        <div style={s.subRecordTitle}>
                          <Droplets size={12} color="#0891b2" /> 消毒液浓度记录
                        </div>
                        {record.disinfectantRecords.map((dr, idx) => (
                          <div key={idx} style={{ background: '#f0fdfa', borderRadius: 6, padding: 8, marginBottom: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f766e' }}>{dr.disinfectantName}</span>
                              <StatusBadge status={dr.result} type="result" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: '#64748b' }}>实测浓度</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: dr.result === 'qualified' ? '#166534' : '#dc2626' }}>{dr.concentration}%</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: '#64748b' }}>标准范围</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{dr.standardMin}~{dr.standardMax}%</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: '#64748b' }}>有效截止</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{dr.validUntil}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 生物监测记录 */}
                      {record.biologicalMonitoring && (
                        <div style={{ ...s.subRecord, background: record.biologicalMonitoring.testResult === 'positive' ? '#fef2f2' : record.biologicalMonitoring.testResult === 'pending' ? '#fef3c7' : '#f0fdf4' }}>
                          <div style={s.subRecordTitle}>
                            <TestTube size={12} color={record.biologicalMonitoring.testResult === 'positive' ? '#dc2626' : record.biologicalMonitoring.testResult === 'pending' ? '#92400e' : '#166534'} />
                            生物监测记录
                            <StatusBadge status={record.biologicalMonitoring.testResult} type="bio" />
                          </div>
                          <div style={s.subRecordRow}>
                            <span style={s.subRecordLabel}>报告编号</span>
                            <span style={{ fontWeight: 600 }}>{record.biologicalMonitoring.reportNo}</span>
                          </div>
                          <div style={s.subRecordRow}>
                            <span style={s.subRecordLabel}>检测方法</span>
                            <span>{record.biologicalMonitoring.testType}</span>
                          </div>
                          <div style={s.subRecordRow}>
                            <span style={s.subRecordLabel}>检测时间</span>
                            <span>{record.biologicalMonitoring.testTime}</span>
                          </div>
                          <div style={s.subRecordRow}>
                            <span style={s.subRecordLabel}>检测人/审核人</span>
                            <span>{record.biologicalMonitoring.tester} / {record.biologicalMonitoring.auditor}</span>
                          </div>
                          <div style={s.subRecordRow}>
                            <span style={s.subRecordLabel}>结论</span>
                            <span style={{ fontWeight: 600, color: record.biologicalMonitoring.conclusion === '待发布' ? '#d97706' : '#166534' }}>{record.biologicalMonitoring.conclusion}</span>
                          </div>
                        </div>
                      )}

                      {/* 超声探头-患者关联 */}
                      {record.ultrasoundDevicePatientLink && (
                        <div style={s.patientLinkCard}>
                          <div style={s.patientLinkTitle}>
                            <Layers size={12} /> 超声探头-患者追溯关联
                          </div>
                          <div style={s.patientLinkRow}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>本次使用</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{record.ultrasoundDevicePatientLink.patientName}</div>
                              <div style={{ fontSize: 10, color: '#64748b' }}>{record.ultrasoundDevicePatientLink.patientId} · {record.ultrasoundDevicePatientLink.procedureType}</div>
                              <div style={{ fontSize: 10, color: '#64748b' }}>{record.ultrasoundDevicePatientLink.procedureTime} · {record.ultrasoundDevicePatientLink.doctor} · {record.ultrasoundDevicePatientLink.room}</div>
                            </div>
                          </div>
                          {record.ultrasoundDevicePatientLink.previousPatientName && (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
                                <ArrowRight size={14} style={s.arrowIcon} />
                                <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>前一位患者（超声探头复用追溯）</span>
                              </div>
                              <div style={s.patientLinkRow}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>上次使用</div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{record.ultrasoundDevicePatientLink.previousPatientName}</div>
                                  <div style={{ fontSize: 10, color: '#64748b' }}>{record.ultrasoundDevicePatientLink.previousPatientId}</div>
                                  <div style={{ fontSize: 10, color: '#64748b' }}>{record.ultrasoundDevicePatientLink.previousProcedureTime}</div>
                                </div>
                                {record.ultrasoundDevicePatientLink.bioResult && (
                                  <StatusBadge status={record.ultrasoundDevicePatientLink.bioResult} type="bio" />
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* 空气培养记录 */}
                      {record.airCulture && (
                        <div style={s.subRecord}>
                          <div style={s.subRecordTitle}>
                            <Leaf size={12} color={record.airCulture.conclusion === 'unqualified' ? '#dc2626' : '#166534'} />
                            空气培养记录
                            <StatusBadge status={record.airCulture.conclusion} type="air" />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            <div style={{ textAlign: 'center', background: '#f0fdf4', padding: 8, borderRadius: 6 }}>
                              <div style={{ fontSize: 10, color: '#64748b' }}>采样位置</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{record.airCulture.location}</div>
                            </div>
                            <div style={{ textAlign: 'center', background: record.airCulture.conclusion === 'unqualified' ? '#fef2f2' : '#f0fdf4', padding: 8, borderRadius: 6 }}>
                              <div style={{ fontSize: 10, color: '#64748b' }}>菌落数(CFU)</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: record.airCulture.conclusion === 'unqualified' ? '#dc2626' : '#166534' }}>{record.airCulture.cfu}</div>
                            </div>
                            <div style={{ textAlign: 'center', background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                              <div style={{ fontSize: 10, color: '#64748b' }}>标准</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{record.airCulture.standard}</div>
                            </div>
                          </div>
                          {record.airCulture.remark && (
                            <div style={{ marginTop: 8, fontSize: 11, color: '#dc2626', background: '#fef2f2', padding: 6, borderRadius: 4 }}>
                              <AlertOctagon size={10} style={{ marginRight: 4 }} />
                              {record.airCulture.remark}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 操作员信息 */}
                      <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 12, color: '#64748b' }}>
                        <strong>总操作员：</strong>{record.operator}　
                        <strong>总耗时：</strong>约{record.steps.length * 20}分钟　
                        <strong>记录编号：</strong>{record.id}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== 功能区2：超声使用追踪 ===== */}
      {activeTab === 'usage' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} /> 超声使用追踪</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>共 {ultrasoundDeviceUsage.length} 条记录</div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {/* Table */}
            <div style={{ flex: 1 }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>探头编号</th>
                    <th style={s.th}>型号</th>
                    <th style={s.th}>患者姓名</th>
                    <th style={s.th}>检查类型</th>
                    <th style={s.th}>使用时间</th>
                    <th style={s.th}>洗消状态</th>
                    <th style={s.th}>下次洗消</th>
                  </tr>
                </thead>
                <tbody>
                  {ultrasoundDeviceUsage.map(row => (
                    <tr key={row.id}>
                      <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{row.ultrasoundDeviceId}</td>
                      <td style={s.td}>{row.model}</td>
                      <td style={s.td}>{row.patientName}</td>
                      <td style={s.td}>{row.checkType}</td>
                      <td style={s.td}>{row.useTime}</td>
                      <td style={s.td}><StatusBadge status={row.status} type="usage" /></td>
                      <td style={s.td}>{row.nextCleanTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Usage Rank */}
            <div style={{ width: 260, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 12 }}>本月使用频次排行</div>
              <div style={s.rankList}>
                {rankData.map((item, idx) => (
                  <div key={item.id} style={s.rankItem}>
                    <div style={s.rankNumber}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{item.id}</div>
                      <div style={s.rankBar}>
                        <div style={{ ...s.rankBarFill, width: `${(item.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                    <div style={s.rankValue}>{item.count}次</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 功能区3：洗消设备管理 ===== */}
      {activeTab === 'equipment' && (
        <div style={s.section}>
          <div style={s.sectionTitle}><Wrench size={16} /> 洗消设备管理</div>

          {/* Equipment Cards */}
          <div style={s.equipmentGrid}>
            {equipment.map(eq => (
              <div key={eq.id} style={s.equipmentCard}>
                <div style={s.equipmentHeader}>
                  <div>
                    <div style={s.equipmentName}>{eq.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{eq.model}</div>
                  </div>
                  <StatusBadge status={eq.status} type="equipment" />
                </div>
                <div style={s.equipmentStats}>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>今日使用</div>
                    <div style={s.equipmentStatValue}>{eq.todayUses}次</div>
                  </div>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>本周使用</div>
                    <div style={s.equipmentStatValue}>{eq.weekUses}次</div>
                  </div>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>最后维护</div>
                    <div style={{ ...s.equipmentStatValue, fontSize: 11 }}>{eq.lastMaintenance}</div>
                  </div>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>设备状态</div>
                    <div style={{ ...s.equipmentStatValue, fontSize: 11, color: eq.status === 'fault' ? '#dc2626' : eq.status === 'running' ? '#166534' : '#1a3a5c' }}>
                      {eq.status === 'running' ? '运行中' : eq.status === 'idle' ? '空闲' : eq.status === 'maintenance' ? '维护中' : '故障'}
                    </div>
                  </div>
                  {eq.temperature !== undefined && (
                    <div style={s.equipmentStat}>
                      <div style={s.equipmentStatLabel}>当前温度</div>
                      <div style={{ ...s.equipmentStatValue, fontSize: 11 }}>{eq.temperature}°C</div>
                    </div>
                  )}
                  {eq.pressure !== undefined && (
                    <div style={s.equipmentStat}>
                      <div style={s.equipmentStatLabel}>压力值</div>
                      <div style={{ ...s.equipmentStatValue, fontSize: 11 }}>{eq.pressure} MPa</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Maintenance Records */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 12 }}>维护记录</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>设备</th>
                  <th style={s.th}>维护类型</th>
                  <th style={s.th}>日期</th>
                  <th style={s.th}>工程师</th>
                  <th style={s.th}>结果</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{rec.equipmentName}</td>
                    <td style={s.td}>{rec.maintenanceType}</td>
                    <td style={s.td}>{rec.date}</td>
                    <td style={s.td}>{rec.engineer}</td>
                    <td style={s.td}><StatusBadge status="resolved" type="result" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== 功能区4：洗消人员资质 ===== */}
      {activeTab === 'staff' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} /> 洗消人员资质管理</div>
            <button style={s.btn}>
              <Plus size={14} /> 添加人员
            </button>
          </div>

          <div style={s.infoAlert}>
            <ShieldCheck size={16} color="#0369a1" />
            <span style={{ fontSize: 13, color: '#0c4a6e' }}>
              根据《超声探头清洗消毒技术规范》，从事超声探头洗消工作的人员必须持证上岗，并定期参加培训。请确保所有人员证书在有效期内。
            </span>
          </div>

          {cleaningStaff.map(staff => (
            <div key={staff.id} style={s.staffCard}>
              <div style={s.staffAvatar}>{staff.name.slice(0, 1)}</div>
              <div style={s.staffInfo}>
                <div style={s.staffName}>
                  {staff.name}
                  <StatusBadge status={staff.status} type="staff" />
                </div>
                <div style={s.staffMeta}>
                  证书编号：{staff.certificateNo} · 发证日期：{staff.issueDate} · 到期日期：{staff.expireDate}
                </div>
                <div style={s.staffCert}>
                  <span style={{ ...s.badge, background: '#f1f5f9', color: '#475569' }}>
                    {staff.certificateType}
                  </span>
                  <span style={{ ...s.badge, background: '#f0fdf4', color: '#166534' }}>
                    <Calendar size={10} style={{ marginRight: 2 }} />
                    最近培训：{staff.lastTrainingDate}
                  </span>
                  {staff.status === 'expired' && (
                    <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626' }}>
                      <AlertTriangle size={10} style={{ marginRight: 2 }} />
                      证书已过期，请尽快续证
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={s.btnSmall}><Eye size={12} /> 查看</button>
                <button style={s.btnSmall}><Edit size={12} /> 编辑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== 功能区5：质控预警 ===== */}
      {activeTab === 'alert' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={16} /> 质控预警</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626' }}>待处理 {qualityAlerts.filter(a => a.handleStatus === 'pending').length}</span>
              <span style={{ ...s.badge, background: '#fef3c7', color: '#92400e' }}>处理中 {qualityAlerts.filter(a => a.handleStatus === 'processing').length}</span>
              <span style={{ ...s.badge, background: '#dcfce7', color: '#166534' }}>已解决 {qualityAlerts.filter(a => a.handleStatus === 'resolved').length}</span>
            </div>
          </div>

          {/* Alert Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8, flexWrap: 'wrap' as const }}>
            {[
              { key: 'concentration', label: '浓度不达标', style: s.concentration },
              { key: 'time', label: '时间不足', style: s.time },
              { key: 'equipment', label: '设备故障', style: s.equipmentAlert },
              { key: 'missing', label: '记录缺失', style: s.missing },
              { key: 'biological', label: '生物监测阳性', style: s.biological },
              { key: 'rfid', label: 'RFID异常', style: s.rfid },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                <span style={{ ...s.badge, ...item.style }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Alert List */}
          {qualityAlerts.map(alert => (
            <div key={alert.id} style={s.alertRow}>
              <div style={s.alertTime}>{alert.alertTime}</div>
              <div style={s.alertEndoscope}>{alert.ultrasoundDeviceId}</div>
              <div style={s.alertType}>
                <StatusBadge status={alert.alertType} type="alert" />
              </div>
              <div style={s.alertDetail}>{alert.detail}</div>
              <div style={s.alertStatus}>
                <StatusBadge status={alert.handleStatus} type="handle" />
              </div>
              {alert.handleStatus === 'pending' && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ ...s.btnSmall, background: '#dcfce7', color: '#166534' }}>
                    <CheckSquare size={10} /> 处理
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
