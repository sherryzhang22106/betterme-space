import React, { useState } from 'react';

interface RedeemCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  productName: string;
}

const RedeemCodeModal: React.FC<RedeemCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productId,
  productName
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('请输入兑换码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          productId,
          userId: null // 可以从 authStore 获取用户 ID
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('兑换成功！');
        onSuccess();
        onClose();
      } else {
        setError(data.message || '兑换失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-2xl font-black text-slate-800 mb-2">输入兑换码</h3>
        <p className="text-sm text-slate-500 mb-6">解锁「{productName}」完整内容</p>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="请输入兑换码（例如：XXXX-XXXX-XXXX）"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary text-center font-mono text-lg tracking-wider"
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-rose-600 mt-2">{error}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {loading ? '验证中...' : '确认兑换'}
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            💡 兑换码可在小红书等渠道购买获得
          </p>
        </div>
      </div>
    </div>
  );
};

export default RedeemCodeModal;
