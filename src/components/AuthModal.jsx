import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';
import { Lock, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthModal() {
  const { isAuthenticated, login, settings } = useBooth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (isAuthenticated) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(true);
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    const success = login(password.trim());
    if (!success) {
      setError(true);
      setErrorMessage('비밀번호가 올바르지 않습니다. 다시 시도해주세요.');
    } else {
      setError(false);
      setErrorMessage('');
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="glass-panel"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '36px 30px',
          textAlign: 'center',
          background: 'rgba(10, 25, 47, 0.85)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 242, 254, 0.25)',
          border: '1px solid rgba(0, 242, 254, 0.4)'
        }}
      >
        {/* 아이콘 */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(155, 81, 224, 0.25))',
            border: '1px solid rgba(0, 242, 254, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: 'var(--neon-glow)'
          }}
        >
          <Lock className="w-8 h-8 text-cyan-300" />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
          축제 부스 전용 로그인
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
          원활한 부스 운영 및 리더보드 동기화를 위해<br />
          공통 접속 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                style={{
                  paddingLeft: '44px',
                  borderColor: error ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.25)'
                }}
              />
              <KeyRound
                className="w-5 h-5 text-gray-400"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  marginTop: '8px',
                  textAlign: 'left'
                }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            <Sparkles className="w-4 h-4" />
            <span>부스 접속하기</span>
          </button>
        </form>

        {/* 기본 비밀번호 안내 힌트 */}
        <div
          style={{
            marginTop: '22px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          💡 초기 기본 비밀번호: <strong style={{ color: 'var(--aqua-cyan)' }}>{settings?.auth_password || '105fish'}</strong>
          <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'rgba(255, 255, 255, 0.4)' }}>
            (한 번 로그인하면 기기 세션이 유지되며, 관리자 페이지에서 변경 가능합니다)
          </div>
        </div>
      </div>
    </div>
  );
}
