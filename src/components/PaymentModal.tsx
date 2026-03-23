import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: {
    id: string;
    name: string;
    price: number;
  };
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, theme, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'redemption'>('wechat');
  const [redemptionCode, setRedemptionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // 微信支付
  const handleWechatPay = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          paymentMethod: 'wechat'
        })
      });

      const data = await res.json();

      if (data.success) {
        // 调用微信支付 JSAPI
        if (typeof WeixinJSBridge !== 'undefined') {
          WeixinJSBridge.invoke(
            'getBrandWCPayRequest',
            data.wechatPayParams,
            (res: any) => {
              if (res.err_msg === 'get_brand_wcpay_request:ok') {
                // 支付成功
                onSuccess();
                onClose();
              } else {
                setError('支付失败，请重试');
              }
            }
          );
        } else {
          setError('请在微信中打开');
        }
      } else {
        setError(data.message || '创建订单失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    }

    setLoading(false);
  };

  // 兑换码支付
  const handleRedemptionPay = async () => {
    if (!redemptionCode.trim()) {
      setError('请输入兑换码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          paymentMethod: 'redemption',
          redemptionCode: redemptionCode.trim()
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{theme.name}</h2>
        <p className="text-3xl font-black text-brand-primary mb-6">
          ¥{theme.price.toFixed(2)}
        </p>

        {/* 支付方式选择 */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setPaymentMethod('wechat')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              paymentMethod === 'wechat'
                ? 'bg-brand-primary text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            微信支付
          </button>
          <button
            onClick={() => setPaymentMethod('redemption')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              paymentMethod === 'redemption'
                ? 'bg-brand-primary text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            兑换码
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
            {error}
          </div>
        )}

        {/* 微信支付 */}
        {paymentMethod === 'wechat' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                💡 点击下方按钮将跳转到微信支付页面
              </p>
            </div>
            <button
              onClick={handleWechatPay}
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>处理中...</span>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 2A5.5 5.5 0 003 7.5v9A5.5 5.5 0 008.5 22h7a5.5 5.5 0 005.5-5.5v-9A5.5 5.5 0 0015.5 2h-7zm0 2h7A3.5 3.5 0 0119 7.5v9a3.5 3.5 0 01-3.5 3.5h-7A3.5 3.5 0 015 16.5v-9A3.5 3.5 0 018.5 4z"/>
                  </svg>
                  <span>微信支付 ¥{theme.price.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 兑换码支付 */}
        {paymentMethod === 'redemption' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 输入兑换码即可免费获得测评权限
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                兑换码
              </label>
              <input
                type="text"
                placeholder="请输入兑换码，例如：ABCD-EFGH-IJKL"
                value={redemptionCode}
                onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
              />
            </div>
            <button
              onClick={handleRedemptionPay}
              disabled={loading}
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {loading ? '验证中...' : '立即兑换'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
