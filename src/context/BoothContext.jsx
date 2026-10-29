import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings as apiUpdateSettings,
  getScores,
  addScore as apiAddScore,
  deleteScore as apiDeleteScore,
  resetAllScores as apiResetScores,
  subscribeBoothRealtime,
  supabase
} from '../lib/supabase';
import { sound } from '../lib/sound';

const BoothContext = createContext(null);

const AUTH_KEY = 'fish_booth_auth_session_v1';
const ADMIN_AUTH_KEY = 'fish_booth_admin_session_v1';

export function BoothProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'authenticated';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'authenticated';
  });

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(Boolean(supabase));
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
      return window.location.pathname || '/';
    }
    return '/';
  });

  // 라우트 네비게이션 함수
  const navigate = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPath(hash || window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // 초기 데이터 로드 및 실시간 구독
  useEffect(() => {
    let mounted = true;

    async function initData() {
      try {
        const [loadedSettings, loadedScores] = await Promise.all([
          getSettings(),
          getScores()
        ]);
        if (mounted) {
          setSettings(loadedSettings);
          setScores(loadedScores);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to init booth data:', err);
        if (mounted) setIsLoading(false);
      }
    }

    initData();

    // 실시간 리스너 연결
    const unsubscribe = subscribeBoothRealtime(
      (newSettings) => {
        if (mounted) setSettings(newSettings);
      },
      (newScores) => {
        if (mounted) setScores(newScores);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // 일반 공통 로그인
  const login = (passwordInput) => {
    const targetPassword = settings?.auth_password || '105fish';
    if (passwordInput === targetPassword) {
      localStorage.setItem(AUTH_KEY, 'authenticated');
      setIsAuthenticated(true);
      sound.playSuccess();
      return true;
    }
    sound.playDowngrade();
    return false;
  };

  // 일반 로그아웃
  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  // 관리자 전용 로그인 (기본: 12345678)
  const adminLogin = (passwordInput) => {
    const targetPassword = settings?.admin_password || '12345678';
    if (passwordInput === targetPassword) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
      setIsAdminAuthenticated(true);
      sound.playSuccess();
      return true;
    }
    sound.playDowngrade();
    return false;
  };

  // 관리자 로그아웃
  const adminLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdminAuthenticated(false);
  };

  // 소리 토글
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  };

  // 설정 업데이트
  const updateBoothSettings = async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    const saved = await apiUpdateSettings({ ...settings, ...newSettings });
    return saved;
  };

  // 수동/주기적 점수 갱신 함수 (폴링용)
  const refreshScores = async () => {
    try {
      const loadedScores = await getScores();
      setScores(loadedScores);
      return loadedScores;
    } catch (e) {
      console.warn('refreshScores error', e);
    }
  };

  // 참가자 점수 등록
  const recordScore = async (data) => {
    const newRecord = await apiAddScore(data);
    setScores(prev => {
      const next = [newRecord, ...prev];
      return next.sort((a, b) => b.score - a.score);
    });
    return newRecord;
  };

  // 단건 삭제
  const removeScore = async (id) => {
    setScores(prev => prev.filter(item => item.id !== id));
    await apiDeleteScore(id);
  };

  // 전체 초기화
  const resetScores = async () => {
    setScores([]);
    await apiResetScores();
  };

  return (
    <BoothContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        settings,
        updateBoothSettings,
        scores,
        refreshScores,
        recordScore,
        removeScore,
        resetScores,
        isLoading,
        isMuted,
        toggleMute,
        isSupabaseConnected,
        currentPath,
        navigate
      }}
    >
      {children}
    </BoothContext.Provider>
  );
}

export function useBooth() {
  const context = useContext(BoothContext);
  if (!context) {
    throw new Error('useBooth must be used within a BoothProvider');
  }
  return context;
}
