---
title: "让营销智能体开工"
seoTitle: "52 个使用你自己业务数据的 AI 营销智能体"
dek: "五十二个专业营销智能体，从 SEO 审计到定价再到发布计划。它们只需了解一次你的业务，就能读取你的数据，并把承诺要做的工作记录在你的项目里。"
time: "45 分钟"
---

智能体平台自带 52 个营销智能体，每个对应一项专业技能：定位、文案、SEO、付费投放、邮件营销、定价、发布等等。每个智能体都按照其技能规定的方式工作，使用的是**你的**业务上下文，并把承诺要做的工作变成可追踪的工作项。

## 你需要

- 一个智能体平台账号，带有 `cybernetics-data` 和 `cybernetics-projects` 两个连接，名称必须完全一致（[智能体平台](/docs/connect/agentic-platform)）。
- 项目管理中一个用于营销工作的项目。如果你已经有一个，智能体会沿用它及其标签。
- 没有这些连接时，智能体仍然能回答，但只能把上下文留在聊天里，并给你一份清单，而不是工作项。

## 它们是怎么组织的

在 Agent Hub 中，智能体分为八个类别：Marketing Strategy、Conversion & Pricing、Content & Creative、SEO & AI Search、Paid & Measurement、Lifecycle & Retention、Social, PR & Launch，以及 Sales。

其中六个被推荐为不错的起点：**Marketing Director**、**Product Marketing Strategist**、**Conversion Copywriter**、**SEO Auditor**、**Paid Media Manager** 和 **Lifecycle Email Strategist**。

## 1. 只需教一次你的业务（15 分钟）

打开 **Product Marketing Strategist**，使用一个开场提示。它会询问你的产品、受众、痛点、竞争对手、差异化、常见异议、品牌语气和目标，在你确认后，把答案保存为一条名为 `product_marketing` 的记忆。

每个营销智能体都读取这同一条记忆，所以你永远不用把业务解释第二遍。你也可以在 **Settings → Personalization** 下自己查看和编辑它。

:::note 必须打开记忆功能
只有在平台启用了记忆功能时，智能体才能保留 `product_marketing`。如果没启用，它们会在每次对话里向你询问上下文。
:::

## 2. 请教一位专家（10 分钟）

打开一个智能体，使用它的某个开场提示，或者直接提问。虚构的例子：

> **SEO Auditor：** 审计 <url> 的首页，找出技术 SEO 问题和内容缺口。

> **Conversion Copywriter：** 为从没听说过我们的创始人们，重写首屏文案。

每个回答都会把**事实**和**假设**分开，并列出**缺失**的信息。需要数据时，智能体会请你提供导出文件（例如分析工具导出的 CSV），而不是去连接第三方工具。

## 3. 让它们追踪自己承诺的工作（5 分钟）

当一段对话变成要做的工作时，智能体会问：*要追踪这 N 项行动吗？* 回答是，它就会在你的营销项目里查找重复项，然后创建工作项。不经询问，什么都不会被创建。

## 4. 更大的工作交给编排者（10 分钟）

有三个智能体负责协调其他智能体：

| 编排者 | 用于 |
|---|---|
| **Marketing Director** | 营销计划；把工作委派给策略、内容、SEO、付费投放和发布方面的专家 |
| **Marketing Ops** | 周期性的营销循环和实验 |
| **Launch Manager** | 一次从头到尾的发布 |

其他智能体会互相转交：当一项工作属于另一位专家时，它们会告诉你是哪一位，并给你一个附带简短说明的链接。

## 5. 处理队列（5 分钟）

要给营销智能体一个队列，就在项目管理里创建一个 handle 相同的智能体，例如 SEO Auditor 对应 `mkt-seo-audit`，并把它加入你的营销项目。给它分配工作项，然后使用该智能体的 **Work my queue** 开场提示：智能体会拉取分配给它的工作项，逐一完成，在每一项上汇报，并在任何标记为需要审批的步骤停下。参见[把工作分配给智能体](/guides/assign-work-to-an-agent)。

## 检查是否成功

- `product_marketing` 已存在，并且第二个智能体直接用上了它，没有再问一遍。
- 有一段对话在你同意后，变成了营销项目里的工作项。
- 一次队列运行在审批步骤停下了。

## 下一步

把你的团队也拉进来：[搭建一个小团队](/guides/small-team-setup)。
