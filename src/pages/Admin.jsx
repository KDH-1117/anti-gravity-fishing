import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { sound } from '../lib/sound';
import {
  Sliders,
  Clock,
  Dice5,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  PlusCircle,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function Admin() {
  const {
    settings,
    updateBoothSettings,
    scores,
    removeScore,
    resetScores,
    recordScore,
    isAdminAuthenticated,
    adminLogin,
    adminLogout
  } = useBooth();

  // 관리자 로그인 폼
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // 1. 제한 시간 및 비용
  const [timeLimit, setTimeLimit] = useState(settings?.time_limit || 60);
  const [costText, setCostText] = useState(settings?.cost_text || '1 ESTA');

  // 2. 명목상(디스플레이) 확률
  const [displaySuccess, setDisplaySuccess] = useState(settings?.display_success || 50);
  const [displayKeep, setDisplayKeep] = useState(settings?.display_keep || 30);
  const [displayDowngrade, setDisplayDowngrade] = useState(settings?.display_downgrade || 20);

  // 3. 실제(Hidden) 확률
  const [hiddenSuccess, setHiddenSuccess] = useState(settings?.hidden_success || 25);
  const [hiddenKeep, setHiddenKeep] = useState(settings?.hidden_keep || 35);
  const [hiddenDowngrade, setHiddenDowngrade] = useState(settings?.hidden_downgrade || 40);

  // 4. 비밀번호 관리
  const [authPassword, setAuthPassword] = useState(settings?.auth_password || '105fish');
  const [adminPassword, setAdminPassword] = useState(settings?.admin_password || '12345678');

  // 알림 및 모달
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [probSaveSuccess, setProbSaveSuccess] = useState(false);
  const [probError, setProbError] = useState('');
  const [resetConfirmModal, setResetConfirmModal] = useState(false);

  // 확률 총합 계산
  const displayTotal = displaySuccess + displayKeep + displayDowngrade;
  const hiddenTotal = hiddenSuccess + hiddenKeep + hiddenDowngrade;
  const isProbValid = displayTotal === 100 && hiddenTotal === 100;

  useEffect(() => {
    if (settings) {
      setTimeLimit(settings.time_limit || 60);
      setCostText(settings.cost_text || '1 ESTA');
      setDisplaySuccess(settings.display_success || 50);
      setDisplayKeep(settings.display_keep || 30);
      setDisplayDowngrade(settings.display_downgrade || 20);
      setHiddenSuccess(settings.hidden_success || 25);
      setHiddenKeep(settings.hidden_keep || 35);
      setHiddenDowngrade(settings.hidden_downgrade || 40);
      setAuthPassword(settings.auth_password || '105fish');
      setAdminPassword(settings.admin_password || '12345678');
    }
  }, [settings]);

  // 관리자 로그인
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) {
      setAdminLoginError('관리자 비밀번호를 입력하세요.');
      return;
    }

    const success = adminLogin(adminPasswordInput.trim());
    if (!success) {
      setAdminLoginError('관리자 비밀번호가 일치하지 않습니다.');
    } else {
      setAdminLoginError('');
    }
  };

  // 확률 전용 저장 핸들러 (100% 검증 필수)
  const handleSaveProbabilities = async () => {
    if (!isProbValid) {
      sound.playDowngrade();
      setProbError(`확률 합계가 100%가 아닙니다. (표시: ${displayTotal}%, 실제: ${hiddenTotal}%)`);
      return;
    }

    sound.playClick();
    setProbError('');

    await updateBoothSettings({
      display_success: displaySuccess,
      display_keep: displayKeep,
      display_downgrade: displayDowngrade,
      hidden_success: hiddenSuccess,
      hidden_keep: hiddenKeep,
      hidden_downgrade: hiddenDowngrade
    });

    sound.playSuccess();
    setProbSaveSuccess(true);
    setTimeout(() => setProbSaveSuccess(false), 3000);
  };

  // 전체 설정 저장
  const handleSaveSettings = async (e) => {
    e?.preventDefault();

    if (!isProbValid) {
      sound.playDowngrade();
      alert(`확률의 합계가 100%가 되어야 저장할 수 있습니다.\n현재 - 표시 확률: ${displayTotal}%, 실제 확률: ${hiddenTotal}%`);
      return;
    }

    sound.playClick();

    const newConfig = {
      time_limit: Number(timeLimit) || 60,
      cost_text: costText.trim() || '1 ESTA',
      display_success: Number(displaySuccess) || 0,
      display_keep: Number(displayKeep) || 0,
      display_downgrade: Number(displayDowngrade) || 0,
      hidden_success: Number(hiddenSuccess) || 0,
      hidden_keep: Number(hiddenKeep) || 0,
      hidden_downgrade: Number(hiddenDowngrade) || 0,
      auth_password: authPassword.trim() || '105fish',
      admin_password: adminPassword.trim() || '12345678'
    };

    await updateBoothSettings(newConfig);
    sound.playSuccess();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // CSV 내보내기
  const exportToCSV = () => {
    sound.playClick();
    if (scores.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const headers = ['순위', '닉네임', '학번', '이름', '낚싯대단계', '최종점수', '등록일시'];
    const rows = scores.map((item, idx) => [
      idx + 1,
      `"${item.nickname || ''}"`,
      `"${item.student_id || ''}"`,
      `"${item.student_name || ''}"`,
      `"${item.rod_level || 1}단계"`,
      item.score || 0,
      `"${new Date(item.created_at).toLocaleString()}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `1-5반_순위표_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 샘플 데이터 추가
  const handleAddSampleData = async () => {
    sound.playClick();
    const samples = [
      { nickname: '월척사냥꾼', student_id: '10501', student_name: '강민우', rod_level: 5, score: 98 },
      { nickname: '샤크마스터', student_id: '10515', student_name: '이지은', rod_level: 4, score: 85 },
      { nickname: '축제요정', student_id: '10522', student_name: '박준호', rod_level: 3, score: 62 },
      { nickname: '낚시꿈나무', student_id: '10508', student_name: '김서연', rod_level: 2, score: 40 },
      { nickname: '바다사나이', student_id: '10519', student_name: '정우진', rod_level: 3, score: 35 },
      { nickname: '초보낚시꾼', student_id: '10511', student_name: '윤도현', rod_level: 1, score: 20 }
    ];

    for (const item of samples) {
      await recordScore(item);
    }
    sound.playSuccess();
    alert('샘플 참가자가 순위표에 추가되었습니다.');
  };

  // ---------------- 관리자 미인증 시 로그인 게이트 ----------------
  if (!isAdminAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '0 16px' }}>
        <div
          className="glass-panel"
          style={{
            padding: '36px 28px',
            textAlign: 'center',
            background: 'rgba(10, 25, 47, 0.95)',
            border: '1px solid rgba(155, 81, 224, 0.5)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(155, 81, 224, 0.2)',
              border: '1px solid rgba(155, 81, 224, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <Lock className="w-7 h-7 text-purple-300" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            관리자 로그인
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '22px' }}>
            관리자 전용 비밀번호를 입력해주세요.
          </p>

          <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                placeholder="관리자 비밀번호"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  if (adminLoginError) setAdminLoginError('');
                }}
                autoFocus
                style={{
                  paddingLeft: '42px',
                  borderColor: adminLoginError ? '#f87171' : undefined
                }}
              />
              <KeyRound className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {adminLoginError && (
              <div style={{ color: '#f87171', fontSize: '0.82rem', textAlign: 'left' }}>
                {adminLoginError}
              </div>
            )}

            <button type="submit" className="btn btn-purple" style={{ width: '100%', padding: '13px' }}>
              <span>관리자 접속</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- 관리자 인증 완료 화면 ----------------
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
            관리자 페이지
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSaveSettings} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
            <Save className="w-4 h-4" />
            <span>전체 설정 저장</span>
          </button>
          <button onClick={adminLogout} className="btn btn-glass" style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
            로그아웃
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div
          className="glass-panel"
          style={{
            padding: '12px 18px',
            marginBottom: '18px',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            color: '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>모든 기기에 설정이 즉시 반영되었습니다.</span>
        </div>
      )}

      {/* ---------------- 1: 확률 조작 시스템 + 밑에 전용 저장 버튼 (100% 검증) ---------------- */}
      <div className="glass-panel" style={{ padding: '24px 20px', marginBottom: '20px', border: '1px solid rgba(155, 81, 224, 0.4)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Dice5 className="w-5 h-5 text-purple-400" />
          <span>낚싯대 강화 확률 조작 시스템</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* 화면 표시용 */}
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--aqua-cyan)', fontWeight: 800, marginBottom: '12px', fontSize: '0.9rem' }}>
              <Eye className="w-4 h-4" />
              <span>화면 표시용 확률</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span>성공</span>
                  <strong>{displaySuccess}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={displaySuccess}
                  onChange={(e) => setDisplaySuccess(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span>유지</span>
                  <strong>{displayKeep}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={displayKeep}
                  onChange={(e) => setDisplayKeep(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span>하락 (2단계부터 적용)</span>
                  <strong>{displayDowngrade}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={displayDowngrade}
                  onChange={(e) => setDisplayDowngrade(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: displayTotal === 100 ? '#6ee7b7' : '#f87171' }}>
                합계: {displayTotal}% {displayTotal === 100 ? '(정상)' : '(100% 필요)'}
              </div>
            </div>
          </div>

          {/* 실제 Hidden */}
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(88, 28, 135, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d8b4fe', fontWeight: 800, marginBottom: '12px', fontSize: '0.9rem' }}>
              <EyeOff className="w-4 h-4 text-purple-300" />
              <span>실제 (Hidden) 확률</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span>실제 성공</span>
                  <strong>{hiddenSuccess}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hiddenSuccess}
                  onChange={(e) => setHiddenSuccess(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span>실제 유지</span>
                  <strong>{hiddenKeep}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hiddenKeep}
                  onChange={(e) => setHiddenKeep(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span>실제 하락 (2단계부터 적용)</span>
                  <strong>{hiddenDowngrade}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hiddenDowngrade}
                  onChange={(e) => setHiddenDowngrade(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: hiddenTotal === 100 ? '#6ee7b7' : '#f87171' }}>
                합계: {hiddenTotal}% {hiddenTotal === 100 ? '(정상)' : '(100% 필요)'}
              </div>
            </div>
          </div>
        </div>

        {/* [요청사항]: 확률 조작 밑에 저장 버튼 + 100% 미충족 시 작동 차단 */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {!isProbValid && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                표시 확률({displayTotal}%)과 실제 확률({hiddenTotal}%)의 총합이 각각 100%여야 저장할 수 있습니다.
              </span>
            </div>
          )}

          {probSaveSuccess && (
            <div style={{ color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 className="w-4 h-4" />
              <span>확률 설정이 정상 저장되었습니다!</span>
            </div>
          )}

          <button
            onClick={handleSaveProbabilities}
            disabled={!isProbValid}
            className="btn btn-purple"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              opacity: isProbValid ? 1 : 0.45,
              cursor: isProbValid ? 'pointer' : 'not-allowed'
            }}
          >
            <Save className="w-4 h-4" />
            <span>확률 설정 저장</span>
          </button>
        </div>
      </div>

      {/* ---------------- 2: 순위표 초기화 & 참가자 명부 관리 ---------------- */}
      <div className="glass-panel" style={{ padding: '24px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
              순위표 및 참가자 명부 (총 {scores.length}건)
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={exportToCSV} className="btn btn-glass" style={{ padding: '8px 12px', fontSize: '0.8rem', borderColor: '#10b981' }}>
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV 다운로드</span>
            </button>
            <button onClick={handleAddSampleData} className="btn btn-glass" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              <PlusCircle className="w-4 h-4 text-cyan-300" />
              <span>샘플 추가</span>
            </button>
            <button
              onClick={() => setResetConfirmModal(true)}
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>순위표 전체 초기화</span>
            </button>
          </div>
        </div>

        {/* 테이블 */}
        {scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
            등록된 참가자가 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <th style={{ padding: '8px 10px' }}>순위</th>
                  <th style={{ padding: '8px 10px' }}>닉네임</th>
                  <th style={{ padding: '8px 10px' }}>학번</th>
                  <th style={{ padding: '8px 10px' }}>이름</th>
                  <th style={{ padding: '8px 10px' }}>단계</th>
                  <th style={{ padding: '8px 10px' }}>점수</th>
                  <th style={{ padding: '8px 10px' }}>시간</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '10px', fontWeight: 800 }}>{idx + 1}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--aqua-cyan)' }}>{row.nickname}</td>
                    <td style={{ padding: '10px' }}>{row.student_id}</td>
                    <td style={{ padding: '10px' }}>{row.student_name}</td>
                    <td style={{ padding: '10px' }}>{row.rod_level}단계</td>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#fef08a' }}>{row.score}점</td>
                    <td style={{ padding: '10px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.78rem' }}>
                      {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          if (confirm(`'${row.nickname}' 기록을 삭제할까요?`)) {
                            removeScore(row.id);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- 3: 비밀번호 변경 ---------------- */}
      <div className="glass-panel" style={{ padding: '24px 20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>비밀번호 변경</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              부스 접속 비밀번호
            </label>
            <input
              type="text"
              className="glass-input"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="105fish"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              관리자 페이지 비밀번호
            </label>
            <input
              type="text"
              className="glass-input"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="12345678"
            />
          </div>
        </div>

        <button onClick={handleSaveSettings} className="btn btn-glass" style={{ marginTop: '14px', fontSize: '0.85rem' }}>
          비밀번호 저장
        </button>
      </div>

      {/* ---------------- 4: 타이머 및 비용 설정 ---------------- */}
      <div className="glass-panel" style={{ padding: '24px 20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>제한 시간 및 비용 설정</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              제한 시간 (초)
            </label>
            <input
              type="number"
              className="glass-input"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              강화 비용 텍스트
            </label>
            <input
              type="text"
              className="glass-input"
              value={costText}
              onChange={(e) => setCostText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 리더보드 초기화 모달 */}
      {resetConfirmModal && (
        <div className="modal-overlay">
          <div
            className="glass-panel"
            style={{
              maxWidth: '380px',
              width: '100%',
              padding: '28px',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.5)'
            }}
          >
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              순위표를 초기화할까요?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '20px' }}>
              모든 참가자 점수 기록이 영구 삭제됩니다.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setResetConfirmModal(false)}
                className="btn btn-glass"
                style={{ flex: 1, padding: '10px' }}
              >
                취소
              </button>
              <button
                onClick={async () => {
                  await resetScores();
                  setResetConfirmModal(false);
                  sound.playDowngrade();
                }}
                className="btn btn-danger"
                style={{ flex: 1, padding: '10px' }}
              >
                초기화 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
