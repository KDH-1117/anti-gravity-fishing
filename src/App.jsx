import React from 'react';
import { BoothProvider, useBooth } from './context/BoothContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import MainGame from './pages/MainGame';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

function AppContent() {
  const { currentPath, isLoading } = useBooth();

  // 현재 라우트에 따른 페이지 렌더링
  const renderPage = () => {
    // pathname 또는 hash 기반 라우팅 호환
    const cleanPath = currentPath.split('?')[0].split('#')[0];

    if (cleanPath === '/scores') {
      return <Leaderboard />;
    }
    if (cleanPath === '/admin') {
      return <Admin />;
    }
    // 기본 메인 화면 ('/' 또는 기타)
    return <MainGame />;
  };

  return (
    <div className="app-container">
      {/* 백그라운드 오라 & 조명 효과 */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* 글로벌 상단 헤더 & 네비게이션 */}
      <Navbar />

      {/* 전역 로그인 인증 모달 (미인증 시 전 페이지 접근 차단) */}
      <AuthModal />

      {/* 메인 콘텐츠 영역 */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(0, 242, 254, 0.2)',
                borderTopColor: 'var(--aqua-cyan)',
                animation: 'spin 1s linear infinite'
              }}
            />
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
              축제 낚시 부스 시스템 로딩 중...
            </p>
          </div>
        ) : (
          renderPage()
        )}
      </main>

      {/* 하단 푸터 */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '20px 16px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.45)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <p>
          © 2026 학교 축제 1학년 5반 부스 • <strong>안티그래비티(Anti-Gravity) 낚시터</strong>
        </p>
        <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>
          Vercel + Supabase 실시간 연동 시스템
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BoothProvider>
      <AppContent />
    </BoothProvider>
  );
}
