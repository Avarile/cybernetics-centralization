---
title: "连接你的 AI：概览"
seoTitle: "通过 MCP 连接 Claude、ChatGPT、Codex 或 Cursor"
description: "三个 MCP 端点、各自的登录方式，以及哪些 AI 应用可以使用哪个模块。"
time: "3 分钟"
---

每个存放数据的模块都提供一个 MCP 端点。MCP（Model Context Protocol，模型上下文协议）是 AI 应用与外部工具对话的标准接口：可以把它想象成 AI 的 USB。任何支持它的应用，都能凭你掌控的密钥读写你的数据。

## 端点

| 模块 | 端点（托管版） | 登录方式 |
|---|---|---|
| 数据库 | `https://cybernetics.avarile.com/api/mcp` | 个人访问令牌，作为请求头发送 |
| 项目管理 | `https://projects.avarile.com/api/mcp` | 个人访问令牌，作为请求头发送 |
| CRM | `https://crm.avarile.com/mcp` | OAuth：在浏览器中批准访问 |

自托管？在你自己的域名上，路径完全相同。

:::note 两种登录方式
**令牌**端点要求每个请求都带上 `Authorization: Bearer <token>` 请求头。请先创建令牌：参见[创建访问令牌](/docs/connect/access-tokens)。

**OAuth** 端点无需事先准备。你的 AI 应用第一次连接时，会打开一个浏览器窗口，你在其中登录并批准访问。
:::

## 哪个应用可以使用哪个模块

有些应用能发送令牌请求头，有些只支持 OAuth。这决定了哪些组合可行。

| AI 应用 | 数据库 | 项目管理 | CRM |
|---|---|---|---|
| [Claude Code](/docs/connect/claude-code) | ✓ | ✓ | ✓ |
| [Claude Desktop](/docs/connect/claude-desktop) | ✓ 需借助一个小桥接 | ✓ 需借助一个小桥接 | ✓ |
| [ChatGPT](/docs/connect/chatgpt) | ✗ 暂不支持 | ✗ 暂不支持 | ✓ |
| [Codex](/docs/connect/codex) | ✓ | ✓ | ✓ |
| [Cursor、VS Code 及其他](/docs/connect/cursor-and-others) | ✓ | ✓ | ✓ |
| [智能体平台](/docs/connect/agentic-platform) | ✓ | ✓ | ✓ |

## 保证安全的规则

- **一个应用一个令牌。** 不再使用某个应用时，撤销它的令牌，其他一切照常。
- **只给它需要的权限。** 数据库令牌可以限制在特定的空间和库，也可以只给只读权限。
- **AI 以你的身份行事。** 令牌携带其所有者的权限。它看到的不会比你多。
- **令牌只显示一次。** 直接粘贴到应用配置或环境变量里。永远不要粘贴到聊天里。
