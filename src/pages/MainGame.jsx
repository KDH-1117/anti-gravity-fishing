import React, { useState, useEffect, useRef } from 'react';
import { useBooth } from '../context/BoothContext';
import { sound } from '../lib/sound';
import confetti from 'canvas-confetti';
import {
  Fish,
  Zap,
  ArrowRight,
  RotateCcw,
  Play,
  Pause,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  User,
  GraduationCap,
  Clock,
  Coins,
  ChevronRight,
  Trophy
} from 'lucide-react';

// 낚싯대 5단계 티어 메타데이터
const ROD_TIERS = {
  1: {
    level: 1,
    name: '일반 나무 낚싯대',
    desc: '기본에 충실한 대나무 낚싯대',
    icon: '🪵',
    class: 'rod-card-tier-1',
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.4)'
  },
  2: {
    level: 2,
    name: '견고한 카본 낚싯대',
    desc: '탄성이 좋은 보급형 탄소강 낚싯대',
    icon: '🎣',
    class: 'rod-card-tier-2',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.5)'
  },
  3: {
    level: 3,
    name: '네온 일렉트릭 낚싯대',
    desc: '전기 신호로 입질을 감지하는 특수 낚싯대',
    icon: '⚡',
    class: 'rod-card-tier-3',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.6)'
  },
  4: {
    level: 4,
    name: '심해 아쿠아마린 낚싯대',
    desc: '심해의 기운을 담은 고성능 발광 낚싯대',
    icon: '🌊',
    class: 'rod-card-tier-4',
    color: '#00f2fe',
    glow: 'rgba(0, 242, 254, 0.7)'
  },
  5: {
    level: 5,
    name: '전설의 신화 낚싯대',
    desc: '신화 속 바다의 지배자가 깃든 최고 등급 낚싯대 (MAX)',
    icon: '👑',
    class: 'rod-card-tier-5',
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.85)'
  }
};

export default function MainGame() {
  const { settings, recordScore, navigate } = useBooth();

  // 게임 진행 단계:
  // 0: 시작 화면 (Start Button)
  // 1: 닉네임 입력 (Nickname)
  // 2: 학번 & 이름 입력 (Student ID & Name)
  // 3: 낚싯대 강화 (Enhancement)
  // 4: 낚시 및 타이머 진행 (Fishing Timer)
  // 5: 점수 입력 및 완료 (Staff Score Input)
  const [step, setStep] = useState(0);

  // 참가자 정보
  const [nickname, setNickname] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');

  // 강화 상태
  const [rodLevel, setRodLevel] = useState(1);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState(null); // 'SUCCESS', 'KEEP', 'DOWN'
  const [enhanceCount, setEnhanceCount] = useState(0);

  // 타이머 상태
  const [timeLeft, setTimeLeft] = useState(settings?.time_limit || 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // 점수 입력 상태
  const [scoreInput, setScoreInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedScore, setSubmittedScore] = useState(null);

  // 에러 메시지
  const [inputError, setInputError] = useState('');

  // 관리자 설정 변경 시 타이머 기본값 동기화
  useEffect(() => {
    if (step < 4) {
      setTimeLeft(settings?.time_limit || 60);
    }
  }, [settings?.time_limit, step]);

  // 타이머 카운트다운 로직
  useEffect(() => {
    if (step === 4 && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            sound.playTimeUp();
            setStep(5); // 타이머 종료 -> 운영진 점수 입력 단계로 자동 전환
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

  // 시작 버튼 클릭
  const handleStartGame = () => {
    sound.playClick();
    setStep(1);
    setInputError('');
  };

  // 1단계: 닉네임 입력 완료
  const handleNextNickname = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setInputError('리더보드에 표시될 닉네임을 입력해주세요.');
      return;
    }
    sound.playClick();
    setInputError('');
    setStep(2);
  };

  // 2단계: 학번 및 이름 입력 완료
  const handleNextStudentInfo = (e) => {
    e.preventDefault();
    if (!studentId.trim() || !studentName.trim()) {
      setInputError('상품 수여를 위해 학번과 이름을 모두 입력해주세요.');
      return;
    }
    sound.playClick();
    setInputError('');
    setStep(3); // 강화 단계로 이동
  };

  // 3단계: 낚싯대 강화 실행 (히든 확률 로직 적용)
  const handleEnhance = () => {
    if (rodLevel >= 5 || isEnhancing) return;

    sound.playClick();
    setIsEnhancing(true);
    setEnhanceResult(null);

    // 0.8초 동안 강화 중 서스펜스 애니메이션
    setTimeout(() => {
      // 관리자 설정의 [실제 Hidden 확률] 사용
      const pSuccess = Number(settings?.hidden_success) || 25;
      const pKeep = Number(settings?.hidden_keep) || 35;
      const pDown = Number(settings?.hidden_downgrade) || 40;
      const total = pSuccess + pKeep + pDown;

      const roll = Math.random() * total;

      let result = 'KEEP';
      if (roll < pSuccess) {
        result = 'SUCCESS';
      } else if (roll < pSuccess + pKeep) {
        result = 'KEEP';
      } else {
        result = 'DOWN';
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
    }, 850);
  };

  // 강화 포기 및 낚시 시작
  const handleStartFishing = () => {
    sound.playClick();
    setTimeLeft(settings?.time_limit || 60);
    setIsTimerRunning(true);
    setStep(4);
  };

  // 5단계: 운영진 점수 제출
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
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setSubmittedScore(finalScore);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      alert('점수 등록 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  // 다음 참가자 받기 (초기화)
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

  // 분/초 포맷팅
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
      {/* ---------------- 0단계: 시작 화면 ---------------- */}
      {step === 0 && (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          {/* 타이틀 뱃지 */}
          <div className="badge badge-cyan" style={{ marginBottom: '18px', padding: '8px 18px', fontSize: '0.9rem' }}>
            <Sparkles className="w-4 h-4" />
            <span>1학년 5반 축제 낚시터 부스</span>
          </div>

          <h1
            style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #ffffff 0%, var(--aqua-cyan) 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em'
            }}
          >
            안티그래비티<br />심해 낚시 대작전
          </h1>

          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1.05rem', marginBottom: '36px', lineHeight: 1.6 }}>
            강화로 최고급 낚싯대를 획득하고,<br />
            제한 시간 안에 최고의 월척 점수를 기록하세요!
          </p>

          {/* 거대 시작 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <button className="hero-start-btn" onClick={handleStartGame}>
              <Play className="w-8 h-8 fill-current" />
              <span>START (시작하기)</span>
            </button>
          </div>

          {/* 간략 게임 룰 안내 카드 */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--aqua-cyan)' }}>
              🎮 부스 참가 안내
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--aqua-cyan)' }}>①</span> 참가자 닉네임 및 상품 수여용 학번/이름 입력
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--aqua-cyan)' }}>②</span> 낚싯대 강화 (1단계 ~ 5단계 도전!)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--aqua-cyan)' }}>③</span> {settings?.time_limit || 60}초 카운트다운 낚시 진행
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--aqua-cyan)' }}>④</span> 운영진 점수 기록 후 실시간 리더보드 등재!
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ---------------- 1단계: 닉네임 입력 ---------------- */}
      {step === 1 && (
        <div className="glass-panel" style={{ padding: '36px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--aqua-cyan)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
            <Sparkles className="w-4 h-4" /> 1단계: 리더보드 정보
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
            참가자 닉네임을 정해주세요
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '24px' }}>
            전광판 실시간 순위표에 멋지게 표시될 닉네임입니다.
          </p>

          <form onSubmit={handleNextNickname}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="예: 낚시왕김철수, 심해괴물"
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
              <span>다음 단계로</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* ---------------- 2단계: 학번 및 이름 입력 ---------------- */}
      {step === 2 && (
        <div className="glass-panel" style={{ padding: '36px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-purple)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
            <Award className="w-4 h-4" /> 2단계: 상품 수령 정보
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
            학번과 실명을 입력해주세요
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '24px' }}>
            축제 종료 후 순위권 및 이벤트 상품 전달을 위해 운영진만 확인합니다.
          </p>

          <form onSubmit={handleNextStudentInfo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                학번 (예: 10512 또는 1-5 12번)
              </label>
              <input
                type="text"
                className="glass-input"
                placeholder="학번 입력"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                이름 (실명)
              </label>
              <input
                type="text"
                className="glass-input"
                placeholder="이름 입력"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            {inputError && (
              <div style={{ color: '#f87171', fontSize: '0.85rem' }}>
                {inputError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '8px' }}>
              <span>강화소 입장하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* ---------------- 3단계: 낚싯대 강화 시스템 ---------------- */}
      {step === 3 && (
        <div>
          {/* 상단 참가자 배지 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="badge badge-cyan">
              <User className="w-3.5 h-3.5" />
              <span>{nickname} 참가자</span>
            </div>
            <div className="badge badge-purple">
              <Coins className="w-3.5 h-3.5" />
              <span>강화 시도: {enhanceCount}회</span>
            </div>
          </div>

          {/* 낚싯대 카드 */}
          <div
            className={`glass-panel ${currentRod.class}`}
            style={{
              padding: '30px 24px',
              textAlign: 'center',
              marginBottom: '20px',
              transition: 'all 0.4s ease'
            }}
          >
            {/* 레벨 배지 */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span
                style={{
                  background: currentRod.color,
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  boxShadow: `0 0 15px ${currentRod.glow}`
                }}
              >
                LEVEL {rodLevel} {rodLevel === 5 ? '★ MAX' : ''}
              </span>
            </div>

            {/* 거대 아이콘 */}
            <div
              style={{
                fontSize: '5rem',
                margin: '10px 0',
                filter: `drop-shadow(0 0 20px ${currentRod.glow})`,
                transform: isEnhancing ? 'scale(1.15) rotate(10deg)' : 'scale(1)',
                transition: 'transform 0.2s ease'
              }}
            >
              {currentRod.icon}
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              {currentRod.name}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              {currentRod.desc}
            </p>

            {/* 강화 결과 알림 플래시 */}
            {enhanceResult && (
              <div
                style={{
                  marginTop: '18px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'popIn 0.3s ease',
                  background:
                    enhanceResult === 'SUCCESS'
                      ? 'rgba(16, 185, 129, 0.25)'
                      : enhanceResult === 'KEEP'
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(239, 68, 68, 0.25)',
                  border:
                    enhanceResult === 'SUCCESS'
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : enhanceResult === 'KEEP'
                      ? '1px solid rgba(245, 158, 11, 0.5)'
                      : '1px solid rgba(239, 68, 68, 0.5)',
                  color:
                    enhanceResult === 'SUCCESS'
                      ? '#6ee7b7'
                      : enhanceResult === 'KEEP'
                      ? '#fde68a'
                      : '#fca5a5'
                }}
              >
                {enhanceResult === 'SUCCESS' && <CheckCircle2 className="w-5 h-5" />}
                {enhanceResult === 'KEEP' && <Sparkles className="w-5 h-5" />}
                {enhanceResult === 'DOWN' && <AlertTriangle className="w-5 h-5" />}
                <span>
                  {enhanceResult === 'SUCCESS' && '강화 성공! 낚싯대 등급이 상승했습니다!'}
                  {enhanceResult === 'KEEP' && '등급 유지! 아쉽지만 등급이 보존되었습니다.'}
                  {enhanceResult === 'DOWN' && '강화 하락! 낚싯대 등급이 1단계 떨어졌습니다.'}
                </span>
              </div>
            )}
          </div>

          {/* 명목상(디스플레이용) 확률 고지 카드 */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              background: 'rgba(15, 23, 42, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                1회 시도 소모 비용
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--aqua-cyan)' }}>
                {settings?.cost_text || '1 ESTA'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>성공: </span>
                <strong style={{ color: '#6ee7b7' }}>{settings?.display_success || 50}%</strong>
              </div>
              <div>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>유지: </span>
                <strong style={{ color: '#fde68a' }}>{settings?.display_keep || 30}%</strong>
              </div>
              <div>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>하락: </span>
                <strong style={{ color: '#fca5a5' }}>{settings?.display_downgrade || 20}%</strong>
              </div>
            </div>
          </div>

          {/* 조작 버튼 영역 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 강화 버튼 */}
            <button
              onClick={handleEnhance}
              disabled={rodLevel >= 5 || isEnhancing}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                opacity: rodLevel >= 5 ? 0.6 : 1
              }}
            >
              <Zap className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>
                {isEnhancing
                  ? '강화 중...'
                  : rodLevel >= 5
                  ? '최고 등급 도달 (강화 완료)'
                  : `낚싯대 강화하기 (${settings?.cost_text || '1 ESTA'} 소모)`}
              </span>
            </button>

            {/* 강화 포기 및 낚시 시작 버튼 */}
            <button
              onClick={handleStartFishing}
              disabled={isEnhancing}
              className="btn btn-glass"
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '1rem',
                borderColor: 'var(--aqua-cyan)'
              }}
            >
              <Fish className="w-5 h-5 text-cyan-300" />
              <span>현재 낚싯대로 낚시 시작하기</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 4단계: 낚시 및 타이머 페이즈 ---------------- */}
      {step === 4 && (
        <div className="glass-panel" style={{ padding: '36px 24px', textAlign: 'center' }}>
          {/* 상단 장착 상태 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <span className="badge badge-cyan">{nickname}</span>
            <span className="badge badge-purple">{currentRod.name} (Lv.{rodLevel})</span>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px' }}>
            🎣 심해 낚시 진행 중!
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px' }}>
            제한 시간 동안 최대한 많은 물고기를 낚아 올리세요!
          </p>

          {/* 거대 타이머 디스플레이 */}
          <div style={{ margin: '20px 0' }}>
            <div className={`timer-huge ${timeLeft <= 10 ? 'timer-critical' : ''}`}>
              {formatTimer(timeLeft)}
            </div>
            <div style={{ fontSize: '0.85rem', color: timeLeft <= 10 ? '#ef4444' : 'var(--aqua-cyan)', fontWeight: 700, marginTop: '4px' }}>
              {timeLeft <= 10 ? '⚠️ 마감 임박!' : '남은 낚시 시간'}
            </div>
          </div>

          {/* 물고기 수영 애니메이션 연출 */}
          <div className="water-container">
            <div className="fishing-bobber">🪝</div>
            <div className="swimming-fish" style={{ top: '25%', animationDuration: '7s' }}>🐟</div>
            <div className="swimming-fish" style={{ top: '65%', animationDuration: '11s', animationDelay: '-3s' }}>🐠</div>
            <div className="swimming-fish" style={{ top: '45%', animationDuration: '9s', animationDelay: '-6s' }}>🐡</div>
          </div>

          {/* 부스 운영진 비상 컨트롤 */}
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
              <span>즉시 종료 및 점수 입력</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 5단계: 부스 운영진 점수 입력 ---------------- */}
      {step === 5 && (
        <div className="glass-panel" style={{ padding: '36px 28px' }}>
          {!submittedScore ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800 }}>
                <Clock className="w-4 h-4" /> 낚시 페이즈 종료
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '6px' }}>
                부스 운영진 전용 점수 입력
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '24px' }}>
                우리 반 운영진 학생이 참가자가 낚은 최종 점수를 확인 후 입력해주세요.
              </p>

              {/* 참가자 요약 정보 카드 */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '0.9rem'
                }}
              >
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.55)', display: 'block', fontSize: '0.75rem' }}>닉네임</span>
                  <strong style={{ color: 'var(--aqua-cyan)', fontSize: '1.1rem' }}>{nickname}</strong>
                </div>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.55)', display: 'block', fontSize: '0.75rem' }}>학번 / 이름</span>
                  <strong>{studentId} ({studentName})</strong>
                </div>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.55)', display: 'block', fontSize: '0.75rem' }}>최종 장착 낚싯대</span>
                  <span style={{ color: currentRod.color, fontWeight: 700 }}>
                    {currentRod.icon} {currentRod.name} (Lv.{rodLevel})
                  </span>
                </div>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.55)', display: 'block', fontSize: '0.75rem' }}>강화 횟수</span>
                  <span>{enhanceCount}회 소모</span>
                </div>
              </div>

              {/* 점수 입력 폼 */}
              <form onSubmit={handleSubmitScore}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                    최종 획득 점수 (점)
                  </label>
                  <input
                    type="number"
                    className="glass-input"
                    placeholder="점수를 숫자로 입력하세요"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center' }}
                    autoFocus
                  />
                </div>

                {/* 빠른 점수 가산 퀵버튼 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {[1, 5, 10, 50, 100].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      className="btn btn-glass"
                      style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                      onClick={() => {
                        const cur = parseInt(scoreInput || '0', 10);
                        setScoreInput((cur + inc).toString());
                      }}
                    >
                      +{inc}점
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn-glass"
                    style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#f87171' }}
                    onClick={() => setScoreInput('0')}
                  >
                    리셋
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || scoreInput === ''}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '16px', fontSize: '1.15rem' }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSubmitting ? '리더보드 등록 중...' : '점수 확정 및 리더보드 등록'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* 등록 완료 화면 */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid rgba(16, 185, 129, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
                }}
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>
                점수 등록 완료!
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1rem', marginBottom: '24px' }}>
                <strong style={{ color: 'var(--aqua-cyan)' }}>{nickname}</strong> 님의 최종 점수:
                <strong style={{ fontSize: '1.4rem', color: '#ffd700', marginLeft: '6px' }}>
                  {submittedScore}점
                </strong>
                <br />
                실시간 리더보드에 즉시 반영되었습니다.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/scores')}
                  className="btn btn-purple"
                  style={{ width: '100%', padding: '15px' }}
                >
                  <Trophy className="w-5 h-5" />
                  <span>리더보드 순위 확인하러 가기</span>
                </button>

                <button
                  onClick={handleResetForNext}
                  className="btn btn-glass"
                  style={{ width: '100%', padding: '14px' }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>다음 참가자 받기 (처음으로)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
