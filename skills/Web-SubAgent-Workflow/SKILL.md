---
name: Web-SubAgent-Workflow
description: Sequential 6-step AI pipeline — Claude Code plans→Kimi searches→(complex? Gemini reasons)→Claude synthesizes→ChatGPT reviews→Claude fixes. Use for complex software engineering tasks needing web research + deep reasoning + quality review.
---

# Web-SubAgent-Workflow

> **核心原则**: Claude Code 大脑 → Kimi 搜索 → (复杂? Gemini 推理) → Claude 合成 → ChatGPT 审查 → Claude 修复
> **Provider 层**: `AgentChat-WebExtended`，零代码重复
> **安全策略**: 永不关闭用户 Chrome

## 架构

```
用户需求 → [1.Claude 规划] → [2.Kimi 搜索] →{复杂?}→ [3.Gemini 推理] → [4.Claude 合成] → [5.ChatGPT 审查] → [6.Claude 修复] → 最终产出
                                              └── 简单: 跳过 ──┘
```

串行管道 + 条件分支。Claude Code 全程担任大脑，仅在 Step 2/3/5 通过 index.js 调 WebExtended。

## 角色与 Prompt 规范

| 步骤 | AI | 角色 | 必须内嵌的指令 |
|------|-----|------|---------------|
| 2 | Kimi | 联网检索 | `请进行联网搜索，用要点列出关键事实和数据。不要运行代码。` |
| 3 | Gemini Pro | 深度推理 (条件) | `直接给出完整的分析。不需要搜索新资料，基于已有信息推理。` |
| 5 | ChatGPT | 交叉审查 | `请逐一审查以下内容，列出所有问题点并给出具体修改建议。不要重写整个方案。` |

## 复杂度判定 (Step 1)

决定 Step 3 是否执行。**不确定时倾向判定为"复杂"**。

**复杂** (触发 Step 3，满足 ≥2 项):
- 需综合多个信息源才能得出结论
- 涉及多步逻辑推理或数学推演
- 有非平凡架构/设计决策，或需多文件代码
- 问题域需要领域专长
- 用户要求"深度分析"或"全面方案"

**简单** (跳过 Step 3):
- 单事实查询、≤50 行直观代码、格式转换等机械工作

---

## 操作流程

### Step 1: 规划与分发

1. 理解需求，判定复杂度
2. **编写一个综合搜索 prompt**（涵盖所有要查的方面，Kimi 内部自动多角度搜索）
3. 向用户报告：复杂度 + 搜索查询 + 预期产出

### Step 2: 联网检索

⚠️ **只调用一次。** Kimi 内部自动多轮搜索，外部拆分反而导致碎片化。

```bash
node skills/Web-SubAgent-Workflow/index.js --search "综合搜索 prompt"
```

输出为 JSON。`response` 字段即 Kimi 完整搜索结果。Claude Code 完整阅读后提取关键事实。

Fallback: Kimi → Qwen

### Step 3: 深度推理 (仅复杂任务)

将搜索摘要 + 原始需求组装为一个推理 prompt。摘要关键信息即可，不要贴原始全文。

```bash
node skills/Web-SubAgent-Workflow/index.js --reason "原始需求: ...搜索摘要: ...请从[角度]深度分析，直接给出完整推理。不需要搜索新资料。" --timeout=300000
```

Fallback: Gemini → ChatGPT → Claude

### Step 4: 核心生成

汇总搜索事实 + 推理结论 + 原始需求，生成最终交付物（代码/文档/报告）。自检：所有搜索事实已纳入？推理结论已被吸收？需求要点全覆盖？

### Step 5: 交叉审查

将 Step 4 产出发给 ChatGPT。审查维度：正确性、安全性、性能、可维护性。

```bash
node skills/Web-SubAgent-Workflow/index.js --review "原始需求: ...待审查产出: ...请从正确性、安全性、性能、可维护性逐一审查，列出问题并给修改建议。不要重写方案。"
```

Fallback: ChatGPT → Claude → Qwen

收到审查意见后逐条评估：合理→Step 6 修复 / 不适用→记录原因 / 需澄清→标注。

### Step 6: 修复与输出

逐条应用审查意见，输出最终文件。向用户报告：步骤摘要、复杂度理由、审查处理情况、产出位置。

---

## CLI 速查

```bash
node skills/Web-SubAgent-Workflow/index.js --search "query"     # Kimi 搜索
node skills/Web-SubAgent-Workflow/index.js --reason "prompt"    # Gemini 推理
node skills/Web-SubAgent-Workflow/index.js --review "content"   # ChatGPT 审查
node skills/Web-SubAgent-Workflow/index.js --smoke | --doctor   # 环境检查
```

| Flag | 说明 |
|------|------|
| `--search/--reason/--review` | 步骤模式（三选一） |
| `--provider=X` | 覆盖默认 provider |
| `--timeout=N` | 超时 ms（默认 180000） |

## 降级链

| 步骤 | 首选 | 降级 |
|------|------|------|
| Search | Kimi → Qwen |
| Reason | Gemini → ChatGPT → Claude |
| Review | ChatGPT → Claude → Qwen |
