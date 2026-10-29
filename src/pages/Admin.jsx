import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { sound } from '../lib/sound';
import { DEFAULT_STAGE_PROBABILITIES } from '../lib/supabase';
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
  RotateCcw,
  ChevronDown,
  ChevronUp
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
    adminLogout,
    navigate
  } = useBooth();

  // 관리자 로그인 폼
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // 1. 제한 시간 및 비용
  const [timeLimit, setTimeLimit] = useState(settings?.time_limit || 60);
  const [costText, setCostText] = useState(settings?.cost_text || '1 ESTA');

  // 2. 단계별 확률 상태 (접힘/펼침 제어)
  const [isProbExpanded, setIsProbExpanded] = useState(false); // [요청사항]: 접혀있다가 펼칠 수 있게 (기본 접힘)
  const [activeStage, setActiveStage] = useState(1); // 1, 2, 3, 4
  const [stageProbs, setStageProbs] = useState(DEFAULT_STAGE_PROBABILITIES);

  // 3. 비밀번호 관리
  const [authPassword, setAuthPassword] = useState(settings?.auth_password || '105fish');
  const [adminPassword, setAdminPassword] = useState(settings?.admin_password || '12345678');

  // 알림 및 모달
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [probSaveSuccess, setProbSaveSuccess] = useState(false);
  const [probError, setProbError] = useState('');
  const [resetConfirmModal, setResetConfirmModal] = useState(false);

  useEffect(() => {
    if (settings) {
      setTimeLimit(settings.time_limit || 60);
      setCostText(settings.cost_text || '1 ESTA');
      setAuthPassword(settings.auth_password || '105fish');
      setAdminPassword(settings.admin_password || '12345678');

      if (settings.stage_probabilities) {
        setStageProbs({
          1: { ...DEFAULT_STAGE_PROBABILITIES[1], ...(settings.stage_probabilities[1] || settings.stage_probabilities['1']) },
          2: { ...DEFAULT_STAGE_PROBABILITIES[2], ...(settings.stage_probabilities[2] || settings.stage_probabilities['2']) },
          3: { ...DEFAULT_STAGE_PROBABILITIES[3], ...(settings.stage_probabilities[3] || settings.stage_probabilities['3']) },
          4: { ...DEFAULT_STAGE_PROBABILITIES[4], ...(settings.stage_probabilities[4] || settings.stage_probabilities['4']) }
        });
      }
    }
  }, [settings]);

  // 확률 총합 계산 및 유효성 검증
  const getStageTotal = (stage, type) => {
    const s = stageProbs[stage] || DEFAULT_STAGE_PROBABILITIES[stage];
    const data = s[type] || { success: 0, keep: 0, downgrade: 0 };
    return (Number(data.success) || 0) + (Number(data.keep) || 0) + (Number(data.downgrade) || 0);
  };

  const isStageValid = (stage) => {
    return getStageTotal(stage, 'display') === 100 && getStageTotal(stage, 'hidden') === 100;
  };

  const invalidStageInfo = [1, 2, 3, 4]
    .map((s) => {
      const disp = getStageTotal(s, 'display');
      const hid = getStageTotal(s, 'hidden');
      if (disp !== 100 || hid !== 100) {
        return `${s}단계(표시: ${disp}%, 실제: ${hid}%)`;
      }
      return null;
    })
    .filter(Boolean);

  const isAllStagesValid = invalidStageInfo.length === 0;

  // 특정 단계의 확률 변경
  const updateStageProb = (stage, type, field, val) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    setStageProbs((prev) => {
      const current = prev[stage] || DEFAULT_STAGE_PROBABILITIES[stage];
      return {
        ...prev,
        [stage]: {
          ...current,
          [type]: {
            ...current[type],
            [field]: stage === 1 && field === 'downgrade' ? 0 : num
          }
        }
      };
    });
  };

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

  // 단계별 확률 전용 저장 핸들러 (전체 단계 100% 검증)
  const handleSaveProbabilities = async () => {
    if (!isAllStagesValid) {
      sound.playDowngrade();
      setProbError(`확률 합계가 100%가 아닌 단계가 있습니다: ${invalidStageInfo.join(', ')}`);
      return;
    }

    sound.playClick();
    setProbError('');

    const s2 = stageProbs[2] || DEFAULT_STAGE_PROBABILITIES[2];
    await updateBoothSettings({
      stage_probabilities: stageProbs,
      // 이전 버전 호환 필드
      display_success: s2.display.success,
      display_keep: s2.display.keep,
      display_downgrade: s2.display.downgrade,
      hidden_success: s2.hidden.success,
      hidden_keep: s2.hidden.keep,
      hidden_downgrade: s2.hidden.downgrade
    });

    sound.playSuccess();
    setProbSaveSuccess(true);
    setTimeout(() => setProbSaveSuccess(false), 3000);
  };

  // 전체 설정 저장
  const handleSaveSettings = async (e) => {
    e?.preventDefault();

    if (!isAllStagesValid) {
      sound.playDowngrade();
      alert(`모든 단계의 확률 합계가 100%가 되어야 저장할 수 있습니다.\n오류 단계: ${invalidStageInfo.join(', ')}`);
      return;
    }

    sound.playClick();

    const s2 = stageProbs[2] || DEFAULT_STAGE_PROBABILITIES[2];
    const newConfig = {
      time_limit: Number(timeLimit) || 60,
      cost_text: costText.trim() || '1 ESTA',
      stage_probabilities: stageProbs,
      display_success: s2.display.success,
      display_keep: s2.display.keep,
      display_downgrade: s2.display.downgrade,
      hidden_success: s2.hidden.success,
      hidden_keep: s2.hidden.keep,
      hidden_downgrade: s2.hidden.downgrade,
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
            border: '1px solid rgba(155, 81, 224, 0.4)'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'rgba(155, 81, 224, 0.2)',
              border: '1px solid rgba(155, 81, 224, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <Lock className="w-6 h-6 text-purple-300" />
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
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-glass"
              style={{ width: '100%', padding: '11px', marginTop: '4px', fontSize: '0.88rem' }}
            >
              <span>메인 화면으로 돌아가기</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 활성 단계의 데이터
  const curStageData = stageProbs[activeStage] || DEFAULT_STAGE_PROBABILITIES[activeStage];
  const activeDispTotal = getStageTotal(activeStage, 'display');
  const activeHidTotal = getStageTotal(activeStage, 'hidden');

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
          <button
            onClick={() => {
              sound.playClick();
              adminLogout();
              navigate('/');
            }}
            className="btn btn-glass"
            style={{ padding: '10px 14px', fontSize: '0.85rem' }}
            title="관리자 세션 종료 후 메인 화면으로 이동"
          >
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

      {/* ---------------- 1: 단계별 확률 조작 시스템 (접힘/펼침 지원) ---------------- */}
      <div
        className="glass-panel"
        style={{
          marginBottom: '20px',
          border: '1px solid rgba(155, 81, 224, 0.45)',
          overflow: 'hidden'
        }}
      >
        {/* 접기/펼치기 클릭 가능한 헤더 */}
        <div
          onClick={() => {
            sound.playClick();
            setIsProbExpanded(!isProbExpanded);
          }}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isProbExpanded ? 'rgba(155, 81, 224, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            transition: 'background 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(155, 81, 224, 0.2)',
                border: '1px solid rgba(155, 81, 224, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Dice5 className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  단계별 강화 확률 조작 시스템
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    background: isAllStagesValid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: isAllStagesValid ? '#6ee7b7' : '#fca5a5',
                    border: `1px solid ${isAllStagesValid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                  }}
                >
                  {isAllStagesValid ? '전체 정상 (100%)' : '합계 100% 오류'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0' }}>
                각 강화 단계(1➜2, 2➜3, 3➜4, 4➜5)별로 노출 확률과 실제 확률을 개별 설정합니다.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
              {isProbExpanded ? '접기' : '펼치기'}
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isProbExpanded ? <ChevronUp className="w-4 h-4 text-purple-300" /> : <ChevronDown className="w-4 h-4 text-purple-300" />}
            </div>
          </div>
        </div>

        {/* 펼쳐졌을 때: 단계별 탭 및 슬라이더 편집기 */}
        {isProbExpanded && (
          <div style={{ padding: '20px 20px 24px', borderTop: '1px solid rgba(155, 81, 224, 0.25)' }}>
            {/* 4개 단계 탭 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4].map((stageNum) => {
                const isValid = isStageValid(stageNum);
                const isActive = activeStage === stageNum;
                const stageName = `${stageNum}단계 ➜ ${stageNum + 1}단계`;

                return (
                  <button
                    key={stageNum}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveStage(stageNum);
                    }}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-glass'}`}
                    style={{
                      flex: '1 1 150px',
                      padding: '12px 14px',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: isActive ? 'var(--aqua-cyan)' : isValid ? 'rgba(255, 255, 255, 0.15)' : 'rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{stageName}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: isValid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                        color: isValid ? '#6ee7b7' : '#fca5a5'
                      }}
                    >
                      {isValid ? '100%' : '오류'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 현재 선택된 단계의 확률 조작 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 화면 표시용 */}
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--aqua-cyan)', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Eye className="w-4 h-4" />
                    <span>화면 표시용 ({activeStage}단계 ➜ {activeStage + 1}단계)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span>성공</span>
                      <strong style={{ color: '#6ee7b7' }}>{curStageData.display.success}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={curStageData.display.success}
                      onChange={(e) => updateStageProb(activeStage, 'display', 'success', e.target.value)}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span>유지</span>
                      <strong style={{ color: '#fde68a' }}>{curStageData.display.keep}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={curStageData.display.keep}
                      onChange={(e) => updateStageProb(activeStage, 'display', 'keep', e.target.value)}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span>
                        하락 {activeStage === 1 && <span style={{ color: '#38bdf8', fontSize: '0.72rem' }}>(1단계 하락 불가 0% 고정)</span>}
                      </span>
                      <strong style={{ color: activeStage === 1 ? '#94a3b8' : '#fca5a5' }}>
                        {activeStage === 1 ? 0 : curStageData.display.downgrade}%
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeStage === 1 ? 0 : curStageData.display.downgrade}
                      disabled={activeStage === 1}
                      onChange={(e) => updateStageProb(activeStage, 'display', 'downgrade', e.target.value)}
                      style={{ width: '100%', accentColor: '#ef4444', opacity: activeStage === 1 ? 0.4 : 1 }}
                    />
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: activeDispTotal === 100 ? '#6ee7b7' : '#f87171' }}>
                    표시 합계: {activeDispTotal}% {activeDispTotal === 100 ? '(정상)' : '(100% 필요)'}
                  </div>
                </div>
              </div>

              {/* 실제 (Hidden) */}
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(88, 28, 135, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d8b4fe', fontWeight: 800, fontSize: '0.9rem' }}>
                    <EyeOff className="w-4 h-4 text-purple-300" />
                    <span>실제 백그라운드 ({activeStage}단계 ➜ {activeStage + 1}단계)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span>실제 성공</span>
                      <strong style={{ color: '#6ee7b7' }}>{curStageData.hidden.success}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={curStageData.hidden.success}
                      onChange={(e) => updateStageProb(activeStage, 'hidden', 'success', e.target.value)}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span>실제 유지</span>
                      <strong style={{ color: '#fde68a' }}>{curStageData.hidden.keep}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={curStageData.hidden.keep}
                      onChange={(e) => updateStageProb(activeStage, 'hidden', 'keep', e.target.value)}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span>
                        실제 하락 {activeStage === 1 && <span style={{ color: '#38bdf8', fontSize: '0.72rem' }}>(1단계 하락 불가 0% 고정)</span>}
                      </span>
                      <strong style={{ color: activeStage === 1 ? '#94a3b8' : '#fca5a5' }}>
                        {activeStage === 1 ? 0 : curStageData.hidden.downgrade}%
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeStage === 1 ? 0 : curStageData.hidden.downgrade}
                      disabled={activeStage === 1}
                      onChange={(e) => updateStageProb(activeStage, 'hidden', 'downgrade', e.target.value)}
                      style={{ width: '100%', accentColor: '#ef4444', opacity: activeStage === 1 ? 0.4 : 1 }}
                    />
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: activeHidTotal === 100 ? '#6ee7b7' : '#f87171' }}>
                    실제 합계: {activeHidTotal}% {activeHidTotal === 100 ? '(정상)' : '(100% 필요)'}
                  </div>
                </div>
              </div>
            </div>

            {/* 전체 4개 단계 요약표 */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '8px' }}>
                전체 단계 요약 (클릭하여 해당 단계 바로 수정)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                {[1, 2, 3, 4].map((s) => {
                  const sp = stageProbs[s] || DEFAULT_STAGE_PROBABILITIES[s];
                  const isValid = isStageValid(s);
                  const isSel = activeStage === s;
                  return (
                    <div
                      key={s}
                      onClick={() => {
                        sound.playClick();
                        setActiveStage(s);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: isSel ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1.5px solid ${isSel ? 'var(--aqua-cyan)' : isValid ? 'rgba(255, 255, 255, 0.1)' : '#f87171'}`,
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#ffffff', marginBottom: '3px' }}>
                        {s}단계 ➜ {s + 1}단계 {isValid ? '✓' : '⚠️'}
                      </div>
                      <div style={{ color: '#6ee7b7' }}>표시: {sp.display.success}/{sp.display.keep}/{sp.display.downgrade}%</div>
                      <div style={{ color: '#d8b4fe' }}>실제: {sp.hidden.success}/{sp.hidden.keep}/{sp.hidden.downgrade}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 확률 설정 저장 버튼 + 100% 검증 */}
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {!isAllStagesValid && (
                <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    합계 오류: {invalidStageInfo.join(', ')}의 총합이 100%가 되어야 저장할 수 있습니다.
                  </span>
                </div>
              )}

              {probSaveSuccess && (
                <div style={{ color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>모든 단계의 확률 설정이 정상 저장되었습니다!</span>
                </div>
              )}

              <button
                onClick={handleSaveProbabilities}
                disabled={!isAllStagesValid}
                className="btn btn-purple"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  opacity: isAllStagesValid ? 1 : 0.45,
                  cursor: isAllStagesValid ? 'pointer' : 'not-allowed'
                }}
              >
                <Save className="w-4 h-4" />
                <span>단계별 확률 설정 저장</span>
              </button>
            </div>
          </div>
        )}
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
