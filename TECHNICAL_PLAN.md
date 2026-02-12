# BetterMe 觅我空间 - 技术方案文档

## 一、项目概述

### 1.1 目标
将多个独立测评网站整合到统一平台，通过「配置驱动」的测评引擎，实现：
- 新增测评主题只需配置 JSON（题库 + 评分模型）
- 统一的用户系统、历史记录、数据统计
- 大幅降低后续开发成本

### 1.2 核心功能
| 功能模块 | 说明 |
|---------|------|
| 测评引擎 | 配置驱动，支持多种题型和评分模型 |
| 用户系统 | 手机号/邮箱注册登录，密码认证 |
| 历史记录 | 用户答题记录存档，可回顾 |
| 分享海报 | 结果页生成图片，支持社交分享 |
| 数据统计 | 后台查看测评参与数据 |

---

## 二、技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │  首页   │  │测评中心 │  │ 答题页  │  │ 用户中心/历史  │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     后端 API (Node.js)                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │用户认证 │  │测评配置 │  │答题记录 │  │  统计分析      │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                │
│  ┌───────────────┐              ┌─────────────────────────┐ │
│  │  PostgreSQL   │              │     文件存储 (OSS)      │ │
│  │  - 用户表     │              │  - 测评配置 JSON        │ │
│  │  - 答题记录   │              │  - 分享海报图片         │ │
│  │  - 统计数据   │              │  - 封面图片             │ │
│  └───────────────┘              └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端框架 | React 19 + TypeScript | 沿用现有项目 |
| 前端路由 | React Router v6 | 主流方案，支持嵌套路由 |
| 状态管理 | Zustand | 轻量、简洁、TypeScript 友好 |
| UI 样式 | Tailwind CSS | 沿用现有项目风格 |
| 后端框架 | Node.js + Express | 快速开发，生态成熟 |
| 数据库 | PostgreSQL | 关系型，适合用户数据和记录 |
| ORM | Prisma | 类型安全，迁移方便 |
| 认证 | JWT + bcrypt | 无状态认证，密码加密 |
| 文件存储 | 阿里云 OSS | 国内访问快，成本低 |
| 海报生成 | html2canvas / node-canvas | 前端或后端生成均可 |

---

## 三、测评引擎设计（核心）

### 3.1 测评配置 Schema

每个测评主题对应一个 JSON 配置文件：

```typescript
interface AssessmentConfig {
  // 基础信息
  id: string;                    // 唯一标识，如 "lying-flat"
  version: string;               // 配置版本，如 "1.0.0"

  meta: {
    title: string;               // 测评名称
    description: string;         // 简介
    category: string;            // 分类
    coverImage?: string;         // 封面图
    timeEstimate: string;        // 预计时长
    difficulty: '简单' | '中等' | '深度';
  };

  // 题库
  questions: Question[];

  // 评分模型
  scoring: ScoringModel;

  // 结果配置
  results: ResultConfig[];
}

// 题目类型
interface Question {
  id: string;
  type: 'single' | 'multiple' | 'scale' | 'text' | 'image-choice';
  content: string;               // 题目内容
  description?: string;          // 题目说明
  image?: string;                // 题目配图
  required: boolean;

  // 选项（单选/多选/图片选择）
  options?: {
    id: string;
    label: string;
    value: number;               // 分值
    image?: string;              // 选项配图
    dimension?: string;          // 所属维度（多维度评分用）
  }[];

  // 量表题配置
  scale?: {
    min: number;
    max: number;
    minLabel: string;            // 如 "完全不同意"
    maxLabel: string;            // 如 "完全同意"
    step: number;
  };
}

// 评分模型
interface ScoringModel {
  method: 'sum' | 'average' | 'weighted' | 'dimension' | 'custom';

  // 维度评分（多维度测评用）
  dimensions?: {
    id: string;
    name: string;
    questionIds: string[];
    weight?: number;             // 权重
  }[];

  // 自定义评分（复杂逻辑）
  customLogic?: string;          // 评分函数名，后端实现
}

// 结果配置
interface ResultConfig {
  id: string;
  condition: {
    type: 'range' | 'dimension' | 'custom';
    // 分数区间
    min?: number;
    max?: number;
    // 维度条件
    dimensionId?: string;
    // 自定义条件
    customLogic?: string;
  };

  title: string;                 // 结果标题，如 "轻度躺平"
  subtitle?: string;             // 副标题
  description: string;           // 详细解读
  suggestions?: string[];        // 建议
  tags?: string[];               // 标签，如 ["需要休息", "压力较大"]

  // 海报配置
  poster?: {
    template: string;            // 海报模板 ID
    primaryColor: string;
    backgroundImage?: string;
  };
}
```

### 3.2 示例：躺平指数配置

```json
{
  "id": "lying-flat",
  "version": "1.0.0",
  "meta": {
    "title": "躺平指数",
    "description": "解析你的"精神躺平"真相，是蓄势待发还是彻底倦怠？",
    "category": "情绪调节",
    "timeEstimate": "3-5 min",
    "difficulty": "简单"
  },
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "content": "早上闹钟响了，你的第一反应是？",
      "required": true,
      "options": [
        { "id": "q1_a", "label": "立刻起床，新的一天开始了", "value": 1 },
        { "id": "q1_b", "label": "再躺5分钟...", "value": 2 },
        { "id": "q1_c", "label": "关掉闹钟继续睡", "value": 3 },
        { "id": "q1_d", "label": "闹钟？我已经不设了", "value": 4 }
      ]
    },
    {
      "id": "q2",
      "type": "scale",
      "content": "对于升职加薪，你的渴望程度是？",
      "required": true,
      "scale": {
        "min": 1,
        "max": 5,
        "minLabel": "完全无所谓",
        "maxLabel": "非常渴望",
        "step": 1
      }
    }
  ],
  "scoring": {
    "method": "sum"
  },
  "results": [
    {
      "id": "r1",
      "condition": { "type": "range", "min": 0, "max": 20 },
      "title": "元气满满型",
      "description": "你目前状态良好，对生活充满热情...",
      "tags": ["积极向上", "能量充沛"]
    },
    {
      "id": "r2",
      "condition": { "type": "range", "min": 21, "max": 40 },
      "title": "战略性躺平",
      "description": "你懂得在忙碌中给自己留白...",
      "tags": ["张弛有度", "聪明休息"]
    },
    {
      "id": "r3",
      "condition": { "type": "range", "min": 41, "max": 60 },
      "title": "深度躺平中",
      "description": "你可能正在经历一段低能量期...",
      "tags": ["需要充电", "适度调整"]
    }
  ]
}
```

### 3.3 新增测评流程

```
1. 创建 JSON 配置文件 → assessments/new-assessment.json
2. 上传到后端/OSS
3. 在管理后台启用
4. 前端自动渲染完整测评流程
```

无需写任何代码！

---

## 四、数据库设计

### 4.1 ER 图

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    User     │       │  AssessmentRecord│      │  AssessmentConfig│
├─────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)     │──┐    │ id (PK)         │       │ id (PK)         │
│ phone       │  │    │ user_id (FK)    │───────│ config_json     │
│ email       │  └───▶│ assessment_id   │       │ status          │
│ password    │       │ answers (JSON)  │       │ created_at      │
│ nickname    │       │ score           │       │ updated_at      │
│ avatar      │       │ result_id       │       └─────────────────┘
│ created_at  │       │ duration        │
│ updated_at  │       │ created_at      │
└─────────────┘       └─────────────────┘
```

### 4.2 表结构

```sql
-- 用户表
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         VARCHAR(20) UNIQUE,
  email         VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname      VARCHAR(50),
  avatar        VARCHAR(500),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),

  -- 至少有手机号或邮箱
  CONSTRAINT phone_or_email CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- 答题记录表
CREATE TABLE assessment_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id),
  assessment_id  VARCHAR(100) NOT NULL,        -- 对应配置的 id
  answers        JSONB NOT NULL,               -- 用户答案
  score          DECIMAL(10,2),                -- 总分
  dimension_scores JSONB,                      -- 维度分数
  result_id      VARCHAR(100),                 -- 命中的结果 ID
  duration       INTEGER,                      -- 答题时长（秒）
  poster_url     VARCHAR(500),                 -- 生成的海报地址
  created_at     TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_id (user_id),
  INDEX idx_assessment_id (assessment_id)
);

-- 测评统计表（可选，用于快速查询）
CREATE TABLE assessment_stats (
  assessment_id  VARCHAR(100) PRIMARY KEY,
  total_count    INTEGER DEFAULT 0,
  avg_score      DECIMAL(10,2),
  avg_duration   INTEGER,
  updated_at     TIMESTAMP DEFAULT NOW()
);
```

---

## 五、API 设计

### 5.1 用户认证

```
POST   /api/auth/register          # 注册
POST   /api/auth/login             # 登录
POST   /api/auth/logout            # 登出
POST   /api/auth/send-code         # 发送验证码（手机/邮箱）
POST   /api/auth/reset-password    # 重置密码
GET    /api/auth/me                # 获取当前用户信息
PUT    /api/auth/profile           # 更新用户信息
```

### 5.2 测评相关

```
GET    /api/assessments                    # 获取测评列表
GET    /api/assessments/:id                # 获取测评详情（含题目）
POST   /api/assessments/:id/submit         # 提交答案，返回结果
GET    /api/assessments/:id/stats          # 获取测评统计
```

### 5.3 用户记录

```
GET    /api/records                        # 获取我的答题记录
GET    /api/records/:id                    # 获取记录详情
POST   /api/records/:id/poster             # 生成分享海报
```

### 5.4 接口示例

**注册接口**
```
POST /api/auth/register
Content-Type: application/json

{
  "account": "13800138000",    // 手机号或邮箱
  "password": "MyPassword123",
  "code": "123456"             // 验证码
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "xxx", "phone": "138****8000" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**提交答案接口**
```
POST /api/assessments/lying-flat/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": {
    "q1": "q1_b",
    "q2": 3,
    "q3": ["q3_a", "q3_c"]
  },
  "duration": 180
}

Response:
{
  "success": true,
  "data": {
    "recordId": "xxx",
    "score": 35,
    "result": {
      "id": "r2",
      "title": "战略性躺平",
      "description": "...",
      "tags": ["张弛有度", "聪明休息"]
    }
  }
}
```

---

## 六、前端页面规划

### 6.1 路由结构

```
/                           # 首页
/assessments                # 测评中心
/assessment/:id             # 测评详情/介绍页
/assessment/:id/start       # 答题页
/assessment/:id/result/:recordId  # 结果页

/auth/login                 # 登录
/auth/register              # 注册
/auth/forgot-password       # 忘记密码

/user                       # 用户中心
/user/records               # 我的记录
/user/records/:id           # 记录详情
/user/settings              # 设置

/terms/:type                # 条款页面
/ai-principles              # AI 原则
```

### 6.2 新增页面组件

```
src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx           # 登录页
│   │   ├── RegisterPage.tsx        # 注册页
│   │   └── ForgotPasswordPage.tsx  # 忘记密码
│   ├── assessment/
│   │   ├── DetailPage.tsx          # 测评介绍页
│   │   ├── QuizPage.tsx            # 答题页（核心）
│   │   └── ResultPage.tsx          # 结果页
│   └── user/
│       ├── ProfilePage.tsx         # 个人中心
│       └── RecordsPage.tsx         # 历史记录
├── components/
│   ├── quiz/
│   │   ├── QuestionRenderer.tsx    # 题目渲染器
│   │   ├── SingleChoice.tsx        # 单选题
│   │   ├── MultipleChoice.tsx      # 多选题
│   │   ├── ScaleQuestion.tsx       # 量表题
│   │   ├── ImageChoice.tsx         # 图片选择题
│   │   ├── ProgressBar.tsx         # 进度条
│   │   └── QuizNavigation.tsx      # 答题导航
│   ├── result/
│   │   ├── ScoreDisplay.tsx        # 分数展示
│   │   ├── DimensionChart.tsx      # 维度雷达图
│   │   ├── ResultCard.tsx          # 结果卡片
│   │   └── SharePoster.tsx         # 分享海报
│   └── auth/
│       ├── AuthForm.tsx            # 登录/注册表单
│       └── VerifyCodeInput.tsx     # 验证码输入
└── stores/
    ├── authStore.ts                # 用户状态
    ├── quizStore.ts                # 答题状态
    └── recordStore.ts              # 记录状态
```

---

## 七、用户登录注册设计

### 7.1 登录方式

支持两种账号类型：
- 手机号 + 密码
- 邮箱 + 密码

### 7.2 注册流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  输入账号   │ ──▶ │  发送验证码 │ ──▶ │  输入验证码 │ ──▶ │  设置密码   │
│ (手机/邮箱) │     │             │     │             │     │  完成注册   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 7.3 页面设计

**登录页**
- 账号输入框（自动识别手机号/邮箱）
- 密码输入框
- 登录按钮
- 忘记密码链接
- 去注册链接

**注册页**
- 账号输入框（手机号/邮箱）
- 验证码输入框 + 发送按钮（60秒倒计时）
- 密码输入框（显示密码强度）
- 确认密码输入框
- 同意条款勾选
- 注册按钮

### 7.4 密码规则

- 长度：8-20 位
- 必须包含：字母 + 数字
- 可选包含：特殊字符
- 前端实时校验 + 后端二次校验

---

## 八、实施计划

### Phase 1：基础框架（1-2 周）
- [ ] 前端路由改造（React Router）
- [ ] 后端项目初始化（Express + Prisma）
- [ ] 数据库搭建（PostgreSQL）
- [ ] 用户注册/登录功能
- [ ] JWT 认证中间件

### Phase 2：测评引擎（2-3 周）
- [ ] 测评配置 Schema 定义
- [ ] 题目渲染组件（各题型）
- [ ] 评分计算引擎
- [ ] 结果页面展示
- [ ] 迁移 2-3 个现有测评到新引擎

### Phase 3：完善功能（1-2 周）
- [ ] 答题记录存储
- [ ] 历史记录页面
- [ ] 分享海报生成
- [ ] 数据统计接口

### Phase 4：优化上线（1 周）
- [ ] 性能优化
- [ ] 安全加固
- [ ] 部署上线
- [ ] 监控告警

---

## 九、目录结构（最终）

```
betterme-platform/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── services/           # API 调用
│   │   ├── utils/
│   │   └── types/
│   ├── public/
│   └── package.json
│
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── types/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── assessments/                 # 测评配置文件
│   ├── lying-flat.json
│   ├── internal-friction.json
│   └── ...
│
└── docs/                        # 文档
    └── TECHNICAL_PLAN.md
```

---

## 十、已确认事项

1. **部署环境**：Vercel（前端 + Serverless Functions）
2. **数据库**：Vercel Postgres
3. **域名**：bettermee.cn（已备案）
4. **用户认证**：账号（手机号/邮箱）+ 密码，无需验证码
5. **游客模式**：支持未登录用户答题，登录后可查看历史记录
6. **现有测评**：iframe 内嵌（躺平指数、内耗指数等）
7. **新测评**：使用测评引擎开发

---

## 十一、调整后的技术方案

### 11.1 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel                              │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   前端 (React)  │    │  Serverless Functions (API) │ │
│  │   静态托管      │    │  /api/auth/*                │ │
│  │                 │    │  /api/assessments/*         │ │
│  │                 │    │  /api/records/*             │ │
│  └─────────────────┘    └─────────────────────────────┘ │
│                                    │                     │
│                                    ▼                     │
│                         ┌─────────────────┐             │
│                         │ Vercel Postgres │             │
│                         └─────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### 11.2 用户系统调整

- 注册：账号 + 密码（无验证码）
- 登录：账号 + 密码
- 游客：可直接答题，结果存 localStorage
- 登录后：历史记录同步到数据库

### 11.3 测评策略

| 测评类型 | 实现方式 |
|---------|---------|
| 现有测评（躺平指数、内耗指数等） | iframe 内嵌 |
| 新开发测评 | 测评引擎（JSON 配置驱动） |

### 11.4 项目结构（Vercel 适配）

```
betterme-platform/
├── src/                        # 前端源码
│   ├── pages/
│   ├── components/
│   ├── stores/
│   └── ...
├── api/                        # Serverless Functions
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   └── me.ts
│   ├── assessments/
│   │   ├── index.ts
│   │   ├── [id].ts
│   │   └── [id]/submit.ts
│   └── records/
│       ├── index.ts
│       └── [id].ts
├── prisma/
│   └── schema.prisma
├── assessments/                # 测评配置 JSON
├── public/
└── package.json
```

---

开发顺序：
1. Phase 1：用户系统（注册/登录/游客模式）
2. Phase 2：iframe 内嵌现有测评
3. Phase 3：测评引擎开发
4. Phase 4：历史记录 + 分享海报
