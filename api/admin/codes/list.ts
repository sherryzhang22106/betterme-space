import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '../../../lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  // 验证管理员权限
  const auth = await verifyAdmin(req);
  if (!auth.isAdmin) {
    if (auth.error === '未提供认证令牌' || auth.error === '无效的认证令牌') {
      return unauthorizedResponse(res, auth.error);
    }
    return forbiddenResponse(res, auth.error);
  }

  try {
    const { status, productId, batchNo, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // 构建查询条件
    let query = `SELECT * FROM redemption_codes WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (productId) {
      query += ` AND product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (batchNo) {
      query += ` AND batch_no = $${paramIndex}`;
      params.push(batchNo);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const codes = await sql(query, params);

    // 获取总数
    let countQuery = `SELECT COUNT(*) as total FROM redemption_codes WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (productId) {
      countQuery += ` AND product_id = $${countParamIndex}`;
      countParams.push(productId);
      countParamIndex++;
    }

    if (batchNo) {
      countQuery += ` AND batch_no = $${countParamIndex}`;
      countParams.push(batchNo);
    }

    const [{ total }] = await sql(countQuery, countParams);

    return res.status(200).json({
      success: true,
      codes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages: Math.ceil(Number(total) / Number(limit))
      }
    });

  } catch (error: any) {
    console.error('获取兑换码列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取兑换码列表失败',
      error: error.message
    });
  }
}
