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

      {/* 하단 푸터 (깔끔하고 간결하게) */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '16px',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <span>1-5 낚시 부스</span>
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
