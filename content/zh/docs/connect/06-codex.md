---
title: "Codex"
seoTitle: "把 Codex 连接到你的数据库、项目和 CRM"
description: "把三个服务器添加到 Codex 的 config.toml。Codex 从环境变量读取令牌，所以文件里永远不会包含它们。"
time: "5 分钟"
---

## 开始之前

两个令牌已放进环境变量，方法见[创建访问令牌](/docs/connect/access-tokens)。

## 添加服务器

把下面的内容加到 `~/.codex/config.toml`：

```toml
[mcp_servers.cybernetics-data]
url = "https://cybernetics.avarile.com/api/mcp"
bearer_token_env_var = "CYBERNETICS_DATA_TOKEN"

[mcp_servers.cybernetics-projects]
url = "https://projects.avarile.com/api/mcp"
bearer_token_env_var = "CYBERNETICS_PROJECTS_TOKEN"

[mcp_servers.cybernetics-crm]
url = "https://crm.avarile.com/mcp"
```

`bearer_token_env_var` 指定 Codex 从哪个变量读取令牌，并以 `Authorization: Bearer …` 的形式发送。更换令牌时，只需更新变量，不用改这个文件。

## 登录 CRM

Codex 第一次遇到这个服务器时，会打开 CRM 的登录页面。如果没有弹出浏览器窗口，运行：

```bash
codex mcp login cybernetics-crm
```

登录链接只打开一次。打开两次会产生两个相互冲突的登录。

## 检查是否成功

```bash
codex mcp list
```

然后在真实任务上试一试：

> 找到我那篇关于部署到生产环境的操作指南，并按它处理这个仓库。
