import React, { useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { Crown, Medal } from 'lucide-react';

export default function Leaderboard() {
  const { scores, refreshScores } = useBooth();

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

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '36px 16px 80px' }}>
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

      {/* ---------------- 올림픽 단상 레이아웃 (2등 | 1등 | 3등) ---------------- */}
      {scores.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '28px',
            padding: '10px 0'
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
                    // 4등, 5등: 은은한 이펙트 테두리와 배경
                    // 그 밑(6등 이상): 아무 효과 없는 심플한 일반 라인
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
  );
}
