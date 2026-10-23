---
title: "创建访问令牌"
seoTitle: "为每个模块创建 MCP 访问令牌"
description: "为数据库和项目管理各创建一个令牌，选择它能访问的范围，用完就撤销。CRM 则改用 OAuth 登录。"
time: "5 分钟"
---

每个 AI 应用、每个模块各创建一个令牌。用应用来命名（例如“笔记本上的 Claude Code”），以后就知道该撤销哪一个。

## 数据库

1. 打开 **Settings → Personal access tokens**，选择 **Create new token**。
2. 填写表单（见下表）。
3. 创建后，**立即复制令牌**。它只显示一次。

| 字段 | 填什么 |
|---|---|
| **Name**、**Description** | 它用于哪个应用、哪台机器 |
| **Scopes** | 令牌能做什么。如果是只读助手，只选读取权限 |
| **Access** | 它能访问的空间和库。选择整个空间，以后新增的库也会包含在内 |
| **Expiration** | 天数、某个日期，或永久。越短越安全 |

**Settings → MCP Server** 页面会显示端点、客户端可用的工具（以及每个工具需要的权限），还有这个实例的限制。

:::note AI 通过 MCP 不能做的事
它不能删除字段或表格，也不能转换字段类型，因为这些操作无法撤销。它删除的记录可以从表格的 **Trash** 中恢复。
:::

## 项目管理

1. 打开你的 **Profile settings → MCP server**。
2. 在 **1. Add a token** 下，选择 **Generate token**，或选择 **Use an existing token** 并粘贴一个以 `plane_api_` 开头的令牌。
3. 选择 **Test connection**。它应该显示 *Connected*，并告诉你有多少个可用工具。
4. **2. Connect your assistant** 提供了 Claude Code、Cursor、VS Code、Claude Desktop 等的现成配置，端点和令牌都已填好。

助手以你的身份、用你的权限登录。随时可以在 **Profile settings → Personal Access Tokens** 下撤销令牌。

## CRM

不需要令牌。CRM 使用 OAuth：AI 应用第一次连接时会打开一个浏览器窗口，你登录 CRM 并批准访问即可。

对于不支持 OAuth 的应用，在 CRM 的 **Settings → APIs & Webhooks** 下创建一个 API 密钥，以 `Authorization: Bearer <key>` 的形式发送。

## 别让令牌出现在聊天和文件里

把令牌存在环境变量里，这样配置文件可以引用它们，而不必包含它们：

```bash
# ~/.zshrc or ~/.bashrc
export CYBERNETICS_DATA_TOKEN="paste-the-data-base-token"
export CYBERNETICS_PROJECTS_TOKEN="plane_api_..."
```

之后打开一个新终端，或运行 `source ~/.zshrc`。后面的设置页面都使用这两个变量名。

:::warning 如果令牌泄露了
立即撤销它（数据库：**Settings → Personal access tokens**；项目管理：**Profile settings → Personal Access Tokens**），然后创建一个新的。永远不要把令牌粘贴到 AI 聊天、截图或 git 仓库里。
:::
