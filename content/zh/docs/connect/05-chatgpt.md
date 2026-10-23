---
title: "ChatGPT"
seoTitle: "通过 MCP 把 ChatGPT 连接到你的 CRM"
description: "ChatGPT 的连接器用 OAuth 登录，所以 CRM 现在就能用。数据库和项目管理需要令牌请求头，而 ChatGPT 暂时还发送不了。"
time: "5 分钟"
---

ChatGPT 把远程 MCP 服务器作为连接器添加。连接器用 OAuth 登录，不能发送自定义请求头。所以目前：

| 模块 | 能在 ChatGPT 中使用吗？ |
|---|---|
| CRM | 能，通过 OAuth |
| 数据库 | 暂时不能：需要令牌请求头 |
| 项目管理 | 暂时不能：需要令牌请求头 |

## 添加 CRM

1. 打开 **Settings → Apps & Connectors**。如果找不到创建入口，在 **Advanced settings** 下打开开发者模式。
2. 选择 **Create**，名称填 `cybernetics-crm`，URL 填 `https://crm.avarile.com/mcp`，认证方式选 OAuth。
3. 在弹出的窗口中登录 CRM 并批准。

## 检查是否成功

新建一个对话，打开这个连接器，然后问：

> 过去两周里，我有哪些人还没联系过？

## 数据库和项目管理

在这两个模块支持 OAuth 之前，请通过能发送请求头的应用来使用它们：[Claude Code](/docs/connect/claude-code)、[Claude Desktop](/docs/connect/claude-desktop)、[Codex](/docs/connect/codex)、[Cursor](/docs/connect/cursor-and-others)，或者[智能体平台](/docs/connect/agentic-platform)——它可以使用任何模型，包括 OpenAI 的模型。

:::warning 不要用公共代理绕过限制
那些替 MCP 服务器“加请求头”的在线工具会看到你的令牌和数据。令牌只应留在你自己掌控的机器上。
:::
