# 配置驱动的模块化测评系统 - 架构文档

## 📋 概述

这是一个**零代码添加新主题**的测评系统架构。通过数据库配置即可快速上线新的测评主题，所有主题共享统一的支付系统（微信支付 + 兑换码）。

## 🏗️ 核心架构

### 1. 数据驱动设计

所有测评内容都存储在数据库中，不需要写代码：

```
themes (主题表)
  ├── questions (题目表)
  │     └── question_options (选项表，含分值)
  └── scoring_rules (评分规则表，含结果模板)
```

### 2. 统一引擎

- **前端**：通用测评组件 `UniversalAssessment.tsx`
- **后端**：通用提交接口 `/api/assessments/submit`
- **支付**：统一支付接口 `/api/payments/create`（支持微信 + 兑换码）

## 📁 文件结构

### 数据库
```
lib/assessment-schema.sql          # 完整的数据库表结构
```

### 后端 API
```
api/themes/list.ts                 # 获取主题列表
api/themes/[themeId].ts            # 获取主题详情和题目
api/assessments/submit.ts          # 提交答案，自动计算结果
api/assessments/result/[recordId].ts  # 获取测评结果
api/entitlements/check.ts          # 检查用户权限
api/payments/create.ts             # 创建订单（微信 + 兑换码）
api/payments/wechat-notify.ts      # 微信支付回调
```

### 前端页面
```
src/pages/ThemeList.tsx            # 主题列表页
src/pages/UniversalAssessment.tsx  # 通用测评页面
src/pages/AssessmentResult.tsx     # 结果展示页
src/components/PaymentModal.tsx    # 统一支付弹窗
```

## 🚀 添加新主题流程

### 只需 3 步，5 分钟上线：

#### 1. 创建主题
```sql
INSERT INTO themes (id, name, description, cover_image, price, question_count, estimated_time)
VALUES ('love-style', '恋爱风格测试', '了解你的恋爱模式', '/images/love.jpg', 19.9, 30, 10);
```

#### 2. 添加题目和选项
```sql
-- 添加题目
INSERT INTO questions (theme_id, order_num, question_text, question_type)
VALUES ('love-style', 1, '在恋爱中，你更看重：', 'single_choice');

-- 添加选项（假设题目 id 是 100）
INSERT INTO question_options (question_id, option_text, option_value, order_num)
VALUES
  (100, '情感共鸣', 10, 1),
  (100, '实际行动', 20, 2),
  (100, '言语表达', 30, 3);
```

#### 3. 配置评分规则
```sql
INSERT INTO scoring_rules (theme_id, min_score, max_score, result_title, result_content)
VALUES
  ('love-style', 0, 300, '情感型', '你是一个注重情感连接的人...'),
  ('love-style', 301, 600, '行动型', '你用实际行动表达爱...'),
  ('love-style', 601, 1000, '表达型', '你善于用语言传递爱意...');
```

**完成！** 新主题立即可用，访问 `/assessment/love-style` 即可开始测评。

## 💳 统一支付流程

### 支付方式
1. **微信支付**：调用微信 JSAPI，支付成功后自动授予权益
2. **兑换码**：输入兑换码，验证通过后立即授予权益

### 支付界面
`PaymentModal` 组件提供统一的支付体验：
- Tab 切换支付方式
- 微信支付：显示支付按钮，调起微信支付
- 兑换码：输入框 + 验证按钮

### 权益管理
- 用户购买后记录在 `user_entitlements` 表
- 测评前自动检查权限 `/api/entitlements/check`
- 免费主题（price = 0）无需支付

## 🔄 完整用户流程

```
1. 浏览主题列表 (/themes)
   ↓
2. 选择主题，检查权限
   ↓
3a. 有权限 → 直接开始测评
3b. 无权限 → 显示支付弹窗
   ↓
4. 选择支付方式
   ├─ 微信支付 → 调起微信 → 支付成功 → 授予权益
   └─ 兑换码 → 输入验证 → 验证通过 → 授予权益
   ↓
5. 开始测评，逐题回答
   ↓
6. 提交答案，自动计算分数
   ↓
7. 匹配结果模板，展示结果
```

## 📊 数据库表说明

### themes - 主题表
| 字段 | 说明 |
|------|------|
| id | 主题唯一标识 |
| name | 主题名称 |
| price | 价格（0 表示免费）|
| question_count | 题目数量 |
| estimated_time | 预计完成时间（分钟）|

### questions - 题目表
| 字段 | 说明 |
|------|------|
| theme_id | 关联主题 |
| order_num | 题目顺序 |
| question_text | 题目内容 |
| question_type | 题型（single_choice/multiple_choice）|

### question_options - 选项表
| 字段 | 说明 |
|------|------|
| question_id | 关联题目 |
| option_text | 选项内容 |
| option_value | 选项分值 |

### scoring_rules - 评分规则表
| 字段 | 说明 |
|------|------|
| theme_id | 关联主题 |
| min_score | 最低分数 |
| max_score | 最高分数 |
| result_title | 结果标题 |
| result_content | 结果内容 |

### orders - 订单表
| 字段 | 说明 |
|------|------|
| payment_method | wechat / redemption_code |
| payment_status | pending / paid / failed |
| redemption_code | 兑换码（如果使用）|

### user_entitlements - 用户权益表
| 字段 | 说明 |
|------|------|
| user_id | 用户 ID |
| theme_id | 主题 ID |
| source | purchase / redemption / gift |

## 🎯 优势

1. **开发成本极低**：新主题只需配置数据，5 分钟上线
2. **统一维护**：一套代码服务所有主题
3. **灵活扩展**：支持多种题型、评分算法
4. **统一支付**：所有主题共用支付系统
5. **数据统一**：所有数据在同一个系统中，便于分析

## 🔧 技术栈

- **前端**：React + TypeScript + React Router + Tailwind CSS
- **后端**：Vercel Serverless Functions + Neon PostgreSQL
- **支付**：微信支付 JSAPI + 自研兑换码系统

## 📝 待完善

1. **微信支付集成**：需要配置微信商户号，实现签名验证
2. **管理后台**：添加主题管理、题目管理界面（目前需要直接操作数据库）
3. **题型扩展**：支持更多题型（量表、排序等）
4. **结果分享**：生成结果海报，支持分享到社交平台

## 🚦 快速开始

1. 执行数据库脚本：
```bash
psql $DATABASE_URL -f lib/assessment-schema.sql
```

2. 访问主题列表：
```
http://localhost:3000/themes
```

3. 添加示例主题（已包含在 schema 中）：
- MBTI 性格测试（示例数据）

---

**核心理念**：配置即代码，数据即产品。
