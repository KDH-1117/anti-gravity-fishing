import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const { isAuthenticated, login } = useBooth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (isAuthenticated) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(true);
      setErrorMessage('비밀번호를 입력하세요.');
      return;
    }

    const success = login(password.trim());
    if (!success) {
      setError(true);
      setErrorMessage('비밀번호가 일치하지 않습니다.');
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
          maxWidth: '380px',
          width: '100%',
          padding: '36px 28px',
          textAlign: 'center',
          background: 'rgba(10, 25, 47, 0.9)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.25)',
          border: '1px solid rgba(0, 242, 254, 0.4)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--neon-glow)'
          }}
        >
          <Lock className="w-7 h-7 text-cyan-300" />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff' }}>
          비밀번호 입력
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '22px' }}>
          부스 접속을 위해 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                style={{
                  paddingLeft: '42px',
                  borderColor: error ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.25)'
                }}
              />
              <KeyRound
                className="w-4 h-4 text-gray-400"
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
                  fontSize: '0.82rem',
                  marginTop: '8px',
                  textAlign: 'left'
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }}>
            <span>접속하기</span>
          </button>
        </form>
      </div>
    </div>
  );
}
