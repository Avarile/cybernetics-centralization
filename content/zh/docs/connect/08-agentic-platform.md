---
title: "智能体平台"
seoTitle: "把智能体平台连接到你的数据"
description: "让你的自定义智能体访问数据库、项目管理和 CRM——每个都用你自己的令牌，运行在你选择的任何模型上。"
time: "10 分钟"
---

智能体平台是自定义智能体和技能运行的地方。三个 MCP 服务器以**应用连接**的形式添加：每个用户用自己的凭据连接，所以智能体看到的永远不会超出该用户能看到的范围。

## 添加连接

每个服务器添加一次，使用你自己的凭据：

1. 选择 **Add MCP Server**。如果看不到这个选项，请管理员打开 **Allow users to create MCP servers**。
2. 按下表填写 **Title**、**MCP Server URL** 和 **Transport**（Streamable HTTP）。
3. 对于数据库和项目管理，把 **Authentication Type** 设为 **API Key**，**Header Format** 设为 **Bearer**，然后粘贴你的令牌。
4. 对于 CRM，**Authentication Type** 保持 **None (Auto-detect)**。系统会检测到该服务器需要 OAuth。
5. 保存。需要登录的服务器会显示 **Needs Auth**：选择 **Authenticate**，在弹出的窗口中登录 CRM 并批准。

使用以下设置：

| 连接 | URL | 凭据 |
|---|---|---|
| `cybernetics-data` | `https://cybernetics.avarile.com/api/mcp` | 请求头 `Authorization: Bearer <你的数据库令牌>` |
| `cybernetics-projects` | `https://projects.avarile.com/api/mcp` | 请求头 `Authorization: Bearer <你的 plane_api_ 令牌>` |
| `cybernetics-crm` | `https://crm.avarile.com/mcp` | OAuth：出现提示时登录 |

请先创建令牌：[创建访问令牌](/docs/connect/access-tokens)。

:::warning 名称必须完全一致
内置智能体会查找名称恰好为 `cybernetics-data` 和 `cybernetics-projects` 的连接。换成别的名称，它们就找不到你的数据，只能退而在聊天里问你。
:::

## 给智能体配上工具

1. 在 **Agent Hub** 中打开智能体，添加它需要的连接。周报智能体需要项目管理和数据库；会议准备智能体需要 CRM。
2. 标记为 **MCP optional** 的智能体在缺少连接时仍能运行，只是用不了那些工具。适合那些有没有你的数据都有用的智能体。
3. 和智能体开始一段对话，问一个只有你的数据才能回答的问题。

## 能领取工作的智能体

在项目管理中被设置为成员的智能体可以执行 **Work my queue**：它们领取分配给自己的工作项，完成工作，再把每一项推进到待你评审的状态。参见关于把工作分配给智能体的指南。

## 更换模型

每个智能体都可以运行在不同的模型上。要一次切换多个，使用 Agent Hub 中的 **Change model**。模型变了，你的连接和数据都不会变。
