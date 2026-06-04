# 上海餐饮情报站 - 部署指南

## 一、Supabase 数据库配置

1. 登录 [Supabase](https://supabase.com/)，创建新项目
2. 进入项目的 **SQL Editor**
3. 新建查询，粘贴 `sql/init.sql` 中的全部内容并执行
4. 确认 4 张表已创建：
   - `topics`
   - `comments`
   - `comment_likes`
   - `topic_views`

## 二、环境变量配置

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase 数据库连接（Connection Pooler / Transaction 模式）
# 在 Supabase Dashboard → Project Settings → Database → Connection String 中获取
DATABASE_URL="postgresql://postgres:[密码]@[host]:5432/postgres?pgbouncer=true"

# 管理后台密码（简单认证，自行设置一个强密码）
ADMIN_PASSWORD="your-admin-password"
```

> ⚠️ 注意：使用 Prisma 连接 Supabase 时，必须使用 **Connection Pooler** 的连接字符串（带 `?pgbouncer=true`），否则会出现连接错误。

## 三、Vercel 部署步骤

### 方式一：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方式二：Git 集成（推荐）

1. 将代码推送到 GitHub/GitLab
2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 **Add New Project** → 导入仓库
4. 在 **Environment Variables** 中添加：
   - `DATABASE_URL` = 你的 Supabase 连接字符串
   - `ADMIN_PASSWORD` = 你的管理密码
5. 点击 **Deploy**

## 四、部署后验证

1. 访问首页：`https://你的域名/`
2. 访问管理后台：`https://你的域名/admin`
3. 输入密码登录管理后台
4. 创建测试话题 → 复制分享链接
5. 微信内打开分享链接，测试浏览、评论、点赞、转发全流程

## 五、域名配置（可选）

在 Vercel Dashboard → Project Settings → Domains 中添加自定义域名，按提示配置 DNS 记录。

## 六、常见问题

**Q: 部署后数据库连接失败？**
A: 确认使用 Supabase Connection Pooler 的连接字符串，并包含 `?pgbouncer=true`。

**Q: Prisma Client 未生成？**
A: package.json 中已配置 `postinstall` 脚本，Vercel 构建时会自动执行。如失败，可在 Vercel 构建命令中添加 `prisma generate`。

**Q: 静态构建时 API 路由报错？**
A: 这是 Next.js 预渲染阶段的正常提示，不影响实际运行时。API 路由在请求时动态执行。
