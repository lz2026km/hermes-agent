import React, { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle, CheckCircle, Clock, Phone, Eye, FileText, User,
  Plus, Filter, X, ChevronDown, ChevronUp, Zap, ShieldAlert,
  Activity, Bell, ArrowRight, LogOut, Timer, TrendingUp, Database,
  MessageSquare, Heart, ArrowUpCircle, Calendar, Users, XCircle,
  Check, Star, ArrowUpRight
} from 'lucide-react';
import type { CriticalValue, CriticalLevel, CriticalStage, CriticalValueLog, FollowUp, PatientOutcome } from '../types';
import {
  initialCriticalValues, initialEscalationRules, initialUsers
} from '../data/initialData';

// ============== 样式 ==============
const MAIN_COLOR = '#1a365d';
const s = {
  root: { minHeight: '100vh', background: '#f7f9fc', fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  header: { background: `linear-gradient(135deg, ${MAIN_COLOR} 0%, #0d2137 100%)`, color: '#fff', padding: '24px 32px' },
  headerTitle: { fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  container: { maxWidth: 1400, margin: '0 auto', padding: '24px 32px' },
  // 统计卡片区
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: 20, display: 'flex',
    alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #eef2f7', transition: 'box-shadow 0.2s',
  },
  statIconWrap: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: MAIN_COLOR, lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#8898aa', marginTop: 2 },
  // 标签筛选
  filterRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const },
  filterTabs: { display: 'flex', background: '#fff', borderRadius: 10, padding: 4, gap: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef2f7' },
  filterTab: (active: boolean) => ({
    padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    background: active ? `linear-gradient(135deg, ${MAIN_COLOR}, #1e3a8a)` : 'transparent',
    color: active ? '#fff' : '#64748b', transition: 'all 0.2s',
  }),
  levelFilter: { display: 'flex', gap: 8 },
  levelBtn: (active: boolean, color: string) => ({
    padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
    background: active ? color : '#f1f5f9', color: active ? '#fff' : '#64748b', transition: 'all 0.2s',
  }),
  // 卡片列表
  cardList: { display: 'flex', flexDirection: 'column' as const, gap: 16 },
  card: {
    background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #eef2f7', overflow: 'hidden', transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9', gap: 12, flexWrap: 'wrap' as const,
  },
  cardPatient: { display: 'flex', alignItems: 'center', gap: 12 },
  patientAvatar: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 },
  patientInfo: {},
  patientName: { fontSize: 15, fontWeight: 600, color: MAIN_COLOR },
  patientMeta: { fontSize: 12, color: '#8898aa', marginTop: 1 },
  cardTags: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  tag: (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: bg, color }),
  cardBody: { padding: '16px 20px' },
  cardContent: { fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 12 },
  cardDetail: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 },
  detailItem: { display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#64748b' },
  detailIcon: { flexShrink: 0, marginTop: 1, color: '#94a3b8' },
  cardFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#fafbfd',
  },
  footerLeft: { fontSize: 12, color: '#8898aa' },
  footerRight: { display: 'flex', gap: 8 },
  actionBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
    borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
  },
  // 生命周期进度条
  lifecycleBar: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    background: '#f8fafc', borderBottom: '1px solid #eef2f7', gap: 0, overflowX: 'auto' as const,
  },
  lifecycleStep: (active: boolean, done: boolean, color: string) => ({
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4,
    flex: 1, minWidth: 80, position: 'relative' as const,
  }),
  stepDot: (done: boolean, active: boolean, color: string) => ({
    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: done ? color : active ? color : '#e2e8f0',
    color: done || active ? '#fff' : '#94a3b8', fontSize: 11, fontWeight: 700, zIndex: 1,
    border: done || active ? 'none' : '2px solid #cbd5e1',
    transition: 'all 0.3s',
  }),
  stepLabel: (done: boolean, active: boolean) => ({
    fontSize: 11, fontWeight: done || active ? 600 : 400, color: done || active ? MAIN_COLOR : '#94a3b8', textAlign: 'center' as const,
  }),
  stepTime: (done: boolean) => ({ fontSize: 10, color: '#94a3b8', textAlign: 'center' as const }),
  // 5阶段颜色
  stages: ['#6366f1', '#f59e0b', '#3b82f6', '#10b981', '#64748b'] as const,
  stageLabels: ['发现', '上报', '通知', '处理', '归档'] as const,
  stageIcons: [AlertTriangle, Bell, MessageSquare, Activity, Archive],
  // 等级颜色
  levelColors: {
    critical: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: '一级危急', icon: Zap },
    urgent: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: '二级紧急', icon: AlertTriangle },
    warning: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: '三级警戒', icon: ShieldAlert },
  },
  // 弹窗
  modal: {
    position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
  },
  modalContent: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh',
    overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    padding: '20px 24px', borderBottom: '1px solid #eef2f7', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: MAIN_COLOR },
  modalBody: { padding: '24px' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid #eef2f7', display: 'flex', justifyContent: 'flex-end', gap: 10 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f1f5f9',
    color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  // 表单
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  formGroupFull: { gridColumn: '1 / -1' },
  formLabel: { fontSize: 12, fontWeight: 600, color: '#374151' },
  formInput: {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13,
    color: MAIN_COLOR, background: '#fafbfc', outline: 'none', transition: 'border 0.2s',
  },
  formSelect: {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13,
    color: MAIN_COLOR, background: '#fafbfc', outline: 'none',
  },
  formTextarea: {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13,
    color: MAIN_COLOR, background: '#fafbfc', outline: 'none', resize: 'vertical' as const, minHeight: 80,
  },
  primaryBtn: {
    padding: '8px 20px', borderRadius: 8, border: 'none',
    background: `linear-gradient(135deg, ${MAIN_COLOR}, #1e3a8a)`,
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
  green: { backgroundColor: '#f0fdf4', color: '#15803d' },
  orange: { backgroundColor: '#fff7ed', color: '#c2410c' },
  purple: { backgroundColor: '#f5f3ff', color: '#7c3aed' },
  red: { backgroundColor: '#fef2f2', color: '#dc2626' },
  // 日志面板
  logPanel: { background: '#fafbfd', borderRadius: 10, padding: 16, marginTop: 16 },
  logTitle: { fontSize: 13, fontWeight: 700, color: MAIN_COLOR, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  logItem: { display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' },
  logDot: (color: string) => ({ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }),
  logContent: { flex: 1 },
  logAction: { fontSize: 13, fontWeight: 600, color: MAIN_COLOR },
  logMeta: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  logConnector: { width: 1, background: '#e2e8f0', margin: '0 4px', alignSelf: 'stretch' },
  // 升级提示
  escalationBanner: (color: string) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
    background: color, color: '#fff', fontSize: 12, fontWeight: 600,
  }),
  empty: { textAlign: 'center' as const, padding: '60px 0', color: '#94a3b8' },
  blue2: '#1e40af',
  // 转随访相关
  followUpBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
    borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#15803d',
    border: '1px solid #bbf7d0',
  },
  transferBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
    borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
    background: '#f5f3ff', color: '#7c3aed', transition: 'all 0.2s',
  },
  // 闭环追踪时间轴
  closedLoopTimeline: {
    display: 'flex', alignItems: 'stretch', gap: 0, padding: '14px 20px',
    background: '#fafbfd', borderTop: '1px solid #eef2f7', overflowX: 'auto' as const,
  },
  timelineNode: (done: boolean, active: boolean, color: string) => ({
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    gap: 4, flex: 1, minWidth: 90, position: 'relative' as const,
  }),
  timelineDot: (done: boolean, active: boolean, color: string) => ({
    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: done ? color : active ? color : '#e2e8f0',
    color: done || active ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 700,
    border: done || active ? 'none' : '2px solid #cbd5e1', zIndex: 1,
    boxShadow: active ? `0 0 0 4px ${color}33` : 'none', transition: 'all 0.3s',
  }),
  timelineLabel: (done: boolean, active: boolean) => ({
    fontSize: 11, fontWeight: done || active ? 600 : 400,
    color: done || active ? MAIN_COLOR : '#94a3b8', textAlign: 'center' as const,
  }),
  timelineMeta: (done: boolean) => ({
    fontSize: 10, color: '#94a3b8', textAlign: 'center' as const,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 80,
  }),
  timelineConnector: (done: boolean, color: string) => ({
    flex: '0 0 20px', height: 2, background: done ? color : '#e2e8f0',
    alignSelf: 'center', marginTop: -16, transition: 'background 0.3s',
  }),
  // 转随访弹窗
  transferModalContent: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
    overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  transferInfo: {
    background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 16,
    border: '1px solid #eef2f7',
  },
  transferInfoRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 },
  transferInfoLabel: { color: '#64748b' },
  transferInfoValue: { color: MAIN_COLOR, fontWeight: 600 },
  dateInputGroup: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  transferModalFooter: { padding: '16px 20px', borderTop: '1px solid #eef2f7', display: 'flex', justifyContent: 'flex-end', gap: 10 },
}

// 动态导入 Archive 图标 (lucide-react 没有 Archive，用 Database 代替)
import { Archive } from 'lucide-react';

// ============== 工具函数 ==============
const LEVEL_COLORS = {
  critical: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: '一级危急', icon: Zap },
  urgent: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: '二级紧急', icon: AlertTriangle },
  warning: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: '三级警戒', icon: ShieldAlert },
};

const STAGE_COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981', '#64748b'];
const STAGE_LABELS = ['发现', '上报', '通知', '处理', '归档'];
const STAGE_KEYS: CriticalStage[] = ['detected', 'reported', 'notified', 'handled', 'archived'];

const STAGE_ACTION_LABELS: Record<string, string> = {
  detected: '发现异常', reported: '科室上报', notified: '通知医生',
  handled: '处理完成', archived: '已归档', escalated: '自动升级',
};

function getStageIndex(stage: CriticalStage): number {
  return STAGE_KEYS.indexOf(stage);
}

function getAvatarColor(name: string): string {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(iso: string): string {
  if (!iso) return '—';
  return iso.replace('T', ' ').slice(0, 16);
}

function getTimeoutStatus(cv: CriticalValue): 'normal' | 'warning' | 'urgent' {
  if (cv.handled || cv.stage === 'archived') return 'normal';
  const rule = initialEscalationRules.find(r => r.level === cv.level);
  if (!rule) return 'normal';
  const detected = new Date(cv.detectedTime).getTime();
  const now = Date.now();
  const diffMin = (now - detected) / 60000;
  if (diffMin >= rule.thresholdMinutes) return 'urgent';
  if (diffMin >= rule.thresholdMinutes * 0.7) return 'warning';
  return 'normal';
}

function getElapsedMinutes(detectedTime: string): number {
  const detected = new Date(detectedTime).getTime();
  return Math.floor((Date.now() - detected) / 60000);
}

function getOutcomeLabel(outcome: string): string {
  const map: Record<string, string> = {
    '继续观察': '继续观察', '住院治疗': '住院治疗', '手术': '手术',
    '转院': '转院', '死亡': '死亡', '失访': '失访', '': '未记录',
  };
  return map[outcome] || outcome || '未记录';
}

function getOutcomeColor(outcome: string): string {
  const map: Record<string, string> = {
    '继续观察': '#3b82f6', '住院治疗': '#f59e0b', '手术': '#8b5cf6',
    '转院': '#06b6d4', '死亡': '#ef4444', '失访': '#94a3b8', '': '#94a3b8',
  };
  return map[outcome] || '#94a3b8';
}

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

// ============== 闭环追踪时间轴组件 ==============
interface ClosedLoopTimelineProps {
  cv: CriticalValue;
}

function ClosedLoopTimeline({ cv }: ClosedLoopTimelineProps) {
  // 闭环5节点：发现 -> 通报临床 -> 处理中 -> 已处理 -> 已归档
  const nodes = [
    {
      key: 'detected',
      emoji: '🔴',
      label: '发现',
      getTime: () => formatTime(cv.detectedTime),
      getMeta: () => cv.detectedDoctorName || '—',
      done: true,
      active: cv.stage === 'detected',
      color: '#dc2626',
    },
    {
      key: 'notified',
      emoji: '🟠',
      label: '通报临床',
      getTime: () => cv.notifiedTime ? formatTime(cv.notifiedTime) : '—',
      getMeta: () => cv.notifiedDoctorName || (cv.autoEscalation ? '系统自动通报' : '—'),
      done: getStageIndex(cv.stage) >= getStageIndex('notified'),
      active: cv.stage === 'notified',
      color: '#ea580c',
    },
    {
      key: 'handling',
      emoji: '🟡',
      label: '处理中',
      getTime: () => cv.handledTime && cv.stage !== 'handled' ? formatTime(cv.handledTime) : '—',
      getMeta: () => {
        if (cv.patientOutcome) return getOutcomeLabel(cv.patientOutcome);
        if (cv.notes) return cv.notes.slice(0, 12) + (cv.notes.length > 12 ? '…' : '');
        return '处理措施待记录';
      },
      done: getStageIndex(cv.stage) >= getStageIndex('handled'),
      active: cv.stage === 'notified' && !cv.handled,
      color: '#d97706',
    },
    {
      key: 'handled',
      emoji: '🟢',
      label: '已处理',
      getTime: () => cv.handledTime ? formatTime(cv.handledTime) : '—',
      getMeta: () => cv.patientOutcome ? getOutcomeLabel(cv.patientOutcome) : (cv.handled ? '处理完成' : '—'),
      done: cv.handled || cv.stage === 'archived',
      active: cv.stage === 'handled',
      color: '#16a34a',
    },
    {
      key: 'archived',
      emoji: '🔵',
      label: '已归档',
      getTime: () => cv.archivalTime ? formatTime(cv.archivalTime) : '—',
      getMeta: () => cv.convertedToFollowUp ? '已转随访' : (cv.stage === 'archived' ? '已归档' : '待归档'),
      done: cv.stage === 'archived',
      active: cv.stage === 'archived',
      color: '#2563eb',
    },
  ];

  return (
    <div style={s.closedLoopTimeline}>
      {nodes.map((node, idx) => (
        <React.Fragment key={node.key}>
          <div style={s.timelineNode(node.done, node.active, node.color)}>
            <div style={s.timelineDot(node.done, node.active, node.color)}>
              {node.done ? '✓' : idx + 1}
            </div>
            <div style={s.timelineLabel(node.done, node.active)}>{node.label}</div>
            <div style={s.timelineMeta(node.done)} title={node.getMeta()}>
              {node.getTime()}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.getMeta()}
            </div>
          </div>
          {idx < nodes.length - 1 && (
            <div style={s.timelineConnector(nodes[idx + 1].done, nodes[idx + 1].color)} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============== 转随访确认弹窗 ==============
interface TransferFollowUpModalProps {
  cv: CriticalValue;
  onConfirm: (scheduledDate: string) => void;
  onClose: () => void;
}

function TransferFollowUpModal({ cv, onConfirm, onClose }: TransferFollowUpModalProps) {
  const defaultDate = addDays(new Date(), 30);

  return (
    <div style={s.modal} onClick={onClose}>
      <div style={s.transferModalContent} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div style={s.modalTitle}>转随访确认</div>
          <button style={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={s.modalBody}>
          {/* 危急值摘要 */}
          <div style={s.transferInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Star size={16} color="#7c3aed" />
              <span style={{ fontSize: 13, fontWeight: 700, color: MAIN_COLOR }}>危急值摘要</span>
            </div>
            <div style={s.transferInfoRow}>
              <span style={s.transferInfoLabel}>患者姓名</span>
              <span style={s.transferInfoValue}>{cv.patientName}</span>
            </div>
            <div style={s.transferInfoRow}>
              <span style={s.transferInfoLabel}>危急值内容</span>
              <span style={{ ...s.transferInfoValue, fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cv.criticalValueContent}
              </span>
            </div>
            <div style={s.transferInfoRow}>
              <span style={s.transferInfoLabel}>危急等级</span>
              <span style={s.transferInfoValue}>{LEVEL_COLORS[cv.level].label}</span>
            </div>
            <div style={s.transferInfoRow}>
              <span style={s.transferInfoLabel}>发现时间</span>
              <span style={s.transferInfoValue}>{formatTime(cv.detectedTime)}</span>
            </div>
            <div style={s.transferInfoRow}>
              <span style={s.transferInfoLabel}>当前状态</span>
              <span style={s.transferInfoValue}>{STAGE_LABELS[getStageIndex(cv.stage)]}</span>
            </div>
          </div>

          {/* 随访信息 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CheckCircle size={16} color="#16a34a" />
              <span style={{ fontSize: 13, fontWeight: 700, color: MAIN_COLOR }}>随访计划</span>
            </div>
            <div style={s.dateInputGroup}>
              <label style={s.formLabel}>计划随访日期（默认30天后）</label>
              <input
                type="date"
                defaultValue={defaultDate}
                min={addDays(new Date(), 1)}
                style={s.formInput}
                onChange={e => {}}
              />
            </div>
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#f5f3ff', borderRadius: 8, fontSize: 12, color: '#7c3aed' }}>
              <strong>随访类型：</strong>复查提醒 &nbsp;|&nbsp; <strong>随访周期：</strong>30天<br />
              <strong>备注：</strong>危急值转随访跟踪，监测病情变化
            </div>
          </div>
        </div>
        <div style={s.transferModalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>取消</button>
          <button
            style={{ ...s.primaryBtn, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            onClick={() => {
              const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
              onConfirm(dateInput?.value || defaultDate);
            }}
          >
            <Check size={14} /> 确认转随访
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== 生命周期进度条组件 ==============
function LifecycleBar({ cv }: { cv: CriticalValue }) {
  const currentIdx = getStageIndex(cv.stage);
  const elapsed = getElapsedMinutes(cv.detectedTime);
  const rule = initialEscalationRules.find(r => r.level === cv.level);
  const threshold = rule?.thresholdMinutes || 30;

  const getLogTime = (stage: CriticalStage): string => {
    const log = cv.logs?.find(l => l.toStage === stage);
    return log ? formatTime(log.actionTime) : '—';
  };

  return (
    <div style={s.lifecycleBar}>
      {STAGE_KEYS.map((stage, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const color = STAGE_COLORS[idx];
        return (
          <React.Fragment key={stage}>
            <div style={s.lifecycleStep(active, done, color)}>
              <div style={s.stepDot(done, active, color)}>
                {done ? '✓' : active ? (idx + 1) : idx + 1}
              </div>
              <div style={s.stepLabel(done, active)}>{STAGE_LABELS[idx]}</div>
              <div style={s.stepTime(done)}>{getLogTime(stage)}</div>
            </div>
            {idx < STAGE_KEYS.length - 1 && (
              <div style={{ flex: '0 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={12} color={done ? color : '#cbd5e1'} />
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* 超时指示 */}
      {!cv.handled && cv.stage !== 'archived' && (
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: elapsed >= threshold ? '#fef2f2' : elapsed >= threshold * 0.7 ? '#fffbeb' : '#f0fdf4',
          color: elapsed >= threshold ? '#dc2626' : elapsed >= threshold * 0.7 ? '#d97706' : '#16a34a',
          flexShrink: 0,
        }}>
          <Timer size={12} />
          已超时 {elapsed}min / {threshold}min
          {elapsed >= threshold && <Zap size={12} />}
        </div>
      )}
    </div>
  );
}

// ============== 危急值卡片 ==============
interface CriticalValueCardProps {
  cv: CriticalValue;
  onView: () => void;
  onAdvance: () => void;
  onMarkHandled: () => void;
  onEscalate: () => void;
  onTransferFollowUp: () => void;
}

function CriticalValueCard({
  cv, onView, onAdvance, onMarkHandled, onEscalate, onTransferFollowUp,
}: CriticalValueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const lc = LEVEL_COLORS[cv.level];
  const timeoutStatus = getTimeoutStatus(cv);
  const elapsed = getElapsedMinutes(cv.detectedTime);
  const rule = initialEscalationRules.find(r => r.level === cv.level);
  const threshold = rule?.thresholdMinutes || 30;
  const currentIdx = getStageIndex(cv.stage);

  const nextStageLabel = () => {
    if (cv.stage === 'detected') return '确认上报';
    if (cv.stage === 'reported') return '通知医生';
    if (cv.stage === 'notified') return '处理完成';
    if (cv.stage === 'handled') return '归档';
    return null;
  };

  const handleAdvance = () => {
    if (cv.stage === 'handled') {
      onMarkHandled();
    } else {
      onAdvance();
    }
  };

  return (
    <div style={{
      ...s.card,
      borderLeft: `4px solid ${timeoutStatus === 'urgent' ? '#dc2626' : timeoutStatus === 'warning' ? '#d97706' : lc.color}`,
      background: timeoutStatus === 'urgent' ? '#fef2f2' : timeoutStatus === 'warning' ? '#fffbeb' : '#fff',
    }}>
      {/* 等级+状态头部 */}
      <div style={s.cardHeader}>
        <div style={s.cardPatient}>
          <div style={{ ...s.patientAvatar, background: getAvatarColor(cv.patientName) }}>
            {cv.patientName.charAt(0)}
          </div>
          <div style={s.patientInfo}>
            <div style={s.patientName}>
              {cv.patientName}
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}> #{cv.id}</span>
            </div>
            <div style={s.patientMeta}>{cv.examItemName}</div>
          </div>
        </div>
        <div style={s.cardTags}>
          <span style={s.tag(lc.bg, lc.color)}>
            <lc.icon size={11} /> {lc.label}
          </span>
          <span style={s.tag('#eff6ff', '#1d4ed8')}>
            <Clock size={11} /> {STAGE_LABELS[currentIdx]}
          </span>
          {cv.autoEscalation && (
            <span style={s.tag('#fef2f2', '#dc2626')}>
              <ArrowUpCircle size={11} /> 自动升级
            </span>
          )}
          {cv.patientOutcome && (
            <span style={s.tag('#f0fdf4', getOutcomeColor(cv.patientOutcome))}>
              <Heart size={11} /> {getOutcomeLabel(cv.patientOutcome)}
            </span>
          )}
          {timeoutStatus === 'urgent' && (
            <span style={s.tag('#fef2f2', '#dc2626')}>
              <Zap size={11} /> 超时{elapsed - threshold}min
            </span>
          )}
          {/* 已转随访徽章 */}
          {cv.convertedToFollowUp && (
            <span style={s.followUpBadge}>
              <CheckCircle size={11} /> 已转随访✓
            </span>
          )}
        </div>
      </div>

      {/* 生命周期进度条 */}
      <LifecycleBar cv={cv} />

      {/* 闭环追踪时间轴 */}
      <ClosedLoopTimeline cv={cv} />

      {/* 自动升级提示 */}
      {cv.autoEscalation && (
        <div style={s.escalationBanner('#fef2f2')}>
          <Zap size={14} color="#dc2626" />
          <span style={{ color: '#dc2626' }}>
            系统自动升级：{cv.escalationTime} 已通知 {cv.notifiedDoctorName || '上级医生'}
            {cv.escalationCount > 1 && ` (第${cv.escalationCount}次升级)`}
          </span>
        </div>
      )}

      {/* 卡片内容 */}
      <div style={s.cardBody}>
        <div style={s.cardContent}>{cv.criticalValueContent}</div>
        <div style={s.cardDetail}>
          <div style={s.detailItem}><User size={12} style={s.detailIcon} /><span>发现：{cv.detectedDoctorName} · {formatTime(cv.detectedTime)}</span></div>
          {cv.reportedDoctorName && <div style={s.detailItem}><Bell size={12} style={s.detailIcon} /><span>上报：{cv.reportedDoctorName} · {formatTime(cv.reportedTime || '')}</span></div>}
          {cv.notifiedDoctorName && <div style={s.detailItem}><MessageSquare size={12} style={s.detailIcon} /><span>通知：{cv.notifiedDoctorName} · {formatTime(cv.notifiedTime || '')}</span></div>}
          {cv.handledTime && <div style={s.detailItem}><Activity size={12} style={s.detailIcon} /><span>处理：{formatTime(cv.handledTime)}</span></div>}
          {cv.archivalTime && <div style={s.detailItem}><Archive size={12} style={s.detailIcon} /><span>归档：{formatTime(cv.archivalTime)}</span></div>}
          {cv.reportMethod && <div style={{ ...s.detailItem, gridColumn: '1 / -1' }}><Phone size={12} style={s.detailIcon} /><span>报告方式：{cv.reportMethod} · 患者反馈：{cv.patientResponse || '—'}</span></div>}
        </div>

        {/* 日志链（展开显示） */}
        {expanded && cv.logs && cv.logs.length > 0 && (
          <div style={s.logPanel}>
            <div style={s.logTitle}><LogOut size={14} /> 生命周期日志</div>
            {cv.logs.map((log, i) => (
              <div key={log.id} style={s.logItem}>
                <div style={s.logDot(STAGE_COLORS[STAGE_KEYS.indexOf(log.toStage || 'detected')])} />
                <div style={{ flex: 1 }}>
                  <div style={s.logAction}>{STAGE_ACTION_LABELS[log.action] || log.action} — {log.description}</div>
                  <div style={s.logMeta}>{log.operatorName} · {formatTime(log.actionTime)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 卡片底部 */}
      <div style={s.cardFooter}>
        <div style={s.footerLeft}>
          {cv.notes && <span style={{ fontStyle: 'italic' }}>备注：{cv.notes}</span>}
          {cv.convertedToFollowUp && cv.scheduledFollowUpDate && (
            <span style={{ marginLeft: 12, fontSize: 11, color: '#7c3aed' }}>
              随访计划：{cv.scheduledFollowUpDate}
            </span>
          )}
        </div>
        <div style={s.footerRight}>
          <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#64748b' }} onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 日志
          </button>
          <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#64748b' }} onClick={onView}>
            <Eye size={13} /> 详情
          </button>
          {/* 转随访按钮 */}
          {!cv.convertedToFollowUp && (
            <button style={s.transferBtn} onClick={onTransferFollowUp}>
              <ArrowUpRight size={13} /> 转随访
            </button>
          )}
          {!cv.handled && cv.stage !== 'archived' && (
            <>
              {!cv.autoEscalation && cv.stage !== 'notified' && (
                <button style={{ ...s.actionBtn, background: '#fef2f2', color: '#dc2626' }} onClick={onEscalate}>
                  <ArrowUpCircle size={13} /> 升级
                </button>
              )}
              {nextStageLabel() && (
                <button style={{ ...s.actionBtn, background: s.blue2, color: '#fff' }} onClick={handleAdvance}>
                  <ArrowRight size={13} /> {nextStageLabel()}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== 新增/推进模态框 ==============
interface CVModalProps {
  cv?: CriticalValue;
  advanceFrom?: CriticalValue;
  onSave: (data: Partial<CriticalValue> & { advanceTo?: CriticalStage }) => void;
  onClose: () => void;
  mode: 'add' | 'advance' | 'view' | 'escalate';
}

function CVModal({ cv, advanceFrom, onSave, onClose, mode }: CVModalProps) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    if (cv) {
      return {
        level: cv.level, stage: cv.stage, criticalValueType: cv.criticalValueType,
        criticalValueContent: cv.criticalValueContent, reportMethod: cv.reportMethod || '电话',
        patientResponse: cv.patientResponse || '', notes: cv.notes || '',
        patientOutcome: cv.patientOutcome || '', handledTime: cv.handledTime || '',
      };
    }
    if (advanceFrom) {
      const next: Record<string, string> = { notes: '', reportMethod: '电话', patientResponse: '' };
      if (advanceFrom.stage === 'detected') { next.level = advanceFrom.level; next.stage = 'reported'; }
      else if (advanceFrom.stage === 'reported') { next.stage = 'notified'; next.level = advanceFrom.level; }
      else if (advanceFrom.stage === 'notified') { next.stage = 'handled'; next.level = advanceFrom.level; }
      else if (advanceFrom.stage === 'handled') { next.stage = 'archived'; next.level = advanceFrom.level; }
      return next;
    }
    return { level: 'urgent', stage: 'detected', criticalValueType: '', criticalValueContent: '', reportMethod: '电话', patientResponse: '', notes: '', patientOutcome: '', handledTime: '' };
  });

  const handleChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    if (mode === 'add') {
      onSave({ level: form.level as CriticalLevel, stage: form.stage as CriticalStage, criticalValueType: form.criticalValueType, criticalValueContent: form.criticalValueContent, reportMethod: form.reportMethod as '电话', patientResponse: form.patientResponse, notes: form.notes } as Partial<CriticalValue> & { advanceTo?: CriticalStage });
    } else if (mode === 'advance') {
      onSave({ advanceTo: form.stage as CriticalStage, reportMethod: form.reportMethod as '电话', patientResponse: form.patientResponse, notes: form.notes, patientOutcome: form.patientOutcome } as Partial<CriticalValue> & { advanceTo?: CriticalStage });
    } else if (mode === 'escalate') {
      onSave({ escalationMessage: form.notes } as Partial<CriticalValue>);
    } else {
      onClose();
    }
  };

  const titleMap: Record<string, string> = { add: '登记危急值', advance: '推进生命周期', view: '危急值详情', escalate: '手动升级' };
  const isView = mode === 'view';

  return (
    <div style={s.modal} onClick={onClose}>
      <div style={s.modalContent} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div style={s.modalTitle}>{titleMap[mode]}</div>
          <button style={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={s.modalBody}>
          {(mode === 'add' || mode === 'advance') && (
            <>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>危急值等级 *</label>
                  <select style={s.formSelect} value={form.level} onChange={e => handleChange('level', e.target.value)} disabled={mode === 'advance'}>
                    <option value="critical">一级危急（15min）</option>
                    <option value="urgent">二级紧急（30min）</option>
                    <option value="warning">三级警戒（2h）</option>
                  </select>
                </div>
                {mode === 'advance' && (
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>推进至阶段</label>
                    <select style={s.formSelect} value={form.stage} onChange={e => handleChange('stage', e.target.value)}>
                      <option value="reported">上报</option>
                      <option value="notified">通知</option>
                      <option value="handled">处理</option>
                      <option value="archived">归档</option>
                    </select>
                  </div>
                )}
                {mode === 'add' && (
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>发现阶段</label>
                    <select style={s.formSelect} value={form.stage} onChange={e => handleChange('stage', e.target.value)}>
                      <option value="detected">发现</option>
                      <option value="reported">上报</option>
                      <option value="notified">通知</option>
                    </select>
                  </div>
                )}
                {mode === 'add' && (
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>危急类型 *</label>
                    <input style={s.formInput} placeholder="如：可疑恶性肿瘤" value={form.criticalValueType} onChange={e => handleChange('criticalValueType', e.target.value)} />
                  </div>
                )}
                <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                  <label style={s.formLabel}>{mode === 'add' ? '危急内容 *' : '补充说明'}</label>
                  <textarea style={s.formTextarea} placeholder={mode === 'add' ? '描述危急值详情...' : '添加备注...'} value={form.criticalValueContent || form.notes} onChange={e => handleChange(mode === 'add' ? 'criticalValueContent' : 'notes', e.target.value)} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>报告方式</label>
                  <select style={s.formSelect} value={form.reportMethod} onChange={e => handleChange('reportMethod', e.target.value)}>
                    <option value="电话">电话</option>
                    <option value="口头">口头</option>
                    <option value="书面">书面</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>患者结局</label>
                  <select style={s.formSelect} value={form.patientOutcome} onChange={e => handleChange('patientOutcome', e.target.value)}>
                    <option value="">— 未选择 —</option>
                    <option value="继续观察">继续观察</option>
                    <option value="住院治疗">住院治疗</option>
                    <option value="手术">手术</option>
                    <option value="转院">转院</option>
                    <option value="死亡">死亡</option>
                    <option value="失访">失访</option>
                  </select>
                </div>
                <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                  <label style={s.formLabel}>患者/家属反馈</label>
                  <input style={s.formInput} placeholder="患者或家属的回应..." value={form.patientResponse} onChange={e => handleChange('patientResponse', e.target.value)} />
                </div>
              </div>
            </>
          )}
          {mode === 'escalate' && (
            <div style={s.formGroup}>
              <label style={s.formLabel}>升级原因说明</label>
              <textarea style={s.formTextarea} placeholder="说明为什么要手动升级..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
            </div>
          )}
          {isView && cv && (
            <div>
              <div style={s.formGrid}>
                <div style={s.formGroup}><label style={s.formLabel}>患者姓名</label><div style={{ padding: '8px 0', color: MAIN_COLOR, fontWeight: 600 }}>{cv.patientName}</div></div>
                <div style={s.formGroup}><label style={s.formLabel}>检查项目</label><div style={{ padding: '8px 0', color: MAIN_COLOR }}>{cv.examItemName}</div></div>
                <div style={s.formGroup}><label style={s.formLabel}>危急等级</label><div style={{ padding: '8px 0' }}><span style={s.tag(LEVEL_COLORS[cv.level].bg, LEVEL_COLORS[cv.level].color)}>{LEVEL_COLORS[cv.level].label}</span></div></div>
                <div style={s.formGroup}><label style={s.formLabel}>当前阶段</label><div style={{ padding: '8px 0', color: MAIN_COLOR }}>{STAGE_LABELS[getStageIndex(cv.stage)]}</div></div>
                <div style={{ ...s.formGroup, ...s.formGroupFull }}><label style={s.formLabel}>危急内容</label><div style={{ padding: '8px 0', color: '#374151', lineHeight: 1.6 }}>{cv.criticalValueContent}</div></div>
                {cv.patientOutcome && <div style={s.formGroup}><label style={s.formLabel}>患者结局</label><div style={{ padding: '8px 0' }}><span style={s.tag('#f0fdf4', getOutcomeColor(cv.patientOutcome))}>{getOutcomeLabel(cv.patientOutcome)}</span></div></div>}
              </div>
              {cv.logs && cv.logs.length > 0 && (
                <div style={s.logPanel}>
                  <div style={s.logTitle}><LogOut size={14} /> 完整日志链</div>
                  {cv.logs.map(log => (
                    <div key={log.id} style={s.logItem}>
                      <div style={s.logDot(STAGE_COLORS[STAGE_KEYS.indexOf(log.toStage || 'detected')])} />
                      <div style={{ flex: 1 }}>
                        <div style={s.logAction}>{STAGE_ACTION_LABELS[log.action] || log.action} — {log.description}</div>
                        <div style={s.logMeta}>{log.operatorName} · {formatTime(log.actionTime)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>取消</button>
          <button style={s.primaryBtn} onClick={handleSubmit}>
            {mode === 'add' ? '登记' : mode === 'view' ? '关闭' : mode === 'escalate' ? '确认升级' : '推进'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== 主页面 ==============
export default function CriticalValuePage() {
  const [cvs, setCvs] = useState<CriticalValue[]>(() =>
    initialCriticalValues.map(cv => ({ ...cv }))
  );
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'advance' | 'view' | 'escalate'>('add');
  const [selectedCv, setSelectedCv] = useState<CriticalValue | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'handled' | 'archived'>('all');
  const [levelFilter, setLevelFilter] = useState<CriticalLevel | 'all'>('all');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCv, setTransferCv] = useState<CriticalValue | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const filtered = useMemo(() => {
    return cvs.filter(cv => {
      if (filter === 'pending' && (cv.handled || cv.stage === 'archived')) return false;
      if (filter === 'handled' && !cv.handled) return false;
      if (filter === 'archived' && cv.stage !== 'archived') return false;
      if (levelFilter !== 'all' && cv.level !== levelFilter) return false;
      return true;
    });
  }, [cvs, filter, levelFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM
    const today = now.toISOString().slice(0, 10);
    const thisMonthCvs = cvs.filter(cv => cv.detectedTime.startsWith(thisMonth));
    const handledCvs = cvs.filter(cv => cv.handled);
    const pendingCvs = cvs.filter(cv => !cv.handled && cv.stage !== 'archived');
    const convertedCount = cvs.filter(cv => cv.convertedToFollowUp).length;

    // 及时处理：handled 且未超时
    const timelyHandled = handledCvs.filter(cv => {
      const rule = initialEscalationRules.find(r => r.level === cv.level);
      if (!rule) return true;
      const detected = new Date(cv.detectedTime).getTime();
      const handled = new Date(cv.handledTime || cv.detectedTime).getTime();
      const diffMin = (handled - detected) / 60000;
      return diffMin <= rule.thresholdMinutes;
    });

    // 处理中超期：未处理且已超时
    const overdueCount = pendingCvs.filter(cv => {
      const rule = initialEscalationRules.find(r => r.level === cv.level);
      if (!rule) return false;
      const detected = new Date(cv.detectedTime).getTime();
      const diffMin = (Date.now() - detected) / 60000;
      return diffMin >= rule.thresholdMinutes;
    }).length;

    const timelyRate = handledCvs.length > 0
      ? Math.round((timelyHandled.length / handledCvs.length) * 100)
      : 100;

    return {
      total: cvs.length,
      pending: pendingCvs.length,
      handled: handledCvs.length,
      today: cvs.filter(cv => cv.detectedTime.startsWith(today)).length,
      critical: cvs.filter(cv => cv.level === 'critical' && !cv.handled).length,
      autoEscalated: cvs.filter(cv => cv.autoEscalation).length,
      // 新增统计
      monthlyNew: thisMonthCvs.length,
      timelyRate,
      convertedToFollowUp: convertedCount,
      overdue: overdueCount,
    };
  }, [cvs]);

  const handleAdd = useCallback((data: Partial<CriticalValue> & { advanceTo?: CriticalStage }) => {
    const nextId = 'CV' + String(cvs.length + 1).padStart(3, '0');
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newCv: CriticalValue = {
      id: nextId, examId: 'EX' + nextId, patientId: 'P' + nextId,
      patientName: '患者' + nextId, examItemName: '超声检查',
      criticalValueType: data.criticalValueType || '其他危急值',
      criticalValueContent: data.criticalValueContent || '',
      level: data.level || 'urgent', stage: data.stage || 'detected',
      detectedDoctorId: 'U001', detectedDoctorName: '张建国',
      detectedTime: now, handled: false, escalationCount: 0,
      logs: [{ id: 'log_new_1', action: 'detected', description: '登记危急值', actionTime: now, operatorId: 'U001', operatorName: '张建国', toStage: 'detected' }],
      ...data,
    };
    setCvs(prev => [newCv, ...prev]);
    setShowModal(false);
  }, [cvs.length]);

  const handleAdvance = useCallback((data: Partial<CriticalValue> & { advanceTo?: CriticalStage }) => {
    if (!selectedCv) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const nextStage = data.advanceTo || 'reported';
    const actionLabel: Record<string, string> = { detected: '发现', reported: '上报', notified: '通知', handled: '处理', archived: '归档' };
    const newLog: CriticalValueLog = {
      id: 'log_' + Date.now(), action: nextStage === 'archived' ? 'archived' : nextStage === 'handled' ? 'handled' : nextStage === 'notified' ? 'notified' : nextStage === 'reported' ? 'reported' : 'detected',
      description: `推进至${actionLabel[nextStage]}阶段`, actionTime: now,
      operatorId: 'U001', operatorName: '张建国', fromStage: selectedCv.stage, toStage: nextStage,
    };
    const updated: CriticalValue = {
      ...selectedCv, stage: nextStage,
      handled: nextStage === 'handled' || nextStage === 'archived' ? true : selectedCv.handled,
      handledTime: (nextStage === 'handled' || nextStage === 'archived') ? now : selectedCv.handledTime,
      archivalTime: nextStage === 'archived' ? now : selectedCv.archivalTime,
      logs: [...(selectedCv.logs || []), newLog],
      patientOutcome: ((data as Record<string, string>).patientOutcome as PatientOutcome) || selectedCv.patientOutcome,
      ...(data.reportMethod && { reportMethod: data.reportMethod as '电话' }),
      ...((data as Record<string, string>).patientResponse && { patientResponse: (data as Record<string, string>).patientResponse }),
    };
    setCvs(prev => prev.map(cv => cv.id === selectedCv.id ? updated : cv));
    setSelectedCv(null);
    setShowModal(false);
  }, [selectedCv]);

  const handleEscalate = useCallback((data: Partial<CriticalValue>) => {
    if (!selectedCv) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newLog: CriticalValueLog = {
      id: 'log_' + Date.now(), action: 'escalated',
      description: `手动升级：${(data as Record<string, string>).escalationMessage || '要求上级处理'}`, actionTime: now,
      operatorId: 'U001', operatorName: '张建国', fromStage: selectedCv.stage, toStage: selectedCv.stage,
    };
    const updated: CriticalValue = {
      ...selectedCv, autoEscalation: true,
      escalationCount: (selectedCv.escalationCount || 0) + 1,
      escalationTime: now,
      notifiedDoctorId: 'U003', notifiedDoctorName: '科室主任',
      notifiedTime: now, stage: 'notified',
      logs: [...(selectedCv.logs || []), newLog],
    };
    setCvs(prev => prev.map(cv => cv.id === selectedCv.id ? updated : cv));
    setSelectedCv(null);
    setShowModal(false);
  }, [selectedCv]);

  const handleTransferFollowUp = useCallback((scheduledDate: string) => {
    if (!transferCv) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const followUpId = 'FU' + String(followUps.length + 1).padStart(4, '0');

    // 创建随访记录
    const newFollowUp: FollowUp = {
      id: followUpId,
      patientId: transferCv.patientId,
      patientName: transferCv.patientName,
      gender: '男',
      age: 50,
      phone: '13800138000',
      followUpType: '复查提醒',
      followUpCycle: '30天',
      status: '待随访',
      scheduledDate,
      doctorId: 'U001',
      doctorName: '张建国',
      notes: `【危急值转随访】${transferCv.criticalValueContent}`,
    };

    // 更新危急值记录
    const updated: CriticalValue = {
      ...transferCv,
      convertedToFollowUp: true,
      followUpRecordId: followUpId,
      scheduledFollowUpDate: scheduledDate,
      logs: [
        ...(transferCv.logs || []),
        {
          id: 'log_fu_' + Date.now(),
          action: 'detected',
          description: `转随访：计划${scheduledDate}随访`,
          actionTime: now,
          operatorId: 'U001',
          operatorName: '张建国',
          toStage: transferCv.stage,
        },
      ],
    };

    setFollowUps(prev => [newFollowUp, ...prev]);
    setCvs(prev => prev.map(cv => cv.id === transferCv.id ? updated : cv));
    setShowTransferModal(false);
    setTransferCv(null);
  }, [transferCv, followUps.length]);

  const openModal = (mode: 'add' | 'advance' | 'view' | 'escalate', cv?: CriticalValue) => {
    setModalMode(mode);
    setSelectedCv(cv || null);
    setShowModal(true);
  };

  const openTransferModal = (cv: CriticalValue) => {
    setTransferCv(cv);
    setShowTransferModal(true);
  };

  return (
    <div style={s.root}>
      {/* 头部 */}
      <div style={s.header}>
        <div style={s.headerTitle}><Zap size={24} />危急值全生命周期管理</div>
        <div style={s.headerSub}>Critical Value Lifecycle Management — {cvs.length} 条记录 · 5阶段闭环追踪</div>
      </div>

      <div style={s.container}>
        {/* 统计卡片 - 原有 + 新增 */}
        <div style={s.statsGrid}>
          <StatCard icon={Database} iconBg="#eff6ff" iconColor="#1d4ed8" value={stats.total} unit="条" label="危急值总数" />
          <StatCard icon={Clock} iconBg="#fff7ed" iconColor="#ea580c" value={stats.pending} unit="条" label="待处理" />
          <StatCard icon={CheckCircle} iconBg="#f0fdf4" iconColor="#16a34a" value={stats.handled} unit="条" label="已处理" />
          <StatCard icon={Calendar} iconBg="#f5f3ff" iconColor="#7c3aed" value={stats.today} unit="条" label="今日新增" />
          <StatCard icon={Zap} iconBg="#fef2f2" iconColor="#dc2626" value={stats.critical} unit="条" label="一级危急" />
          <StatCard icon={ArrowUpCircle} iconBg="#fffbeb" iconColor="#d97706" value={stats.autoEscalated} unit="条" label="自动升级" />
          {/* 新增4个统计指标 */}
          <StatCard icon={TrendingUp} iconBg="#e0f2fe" iconColor={MAIN_COLOR} value={stats.monthlyNew} unit="条" label="本月新增" />
          <StatCard icon={CheckCircle} iconBg="#f0fdf4" iconColor="#16a34a" value={stats.timelyRate} unit="%" label="及时处理率" />
          <StatCard icon={ArrowUpRight} iconBg="#f5f3ff" iconColor="#7c3aed" value={stats.convertedToFollowUp} unit="条" label="已转随访" />
          <StatCard icon={XCircle} iconBg="#fef2f2" iconColor="#dc2626" value={stats.overdue} unit="条" label="处理中超期" />
        </div>

        {/* 升级规则说明 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eef2f7' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MAIN_COLOR, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldAlert size={16} color="#1d4ed8" /> 危急值分级处理时限</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { level: 'critical', label: '一级危急', color: '#dc2626', bg: '#fef2f2', threshold: 15, desc: '危及生命/疑似恶性肿瘤' },
              { level: 'urgent', label: '二级紧急', color: '#d97706', bg: '#fffbeb', threshold: 30, desc: '急性病变/需要紧急处理' },
              { level: 'warning', label: '三级警戒', color: '#16a34a', bg: '#f0fdf4', threshold: 120, desc: '需要关注/随访观察' },
            ].map(r => (
              <div key={r.level} style={{ flex: 1, minWidth: 180, padding: 12, borderRadius: 10, background: r.bg, border: `1px solid ${r.color}22` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.label} — {r.threshold}分钟内处理</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 筛选工具栏 */}
        <div style={s.filterRow}>
          <div style={s.filterTabs}>
            {(['all', 'pending', 'handled', 'archived'] as const).map(f => (
              <button key={f} style={s.filterTab(filter === f)} onClick={() => setFilter(f)}>
                {f === 'all' ? '全部' : f === 'pending' ? '待处理' : f === 'handled' ? '已处理' : '已归档'}
              </button>
            ))}
          </div>
          <div style={s.levelFilter}>
            {(['all', 'critical', 'urgent', 'warning'] as const).map(l => (
              <button key={l} style={s.levelBtn(levelFilter === l, l === 'all' ? MAIN_COLOR : LEVEL_COLORS[l as CriticalLevel].color)} onClick={() => setLevelFilter(l as CriticalLevel | 'all')}>
                {l === 'all' ? '全等级' : LEVEL_COLORS[l as CriticalLevel].label}
              </button>
            ))}
          </div>
          <button style={{ ...s.primaryBtn, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => openModal('add')}>
            <Plus size={14} /> 登记危急值
          </button>
        </div>

        {/* 卡片列表 */}
        {filtered.length === 0 ? (
          <div style={s.empty}><Zap size={40} color="#e2e8f0" /><div style={{ marginTop: 12 }}>暂无危急值记录</div></div>
        ) : (
          <div style={s.cardList}>
            {filtered.map(cv => (
              <CriticalValueCard
                key={cv.id}
                cv={cv}
                onView={() => openModal('view', cv)}
                onAdvance={() => openModal('advance', cv)}
                onMarkHandled={() => {
                  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
                  const newLog: CriticalValueLog = { id: 'log_' + Date.now(), action: 'handled', description: '标记处理完成', actionTime: now, operatorId: 'U001', operatorName: '张建国', fromStage: cv.stage, toStage: 'handled' };
                  setCvs(prev => prev.map(c => c.id === cv.id ? { ...c, handled: true, stage: 'handled', handledTime: now, logs: [...(c.logs || []), newLog] } : c));
                }}
                onEscalate={() => openModal('escalate', cv)}
                onTransferFollowUp={() => openTransferModal(cv)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <CVModal
          cv={modalMode === 'view' ? selectedCv || undefined : undefined}
          advanceFrom={modalMode === 'advance' ? selectedCv || undefined : undefined}
          mode={modalMode}
          onSave={(data) => {
            if (modalMode === 'add') handleAdd(data);
            else if (modalMode === 'advance') handleAdvance(data);
            else if (modalMode === 'escalate') handleEscalate(data);
            else setShowModal(false);
          }}
          onClose={() => { setShowModal(false); setSelectedCv(null); }}
        />
      )}

      {/* 转随访确认弹窗 */}
      {showTransferModal && transferCv && (
        <TransferFollowUpModal
          cv={transferCv}
          onConfirm={handleTransferFollowUp}
          onClose={() => { setShowTransferModal(false); setTransferCv(null); }}
        />
      )}
    </div>
  );
}

// ---------- StatCard ----------
interface StatCardProps {
  icon: React.ComponentType<{ size?: number | string; color?: string }>;
  iconBg: string;
  iconColor: string;
  value: number | string;
  unit: string;
  label: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, value, unit, label }: StatCardProps) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIconWrap, background: iconBg }}><Icon size={22} color={iconColor} /></div>
      <div style={s.statInfo}>
        <div style={s.statValue}>{value}<span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>{unit}</span></div>
        <div style={s.statLabel}>{label}</div>
      </div>
    </div>
  );
}
