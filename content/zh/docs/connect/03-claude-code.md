---
title: "Claude Code"
seoTitle: "把 Claude Code 连接到你的数据库、项目和 CRM"
description: "一次性把三个 MCP 服务器都加到 Claude Code：数据库和项目管理用令牌请求头，CRM 用 OAuth。"
time: "5 分钟"
---

Claude Code 在终端里添加远程 MCP 服务器，并会发送你提供的任何请求头。

## 开始之前

- 已安装并登录 Claude Code。
- 两个令牌已放进环境变量：参见[创建访问令牌](/docs/connect/access-tokens)。

## 添加服务器

```bash
claude mcp add --transport http --scope user cybernetics-data \
  https://cybernetics.avarile.com/api/mcp \
  --header "Authorization: Bearer $CYBERNETICS_DATA_TOKEN"

claude mcp add --transport http --scope user cybernetics-projects \
  https://projects.avarile.com/api/mcp \
  --header "Authorization: Bearer $CYBERNETICS_PROJECTS_TOKEN"

claude mcp add --transport http --scope user cybernetics-crm \
  https://crm.avarile.com/mcp
```

`--scope user` 让这些服务器在所有项目中可用。去掉它，就只添加到当前项目。

:::note 保存的是令牌本身，而不是引用
运行命令时，你的 shell 会展开 `$CYBERNETICS_DATA_TOKEN`，所以 Claude Code 保存的是令牌的值。如果你更换了令牌，需要移除服务器后重新添加。
:::

## 登录 CRM

启动 Claude Code，运行 `/mcp`。选择 `cybernetics-crm`，然后选择认证。浏览器窗口会打开；登录 CRM 并批准即可。

## 检查是否成功

```bash
claude mcp list
```

三个都应显示为已连接。然后问一个只有你的数据才能回答的问题：

> 我当前有哪些目标？每个目标下都计划了什么？

如果回答列出了你自己的目标和项目，就说明连接成功了。

## 移除或更新服务器

```bash
claude mcp remove cybernetics-data --scope user
```

然后用新令牌重新添加。
