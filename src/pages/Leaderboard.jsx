import React, { useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { Crown, Medal, Gift, Trophy, Sparkles } from 'lucide-react';

export default function Leaderboard() {
  const { scores, refreshScores, settings } = useBooth();

  // 2.5초 주기 백그라운드 자동 폴링
  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshScores) {
        await refreshScores();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [refreshScores]);

  const top1 = scores[0];
  const top2 = scores[1];
  const top3 = scores[2];
  const restScores = scores.slice(3); // 4위부터 끝까지

  // 등수별 상품 정보 (기본값 '-')
  const prizes = settings?.prizes || {
    1: '-',
    2: '-',
    3: '-',
    4: '-',
    5: '-'
  };

  const prizeList = [
    {
      rank: 1,
      label: '1등',
      badgeBg: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
      badgeColor: '#78350f',
      border: '1.5px solid rgba(251, 191, 36, 0.65)',
      cardBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.06) 100%)',
      valueColor: '#fef08a',
      glow: '0 0 16px rgba(245, 158, 11, 0.22)',
      icon: <Crown className="w-3.5 h-3.5 text-amber-900 fill-current" />
    },
    {
      rank: 2,
      label: '2등',
      badgeBg: '#cbd5e1',
      badgeColor: '#0f172a',
      border: '1px solid rgba(226, 232, 240, 0.45)',
      cardBg: 'rgba(226, 232, 240, 0.06)',
      valueColor: '#e2e8f0',
      glow: 'none',
      icon: <Medal className="w-3.5 h-3.5 text-slate-900" />
    },
    {
      rank: 3,
      label: '3등',
      badgeBg: '#d97706',
      badgeColor: '#ffffff',
      border: '1px solid rgba(217, 119, 6, 0.45)',
      cardBg: 'rgba(217, 119, 6, 0.06)',
      valueColor: '#f59e0b',
      glow: 'none',
      icon: <Medal className="w-3.5 h-3.5 text-white" />
    },
    {
      rank: 4,
      label: '4등',
      badgeBg: 'rgba(0, 242, 254, 0.25)',
      badgeColor: 'var(--aqua-cyan)',
      border: '1px solid rgba(0, 242, 254, 0.35)',
      cardBg: 'rgba(0, 242, 254, 0.04)',
      valueColor: 'var(--aqua-cyan)',
      glow: 'none',
      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
    },
    {
      rank: 5,
      label: '5등',
      badgeBg: 'rgba(59, 130, 246, 0.25)',
      badgeColor: '#93c5fa',
      border: '1px solid rgba(59, 130, 246, 0.35)',
      cardBg: 'rgba(59, 130, 246, 0.04)',
      valueColor: '#93c5fa',
      glow: 'none',
      icon: <Trophy className="w-3.5 h-3.5 text-blue-400" />
    }
  ];

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', width: '100%', padding: '36px 16px 80px' }}>
      {/* 헤더: 검색 및 버튼 없이 오직 순위표 타이틀만 간결하게 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '2.6rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 25px rgba(0, 242, 254, 0.35)'
          }}
        >
          순위표
        </h1>
      </div>

      {/* 2열 반응형 그리드: 왼쪽(상품 안내 탭) + 오른쪽(올림픽 단상 및 순위 리스트) */}
      <div className="leaderboard-layout-grid">
        {/* =================== 왼쪽: 등수별 상품 안내 탭 =================== */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 20px',
            position: 'sticky',
            top: '20px',
            background: 'rgba(10, 25, 47, 0.72)',
            border: '1.5px solid rgba(0, 242, 254, 0.3)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.3) 0%, rgba(155, 81, 224, 0.3) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 242, 254, 0.35)'
              }}
            >
              <Gift className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                상품 안내
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                1등 ~ 5등 순위별 리워드
              </p>
            </div>
          </div>

          {/* 상품 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {prizeList.map((item) => {
              const prizeText = prizes[item.rank] || prizes[String(item.rank)] || '-';
              return (
                <div
                  key={item.rank}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: item.cardBg,
                    border: item.border,
                    boxShadow: item.glow,
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '70px' }}>
                    <span
                      className="prize-rank-badge"
                      style={{
                        background: item.badgeBg,
                        color: item.badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: item.valueColor,
                      wordBreak: 'break-all',
                      flex: 1
                    }}
                  >
                    {prizeText}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.73rem',
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: 1.5,
              textAlign: 'center'
            }}
          >
            ※ 축제 마감 시점의 순위표 기록을 기준으로 상품이 지급됩니다.
          </div>
        </div>

        {/* =================== 오른쪽: 올림픽 단상 및 순위표 =================== */}
        <div>
          {/* ---------------- 올림픽 단상 레이아웃 (2등 | 1등 | 3등) ---------------- */}
          {scores.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '24px',
                padding: '6px 0'
              }}
            >
              {/* 2위 단상 (왼쪽) */}
              {top2 ? (
                <div
                  className="glass-panel"
                  style={{
                    flex: '1 1 0',
                    maxWidth: '220px',
                    minHeight: '200px',
                    padding: '20px 12px 16px',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(226, 232, 240, 0.12) 0%, rgba(148, 163, 184, 0.06) 100%)',
                    border: '1.5px solid rgba(226, 232, 240, 0.45)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#cbd5e1',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        boxShadow: '0 0 15px rgba(226, 232, 240, 0.4)'
                      }}
                    >
                      <Medal className="w-5 h-5" />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#cbd5e1' }}>2등</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px' }}>
                      {top2.nickname}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {top2.rod_level}단계
                    </div>
                  </div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#cbd5e1', marginTop: '10px' }}>
                    {top2.score}
                    <span style={{ fontSize: '0.85rem', marginLeft: '2px' }}>점</span>
                  </div>
                </div>
              ) : (
                <div style={{ flex: '1 1 0', maxWidth: '220px' }} />
              )}

              {/* 1위 단상 (가운데 - 가장 높음) */}
              {top1 && (
                <div
                  className="glass-panel glass-glow-gold"
                  style={{
                    flex: '1 1 0',
                    maxWidth: '240px',
                    minHeight: '245px',
                    padding: '24px 14px 18px',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.08) 100%)',
                    border: '2px solid rgba(251, 191, 36, 0.75)',
                    boxShadow: '0 12px 35px rgba(245, 158, 11, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
                        color: '#78350f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)'
                      }}
                    >
                      <Crown className="w-6 h-6 fill-current" />
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fbbf24' }}>1등</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 2px' }}>
                      {top1.nickname}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {top1.rod_level}단계
                    </div>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fbbf24', marginTop: '10px' }}>
                    {top1.score}
                    <span style={{ fontSize: '0.95rem', marginLeft: '3px' }}>점</span>
                  </div>
                </div>
              )}

              {/* 3위 단상 (오른쪽) */}
              {top3 ? (
                <div
                  className="glass-panel"
                  style={{
                    flex: '1 1 0',
                    maxWidth: '220px',
                    minHeight: '180px',
                    padding: '18px 12px 14px',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(180, 83, 9, 0.15) 0%, rgba(146, 64, 14, 0.05) 100%)',
                    border: '1.5px solid rgba(217, 119, 6, 0.45)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#d97706',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        boxShadow: '0 0 15px rgba(217, 119, 6, 0.4)'
                      }}
                    >
                      <Medal className="w-4 h-4" />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f59e0b' }}>3등</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px' }}>
                      {top3.nickname}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {top3.rod_level}단계
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', marginTop: '10px' }}>
                    {top3.score}
                    <span style={{ fontSize: '0.85rem', marginLeft: '2px' }}>점</span>
                  </div>
                </div>
              ) : (
                <div style={{ flex: '1 1 0', maxWidth: '220px' }} />
              )}
            </div>
          )}

          {/* ---------------- 4등 이하 리스트 ---------------- */}
          <div className="glass-panel" style={{ padding: '20px 16px' }}>
            {scores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255, 255, 255, 0.5)' }}>
                <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  등록된 점수가 없습니다.
                </p>
              </div>
            ) : (
              <div>
                {/* 4위부터 차례대로 렌더링 */}
                {restScores.map((record, index) => {
                  const rank = index + 4; // 4등부터 시작
                  const isHighlight = rank === 4 || rank === 5; // 4등, 5등까지만 이펙트 살짝 넣음

                  return (
                    <div
                      key={record.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: isHighlight ? '13px 16px' : '10px 14px',
                        marginBottom: isHighlight ? '8px' : '0',
                        borderRadius: isHighlight ? '12px' : '0',
                        background: isHighlight ? 'rgba(0, 242, 254, 0.06)' : 'transparent',
                        border: isHighlight ? '1px solid rgba(0, 242, 254, 0.3)' : 'none',
                        borderBottom: isHighlight ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 255, 255, 0.07)',
                        boxShadow: isHighlight ? '0 0 12px rgba(0, 242, 254, 0.12)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: isHighlight ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: isHighlight ? 'var(--aqua-cyan)' : 'rgba(255, 255, 255, 0.65)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {rank}
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: isHighlight ? '1rem' : '0.95rem',
                              fontWeight: isHighlight ? 800 : 600,
                              color: '#ffffff'
                            }}
                          >
                            {record.nickname}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            {record.rod_level || 1}단계
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: isHighlight ? '1.35rem' : '1.2rem',
                            fontWeight: 900,
                            color: isHighlight ? 'var(--aqua-cyan)' : 'rgba(255, 255, 255, 0.85)'
                          }}
                        >
                          {record.score}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.55)', marginLeft: '2px' }}>
                          점
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
