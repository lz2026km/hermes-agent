import React, { useState, useEffect, useRef } from 'react'
import {
  Video, Search, Plus, RefreshCw, Send, Image,
  MessageSquare, Wifi, Clock, User, Building2, Upload, Phone,
  Monitor, Check, X, ArrowRight, Edit3, Eraser, Type,
  Mic, MicOff, Printer, Download, Activity, Stethoscope,
  FileText, Star, ArrowUp, ArrowDown, Circle, Zap
} from 'lucide-react'

const C = {
  primary: '#1a365d',
  accent: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  white: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  text: '#1a365c',
  textLight: '#64748b',
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 700, color: C.primary, margin: 0 },
  subtitle: { fontSize: 13, color: C.textLight, marginTop: 4 },
  networkBar: { display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: `linear-gradient(135deg, ${C.success} 0%, #10b981 100%)`, borderRadius: 10, marginBottom: 20, color: C.white },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20 },
  kpiCard: { background: C.white, borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  kpiValue: { fontSize: 28, fontWeight: 700, color: C.primary },
  kpiLabel: { fontSize: 13, color: C.textLight, marginTop: 4 },
  tabRow: { display: 'flex', gap: 6, marginBottom: 20, borderBottom: `2px solid ${C.border}`, paddingBottom: 0 },
  tab: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 13, cursor: 'pointer' as const, border: 'none', background: 'transparent', color: C.textLight, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  tabActive: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 13, cursor: 'pointer' as const, border: 'none', background: C.primary, color: C.white, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
  card: { background: C.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` },
  cardTitle: { fontSize: 15, fontWeight: 600, color: C.primary, display: 'flex', alignItems: 'center', gap: 8 },
  badge: { padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 500 },
  mainContent: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },
  consList: { maxHeight: 440, overflowY: 'auto' as const },
  consItem: { padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8, cursor: 'pointer' as const },
  consItemActive: { padding: 12, borderRadius: 8, border: `2px solid ${C.accent}`, marginBottom: 8, cursor: 'pointer' as const, background: '#eff6ff' },
  // Tab2 实时会诊
  quadScreen: { display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, height: 360, marginBottom: 12 },
  quadPane: { background: '#0f172a', borderRadius: 8, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', position: 'relative' as const, minHeight: 160 },
  quadLabel: { color: '#94a3b8', fontSize: 12, position: 'absolute' as const, top: 8, left: 10 },
  quadParams: { color: '#10b981', fontSize: 11, position: 'absolute' as const, bottom: 8, right: 10 },
  toolBar: { display: 'flex', gap: 8, padding: '12px 0', borderTop: `1px solid ${C.border}`, marginTop: 12, flexWrap: 'wrap' as const },
  toolBtn: { padding: '7px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer' as const, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  toolBtnActive: { padding: '7px 14px', borderRadius: 6, border: 'none', background: C.primary, color: C.white, cursor: 'pointer' as const, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  callBtn: { padding: '7px 14px', borderRadius: 6, border: 'none', background: C.success, color: C.white, cursor: 'pointer' as const, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  callBtnEnd: { padding: '7px 14px', borderRadius: 6, border: 'none', background: C.danger, color: C.white, cursor: 'pointer' as const, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  // Tab3 报告
  reportSection: { marginBottom: 20 },
  reportRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  label: { fontSize: 13, color: C.textLight, marginBottom: 6 },
  input: { padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' as const, width: '100%', boxSizing: 'border-box' as const },
  textarea: { padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' as const, width: '100%', minHeight: 80, resize: 'vertical' as const, boxSizing: 'border-box' as const },
  stars: { display: 'flex', gap: 4, alignItems: 'center' },
  starBtn: { fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' as const, color: '#d1d5db', padding: '2px' },
  starBtnActive: { fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' as const, color: '#f59e0b', padding: '2px' },
  // Tab5 医联体
  hospitalGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  hospitalCard: { padding: 16, borderRadius: 8, border: `1px solid ${C.border}` },
  hospitalName: { fontWeight: 600, color: C.primary, marginBottom: 4 },
  hospitalStat: { fontSize: 12, color: C.textLight },
  meterRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  meterLabel: { fontSize: 13, color: C.textLight, width: 56 },
  meterBar: { flex: 1, height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' as const },
  meterFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  meterValue: { fontSize: 13, fontWeight: 600, width: 72, textAlign: 'right' as const },
  // Chat
  chatArea: { height: 320, overflowY: 'auto' as const, padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 12 },
  chatMsg: { marginBottom: 12, display: 'flex', gap: 8 },
  chatBubbleSelf: { background: C.accent, color: C.white },
  chatBubbleOther: { background: C.white, color: C.text, border: `1px solid ${C.border}` },
}

const DEMO_CONSULTATIONS = [
  { id: 'RC001', patient: '赵婉清', age: 45, gender: '女', examType: '腹部US', hospital: '东华区第一医院', doctor: '张明', status: 'pending', priority: 'urgent', reason: '肝右叶占位待确诊', date: '2026-05-01' },
  { id: 'RC002', patient: '孙铭远', age: 58, gender: '男', examType: '心血管US', hospital: '南港新城中心医院', doctor: '李娜', status: 'in_progress', priority: 'normal', reason: '主动脉瓣狭窄评估', date: '2026-05-01' },
  { id: 'RC003', patient: '周雨彤', age: 32, gender: '女', examType: '妇产科US', hospital: '国家医学中心直属医院', doctor: '王强', status: 'completed', priority: 'normal', reason: '胎儿生长评估', date: '2026-04-30' },
  { id: 'RC004', patient: '吴建华', age: 52, gender: '女', examType: '浅表器官US', hospital: '滨海新城医院', doctor: '陈静', status: 'pending', priority: 'normal', reason: '甲状腺结节TI-RADS 4类', date: '2026-04-30' },
  { id: 'RC005', patient: '郑雅琪', age: 65, gender: '男', examType: '腹部US', hospital: '东华区第一医院', doctor: '刘洋', status: 'completed', priority: 'urgent', reason: '胰尾占位性质待定', date: '2026-04-29' },
  { id: 'RC006', patient: '黄思远', age: 48, gender: '女', examType: '泌尿系统US', hospital: '南港新城中心医院', doctor: '张明', status: 'pending', priority: 'normal', reason: '左肾结石伴积水', date: '2026-05-02' },
  { id: 'RC007', patient: '林晓薇', age: 36, gender: '女', examType: '妇产科US', hospital: '国家医学中心直属医院', doctor: '李娜', status: 'in_progress', priority: 'urgent', reason: '宫内孕32周胎盘前置', date: '2026-05-02' },
  { id: 'RC008', patient: '徐明辉', age: 61, gender: '男', examType: '腹部US', hospital: '滨海新城医院', doctor: '王强', status: 'pending', priority: 'normal', reason: '脂肪肝伴肝囊肿', date: '2026-05-02' },
]

const DEMO_REALTIME = [
  { id: 'RV001', patient: '孙铭远', examType: '心血管US', hospital: '南港新城中心医院', duration: '00:12:35', bandwidth: 320, latency: 18 },
  { id: 'RV002', patient: '林晓薇', examType: '妇产科US', hospital: '国家医学中心直属医院', duration: '00:05:20', bandwidth: 280, latency: 22 },
]

const DEMO_REPORTS = [
  { id: 'HR001', patient: '赵婉清', examType: '腹部US', hospital: '东华区第一医院', doctor: '张明', conclusion: '肝血管瘤可能性大', suggestion: '建议增强CT进一步检查，3月后复查超声', followup: '3月后复查腹部超声+增强CT', critical: false, rating: 5, sig1: '张明', sig2: '王强', date: '2026-04-28', duration: '35分钟' },
  { id: 'HR002', patient: '孙铭远', examType: '心血管US', hospital: '南港新城中心医院', doctor: '李娜', conclusion: '主动脉瓣狭窄（中度）', suggestion: '建议定期复查心超，避免剧烈运动', followup: '6月后复查心功能', critical: false, rating: 4, sig1: '李娜', sig2: '陈静', date: '2026-04-27', duration: '28分钟' },
  { id: 'HR003', patient: '周雨彤', examType: '妇产科US', hospital: '国家医学中心直属医院', doctor: '王强', conclusion: '胎儿发育正常，胎位LOA', suggestion: '继续常规产检，注意休息', followup: '4周后复查', critical: false, rating: 5, sig1: '王强', sig2: '刘洋', date: '2026-04-26', duration: '42分钟' },
]

const MESSAGES = [
  { id: 1, type: 'other' as const, sender: '张明 · 东华区第一医院', content: '收到会诊申请，请上传最新的超声造影图像。', time: '09:30' },
  { id: 2, type: 'self' as const, sender: '我', content: '好的，已上传2张超声造影图像，请查阅。', time: '09:32' },
  { id: 3, type: 'other' as const, sender: '张明 · 东华区第一医院', content: '图像清晰。综合弹性成像表现，考虑肝血管瘤可能性大，建议增强CT进一步检查。', time: '10:15' },
]

const HOSPITALS = [
  { name: '东华区第一医院', experts: 12, consults: 86, response: '15分钟', online: true },
  { name: '南港新城中心医院', experts: 8, consults: 54, response: '22分钟', online: true },
  { name: '国家医学中心直属医院', experts: 15, consults: 103, response: '10分钟', online: true },
  { name: '滨海新城医院', experts: 6, consults: 38, response: '28分钟', online: false },
  { name: '青浦区分院', experts: 5, consults: 29, response: '35分钟', online: true },
  { name: '临港新城医院', experts: 9, consults: 61, response: '18分钟', online: false },
]

export default function RemoteConsultationPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedId, setSelectedId] = useState('RC001')
  const [selectedRealtime, setSelectedRealtime] = useState('RV001')
  const [searchText, setSearchText] = useState('')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState(MESSAGES)
  const [networkStatus, setNetworkStatus] = useState<'excellent' | 'good' | 'unstable'>('excellent')
  const [bandwidth, setBandwidth] = useState(280)
  const [latency, setLatency] = useState(12)
  // Tab2
  const [annotationTool, setAnnotationTool] = useState<'arrow' | 'brush' | 'text' | null>(null)
  const [isLiveCall, setIsLiveCall] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  // Tab3
  const [selectedReport, setSelectedReport] = useState('HR001')
  const [reportForm, setReportForm] = useState({
    conclusion: '肝血管瘤可能性大',
    suggestion: '建议增强CT进一步检查，3月后复查超声',
    followup: '3月后复查腹部超声+增强CT',
    critical: false,
    rating: 5,
    sig1: '张明',
    sig2: '王强',
  })
  // Tab5 network
  const [jitter, setJitter] = useState(5)
  const [packetLoss, setPacketLoss] = useState(0.1)

  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random()
      if (rand < 0.2) {
        setNetworkStatus('unstable')
        setLatency(Math.floor(Math.random() * 30) + 30)
        setJitter(Math.floor(Math.random() * 10) + 10)
        setPacketLoss(Number((Math.random() * 2 + 0.5).toFixed(1)))
      } else if (rand < 0.5) {
        setNetworkStatus('good')
        setLatency(Math.floor(Math.random() * 15) + 15)
        setJitter(Math.floor(Math.random() * 5) + 3)
        setPacketLoss(Number((Math.random() * 0.5).toFixed(1)))
      } else {
        setNetworkStatus('excellent')
        setBandwidth(Math.floor(Math.random() * 100) + 250)
        setLatency(Math.floor(Math.random() * 10) + 8)
        setJitter(Math.floor(Math.random() * 3) + 1)
        setPacketLoss(Number((Math.random() * 0.2).toFixed(1)))
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (isLiveCall) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(timer)
  }, [isLiveCall])

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const filtered = DEMO_CONSULTATIONS.filter(c =>
    c.patient.includes(searchText) || c.id.includes(searchText)
  )
  const selected = DEMO_CONSULTATIONS.find(c => c.id === selectedId)
  const realtimeSelected = DEMO_REALTIME.find(r => r.id === selectedRealtime)
  const reportSelected = DEMO_REPORTS.find(r => r.id === selectedReport)

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; text: string }> = {
      pending: { bg: '#fef3c7', color: '#d97706', text: '待会诊' },
      in_progress: { bg: '#dbeafe', color: '#2563eb', text: '会诊中' },
      completed: { bg: '#d1fae5', color: '#059669', text: '已完成' },
    }
    return map[status] || map.pending
  }

  const getPriorityBadge = (p: string) => {
    const map: Record<string, { bg: string; color: string; text: string }> = {
      urgent: { bg: '#fee2e2', color: '#dc2626', text: '紧急' },
      normal: { bg: '#f1f5f9', color: '#64748b', text: '普通' },
    }
    return map[p] || map.normal
  }

  const handleSend = () => {
    if (!inputText.trim()) return
    const newMsg = {
      id: messages.length + 1,
      type: 'self' as const,
      sender: '我',
      content: inputText,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages([...messages, newMsg])
    setInputText('')
  }

  const getMeterColor = (pct: number) => {
    if (pct >= 80) return C.success
    if (pct >= 50) return C.warning
    return C.danger
  }

  const getNetworkRating = () => {
    const bwPct = Math.min((bandwidth / 500) * 100, 100)
    const latPct = Math.max(0, 100 - (latency / 50) * 100)
    const jitPct = Math.max(0, 100 - (jitter / 20) * 100)
    const plPct = Math.max(0, 100 - (packetLoss / 5) * 100)
    const avg = (bwPct + latPct + jitPct + plPct) / 4
    if (avg >= 80) return { text: '极好', color: C.success }
    if (avg >= 60) return { text: '良好', color: C.accent }
    if (avg >= 40) return { text: '一般', color: C.warning }
    return { text: '差', color: C.danger }
  }

  const TABS = [
    { key: 'list', label: '会诊申请', icon: <FileText size={14} /> },
    { key: 'realtime', label: '实时会诊', icon: <Video size={14} /> },
    { key: 'report', label: '会诊报告', icon: <Stethoscope size={14} /> },
    { key: 'chat', label: '图文交流', icon: <MessageSquare size={14} /> },
    { key: 'alliance', label: '医联体', icon: <Building2 size={14} /> },
  ]

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>远程超声会诊</h1>
          <p style={s.subtitle}>5G远程医疗协作平台 · 医联体资源共享</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.badge, background: '#f1f5f9', color: C.textLight, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> 刷新
          </button>
          <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> 新建会诊
          </button>
        </div>
      </div>

      {/* 5G Network Status Bar */}
      <div style={s.networkBar}>
        <Zap size={20} />
        <span style={{ fontWeight: 600 }}>
          5G网络：{networkStatus === 'excellent' ? '极好' : networkStatus === 'good' ? '良好' : '不稳定'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 13 }}>
          <span>带宽：{bandwidth} Mbps</span>
          <span>延迟：{latency} ms</span>
          <span>抖动：{jitter} ms</span>
          <span>丢包：{packetLoss}%</span>
        </div>
      </div>

      {/* KPI Row */}
      <div style={s.kpiRow}>
        {[
          { value: 28, label: '待处理会诊', color: C.danger },
          { value: 12, label: '会诊中', color: C.accent },
          { value: 156, label: '本月完成', color: C.success },
          { value: 8, label: '医联体医院', color: '#7c3aed' },
          { value: 52, label: '在线专家', color: C.primary },
        ].map((k, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
            <div style={s.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            style={activeTab === tab.key ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab 1: 会诊申请 ===== */}
      {activeTab === 'list' && (
        <div style={s.mainContent}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><FileText size={16} color={C.primary} /> 会诊列表</span>
              <input
                style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 220 }}
                placeholder="搜索患者/会诊号..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <div style={s.consList}>
              {filtered.map(c => {
                const sb = getStatusBadge(c.status)
                const pb = getPriorityBadge(c.priority)
                return (
                  <div
                    key={c.id}
                    style={c.id === selectedId ? s.consItemActive : s.consItem}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: C.primary }}>{c.patient} · {c.age}岁{c.gender}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ ...s.badge, background: pb.bg, color: pb.color }}>{pb.text}</span>
                        <span style={{ ...s.badge, background: sb.bg, color: sb.color }}>{sb.text}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: C.textLight }}>
                      <span style={{ marginRight: 12 }}>{c.examType}</span>
                      <span>{c.hospital}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.reason}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {selected && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}><User size={16} color={C.primary} /> 会诊详情</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.primary, marginBottom: 12 }}>{selected.patient}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: '#94a3b8' }}>年龄：</span>{selected.age}岁</div>
                  <div><span style={{ color: '#94a3b8' }}>性别：</span>{selected.gender}</div>
                  <div><span style={{ color: '#94a3b8' }}>检查：</span>{selected.examType}</div>
                  <div><span style={{ color: '#94a3b8' }}>会诊号：</span>{selected.id}</div>
                  <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#94a3b8' }}>目的医院：</span>{selected.hospital}</div>
                  <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#94a3b8' }}>会诊原因：</span>{selected.reason}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setActiveTab('realtime'); setSelectedRealtime('RV001') }}
                  style={{ flex: 1, padding: '8px 12px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Video size={14} /> 发起会诊
                </button>
                <button style={{ flex: 1, padding: '8px 12px', background: '#f1f5f9', color: C.textLight, border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Phone size={14} /> 联系对方
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Tab 2: 实时会诊（四分屏+标注工具） ===== */}
      {activeTab === 'realtime' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><Video size={16} color={C.primary} /> 实时超声会诊</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {DEMO_REALTIME.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRealtime(r.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      border: `1px solid ${r.id === selectedRealtime ? C.accent : C.border}`,
                      background: r.id === selectedRealtime ? '#eff6ff' : C.white,
                      color: r.id === selectedRealtime ? C.accent : C.textLight,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {r.id} · {r.patient}
                  </button>
                ))}
              </div>
            </div>

            {/* 四分屏 */}
            <div style={s.quadScreen}>
              {/* 左上：超声图像 */}
              <div style={s.quadPane}>
                <span style={s.quadLabel}>超声图像</span>
                <div style={{ textAlign: 'center' }}>
                  <Activity size={36} color="#334155" />
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>实时超声</div>
                  <div style={{ color: '#10b981', fontSize: 11, marginTop: 4 }}>B-Mode</div>
                </div>
                <span style={s.quadParams}>深度:15cm 增益:72</span>
              </div>
              {/* 右上：操作手法 */}
              <div style={s.quadPane}>
                <span style={s.quadLabel}>操作手法</span>
                <div style={{ textAlign: 'center' }}>
                  <Video size={36} color="#334155" />
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>操作手法同步</div>
                </div>
                <span style={s.quadParams}>频率:3.5MHz TGC:5</span>
              </div>
              {/* 左下：申请方专家 */}
              <div style={s.quadPane}>
                <span style={s.quadLabel}>申请方专家</span>
                <div style={{ textAlign: 'center' }}>
                  <User size={36} color="#334155" />
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>{realtimeSelected?.hospital?.split(' ')[0]}</div>
                </div>
                <span style={{ ...s.quadLabel, top: 8, left: 10, color: '#10b981', fontSize: 11 }}>● 通话中</span>
              </div>
              {/* 右下：会诊方专家 */}
              <div style={s.quadPane}>
                <span style={s.quadLabel}>会诊方专家</span>
                <div style={{ textAlign: 'center' }}>
                  <User size={36} color="#334155" />
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>东华区第一医院</div>
                </div>
                <span style={{ ...s.quadLabel, top: 8, left: 10, color: '#10b981', fontSize: 11 }}>● 通话中</span>
              </div>
            </div>

            {/* 超声参数条 */}
            <div style={{ display: 'flex', gap: 16, padding: '8px 16px', background: '#f8fafc', borderRadius: 6, marginBottom: 12, fontSize: 12, color: C.textLight }}>
              <span>深度: <strong style={{ color: C.primary }}>15cm</strong></span>
              <span>增益: <strong style={{ color: C.primary }}>72</strong></span>
              <span>频率: <strong style={{ color: C.primary }}>3.5MHz</strong></span>
              <span>TGC: <strong style={{ color: C.primary }}>5</strong></span>
              <span>探头: <strong style={{ color: C.primary }}>凸阵</strong></span>
            </div>

            {/* 标注工具栏 */}
            <div style={s.toolBar}>
              <button
                style={!isLiveCall ? s.callBtn : s.callBtnEnd}
                onClick={() => setIsLiveCall(!isLiveCall)}
              >
                {isLiveCall ? <Phone size={14} /> : <Video size={14} />}
                {isLiveCall ? '停止会诊' : '开始会诊'}
              </button>
              <span style={{ width: 1, background: C.border, margin: '0 4px' }} />
              <button
                style={annotationTool === 'arrow' ? s.toolBtnActive : s.toolBtn}
                onClick={() => setAnnotationTool(annotationTool === 'arrow' ? null : 'arrow')}
              >
                <ArrowRight size={14} /> 箭头标注
              </button>
              <button
                style={annotationTool === 'brush' ? s.toolBtnActive : s.toolBtn}
                onClick={() => setAnnotationTool(annotationTool === 'brush' ? null : 'brush')}
              >
                <Edit3 size={14} /> 画笔标注
              </button>
              <button
                style={annotationTool === 'text' ? s.toolBtnActive : s.toolBtn}
                onClick={() => setAnnotationTool(annotationTool === 'text' ? null : 'text')}
              >
                <Type size={14} /> 文字标注
              </button>
              <button style={s.toolBtn} onClick={() => setAnnotationTool(null)}>
                <Eraser size={14} /> 清除
              </button>
              <span style={{ width: 1, background: C.border, margin: '0 4px' }} />
              <button style={s.toolBtn}>
                <Image size={14} /> 冻结图像
              </button>
              <button style={s.toolBtn}>
                <Download size={14} /> 截图
              </button>
              <button style={{ ...s.toolBtn, marginLeft: 'auto' }} onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff size={14} color={C.danger} /> : <Mic size={14} />}
                {isMuted ? '取消静音' : '静音'}
              </button>
            </div>
          </div>

          {/* 右侧信息栏 */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><Activity size={16} color={C.primary} /> 会诊信息</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '8px 12px', background: '#f0f9ff', borderRadius: 6, fontSize: 13 }}>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>患者</div>
                <div style={{ fontWeight: 600, color: C.primary }}>{realtimeSelected?.patient}</div>
              </div>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>检查类型</div>
                <div style={{ fontWeight: 600, color: C.primary }}>{realtimeSelected?.examType}</div>
              </div>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>目的医院</div>
                <div style={{ fontWeight: 600, color: C.primary }}>{realtimeSelected?.hospital}</div>
              </div>
              <div style={{ padding: '8px 12px', background: isLiveCall ? '#f0fdf4' : '#fef2f2', borderRadius: 6, fontSize: 13 }}>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>通话计时</div>
                <div style={{ fontWeight: 700, fontSize: 20, color: isLiveCall ? C.success : C.textLight, fontFamily: 'monospace' }}>
                  {isLiveCall ? fmtTime(callDuration) : '00:00:00'}
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>当前带宽</div>
                <div style={{ fontWeight: 600, color: C.primary }}>{bandwidth} Mbps</div>
              </div>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>当前延迟</div>
                <div style={{ fontWeight: 600, color: latency > 30 ? C.danger : latency > 15 ? C.warning : C.success }}>{latency} ms</div>
              </div>
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>网络质量</div>
                <div style={{ fontWeight: 700, color: getNetworkRating().color }}>{getNetworkRating().text}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Tab 3: 会诊报告 ===== */}
      {activeTab === 'report' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Stethoscope size={16} color={C.primary} /> 结构化会诊报告</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {DEMO_REPORTS.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedReport(r.id)
                    setReportForm({
                      conclusion: r.conclusion,
                      suggestion: r.suggestion,
                      followup: r.followup,
                      critical: r.critical,
                      rating: r.rating,
                      sig1: r.sig1,
                      sig2: r.sig2,
                    })
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    border: `1px solid ${r.id === selectedReport ? C.accent : C.border}`,
                    background: r.id === selectedReport ? '#eff6ff' : C.white,
                    color: r.id === selectedReport ? C.accent : C.textLight,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {r.id}
                </button>
              ))}
            </div>
          </div>

          <div style={s.reportSection}>
            {/* 报告信息 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, marginBottom: 20 }}>
              <div><span style={{ color: '#94a3b8', fontSize: 12 }}>患者：</span><strong style={{ color: C.primary }}>{reportSelected?.patient}</strong></div>
              <div><span style={{ color: '#94a3b8', fontSize: 12 }}>检查：</span><strong style={{ color: C.primary }}>{reportSelected?.examType}</strong></div>
              <div><span style={{ color: '#94a3b8', fontSize: 12 }}>会诊医院：</span><strong style={{ color: C.primary }}>{reportSelected?.hospital}</strong></div>
              <div><span style={{ color: '#94a3b8', fontSize: 12 }}>会诊医师：</span><strong style={{ color: C.primary }}>{reportSelected?.doctor}</strong></div>
            </div>

            {/* 诊断结论 */}
            <div style={{ marginBottom: 16 }}>
              <div style={s.label}>诊断结论</div>
              <textarea
                style={s.textarea}
                value={reportForm.conclusion}
                onChange={e => setReportForm(f => ({ ...f, conclusion: e.target.value }))}
                placeholder="请输入诊断结论..."
              />
            </div>

            <div style={s.reportRow}>
              <div>
                <div style={s.label}>诊疗建议</div>
                <textarea
                  style={s.textarea}
                  value={reportForm.suggestion}
                  onChange={e => setReportForm(f => ({ ...f, suggestion: e.target.value }))}
                  placeholder="请输入诊疗建议..."
                />
              </div>
              <div>
                <div style={s.label}>随访建议</div>
                <textarea
                  style={s.textarea}
                  value={reportForm.followup}
                  onChange={e => setReportForm(f => ({ ...f, followup: e.target.value }))}
                  placeholder="请输入随访建议..."
                />
              </div>
            </div>

            <div style={s.reportRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <input
                  type="checkbox"
                  id="critical"
                  checked={reportForm.critical}
                  onChange={e => setReportForm(f => ({ ...f, critical: e.target.checked }))}
                />
                <label htmlFor="critical" style={{ fontSize: 14, color: C.primary, fontWeight: 600 }}>危急值标注</label>
                {reportForm.critical && (
                  <span style={{ padding: '4px 12px', background: '#fee2e2', color: C.danger, borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                    ⚠ 需立即通知临床
                  </span>
                )}
              </div>
              <div>
                <div style={s.label}>会诊满意度</div>
                <div style={s.stars}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      onClick={() => setReportForm(f => ({ ...f, rating: v }))}
                      style={v <= reportForm.rating ? s.starBtnActive : s.starBtn}
                    >
                      <Star size={22} fill={v <= reportForm.rating ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                  <span style={{ marginLeft: 8, fontSize: 13, color: C.textLight }}>{reportForm.rating}分</span>
                </div>
              </div>
            </div>

            <div style={s.reportRow}>
              <div>
                <div style={s.label}>申请医生签名</div>
                <input
                  style={s.input}
                  value={reportForm.sig1}
                  onChange={e => setReportForm(f => ({ ...f, sig1: e.target.value }))}
                />
              </div>
              <div>
                <div style={s.label}>会诊专家签名</div>
                <input
                  style={s.input}
                  value={reportForm.sig2}
                  onChange={e => setReportForm(f => ({ ...f, sig2: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            <button style={{ flex: 1, padding: '10px 20px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}>
              <Check size={16} /> 保存报告
            </button>
            <button style={{ flex: 1, padding: '10px 20px', background: '#f1f5f9', color: C.primary, border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}>
              <Printer size={16} /> 打印预览
            </button>
          </div>
        </div>
      )}

      {/* ===== Tab 4: 图文交流 ===== */}
      {activeTab === 'chat' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><MessageSquare size={16} color={C.primary} /> 实时沟通</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{selected?.hospital} · {selected?.doctor}</span>
          </div>
          <div style={s.chatArea}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{ ...s.chatMsg, ...(m.type === 'self' ? { flexDirection: 'row-reverse' } : {}) }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: m.type === 'self' ? C.accent : C.success,
                  color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 12, flexShrink: 0
                }}>
                  {m.sender[0]}
                </div>
                <div style={{ ...s.chatBubble, ...(m.type === 'self' ? s.chatBubbleSelf : s.chatBubbleOther) }}>
                  <div style={{ fontSize: 11, color: m.type === 'self' ? '#bfdbfe' : '#94a3b8', marginBottom: 2 }}>{m.sender}</div>
                  {m.content}
                  <div style={{ fontSize: 10, color: m.type === 'self' ? '#bfdbfe' : '#94a3b8', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          {/* 网络状态条 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 8, padding: '4px 8px', background: '#f0fdf4', borderRadius: 4, fontSize: 11, color: C.success }}>
            <span>● {networkStatus === 'excellent' ? '极好' : networkStatus === 'good' ? '良好' : '不稳定'}</span>
            <span>带宽: {bandwidth}Mbps</span>
            <span>延迟: {latency}ms</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }}
              placeholder="输入会诊意见..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              style={{ padding: '8px 16px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Send size={14} /> 发送
            </button>
          </div>
        </div>
      )}

      {/* ===== Tab 5: 医联体协作 ===== */}
      {activeTab === 'alliance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* 左侧：医院网络 */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><Building2 size={16} color={C.primary} /> 医联体协作医院</span>
              <span style={{ fontSize: 13, color: C.textLight }}>在线专家：<strong style={{ color: C.success }}>52</strong> 人</span>
            </div>
            <div style={s.hospitalGrid}>
              {HOSPITALS.map((h, i) => (
                <div key={i} style={s.hospitalCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.online ? C.success : '#94a3b8', display: 'inline-block' }} />
                    <span style={s.hospitalName}>{h.name}</span>
                  </div>
                  <div style={s.hospitalStat}>专家：{h.experts}位 · 本月会诊：{h.consults}次</div>
                  <div style={s.hospitalStat}>平均响应：{h.response}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：5G网络质量监控 */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><Zap size={16} color={C.warning} /> 5G网络质量监控</span>
              <span style={{ padding: '4px 12px', background: '#f0fdf4', borderRadius: 6, fontSize: 13, fontWeight: 700, color: getNetworkRating().color }}>
                {getNetworkRating().text}
              </span>
            </div>

            {/* 带宽 */}
            <div style={s.meterRow}>
              <span style={s.meterLabel}>带宽</span>
              <div style={s.meterBar}>
                <div style={{ ...s.meterFill, width: `${Math.min((bandwidth / 500) * 100, 100)}%`, background: getMeterColor((bandwidth / 500) * 100) }} />
              </div>
              <span style={{ ...s.meterValue, color: getMeterColor((bandwidth / 500) * 100) }}>{bandwidth} Mbps</span>
            </div>

            {/* 延迟 */}
            <div style={s.meterRow}>
              <span style={s.meterLabel}>延迟</span>
              <div style={s.meterBar}>
                <div style={{ ...s.meterFill, width: `${Math.max(0, 100 - (latency / 50) * 100)}%`, background: getMeterColor(Math.max(0, 100 - (latency / 50) * 100)) }} />
              </div>
              <span style={{ ...s.meterValue, color: getMeterColor(Math.max(0, 100 - (latency / 50) * 100)) }}>{latency} ms</span>
            </div>

            {/* 抖动 */}
            <div style={s.meterRow}>
              <span style={s.meterLabel}>抖动</span>
              <div style={s.meterBar}>
                <div style={{ ...s.meterFill, width: `${Math.max(0, 100 - (jitter / 20) * 100)}%`, background: getMeterColor(Math.max(0, 100 - (jitter / 20) * 100)) }} />
              </div>
              <span style={{ ...s.meterValue, color: getMeterColor(Math.max(0, 100 - (jitter / 20) * 100)) }}>{jitter} ms</span>
            </div>

            {/* 丢包率 */}
            <div style={s.meterRow}>
              <span style={s.meterLabel}>丢包率</span>
              <div style={s.meterBar}>
                <div style={{ ...s.meterFill, width: `${Math.max(0, 100 - (packetLoss / 5) * 100)}%`, background: getMeterColor(Math.max(0, 100 - (packetLoss / 5) * 100)) }} />
              </div>
              <span style={{ ...s.meterValue, color: getMeterColor(Math.max(0, 100 - (packetLoss / 5) * 100)) }}>{packetLoss}%</span>
            </div>

            {/* 自动降质 */}
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
              <div style={{ fontWeight: 600, color: C.warning, fontSize: 13, marginBottom: 8 }}>⚡ 自动降质策略</div>
              <div style={{ fontSize: 12, color: C.textLight }}>
                <div style={{ marginBottom: 4 }}>当网络质量下降时，自动切换：</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <span style={{ padding: '2px 8px', background: C.success, color: C.white, borderRadius: 4, fontSize: 11 }}>高清</span>
                  <ArrowRight size={12} color={C.textLight} />
                  <span style={{ padding: '2px 8px', background: C.warning, color: C.white, borderRadius: 4, fontSize: 11 }}>标清</span>
                  <ArrowRight size={12} color={C.textLight} />
                  <span style={{ padding: '2px 8px', background: C.danger, color: C.white, borderRadius: 4, fontSize: 11 }}>音频模式</span>
                </div>
              </div>
            </div>

            {/* 技术参数 */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '编码格式', value: 'H.265/HEVC' },
                { label: '帧率', value: '30fps' },
                { label: '分辨率', value: '1920×1080' },
                { label: '音频编码', value: 'AAC-LC' },
              ].map((p, i) => (
                <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
                  <span style={{ color: '#94a3b8' }}>{p.label}：</span>
                  <strong style={{ color: C.primary }}>{p.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
