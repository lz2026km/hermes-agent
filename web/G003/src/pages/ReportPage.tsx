// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 报告列表查询页面 v0.13.0
// 功能：报告查询/预览/修改/打印/历史对比/电子签名
// ============================================================
import { useState, useMemo } from 'react'
import {
  FileText, Search, Filter, Printer, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, Download, Upload, X, Check,
  Clock, User, Stethoscope, Activity, ShieldCheck, AlertTriangle,
  CheckCircle, XCircle, ArrowLeftRight, Signature, BarChart3,
  Calendar, RefreshCw, Tag, Star, History
} from 'lucide-react'
import type { UltrasoundReport, ReportStatus } from '../types'
import { initialUltrasoundReports, initialPatients, initialUltrasoundExams, initialUsers } from '../data/initialData'

type FilterStatus = '全部' | '待写' | '已写' | '已审' | '已发布' | '危急值'

// 状态配色
const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  '待写':       { bg: '#fef3c7', text: '#92400e', label: '待写报告' },
  '已写':       { bg: '#dbeafe', text: '#1e40af', label: '已提交' },
  '已审':       { bg: '#d1fae5', text: '#065f46', label: '已审核' },
  '已发布':     { bg: '#e0e7ff', text: '#3730a3', label: '已发布' },
  '危急值':     { bg: '#fee2e2', text: '#991b1b', label: '危急值' },
}

export default function ReportPage() {
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('全部')
  const [filterDoctor, setFilterDoctor] = useState('全部')
  const [filterDevice, setFilterDevice] = useState('全部')
  const [filterDateRange, setFilterDateRange] = useState('今日')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<UltrasoundReport | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'statistics'>('list')
  const pageSize = 10

  // 合并所有报告数据（含v0500）
  const allReports = useMemo(() => {
    const base = [...initialUltrasoundReports]
    return base
  }, [])

  // 报告医师列表
  const doctors = useMemo(() => {
    const ids = [...new Set(allReports.map(r => r.reportDoctorId).filter(Boolean))]
    return ids.map(id => {
      const u = initialUsers.find(u => u.id === id)
      return { id, name: u?.name || id }
    })
  }, [allReports])

  // 设备列表
  const devices = useMemo(() => {
    const ids = [...new Set(allReports.map(r => r.deviceId).filter(Boolean))]
    return ids
  }, [allReports])

  // 日期筛选
  const dateFiltered = useMemo(() => {
    const now = new Date()
    let start: Date | null = null
    if (filterDateRange === '今日') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (filterDateRange === '本周') {
      const d = new Date(now)
      d.setDate(d.getDate() - d.getDay())
      start = d
    } else if (filterDateRange === '本月') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    if (!start) return allReports
    return allReports.filter(r => new Date(r.examDate) >= start!)
  }, [allReports, filterDateRange])

  // 过滤
  const filtered = useMemo(() => {
    let list = dateFiltered
    if (filterStatus !== '全部') {
      const map: Record<string, string[]> = {
        '待写': ['draft', 'pending'],
        '已写': ['submitted'],
        '已审': ['approved'],
        '已发布': ['published'],
        '危急值': ['critical'],
      }
      list = list.filter(r => map[filterStatus]?.includes(r.status))
    }
    if (filterDoctor !== '全部') {
      list = list.filter(r => r.reportDoctorId === filterDoctor)
    }
    if (filterDevice !== '全部') {
      list = list.filter(r => r.deviceId === filterDevice)
    }
    if (searchText.trim()) {
      const kw = searchText.toLowerCase()
      list = list.filter(r =>
        r.patientName?.toLowerCase().includes(kw) ||
        r.patientId?.toLowerCase().includes(kw) ||
        r.reportId?.toLowerCase().includes(kw) ||
        r.findings?.toLowerCase().includes(kw) ||
        r.diagnosis?.toLowerCase().includes(kw) ||
        r.examType?.toLowerCase().includes(kw)
      )
    }
    return list
  }, [dateFiltered, filterStatus, filterDoctor, filterDevice, searchText])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 统计
  const stats = useMemo(() => {
    const total = allReports.length
    const todayCount = allReports.filter(r => {
      const d = new Date(r.examDate)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    }).length
    const critical = allReports.filter(r => r.status === 'critical').length
    const approved = allReports.filter(r => r.status === 'approved' || r.status === 'published').length
    const pending = allReports.filter(r => ['draft','pending'].includes(r.status)).length
    return { total, todayCount, critical, approved, pending }
  }, [allReports])

  // 获取患者信息
  const getPatient = (id: string) => initialPatients.find(p => p.id === id)
  const getDoctor = (id: string) => initialUsers.find(u => u.id === id)
  const getExam = (id: string) => initialUltrasoundExams.find(e => e.id === id)

  const openPreview = (report: UltrasoundReport) => {
    setSelectedReport(report)
    setShowPreview(true)
  }

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={26} style={{ color: '#3b82f6' }} />
          超声报告管理
          <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}>共 {filtered.length} 份报告</span>
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          报告查询 · 历史对比 · 预览打印 · 审核发布
        </p>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '今日报告', value: stats.todayCount, icon: <FileText size={18} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: '待写报告', value: stats.pending, icon: <Clock size={18} />, color: '#f59e0b', bg: '#fffbeb' },
          { label: '已审核', value: stats.approved, icon: <CheckCircle size={18} />, color: '#10b981', bg: '#ecfdf5' },
          { label: '危急值', value: stats.critical, icon: <AlertTriangle size={18} />, color: '#ef4444', bg: '#fef2f2' },
          { label: '总报告量', value: stats.total, icon: <BarChart3 size={18} />, color: '#6366f1', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${s.color}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 标签页 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#e2e8f0', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[['list', '报告列表'], ['statistics', '统计分析']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#3b82f6' : '#64748b',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <>
          {/* 筛选栏 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* 搜索 */}
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1) }}
                  placeholder="搜索患者姓名/ID/报告号/诊断..."
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 12, height: 38, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* 状态 */}
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as FilterStatus); setCurrentPage(1) }}
                style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#475569', background: '#fff', cursor: 'pointer' }}>
                {(['全部', '待写', '已写', '已审', '已发布', '危急值'] as FilterStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* 医师 */}
              <select value={filterDoctor} onChange={e => { setFilterDoctor(e.target.value); setCurrentPage(1) }}
                style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#475569', background: '#fff', cursor: 'pointer' }}>
                <option value="全部">全部医师</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              {/* 设备 */}
              <select value={filterDevice} onChange={e => { setFilterDevice(e.target.value); setCurrentPage(1) }}
                style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#475569', background: '#fff', cursor: 'pointer' }}>
                <option value="全部">全部设备</option>
                {devices.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              {/* 日期 */}
              <select value={filterDateRange} onChange={e => { setFilterDateRange(e.target.value); setCurrentPage(1) }}
                style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#475569', background: '#fff', cursor: 'pointer' }}>
                {['今日', '本周', '本月', '全部'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <button onClick={() => { setSearchText(''); setFilterStatus('全部'); setFilterDoctor('全部'); setFilterDevice('全部'); setFilterDateRange('今日'); setCurrentPage(1) }}
                style={{ height: 38, padding: '0 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={14} /> 重置
              </button>
            </div>
          </div>

          {/* 报告列表 */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['报告号', '患者', '检查项目', '设备', '检查日期', '报告医师', '审核医师', '状态', '操作'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    <FileText size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
                    未找到匹配的报告
                  </td></tr>
                ) : paged.map((r, i) => {
                  const patient = getPatient(r.patientId)
                  const doctor = getDoctor(r.reportDoctorId)
                  const auditor = getDoctor(r.auditorId)
                  const sc = STATUS_COLORS[r.status === 'pending' ? '待写' : r.status === 'draft' ? '待写' : r.status === 'submitted' ? '已写' : r.status === 'approved' ? '已审' : r.status === 'published' ? '已发布' : r.status === 'critical' ? '危急值' : '已写']
                  return (
                    <tr key={r.reportId || i} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => openPreview(r)}>
                      <td style={{ padding: '11px 14px', color: '#3b82f6', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{r.reportId}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.patientName || patient?.name || '-'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{patient?.gender} {patient?.age}岁</div>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>{r.examType}</td>
                      <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 12 }}>{r.deviceId}</td>
                      <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 12 }}>{r.examDate}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ color: '#1e293b', fontWeight: 500 }}>{doctor?.name || r.reportDoctorId}</div>
                        {r.signedAt && <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.signedAt}</div>}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ color: '#1e293b', fontWeight: 500 }}>{auditor?.name || r.auditorId || '-'}</div>
                        {r.approvedAt && <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.approvedAt}</div>}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc?.bg || '#f1f5f9', color: sc?.text || '#64748b' }}>
                          {sc?.label || r.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openPreview(r)} title="预览" style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Eye size={13} style={{ color: '#64748b' }} />
                          </button>
                          <button title="历史对比" onClick={() => { setSelectedReport(r); setShowHistory(true) }}
                            style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <History size={13} style={{ color: '#64748b' }} />
                          </button>
                          <button title="打印" onClick={() => window.print()}
                            style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Printer size={13} style={{ color: '#64748b' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* 分页 */}
            {filtered.length > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>第 {currentPage} / {totalPages} 页，共 {filtered.length} 条</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontSize: 12 }}>首页</button>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ChevronLeft size={13} /> 上一页
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return <button key={p} onClick={() => setCurrentPage(p)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: currentPage === p ? '#3b82f6' : '#fff', color: currentPage === p ? '#fff' : '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: currentPage === p ? 600 : 400 }}>{p}</button>
                  })}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    下一页 <ChevronRight size={13} />
                  </button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontSize: 12 }}>末页</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'statistics' && (
        <ReportStatistics reports={filtered} />
      )}

      {/* 报告预览弹窗 */}
      {showPreview && selectedReport && (
        <ReportPreviewModal
          report={selectedReport}
          patient={getPatient(selectedReport.patientId)}
          doctor={getDoctor(selectedReport.reportDoctorId)}
          auditor={getDoctor(selectedReport.auditorId)}
          exam={getExam(selectedReport.examId)}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* 历史对比弹窗 */}
      {showHistory && selectedReport && (
        <HistoryCompareModal
          report={selectedReport}
          allReports={allReports.filter(r => r.patientId === selectedReport.patientId)}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}

// ============================================================
// 报告预览弹窗
// ============================================================
function ReportPreviewModal({ report, patient, doctor, auditor, exam, onClose }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 820, maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>超声报告预览</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>报告号：{report.reportId}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.print()} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={14} /> 打印报告
            </button>
            <button onClick={onClose} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 患者信息 */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 20px', fontSize: 13 }}>
            {[
              ['患者姓名', patient?.name || '-'],
              ['性别/年龄', `${patient?.gender || ''} ${patient?.age || ''}岁`],
              ['联系电话', patient?.phone || '-'],
              ['身份证号', patient?.idCard || '-'],
              ['检查项目', report.examType],
              ['检查日期', report.examDate],
              ['设备编号', report.deviceId],
              ['检查医师', auditor?.name || '-'],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 报告内容 */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stethoscope size={14} /> 超声描述
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.8, color: '#334155', minHeight: 100, whiteSpace: 'pre-wrap' }}>
                {report.findings || '（未填写）'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} /> 超声诊断
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.8, color: '#334155', minHeight: 100, whiteSpace: 'pre-wrap' }}>
                {report.diagnosis || '（未填写）'}
              </div>
            </div>
          </div>

          {/* 签名信息 */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#f8fafc', borderRadius: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 12 }}>
            <div>
              <div style={{ color: '#94a3b8', marginBottom: 3 }}>报告医师</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{doctor?.name || '-'}</div>
              {report.signedAt && <div style={{ color: '#64748b', marginTop: 2 }}>签名时间：{report.signedAt}</div>}
            </div>
            <div>
              <div style={{ color: '#94a3b8', marginBottom: 3 }}>审核医师</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{auditor?.name || '-'}</div>
              {report.approvedAt && <div style={{ color: '#64748b', marginTop: 2 }}>审核时间：{report.approvedAt}</div>}
            </div>
            <div>
              <div style={{ color: '#94a3b8', marginBottom: 3 }}>报告状态</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{report.status}</div>
              <div style={{ color: '#64748b', marginTop: 2 }}>发布时间：{report.publishedAt || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 历史对比弹窗
// ============================================================
function HistoryCompareModal({ report, allReports, onClose }: any) {
  const history = allReports.sort((a: any, b: any) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
  const current = history.findIndex((r: any) => r.reportId === report.reportId)
  const prev = history[current + 1]
  const next = history[current - 1]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>报告历史对比</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>患者：{report.patientName} · 共 {history.length} 份历史报告</p>
          </div>
          <button onClick={onClose} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* 当前报告 */}
            {report && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={14} /> 当前报告（{report.examDate}）
                </div>
                <div style={{ border: '2px solid #3b82f6', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: '#eff6ff', fontSize: 12, fontWeight: 600, color: '#1e40af' }}>{report.examType} · {report.reportId}</div>
                  <div style={{ padding: 14, fontSize: 12 }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ color: '#94a3b8', marginBottom: 3 }}>超声描述</div>
                      <div style={{ background: '#f8fafc', borderRadius: 6, padding: 10, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 150, overflow: 'auto' }}>{report.findings || '（空）'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', marginBottom: 3 }}>超声诊断</div>
                      <div style={{ background: '#f8fafc', borderRadius: 6, padding: 10, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'auto' }}>{report.diagnosis || '（空）'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* 历史报告 */}
            {prev ? (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <History size={14} /> 历史报告（{prev.examDate}）
                </div>
                <div style={{ border: '2px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: '#f8fafc', fontSize: 12, fontWeight: 600, color: '#64748b' }}>{prev.examType} · {prev.reportId}</div>
                  <div style={{ padding: 14, fontSize: 12 }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ color: '#94a3b8', marginBottom: 3 }}>超声描述</div>
                      <div style={{ background: '#f8fafc', borderRadius: 6, padding: 10, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 150, overflow: 'auto', color: '#94a3b8' }}>{prev.findings || '（空）'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', marginBottom: 3 }}>超声诊断</div>
                      <div style={{ background: '#f8fafc', borderRadius: 6, padding: 10, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'auto', color: '#94a3b8' }}>{prev.diagnosis || '（空）'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
                无更早的历史报告
              </div>
            )}
          </div>

          {/* 历史列表 */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>全部历史记录</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.map((r: any, i: number) => (
                <div key={r.reportId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: i === current ? '#eff6ff' : '#f8fafc', borderRadius: 8, border: `1px solid ${i === current ? '#3b82f6' : '#e2e8f0'}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, color: '#64748b', minWidth: 80 }}>{r.examDate}</span>
                  <span style={{ fontSize: 12, color: '#1e293b', flex: 1 }}>{r.examType}</span>
                  <span style={{ fontSize: 11, color: i === current ? '#3b82f6' : '#94a3b8', fontWeight: i === current ? 600 : 400 }}>{i === current ? '◀ 当前' : `第${history.length - i}次`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 统计分析
// ============================================================
function ReportStatistics({ reports }: { reports: any[] }) {
  const byStatus = useMemo(() => {
    const map: Record<string, number> = {}
    reports.forEach(r => { map[r.status] = (map[r.status] || 0) + 1 })
    return map
  }, [reports])

  const byExamType = useMemo(() => {
    const map: Record<string, number> = {}
    reports.forEach(r => { map[r.examType] = (map[r.examType] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [reports])

  const byDoctor = useMemo(() => {
    const map: Record<string, number> = {}
    reports.forEach(r => { if (r.reportDoctorId) map[r.reportDoctorId] = (map[r.reportDoctorId] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [reports])

  const maxCount = Math.max(...Object.values(byStatus), 1)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* 状态分布 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>报告状态分布</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(byStatus).map(([status, count]) => {
            const pct = (count / maxCount) * 100
            const colors: Record<string, string> = { draft: '#f59e0b', pending: '#f59e0b', submitted: '#3b82f6', approved: '#10b981', published: '#6366f1', critical: '#ef4444' }
            return (
              <div key={status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: '#475569' }}>{status}</span>
                  <span style={{ fontWeight: 700, color: colors[status] || '#64748b' }}>{count}份</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8 }}>
                  <div style={{ background: colors[status] || '#94a3b8', borderRadius: 4, height: '100%', width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            )
          })}
          {Object.keys(byStatus).length === 0 && <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>暂无数据</div>}
        </div>
      </div>

      {/* 检查项目分布 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>检查项目分布 Top8</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {byExamType.map(([type, count], i) => (
            <div key={type} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 18, textAlign: 'right' }}>{i + 1}</span>
              <span style={{ fontSize: 12, color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{type}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{count}</span>
            </div>
          ))}
          {byExamType.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>暂无数据</div>}
        </div>
      </div>

      {/* 医师工作量 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>医师报告工作量排名</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {byDoctor.map(([doctorId, count], i) => {
            const doc = initialUsers.find(u => u.id === doctorId)
            return (
              <div key={doctorId} style={{ background: '#f8fafc', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: i === 0 ? '#f59e0b' : '#3b82f6', marginBottom: 4 }}>{count}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{doc?.name || doctorId}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>报告数</div>
              </div>
            )
          })}
          {byDoctor.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20, gridColumn: '1/-1' }}>暂无数据</div>}
        </div>
      </div>
    </div>
  )
}
