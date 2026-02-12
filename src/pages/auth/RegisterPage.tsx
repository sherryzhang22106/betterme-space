import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 密码强度检测
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, text: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 1, text: '弱', color: 'bg-rose-400' };
    if (score <= 3) return { level: 2, text: '中', color: 'bg-amber-400' };
    return { level: 3, text: '强', color: 'bg-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(password);

  // 验证账号格式
  const isValidAccount = (acc: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return phoneRegex.test(acc) || emailRegex.test(acc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证
    if (!account.trim()) {
      setError('请输入手机号或邮箱');
      return;
    }
    if (!isValidAccount(account.trim())) {
      setError('请输入正确的手机号或邮箱格式');
      return;
    }
    if (!password) {
      setError('请设置密码');
      return;
    }
    if (password.length < 8) {
      setError('密码长度至少8位');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError('密码需包含字母和数字');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (!agreed) {
      setError('请先同意服务条款和隐私政策');
      return;
    }

    setLoading(true);
    const res = await authApi.register(account.trim(), password);
    setLoading(false);

    if (res.success && res.data) {
      login(res.data.user, res.data.token);
      navigate('/');
    } else {
      setError(res.error || '注册失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Better<span className="text-brand-primary">Me</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">觅我空间</p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10">
          <h2 className="text-2xl font-black text-slate-900 mb-2">创建账号</h2>
          <p className="text-sm text-slate-400 mb-8">注册后可保存测评记录，随时回顾</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                账号
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="手机号或邮箱"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                设置密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8位以上，包含字母和数字"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Strength */}
              {password && (
                <div className="mt-3 flex items-center space-x-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex space-x-1">
                    <div className={`h-full rounded-full transition-all ${passwordStrength.level >= 1 ? passwordStrength.color : 'bg-slate-100'}`} style={{ width: '33%' }} />
                    <div className={`h-full rounded-full transition-all ${passwordStrength.level >= 2 ? passwordStrength.color : 'bg-slate-100'}`} style={{ width: '33%' }} />
                    <div className={`h-full rounded-full transition-all ${passwordStrength.level >= 3 ? passwordStrength.color : 'bg-slate-100'}`} style={{ width: '33%' }} />
                  </div>
                  <span className={`text-xs font-bold ${
                    passwordStrength.level === 1 ? 'text-rose-400' :
                    passwordStrength.level === 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                确认密码
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-rose-400 font-medium">两次密码不一致</p>
              )}
            </div>

            {/* Agreement */}
            <div className="flex items-start space-x-3">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  agreed ? 'bg-brand-primary border-brand-primary' : 'border-slate-200'
                }`}
              >
                {agreed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-slate-400 leading-relaxed">
                我已阅读并同意
                <Link to="/terms/service" className="text-brand-primary hover:underline mx-1">服务条款</Link>
                和
                <Link to="/terms/privacy" className="text-brand-primary hover:underline mx-1">隐私政策</Link>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                <p className="text-sm text-rose-500 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              已有账号？
              <Link to="/auth/login" className="text-brand-primary font-bold hover:underline ml-1">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
