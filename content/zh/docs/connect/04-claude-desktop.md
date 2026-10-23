---
title: "Claude Desktop"
seoTitle: "通过 MCP 把 Claude Desktop 连接到你的数据"
description: "把 CRM 添加为连接器；数据库和项目管理则通过 mcp-remote 桥接，因为 Claude 的连接器表单无法发送令牌请求头。"
time: "10 分钟"
---

Claude 的连接器表单只支持 OAuth 登录。CRM 支持 OAuth，所以作为连接器添加。数据库和项目管理需要令牌请求头，所以要通过 `mcp-remote` 写进 Claude Desktop 的配置文件——这是一个在你电脑上运行的小桥接程序，会替你加上请求头。

## CRM：作为连接器

1. 打开 **Settings → Connectors → Add custom connector**。
2. 命名为 `cybernetics-crm`，粘贴 `https://crm.avarile.com/mcp`。
3. 选择 **Connect**，在浏览器窗口中登录 CRM 并批准。

## 数据库和项目管理：通过 mcp-remote

你需要安装 Node.js，因为桥接程序用 `npx` 运行。

1. 打开 **Settings → Developer → Edit Config**。这会打开 `claude_desktop_config.json`。
2. 添加两个服务器。把令牌放在 `env` 里，而不是写进参数：

```json
{
  "mcpServers": {
    "cybernetics-data": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://cybernetics.avarile.com/api/mcp",
        "--header", "Authorization:${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "Bearer paste-the-data-base-token" }
    },
    "cybernetics-projects": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://projects.avarile.com/api/mcp",
        "--header", "Authorization:${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "Bearer plane_api_..." }
    }
  }
}
```

3. 保存文件，**彻底退出 Claude Desktop**，然后重新打开。只关闭窗口是不够的。

:::tip 为什么请求头要这样写
`Authorization:${AUTH_HEADER}` 的冒号后面没有空格，空格放在变量里面。有些系统会按空格拆分参数，直接在 `args` 里写 `Authorization: Bearer …` 就会出错。
:::

## 检查是否成功

打开一个新对话。工具菜单里应该列出 `cybernetics-data`、`cybernetics-projects` 和 `cybernetics-crm`。问一句：

> 我的项目里有哪些逾期了？这些任务关联了哪些笔记？

## 如果连不上

- **什么都没出现：** 检查文件是否是合法的 JSON（最常见的原因是少了一个逗号），并彻底重启应用。
- **服务器显示错误：** 在终端里运行同样的 `npx -y mcp-remote …` 命令查看提示信息。401 表示令牌错误或已被撤销。
- 更多内容见[故障排查](/docs/connect/troubleshooting)。
