---
title: "Cursor、VS Code 及其他客户端"
seoTitle: "通过 MCP 把 Cursor 或 VS Code 连接到你的数据"
description: "为 Cursor 和 VS Code 配置令牌请求头，或者把任何支持 Streamable HTTP 的 MCP 客户端指向这三个端点。"
time: "5 分钟"
---

## Cursor

项目管理的 **Profile settings → MCP server** 页面上有一个 **Add to Cursor** 按钮，一键就能为该服务器完成配置。要添加全部三个，把它们写进 `~/.cursor/mcp.json`（所有项目）或 `.cursor/mcp.json`（单个项目）：

```json
{
  "mcpServers": {
    "cybernetics-data": {
      "url": "https://cybernetics.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${env:CYBERNETICS_DATA_TOKEN}" }
    },
    "cybernetics-projects": {
      "url": "https://projects.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${env:CYBERNETICS_PROJECTS_TOKEN}" }
    },
    "cybernetics-crm": {
      "url": "https://crm.avarile.com/mcp"
    }
  }
}
```

`${env:…}` 从你的环境变量中读取令牌，设置方法见[创建访问令牌](/docs/connect/access-tokens)。设置好变量后重启 Cursor。CRM 在第一次使用时会要求你登录。

在 **Cursor Settings → MCP** 下查看状态：每个服务器都应显示一个绿点及其工具列表。

## VS Code

项目管理的 MCP 页面上也有一个 **Add to VS Code** 按钮。要添加全部三个，创建 `.vscode/mcp.json`。VS Code 可以只提示一次输入令牌，并安全地保存它：

```json
{
  "inputs": [
    { "type": "promptString", "id": "data-token", "description": "Data Base token", "password": true },
    { "type": "promptString", "id": "projects-token", "description": "Project Management token", "password": true }
  ],
  "servers": {
    "cybernetics-data": {
      "type": "http",
      "url": "https://cybernetics.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${input:data-token}" }
    },
    "cybernetics-projects": {
      "type": "http",
      "url": "https://projects.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${input:projects-token}" }
    },
    "cybernetics-crm": {
      "type": "http",
      "url": "https://crm.avarile.com/mcp"
    }
  }
}
```

## 其他任何客户端

任何支持 **Streamable HTTP** 的客户端都可以使用：

| 设置 | 数据库 | 项目管理 | CRM |
|---|---|---|---|
| URL | `https://cybernetics.avarile.com/api/mcp` | `https://projects.avarile.com/api/mcp` | `https://crm.avarile.com/mcp` |
| 认证 | `Authorization: Bearer <token>` | `Authorization: Bearer <token>`（或 `X-Api-Key: <token>`） | OAuth |

如果某个客户端只支持本地（stdio）服务器，就像 [Claude Desktop](/docs/connect/claude-desktop) 那样用 `mcp-remote` 桥接。
