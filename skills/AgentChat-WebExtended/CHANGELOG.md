# AgentChat-WebExtended Changelog

## 2026-07-03
- 新增 `--single` flag: 只尝试单个 provider 不级联，供 FreeSubAgent 的跨 worker 锁使用
- checkOverlays(): 修掉一处死三元表达式 (`dismissable ? 'error' : 'error'`)
- waitForCompletion() 的 stopWaitMode='detached' 分支 (Qwen): 补上已耗时间扣减，避免单 provider 超预算
- Claude adapter postResponseHook: 去掉与 minResponseLength:5 矛盾的 30 字符门槛，短回答不再被误杀
- telemetry.js 日志轮转 off-by-one: `.2` 之前会被静默覆盖丢失，现在能正确落到 `.3`
- Kimi 响应检测: 字符串相等比较 → 元素计数+文本长度增长, 修复同文本不匹配 bug
- Kimi 新建会话: 每次调用前点击 `.new-chat-btn` 清空旧 DOM, 避免检测干扰
- Kimi 问候语识别: `oldCount===1 && oldText<30chars` → 视为空白页
- Kimi 稳定性窗口: 自适应 (5s/30s/20s/15s/8s), 短文不再等 30s
- Kimi 串行超时: selector 60s → 10s each, 45s 最坏 → 30s
- Gemini Pro Extended 长 prompt 超时: stop button 可见=仍在思考, 延长等待+120s
- Claude "Thinking" 占位符: 过滤 Thinking/Analyzing 空响应, 多重停止检测
- Promise.allSettled: FreeSubAgent 单 worker 异常不再影响其他 worker
