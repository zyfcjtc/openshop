# OpenShop

开源一键建店工具。几分钟内启动一个移动端优先的在线商店 — 无需编程。

[English](./README.md) | 中文

## 功能特点

- **移动端优先** — 商品列表、详情页、购物车和结账流程，专为手机优化
- **Stripe 支付** — 支持 Apple Pay、Google Pay 和信用卡支付
- **管理后台** — 在手机上管理商品、订单和商店设置
- **设置向导** — 为非技术用户设计的引导式设置，一键部署
- **自定义** — 自由设置店铺名称、语言、Logo 和主题颜色
- **多语言** — 配置驱动的单语言模式（英文、中文，或添加其他语言）

## 技术栈

- [Next.js 16](https://nextjs.org/) — App Router, Server Components
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — 数据库、认证、存储
- [Stripe](https://stripe.com/) — 支付
- [Resend](https://resend.com/) — 邮件通知
- [Vercel](https://vercel.com/) — 托管

## 快速开始

### 方式一：设置向导（推荐）

打开 [设置向导](https://zyfcjtc.github.io/openshop/) 并按照步骤操作。

### 方式二：手动设置

1. 创建 [Supabase](https://supabase.com/) 项目
2. 在 Supabase SQL 编辑器中运行 `supabase/migrations/001_initial_schema.sql`
3. 创建 [Stripe](https://stripe.com/) 账号
4. 创建 [Resend](https://resend.com/) 账号
5. 复制 `.env.local.example` 为 `.env.local` 并填入密钥
6. 本地运行：

```bash
npm install
npm run dev
```

7. 部署到 Vercel：

```bash
npx vercel
```

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 |
| `STRIPE_SECRET_KEY` | Stripe 密钥 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公开密钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名密钥 |
| `RESEND_API_KEY` | Resend API 密钥 |
| `RESEND_FROM_EMAIL` | 发件人邮箱地址 |
| `ADMIN_EMAIL` | 管理员通知邮箱 |
| `NEXT_PUBLIC_STORE_NAME` | 商店名称 |
| `NEXT_PUBLIC_LOCALE` | 语言（`en` 或 `zh`） |
| `NEXT_PUBLIC_THEME_COLOR` | 主题颜色预设 |

## 添加语言

1. 复制 `src/messages/en.json` 为 `src/messages/{locale}.json`
2. 翻译所有值
3. 在 `src/lib/i18n.ts` 中添加导入
4. 将 `NEXT_PUBLIC_LOCALE` 设为新的语言代码

## 许可证

MIT
