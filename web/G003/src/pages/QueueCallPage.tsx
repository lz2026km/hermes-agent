// ============================================================
// G003 超声RIS系统 - 排队叫号系统页面
// 功能：超声检查排队叫号大屏，支持呼叫、重呼、跳过等操作
// 竞品对标：卫软信息叫号模块 / 蓝网科技叫号系统
// ============================================================
import { useState, useMemo } from 'react'
import {
  Speaker, RefreshCw, SkipForward, Clock, User,
  Activity, CheckCircle, PlayCircle, PauseCircle,
  Calendar, Microscope, AlertCircle, ChevronRight
} from 'lucide-react'
import { initialAppointments } from '../data/initialData'
import type { Appointment, AppointmentStatus } from '../types'

// ---------- 本地类型（叫号系统专用） ----------
type PatientStatus = '等待' | '已呼叫' | '检查中' | '已完成'
type RoomStatus = '空闲' | '检查中' | '准备中'

interface QueuePatient {
  id: string
  sequence: number
  name: string
  patientId: string
  examType: string
  room: string
  callTime: string
  status: PatientStatus
  appointmentId: string
}

interface ExamRoom {
  id: string
  name: string
  status: RoomStatus
  currentPatient?: string
  doctor: string
}

// ---------- 模拟诊室数据 ----------
const mockRooms: ExamRoom[] = [
  { id: 'R1', name: '诊室1', status: '检查中', currentPatient: '王建国', doctor: '张建国' },
  { id: 'R2', name: '诊室2', status: '空闲', doctor: '李秀英' },
  { id: 'R3', name: '诊室3', status: '准备中', currentPatient: '张德明', doctor: '王海涛' },
]

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  // 叫号大屏背景页
  callPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d1b2a 0%, #1b3a5c 50%, #2d5a87 100%)',
    padding: 20,
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
  },
  callContainer: {
    maxWidth: 1600,
    margin: '0 auto',
  },
  callHeader: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
  },
  callHeaderTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  callHeaderSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  // 统计概览
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: '20px 24px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 700,
    color: '#60a5fa',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  // 主内容区
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 24,
  },
  panel: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  panelHeader: {
    background: 'linear-gradient(90deg, #1a3a5c, #2d5a87)',
    color: '#fff',
    padding: '14px 20px',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  // 叫号大屏
  callScreen: {
    padding: 24,
    textAlign: 'center',
  },
  currentCallLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  currentCallNumber: {
    fontSize: 64,
    fontWeight: 800,
    color: '#1a3a5c',
    marginBottom: 4,
  },
  currentCallName: {
    fontSize: 48,
    fontWeight: 700,
    color: '#dc2626',
    marginBottom: 8,
  },
  currentCallInfo: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 4,
  },
  nextPatientBox: {
    background: '#f0f9ff',
    borderRadius: 8,
    padding: '12px 20px',
    marginTop: 16,
    display: 'inline-block',
  },
  nextPatientLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  nextPatientValue: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1a3a5c',
  },
  // 按钮区
  buttonGroup: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  btnCallNext: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 52,
    minWidth: 160,
  },
  btnRecall: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#ea580c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 52,
    minWidth: 160,
  },
  btnSkip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#64748b',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 52,
    minWidth: 160,
  },
  // 等待队列
  waitingQueue: {
    padding: 16,
  },
  queueTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 15,
  },
  th: {
    background: '#f1f5f9',
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#334155',
    borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  // 诊室状态
  roomSection: {
    marginBottom: 24,
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  roomCard: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  roomName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a3a5c',
    marginBottom: 8,
  },
  roomStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  roomDoctor: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  roomPatient: {
    fontSize: 16,
    fontWeight: 600,
    color: '#334155',
    marginTop: 8,
  },
  // 底部提示
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 16,
    padding: 12,
  },
  // 普通页面样式（返回按钮等）
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#64748b',
    cursor: 'pointer',
  },
  // Tab 切换
  tabBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: 0,
  },
  tab: {
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    transition: 'all 0.2s',
    color: '#64748b',
  },
  tabActive: {
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid #1a3a5c',
    marginBottom: -2,
    color: '#1a3a5c',
  },
}

// ---------- 状态颜色 ----------
const statusColors: Record<PatientStatus, { bg: string; text: string }> = {
  '等待': { bg: '#e2e8f0', text: '#475569' },
  '已呼叫': { bg: '#fef3c7', text: '#92400e' },
  '检查中': { bg: '#dbeafe', text: '#1e40af' },
  '已完成': { bg: '#dcfce7', text: '#166534' },
}

const roomStatusColors: Record<RoomStatus, { bg: string; text: string }> = {
  '空闲': { bg: '#dcfce7', text: '#166534' },
  '检查中': { bg: '#dbeafe', text: '#1e40af' },
  '准备中': { bg: '#fef3c7', text: '#92400e' },
}

// 叫号状态配置（映射 AppointmentStatus -> PatientStatus）
const QUEUE_STATUS_MAP: Record<AppointmentStatus, PatientStatus> = {
  '待确认': '等待',
  '已确认': '等待',
  '检查中': '检查中',
  '已完成': '已完成',
  '已取消': '已完成',
  '迟到': '等待',
  '待检查': '等待',
  '进行中': '检查中',
}

// ---------- 组件 ----------
export default function QueueCallPage() {
  const today = '2026-04-29'

  // 从今日预约中构建叫号队列
  const [queuePatients, setQueuePatients] = useState<QueuePatient[]>(() => {
    return initialAppointments
      .filter(apt => apt.appointmentDate === today && apt.status !== '已取消')
      .slice(0, 12)
      .map((apt, idx) => ({
        id: `Q${idx + 1}`,
        sequence: apt.queueNumber || idx + 1,
        name: apt.patientName,
        patientId: apt.patientId,
        examType: apt.examItemName,
        room: apt.examRoom,
        callTime: idx < 2 ? `${8 + Math.floor(idx / 2)}:${String(55 - idx * 5).padStart(2, '0')}` : '',
        status: idx === 0 ? '检查中' as PatientStatus : idx === 1 ? '已呼叫' as PatientStatus : '等待' as PatientStatus,
        appointmentId: apt.id,
      }))
  })

  const [rooms] = useState<ExamRoom[]>(mockRooms)

  const currentCall = queuePatients.find(p => p.status === '已呼叫')
  const nextPatient = queuePatients.find(p => p.status === '等待')
  const waitingList = queuePatients.filter(p => p.status === '等待' || p.status === '已呼叫')
  const completedCount = queuePatients.filter(p => p.status === '已完成').length
  const waitingCount = queuePatients.filter(p => p.status === '等待').length

  const avgWaitTime = useMemo(() => {
    const called = queuePatients.filter(p => p.callTime && p.status !== '等待')
    if (called.length === 0) return 0
    return Math.round(completedCount * 12 + waitingCount * 8)
  }, [queuePatients, completedCount, waitingCount])

  const handleCallNext = () => {
    setQueuePatients(prev => {
      const current = prev.find(p => p.status === '已呼叫')
      const inProgress = prev.find(p => p.status === '检查中')
      const next = prev.find(p => p.status === '等待')
      if (!next) return prev
      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      return prev.map(p => {
        if (p.id === inProgress?.id) return { ...p, status: '已完成' as PatientStatus }
        if (p.id === current?.id) return { ...p, status: '检查中' as PatientStatus }
        if (p.id === next.id) return { ...p, status: '已呼叫' as PatientStatus, callTime: now }
        return p
      })
    })
  }

  const handleRecall = () => {
    setQueuePatients(prev => prev.map(p => {
      if (p.status === '已呼叫' || p.status === '检查中') {
        return {
          ...p,
          callTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        }
      }
      return p
    }))
  }

  const handleSkip = () => {
    setQueuePatients(prev => {
      const current = prev.find(p => p.status === '已呼叫')
      const next = prev.find(p => p.status === '等待')
      if (!next) return prev
      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      return prev.map(p => {
        if (p.id === current?.id) return { ...p, status: '等待' as PatientStatus, callTime: '' }
        if (p.id === next.id) return { ...p, status: '已呼叫' as PatientStatus, callTime: now }
        return p
      })
    })
  }

  const handleComplete = (id: string) => {
    setQueuePatients(prev => prev.map(p =>
      p.id === id ? { ...p, status: '已完成' as PatientStatus } : p
    ))
  }

  const now = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>排队叫号系统</h1>
          <p style={s.subtitle}>
            <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {now}
            <span style={{ marginLeft: 12, color: '#94a3b8' }}>
              今日候诊 <strong style={{ color: '#1a3a5c' }}>{waitingCount}</strong> 人，
              已完成 <strong style={{ color: '#22c55e' }}>{completedCount}</strong> 例
            </span>
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={s.backBtn}>
            <RefreshCw size={15} />
            刷新数据
          </button>
        </div>
      </div>

      {/* 叫号大屏（深色背景） */}
      <div style={s.callPage}>
        <div style={s.callContainer}>
          {/* 标题 */}
          <div style={s.callHeader}>
            <div style={s.callHeaderTitle}>
              <Speaker size={36} color="#4ade80" />
              超声中心叫号系统
            </div>
            <div style={s.callHeaderSubtitle}>Ultrasound Center Queue Call System</div>
          </div>

          {/* 统计概览 */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <div style={s.statValue}>{completedCount}</div>
              <div style={s.statLabel}>今日已检查</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{waitingCount}</div>
              <div style={s.statLabel}>当前等待</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{avgWaitTime}<span style={{ fontSize: 18 }}>分钟</span></div>
              <div style={s.statLabel}>预计候诊时间</div>
            </div>
          </div>

          {/* 诊室状态栏 */}
          <div style={s.roomSection}>
            <div style={s.panelHeader}>
              <Activity size={20} />
              诊室状态
            </div>
            <div style={{ padding: 16 }}>
              <div style={s.roomGrid}>
                {rooms.map(room => (
                  <div key={room.id} style={s.roomCard}>
                    <div style={s.roomName}>{room.name}</div>
                    <div style={{
                      ...s.roomStatus,
                      background: roomStatusColors[room.status].bg,
                      color: roomStatusColors[room.status].text,
                    }}>
                      {room.status === '空闲' && <PauseCircle size={16} />}
                      {room.status === '检查中' && <PlayCircle size={16} />}
                      {room.status === '准备中' && <RefreshCw size={16} />}
                      {room.status}
                    </div>
                    {room.currentPatient && (
                      <div style={s.roomPatient}>{room.currentPatient}</div>
                    )}
                    <div style={s.roomDoctor}>医生：{room.doctor}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 主内容区 */}
          <div style={s.mainGrid}>
            {/* 叫号大屏 */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <Speaker size={20} />
                当前叫号
              </div>
              <div style={s.callScreen}>
                <div style={s.currentCallLabel}>正在检查</div>
                {currentCall ? (
                  <>
                    <div style={s.currentCallNumber}>第 {currentCall.sequence} 号</div>
                    <div style={s.currentCallName}>{currentCall.name}</div>
                    <div style={s.currentCallInfo}>
                      <Microscope size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {currentCall.examType} | {currentCall.room}
                    </div>
                    <div style={s.currentCallInfo}>
                      <Clock size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      呼叫时间：{currentCall.callTime}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <span style={{
                        ...s.statusBadge,
                        background: statusColors['检查中'].bg,
                        color: statusColors['检查中'].text,
                      }}>
                        <Activity size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        检查中
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 24, color: '#94a3b8', padding: '40px 0' }}>
                    暂无叫号
                  </div>
                )}

                {nextPatient && (
                  <div style={s.nextPatientBox}>
                    <div style={s.nextPatientLabel}>下一位</div>
                    <div style={s.nextPatientValue}>
                      {nextPatient.name} - 第 {nextPatient.sequence} 号
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div style={s.buttonGroup}>
                  <button style={s.btnCallNext} onClick={handleCallNext}>
                    <Speaker size={22} />
                    呼叫下一位
                  </button>
                  <button style={s.btnRecall} onClick={handleRecall}>
                    <RefreshCw size={22} />
                    重呼
                  </button>
                  <button style={s.btnSkip} onClick={handleSkip}>
                    <SkipForward size={22} />
                    跳过
                  </button>
                </div>
              </div>
            </div>

            {/* 候诊区状态 */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <User size={20} />
                候诊区状态
              </div>
              <div style={s.waitingQueue}>
                <table style={s.queueTable}>
                  <thead>
                    <tr>
                      <th style={{ ...s.th, width: 60 }}>序号</th>
                      <th style={{ ...s.th, width: 80 }}>姓名</th>
                      <th style={{ ...s.th, width: 90 }}>检查项目</th>
                      <th style={{ ...s.th, width: 70 }}>诊室</th>
                      <th style={{ ...s.th, width: 80 }}>呼叫时间</th>
                      <th style={{ ...s.th }}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingList.slice(0, 8).map(patient => (
                      <tr key={patient.id}>
                        <td style={s.td}>{patient.sequence}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{patient.name}</td>
                        <td style={s.td}>{patient.examType}</td>
                        <td style={s.td}>{patient.room}</td>
                        <td style={s.td}>{patient.callTime || '-'}</td>
                        <td style={s.td}>
                          <span style={{
                            ...s.statusBadge,
                            background: statusColors[patient.status].bg,
                            color: statusColors[patient.status].text,
                          }}>
                            {patient.status === '已呼叫' && <Speaker size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                            {patient.status === '检查中' && <Activity size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                            {patient.status === '已完成' && <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                            {patient.status === '等待' && <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {waitingList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <Clock size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontSize: 14 }}>当前无候诊患者</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div style={s.footer}>
            超声中心叫号系统 v1.0 | 请保持网络连接通畅 | 支持语音呼叫集成
          </div>
        </div>
      </div>
    </div>
  )
}
