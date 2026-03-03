# 统一兑换码系统使用文档

## 系统概述

统一兑换码系统允许在 betterme-space 管理后台批量生成兑换码，覆盖平台所有测评产品。用户可以通过兑换码解锁测评内容。

## 数据库设置

### 1. 执行数据库迁移

首先需要在你的 Neon 数据库中执行以下 SQL 文件：

```bash
# 连接到你的 Neon 数据库，执行
lib/redemption-schema.sql
```

这将创建以下表：
- `redemption_codes` - 兑换码表
- `redemption_logs` - 兑换记录表

### 2. 确保环境变量配置

在 `.env.local` 中确保有以下配置：

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
```

## 管理后台使用

### 访问兑换码管理

1. 登录管理后台：https://www.bettermee.cn/admin
2. 点击「兑换码管理」标签页

### 功能模块

#### 1. 数据统计
- 查看总兑换码数、已使用数、未使用数、使用率
- 按产品查看兑换码统计
- 查看最近兑换记录

#### 2. 生成兑换码
- 选择产品（依恋风格、恋爱健康指数等）
- 设置生成数量（1-1000）
- 可选：设置批次号（便于管理）
- 可选：添加备注（如"小红书活动专用"）
- 点击生成后自动下载 txt 文件

#### 3. 兑换码列表
- 查看所有兑换码
- 按状态筛选（未使用/已使用/已过期）
- 按产品筛选
- 复制兑换码

## 前端集成

### 在测评页面添加兑换码入口

```tsx
import RedeemCodeModal from '../components/RedeemCodeModal';

// 在组件中
const [showRedeemModal, setShowRedeemModal] = useState(false);

// 在需要验证兑换码的地方
<button onClick={() => setShowRedeemModal(true)}>
  输入兑换码解锁
</button>

<RedeemCodeModal
  isOpen={showRedeemModal}
  onClose={() => setShowRedeemModal(false)}
  onSuccess={() => {
    // 兑换成功后的逻辑
    // 例如：允许用户继续测评或查看报告
  }}
  productId="attachment-style"
  productName="依恋风格"
/>
```

## API 接口

### 1. 生成兑换码（管理员）
```
POST /api/admin/codes/generate
Authorization: Bearer {token}

Body:
{
  "productId": "attachment-style",
  "productName": "依恋风格",
  "count": 10,
  "batchNo": "2024-03-batch-01",  // 可选
  "notes": "小红书活动专用"        // 可选
}
```

### 2. 获取兑换码列表（管理员）
```
GET /api/admin/codes/list?status=active&productId=attachment-style&page=1&limit=50
Authorization: Bearer {token}
```

### 3. 获取统计数据（管理员）
```
GET /api/admin/codes/stats
Authorization: Bearer {token}
```

### 4. 验证兑换码（前端）
```
POST /api/codes/verify

Body:
{
  "code": "ABCD-EFGH-IJKL",
  "productId": "attachment-style",
  "userId": "user-uuid"  // 可选，如果用户已登录
}
```

## 兑换码格式

- 格式：`XXXX-XXXX-XXXX`（12位，每4位用短横线分隔）
- 字符集：大写字母 + 数字（去除易混淆字符如 0、O、I、1）
- 示例：`A3B7-K9M2-P4Q8`

## 业务流程

### 小红书销售流程

1. **管理员操作**：
   - 在后台生成一批兑换码（如 100 个）
   - 设置批次号：`xiaohongshu-2024-03`
   - 下载兑换码文件

2. **小红书发货**：
   - 用户在小红书购买产品
   - 通过"在线发货"方式发送兑换码

3. **用户使用**：
   - 用户访问测评页面
   - 点击"输入兑换码"
   - 输入兑换码解锁内容

4. **系统验证**：
   - 检查兑换码是否存在
   - 检查是否已使用
   - 检查产品是否匹配
   - 标记为已使用并记录日志

## 产品 ID 对照表

| 产品名称 | Product ID |
|---------|-----------|
| 依恋风格 | attachment-style |
| 恋爱健康指数 | love-health |
| 爱情浓度 | love-concentration |
| 分手挽回可能性 | breakup-recovery |
| 躺平指数 | lying-flat |
| 内耗指数 | internal-friction |
| 人生剧本 | life-script |
| 社恐/社牛指数 | social-anxiety |
| 完美主义倾向 | perfectionism |

## 注意事项

1. **安全性**：
   - 兑换码生成和管理接口需要管理员权限
   - 验证接口对所有用户开放
   - 每个兑换码只能使用一次

2. **过期时间**：
   - 目前设计不设置过期时间
   - 如需添加，在生成时传入 `expiresAt` 参数

3. **批次管理**：
   - 建议使用有意义的批次号
   - 格式建议：`渠道-年月-批次`
   - 例如：`xiaohongshu-2024-03-01`

4. **数据导出**：
   - 生成后自动下载 txt 文件
   - 包含：兑换码、产品名称、生成时间
   - 建议妥善保管导出文件

## 后续扩展

### 微信支付集成
后续可以在同一个支付界面同时支持：
- 微信支付（在线支付）
- 兑换码（离线兑换）

用户可以选择任一方式解锁内容。

### 统计分析
- 各渠道兑换码使用情况
- 转化率分析
- 用户行为追踪
