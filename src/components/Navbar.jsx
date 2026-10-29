import React from 'react';
import { useBooth } from '../context/BoothContext';
import {
  Fish,
  Trophy,
  Sliders,
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

  const cleanPath = (currentPath || '/').split('?')[0].split('#')[0];

  // 메인(/)과 리더보드(/scores)에서는 상단 메뉴 완전 비노출
  if (cleanPath === '/' || cleanPath === '/scores' || cleanPath === '') {
    return null;
  }

  return (
    <header className="glass-header">
      <div className="header-container" style={{ maxWidth: '800px' }}>
        {/* 왼쪽 위: 아이콘 */}
        <div
          className="logo-area"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
          title="메인 화면으로 이동"
        >
          <div className="logo-icon-wrapper" style={{ width: '40px', height: '40px' }}>
            <Fish className="w-5 h-5 text-cyan-300" />
          </div>
        </div>

        {/* 네비게이션: 관리자 화면에서 다른 화면으로 빠른 이동 */}
        <div className="nav-links">
          <button
            onClick={() => navigate('/')}
            className="nav-btn"
            title="낚시 화면으로 이동"
          >
            <Fish className="w-4 h-4" />
            <span>낚시</span>
          </button>

          <button
            onClick={() => navigate('/scores')}
            className="nav-btn"
            title="순위표로 이동"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>순위표</span>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="nav-btn active"
            title="관리자 설정"
          >
            <Sliders className="w-4 h-4 text-purple-300" />
            <span>관리자</span>
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
        </div>
      </div>
    </header>
  );
}
