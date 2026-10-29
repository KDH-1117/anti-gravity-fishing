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
  ShieldCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';

export default function Admin() {
  const {
    settings,
    updateBoothSettings,
    scores,
    removeScore,
    resetScores,
    recordScore
  } = useBooth();

  // 1. 제한 시간 및 비용 로컬 폼 상태
  const [timeLimit, setTimeLimit] = useState(settings?.time_limit || 60);
  const [costText, setCostText] = useState(settings?.cost_text || '1 ESTA');

  // 2. 명목상(디스플레이용) 확률 상태
  const [displaySuccess, setDisplaySuccess] = useState(settings?.display_success || 50);
  const [displayKeep, setDisplayKeep] = useState(settings?.display_keep || 30);
  const [displayDowngrade, setDisplayDowngrade] = useState(settings?.display_downgrade || 20);

  // 3. 실제(Hidden) 확률 상태 (핵심 로직)
  const [hiddenSuccess, setHiddenSuccess] = useState(settings?.hidden_success || 25);
  const [hiddenKeep, setHiddenKeep] = useState(settings?.hidden_keep || 35);
  const [hiddenDowngrade, setHiddenDowngrade] = useState(settings?.hidden_downgrade || 40);

  // 마스터 비밀번호 상태
  const [authPassword, setAuthPassword] = useState(settings?.auth_password || '105fish');

  // 저장 성공 알림 메시지
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmModal, setResetConfirmModal] = useState(false);

  // settings 변경 시 로컬 폼 동기화
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
    }
  }, [settings]);

  // 설정 저장 핸들러
  const handleSaveSettings = async (e) => {
    e?.preventDefault();
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
      auth_password: authPassword.trim() || '105fish'
    };

    await updateBoothSettings(newConfig);
    sound.playSuccess();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // CSV 다운로드 (UTF-8 with BOM for Excel)
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
    link.setAttribute('download', `1-5반_축제낚시대회_결과_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 테스트 샘플 목데이터 생성
  const handleAddSampleData = async () => {
    sound.playClick();
    const samples = [
      { nickname: '월척사냥꾼', student_id: '10501', student_name: '강민우', rod_level: 5, score: 98 },
      { nickname: '샤크마스터', student_id: '10515', student_name: '이지은', rod_level: 4, score: 85 },
      { nickname: '축제요정', student_id: '10522', student_name: '박준호', rod_level: 3, score: 62 },
      { nickname: '낚시꿈나무', student_id: '10508', student_name: '김서연', rod_level: 2, score: 40 }
    ];

    for (const item of samples) {
      await recordScore(item);
    }
    sound.playSuccess();
    alert('샘플 참가자 4명이 순위표에 추가되었습니다!');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
      {/* 관리자 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div className="badge badge-purple" style={{ marginBottom: '8px' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>부스 총괄 운영진 전용 컨트롤 패널</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
            부스 시스템 관리자
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSaveSettings} className="btn btn-primary" style={{ padding: '12px 22px' }}>
            <Save className="w-4 h-4" />
            <span>설정 실시간 저장</span>
          </button>
        </div>
      </div>

      {/* 저장 완료 토스트 */}
      {saveSuccess && (
        <div
          className="glass-panel"
          style={{
            padding: '14px 20px',
            marginBottom: '20px',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            color: '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700
          }}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>모든 기기에 설정이 실시간으로 즉시 반영되었습니다!</span>
        </div>
      )}

      {/* ---------------- 1 & 2: 기본 시간 & 비용 설정 ---------------- */}
      <div className="glass-panel" style={{ padding: '28px 24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock className="w-5 h-5 text-cyan-400" />
          <span>1. 낚시 타이머 및 강화 비용 단위 설정</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
              낚시 제한 시간 (초 단위)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              {[30, 45, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  className="btn btn-glass"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    background: timeLimit === sec ? 'rgba(0, 242, 254, 0.3)' : undefined,
                    borderColor: timeLimit === sec ? 'var(--aqua-cyan)' : undefined
                  }}
                  onClick={() => setTimeLimit(sec)}
                >
                  {sec}초
                </button>
              ))}
            </div>
            <input
              type="number"
              className="glass-input"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              placeholder="예: 60"
            />
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.55)', marginTop: '4px', display: 'block' }}>
              참가자 낚시 시작 시 적용되는 시간입니다.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
              강화 비용 단위 텍스트
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              {['1 ESTA', '2 ESTA', '500원', '1 티켓', '무료'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="btn btn-glass"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    background: costText === preset ? 'rgba(155, 81, 224, 0.3)' : undefined,
                    borderColor: costText === preset ? 'var(--neon-purple)' : undefined
                  }}
                  onClick={() => setCostText(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="glass-input"
              value={costText}
              onChange={(e) => setCostText(e.target.value)}
              placeholder="예: 1 ESTA"
            />
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.55)', marginTop: '4px', display: 'block' }}>
              참가자 화면의 강화 버튼 및 안내창에 실시간 노출됩니다.
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- 3: 확률 조작 시스템 (프리셋 제거, 깔끔한 직접 조절) ---------------- */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 24px',
          marginBottom: '24px',
          border: '1px solid rgba(155, 81, 224, 0.5)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(88, 28, 135, 0.15))'
        }}
      >
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f3e8ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dice5 className="w-5 h-5 text-purple-400" />
            <span>2. 낚싯대 강화 확률 조작 시스템</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
            참가자 화면에 띄우는 ‘명목상 확률’과 실제 코드에서 굴려지는 ‘히든 확률’을 완전히 분리 제어합니다.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '16px' }}>
          {/* A. 화면 표시용 (명목) 확률 */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(0, 242, 254, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--aqua-cyan)', fontWeight: 800, marginBottom: '14px', fontSize: '0.95rem' }}>
              <Eye className="w-4 h-4" />
              <span>화면 표시용 (디스플레이 명목) 확률</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '16px' }}>
              참가자 화면에 보여지는 안내용 수치입니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#6ee7b7' }}>성공 (상승) 확률</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fde68a' }}>유지 (보존) 확률</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fca5a5' }}>하락 (실패) 확률</span>
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

              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: displaySuccess + displayKeep + displayDowngrade === 100 ? '#6ee7b7' : '#f87171' }}>
                합계: {displaySuccess + displayKeep + displayDowngrade}%
              </div>
            </div>
          </div>

          {/* B. 실제 (Hidden) 확률 */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              background: 'rgba(88, 28, 135, 0.25)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              boxShadow: '0 0 25px rgba(168, 85, 247, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d8b4fe', fontWeight: 800, marginBottom: '14px', fontSize: '0.95rem' }}>
              <EyeOff className="w-4 h-4 text-purple-300" />
              <span>실제 (Hidden) 확률 - 실제 당첨 로직</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px' }}>
              참가자에게 보이지 않고 실제 내부 로직에서 굴려지는 확률입니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#6ee7b7' }}>실제 성공 확률</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fde68a' }}>실제 유지 확률</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#fca5a5' }}>실제 하락 확률</span>
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

              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: hiddenSuccess + hiddenKeep + hiddenDowngrade === 100 ? '#6ee7b7' : '#f87171' }}>
                합계: {hiddenSuccess + hiddenKeep + hiddenDowngrade}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 4: 참가자 전체 명단 관리 (비공개 학번/이름 포함) ---------------- */}
      <div className="glass-panel" style={{ padding: '28px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              3. 참가자 전체 명단 관리 (운영진 대외비)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              축제 상품 수여를 위한 참가자 학번, 실명 및 점수 기록부 (총 {scores.length}건)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleAddSampleData} className="btn btn-glass" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              <PlusCircle className="w-4 h-4 text-cyan-300" />
              <span>샘플 데이터 추가</span>
            </button>
            <button onClick={exportToCSV} className="btn btn-glass" style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#10b981' }}>
              <Download className="w-4 h-4 text-emerald-400" />
              <span>엑셀 CSV 내보내기</span>
            </button>
            <button
              onClick={() => setResetConfirmModal(true)}
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Trash2 className="w-4 h-4" />
              <span>전체 초기화</span>
            </button>
          </div>
        </div>

        {/* 참가자 테이블 */}
        {scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
            현재 등록된 참가자가 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <th style={{ padding: '10px 12px' }}>순위</th>
                  <th style={{ padding: '10px 12px' }}>닉네임</th>
                  <th style={{ padding: '10px 12px' }}>학번</th>
                  <th style={{ padding: '10px 12px' }}>이름</th>
                  <th style={{ padding: '10px 12px' }}>낚싯대</th>
                  <th style={{ padding: '10px 12px' }}>점수</th>
                  <th style={{ padding: '10px 12px' }}>등록 시간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 800, color: idx < 3 ? '#ffd700' : '#ffffff' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--aqua-cyan)' }}>
                      {row.nickname}
                    </td>
                    <td style={{ padding: '12px' }}>{row.student_id}</td>
                    <td style={{ padding: '12px' }}>{row.student_name}</td>
                    <td style={{ padding: '12px' }}>{row.rod_level}단계</td>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#fef08a' }}>
                      {row.score}점
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.8rem' }}>
                      {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          if (confirm(`'${row.nickname}' 참가자 기록을 삭제하시겠습니까?`)) {
                            removeScore(row.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="기록 삭제"
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

      {/* ---------------- 5: 공통 비밀번호 ---------------- */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>4. 부스 공통 인증 비밀번호 변경</span>
        </h3>

        <div style={{ maxWidth: '400px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px' }}>
            현재 마스터 비밀번호
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="glass-input"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="105fish"
            />
            <button onClick={handleSaveSettings} className="btn btn-glass" style={{ whiteSpace: 'nowrap' }}>
              비밀번호 저장
            </button>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px', display: 'block' }}>
            모든 4대 이상의 기기에서 처음 접근 시 이 비밀번호를 사용합니다.
          </span>
        </div>
      </div>

      {/* 전체 초기화 확인 모달 */}
      {resetConfirmModal && (
        <div className="modal-overlay">
          <div
            className="glass-panel"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '30px',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.5)'
            }}
          >
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              정말 전체 점수를 초기화할까요?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
              지금까지 등록된 모든 참가자 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setResetConfirmModal(false)}
                className="btn btn-glass"
                style={{ flex: 1 }}
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
                style={{ flex: 1 }}
              >
                네, 전부 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
