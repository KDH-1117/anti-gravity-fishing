import React from 'react';
import { useBooth } from '../context/BoothContext';
import {
  Fish,
  Trophy,
  Volume2,
  VolumeX,
  LogOut
} from 'lucide-react';

export default function Navbar() {
  const {
    currentPath,
    navigate,
    isAuthenticated,
    logout,
    isMuted,
    toggleMute
  } = useBooth();

  return (
    <header className="glass-header">
      <div className="header-container" style={{ maxWidth: '800px' }}>
        {/* 로고 */}
        <div className="logo-area" onClick={() => navigate('/')}>
          <div className="logo-icon-wrapper" style={{ width: '38px', height: '38px' }}>
            <Fish className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="logo-text" style={{ fontSize: '1.15rem' }}>낚시 부스</div>
          </div>
        </div>

        {/* 네비게이션: 메인화면과 순위표만 노출 */}
        <div className="nav-links">
          <button
            onClick={() => navigate('/')}
            className={`nav-btn ${currentPath === '/' ? 'active' : ''}`}
          >
            <Fish className="w-4 h-4" />
            <span>낚시</span>
          </button>

          <button
            onClick={() => navigate('/scores')}
            className={`nav-btn ${currentPath === '/scores' ? 'active' : ''}`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>순위표</span>
          </button>

          {/* 음소거 토글 */}
          <button
            onClick={toggleMute}
            className="nav-btn"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
            style={{ padding: '8px 10px' }}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* 로그아웃 / 잠금 */}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="nav-btn"
              title="잠금"
              style={{ padding: '8px 10px', color: '#f87171' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
