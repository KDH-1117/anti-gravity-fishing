import React from 'react';
import { useBooth } from '../context/BoothContext';
import {
  Fish,
  Trophy,
  Sliders,
  Volume2,
  VolumeX,
  LogOut,
  Wifi,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const {
    currentPath,
    navigate,
    isAuthenticated,
    logout,
    isMuted,
    toggleMute,
    isSupabaseConnected
  } = useBooth();

  return (
    <header className="glass-header">
      <div className="header-container">
        {/* 로고 영역 */}
        <div className="logo-area" onClick={() => navigate('/')}>
          <div className="logo-icon-wrapper">
            <Fish className="w-6 h-6 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="logo-text">1-5 반 축제 낚시터</div>
            <div className="logo-sub">Anti-Gravity Fishing Booth</div>
          </div>
        </div>

        {/* 네비게이션 & 도구 */}
        <div className="nav-links">
          {/* Supabase 실시간 연동 상태 표시 */}
          <div
            className={`badge ${isSupabaseConnected ? 'badge-cyan' : 'badge-gold'}`}
            title={
              isSupabaseConnected
                ? 'Supabase Realtime 실시간 다중 기기 연동 중'
                : '로컬 동기화 모드 (Supabase 미연결 시 브라우저 내 실시간 연동)'
            }
            style={{ cursor: 'pointer', padding: '6px 10px' }}
            onClick={() => navigate('/admin')}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span style={{ fontSize: '0.75rem' }}>
              {isSupabaseConnected ? '실시간 연동' : '로컬 모드'}
            </span>
          </div>

          {/* 소리 토글 */}
          <button
            onClick={toggleMute}
            className="nav-btn"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
            style={{ padding: '8px 12px' }}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* 메인 게임 */}
          <button
            onClick={() => navigate('/')}
            className={`nav-btn ${currentPath === '/' ? 'active' : ''}`}
          >
            <Fish className="w-4 h-4" />
            <span>낚시하기</span>
          </button>

          {/* 리더보드 */}
          <button
            onClick={() => navigate('/scores')}
            className={`nav-btn ${currentPath === '/scores' ? 'active' : ''}`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>순위표</span>
          </button>

          {/* 관리자 패널 */}
          <button
            onClick={() => navigate('/admin')}
            className={`nav-btn ${currentPath === '/admin' ? 'active' : ''}`}
          >
            <Sliders className="w-4 h-4 text-purple-300" />
            <span>관리자</span>
          </button>

          {/* 로그아웃 (인증된 경우 노출) */}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="nav-btn"
              title="잠금 / 로그아웃"
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              <LogOut className="w-4 h-4" />
              <span>잠금</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
