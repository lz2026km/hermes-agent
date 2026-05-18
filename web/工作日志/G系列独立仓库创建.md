# G系列独立仓库创建 - 开发日志
## 时间：2026-05-05

---

## 08:01 开始自检

主公要求"自检自己的情况"，开始检查系统状态。

## G006独立仓库创建

主公要求G006独立Git仓库创建 + 推送。

### 执行过程
1. 检查G006状态：版本v0.9.0，22个页面，已有独立仓库g006-appointment-system
2. 创建backup tag：v0.0.0-backup ✅
3. 版本升级：package.json v0.0.0→v1.0.0，App.tsx v0.9.0→v1.0.0
4. tsc编译：0 errors ✅
5. build：成功 ✅
6. preview启动：端口5177，200 OK ✅
7. 22页全部HTTP 200 ✅
8. 浏览器验证：Console 0 errors，数据正确（CT/MRI/超声/内镜/心电/DR）✅
9. git commit + push：main分支 ✅

### 重要教训
- **G002特殊性**：G002是hermes-agent/web子目录而非独立仓库，不能直接git push。采用提取文件到/tmp/临时目录 → git init → force push方式解决
- **版本号不一致**：package.json版本与代码内版本需保持一致，以代码实际版本为准
- **全部7个系统完成**：G002/G003/G004/G005/G006/G007/G008全部独立仓库 + 优化验收 + GitHub推送

### 内存清理
MEMORY.md从3249字符压缩到2307字符，删除过时端口信息、G003调试残留等，腾出空间记录7个仓库完整信息。
