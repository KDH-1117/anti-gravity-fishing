import React, { useState, useEffect, useRef } from 'react';
import { useBooth } from '../context/BoothContext';
import { sound } from '../lib/sound';
import { DEFAULT_STAGE_PROBABILITIES } from '../lib/supabase';
import confetti from 'canvas-confetti';
import {
  Fish,
  Zap,
  ArrowRight,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Trophy
} from 'lucide-react';

const ROD_TIERS = {
  1: { level: 1, name: '낚싯대 1단계', color: '#94a3b8' },
  2: { level: 2, name: '낚싯대 2단계', color: '#38bdf8' },
  3: { level: 3, name: '낚싯대 3단계', color: '#c084fc' },
  4: { level: 4, name: '낚싯대 4단계', color: '#00f2fe' },
  5: { level: 5, name: '낚싯대 5단계 (최대)', color: '#ffd700' }
};

export default function MainGame() {
  const { settings, recordScore, navigate } = useBooth();

  // 단계: 0: START, 1: 닉네임, 2: 학번/이름, 3: 강화, 4: 낚시 타이머, 5: 점수 입력
  const [step, setStep] = useState(0);

  // 참가자 정보
  const [nickname, setNickname] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');

  // 강화 상태
  const [rodLevel, setRodLevel] = useState(1);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState(null);
  const [enhanceCount, setEnhanceCount] = useState(0);

  // 타이머 상태
  const [timeLeft, setTimeLeft] = useState(settings?.time_limit || 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // 점수 입력 상태
  const [scoreInput, setScoreInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedScore, setSubmittedScore] = useState(null);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (step < 4) {
      setTimeLeft(settings?.time_limit || 60);
    }
  }, [settings?.time_limit, step]);

  useEffect(() => {
    if (step === 4 && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            sound.playTimeUp();
            setStep(5);
            return 0;
          }
          if (prev <= 10) {
            sound.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [step, isTimerRunning]);

  const handleStartGame = () => {
    sound.playClick();
    setStep(1);
    setInputError('');
  };

  const handleNextNickname = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setInputError('닉네임을 입력해주세요.');
      return;
    }
    sound.playClick();
    setInputError('');
    setStep(2);
  };

  const handleNextStudentInfo = (e) => {
    e.preventDefault();
    if (!studentId.trim() || !studentName.trim()) {
      setInputError('학번과 이름을 모두 입력해주세요.');
      return;
    }
    sound.playClick();
    setInputError('');
    setStep(3);
  };

  // 현재 단계별 확률 조회
  const getStageProbabilities = (lvl) => {
    const stageKey = String(lvl);
    const stageData = settings?.stage_probabilities?.[stageKey] || DEFAULT_STAGE_PROBABILITIES[stageKey] || {
      display: { success: 50, keep: 30, downgrade: 20 },
      hidden: { success: 25, keep: 35, downgrade: 40 }
    };
    return stageData;
  };

  // 강화 실행 (1단계에서는 절대 하락 불가)
  const handleEnhance = () => {
    if (rodLevel >= 5 || isEnhancing) return;

    sound.playClick();
    setIsEnhancing(true);
    setEnhanceResult(null);

    setTimeout(() => {
      const stageData = getStageProbabilities(rodLevel);
      const pSuccess = Number(stageData.hidden?.success ?? 25);
      const pKeep = Number(stageData.hidden?.keep ?? 35);
      const pDown = Number(stageData.hidden?.downgrade ?? 40);
      const total = pSuccess + pKeep + pDown;

      const roll = Math.random() * total;

      let result = 'KEEP';
      if (roll < pSuccess) {
        result = 'SUCCESS';
      } else if (roll < pSuccess + pKeep) {
        result = 'KEEP';
      } else {
        // [중요 요구사항]: 1단계에서는 하락 못하게 함 (하락 대신 유지 처리)
        if (rodLevel === 1) {
          result = 'KEEP';
        } else {
          result = 'DOWN';
        }
      }

      setEnhanceCount((prev) => prev + 1);
      setEnhanceResult(result);

      if (result === 'SUCCESS') {
        const nextLv = Math.min(5, rodLevel + 1);
        setRodLevel(nextLv);
        sound.playSuccess();
        if (nextLv === 5) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      } else if (result === 'KEEP') {
        sound.playKeep();
      } else {
        const nextLv = Math.max(1, rodLevel - 1);
        setRodLevel(nextLv);
        sound.playDowngrade();
      }

      setIsEnhancing(false);
    }, 600);
  };

  const handleStartFishing = () => {
    sound.playClick();
    setTimeLeft(settings?.time_limit || 60);
    setIsTimerRunning(true);
    setStep(4);
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    const finalScore = parseInt(scoreInput, 10);
    if (isNaN(finalScore) || finalScore < 0) {
      alert('올바른 점수를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordScore({
        nickname: nickname.trim(),
        student_id: studentId.trim(),
        student_name: studentName.trim(),
        rod_level: rodLevel,
        score: finalScore
      });

      sound.playCelebrate();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

      setSubmittedScore(finalScore);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      alert('점수 등록 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  const handleResetForNext = () => {
    sound.playClick();
    setStep(0);
    setNickname('');
    setStudentId('');
    setStudentName('');
    setRodLevel(1);
    setEnhanceResult(null);
    setEnhanceCount(0);
    setTimeLeft(settings?.time_limit || 60);
    setIsTimerRunning(false);
    setScoreInput('');
    setSubmittedScore(null);
  };

  const currentRod = ROD_TIERS[rodLevel];

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
      {/* ---------------- 0단계: 꽤 큰 START 버튼 단독 화면 ---------------- */}
      {step === 0 && (
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <button
            className="hero-start-btn"
            onClick={handleStartGame}
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '140px',
              fontSize: '3.4rem',
              fontWeight: 900,
              borderRadius: '36px',
              letterSpacing: '0.06em',
              boxShadow: '0 15px 50px rgba(0, 242, 254, 0.6), 0 0 40px rgba(155, 81, 224, 0.5)'
            }}
          >
            <Play className="w-12 h-12 fill-current" />
            <span>START</span>
          </button>
        </div>
      )}

      {/* ---------------- 1단계: 닉네임 입력 ---------------- */}
      {step === 1 && (
        <div className="glass-panel" style={{ padding: '36px 28px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
            닉네임 입력
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', marginBottom: '22px' }}>
            순위표에 표시될 닉네임을 입력하세요.
          </p>

          <form onSubmit={handleNextNickname}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                autoFocus
              />
              {inputError && (
                <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '8px' }}>
                  {inputError}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
              <span>다음</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* ---------------- 2단계: 학번 및 이름 입력 ---------------- */}
      {step === 2 && (
        <div className="glass-panel" style={{ padding: '36px 28px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
            학번 및 이름 입력
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', marginBottom: '22px' }}>
            상품 수여 본인 확인용 정보입니다.
          </p>

          <form onSubmit={handleNextStudentInfo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                학번
              </label>
              <input
                type="text"
                className="glass-input"
                placeholder="예: 10512"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                이름
              </label>
              <input
                type="text"
                className="glass-input"
                placeholder="이름"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            {inputError && (
              <div style={{ color: '#f87171', fontSize: '0.85rem' }}>
                {inputError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '6px' }}>
              <span>강화하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* ---------------- 3단계: 낚싯대 강화 (1단계 하락 방지 적용) ---------------- */}
      {step === 3 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--aqua-cyan)' }}>
              {nickname}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              강화 {enhanceCount}회
            </span>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              marginBottom: '16px',
              border: `2px solid ${currentRod.color}`
            }}
          >
            <div
              style={{
                fontSize: '2.6rem',
                fontWeight: 900,
                color: currentRod.color,
                marginBottom: '8px'
              }}
            >
              {currentRod.name}
            </div>

            {enhanceResult && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background:
                    enhanceResult === 'SUCCESS'
                      ? 'rgba(16, 185, 129, 0.25)'
                      : enhanceResult === 'KEEP'
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(239, 68, 68, 0.25)',
                  color:
                    enhanceResult === 'SUCCESS'
                      ? '#6ee7b7'
                      : enhanceResult === 'KEEP'
                      ? '#fde68a'
                      : '#fca5a5'
                }}
              >
                {enhanceResult === 'SUCCESS' && <CheckCircle2 className="w-4 h-4" />}
                {enhanceResult === 'KEEP' && '•'}
                {enhanceResult === 'DOWN' && <AlertTriangle className="w-4 h-4" />}
                <span>
                  {enhanceResult === 'SUCCESS' && '강화 성공 (+1)'}
                  {enhanceResult === 'KEEP' && '단계 유지'}
                  {enhanceResult === 'DOWN' && '강화 하락 (-1)'}
                </span>
              </div>
            )}
          </div>

          {/* 비용 및 명목상 확률 (현재 단계별 확률 반영) */}
          {(() => {
            const currentStageProb = getStageProbabilities(rodLevel);
            const dispSuccess = currentStageProb.display?.success ?? 50;
            const dispKeep = currentStageProb.display?.keep ?? 30;
            const dispDown = rodLevel === 1 ? 0 : (currentStageProb.display?.downgrade ?? 20);

            return (
              <div
                className="glass-panel"
                style={{
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>비용: </span>
                  <strong style={{ color: 'var(--aqua-cyan)', fontSize: '1rem' }}>{settings?.cost_text || '1 ESTA'}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <span>성공 <strong style={{ color: '#6ee7b7' }}>{dispSuccess}%</strong></span>
                  <span>유지 <strong style={{ color: '#fde68a' }}>{dispKeep}%</strong></span>
                  <span>하락 <strong style={{ color: '#fca5a5' }}>{dispDown}%</strong></span>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleEnhance}
              disabled={rodLevel >= 5 || isEnhancing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1.05rem', opacity: rodLevel >= 5 ? 0.6 : 1 }}
            >
              <Zap className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>
                {isEnhancing
                  ? '강화 중...'
                  : rodLevel >= 5
                  ? '최대 단계 달성'
                  : `강화하기 (${settings?.cost_text || '1 ESTA'})`}
              </span>
            </button>

            <button
              onClick={handleStartFishing}
              disabled={isEnhancing}
              className="btn btn-glass"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', borderColor: 'var(--aqua-cyan)' }}
            >
              <Fish className="w-5 h-5 text-cyan-300" />
              <span>낚시 시작</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 4단계: 낚시 타이머 페이즈 ---------------- */}
      {step === 4 && (
        <div className="glass-panel" style={{ padding: '36px 20px', textAlign: 'center', marginTop: '10px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--aqua-cyan)', fontWeight: 700, marginBottom: '6px' }}>
            {nickname} ({currentRod.name})
          </div>

          <div style={{ margin: '20px 0' }}>
            <div className={`timer-huge ${timeLeft <= 10 ? 'timer-critical' : ''}`}>
              {formatTimer(timeLeft)}
            </div>
          </div>

          <div className="water-container">
            <div className="fishing-bobber">🪝</div>
            <div className="swimming-fish" style={{ top: '25%', animationDuration: '7s' }}>🐟</div>
            <div className="swimming-fish" style={{ top: '65%', animationDuration: '11s', animationDelay: '-3s' }}>🐠</div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsTimerRunning((prev) => !prev)}
              className="btn btn-glass"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? '일시정지' : '재개'}</span>
            </button>

            <button
              onClick={() => {
                sound.playTimeUp();
                setIsTimerRunning(false);
                setStep(5);
              }}
              className="btn btn-glass"
              style={{ padding: '10px 18px', fontSize: '0.85rem', color: '#fca5a5' }}
            >
              <Clock className="w-4 h-4" />
              <span>종료 및 점수 입력</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 5단계: 점수 입력 ---------------- */}
      {step === 5 && (
        <div className="glass-panel" style={{ padding: '36px 24px', marginTop: '10px' }}>
          {!submittedScore ? (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
                점수 입력
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {nickname} ({studentId} {studentName}) | {currentRod.name}
              </p>

              <form onSubmit={handleSubmitScore}>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="number"
                    className="glass-input"
                    placeholder="획득 점수 입력"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {[1, 5, 10, 50, 100].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      className="btn btn-glass"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      onClick={() => {
                        const cur = parseInt(scoreInput || '0', 10);
                        setScoreInput((cur + inc).toString());
                      }}
                    >
                      +{inc}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn-glass"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#f87171' }}
                    onClick={() => setScoreInput('0')}
                  >
                    리셋
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || scoreInput === ''}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSubmitting ? '등록 중...' : '점수 등록 완료'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid rgba(16, 185, 129, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                등록 완료
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1rem', marginBottom: '24px' }}>
                {nickname} : <strong>{submittedScore}점</strong>
              </p>

              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleResetForNext}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    borderRadius: '16px',
                    boxShadow: '0 8px 30px rgba(0, 242, 254, 0.4)'
                  }}
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>처음으로 가기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
