// 简单测试 auth 模块是否能正常工作
const path = require('path');

// 模拟 Vercel 环境
process.env.DATABASE_URL = 'postgresql://test';
process.env.JWT_SECRET = 'test-secret';

// 尝试导入
try {
  const authPath = path.join(__dirname, 'lib', 'auth.ts');
  console.log('Auth file path:', authPath);
  console.log('File exists:', require('fs').existsSync(authPath));
  
  // 检查相对路径
  const apiPath = path.join(__dirname, 'api', 'admin', 'stats.ts');
  const relativePath = path.relative(path.dirname(apiPath), authPath);
  console.log('Relative path from stats.ts to auth.ts:', relativePath);
} catch (err) {
  console.error('Error:', err);
}
