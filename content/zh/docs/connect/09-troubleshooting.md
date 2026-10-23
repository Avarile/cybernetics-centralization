---
title: "连接故障排查"
seoTitle: "修复 MCP 连接错误：401、404、405"
description: "每种错误的含义、如何在终端里测试端点，以及最常见问题的解决办法。"
time: "5 分钟"
---

## 直接测试端点

下面的命令会发送每个 MCP 客户端都会发送的第一条消息。在终端中运行，令牌放在环境变量里：

```bash
curl -s -X POST https://cybernetics.avarile.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $CYBERNETICS_DATA_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'
```

正常工作的服务器会返回它的名称和能力。测试项目管理时，换成它的 URL 和 `$CYBERNETICS_PROJECTS_TOKEN`。

:::warning 不要用 curl 请求智能体平台
智能体平台会把对其应用路由的脚本请求视为滥用，可能把你的账号和 IP 锁定两小时。请改为测试上面三个数据端点。
:::

## 错误的含义

| 你看到 | 可能原因 | 解决办法 |
|---|---|---|
| **404** "Cannot POST /mcp" | 数据库的路径错了 | 使用 `/api/mcp` |
| **405** 并返回一个 HTML 页面 | 项目管理的路径错了，或者它的 MCP 服务器没开 | 使用 `/api/mcp`；自托管者需设置 `MCP_SERVER_ENABLED=1` |
| `crm…/api/mcp` 返回 **404** | CRM 的路径错了 | 使用 `/mcp` |
| **401** Unauthorized | 令牌缺失、拼写错误、已过期或已撤销 | 检查请求头是否为 `Authorization: Bearer <token>`，中间只有一个空格；不确定时就新建一个令牌 |
| CRM 返回 **401** | OAuth 登录没有完成 | 重新执行应用的登录流程（Claude Code 中用 `/mcp`，或 `codex mcp login`） |
| 只出现读取类工具 | 令牌只有读取权限，或服务器是只读的（`MCP_READONLY`） | 给令牌添加权限，或询问管理员 |
| 一次查询最多返回 500 条记录 | 服务器的单次查询上限 | 缩小查询范围，或分页获取结果 |

## 常见问题

- **令牌在 curl 里能用，在应用里不行。** 应用保存的是旧值。移除服务器后重新添加（Claude Code），更新环境变量后重启（Codex、Cursor），或者编辑配置文件后彻底退出再重新打开（Claude Desktop）。
- **Claude Desktop 里什么都没有。** 配置文件不是合法的 JSON，或者应用没有彻底重启。参见 [Claude Desktop](/docs/connect/claude-desktop)。
- **"npx: command not found"。** 安装 Node.js；`mcp-remote` 依赖它运行。
- **AI 说它看不到某个表格。** 令牌的访问范围不包含那个空间或库。在数据库中编辑令牌的访问范围。
- **AI 回答了，但不是基于你的数据。** 问它用了哪个工具。如果它没有调用任何工具，就明确说“查一下我的数据库”，或者在这个对话里打开连接器。
