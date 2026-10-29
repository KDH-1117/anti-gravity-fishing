import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import {
  Crown,
  Medal,
  Search,
  Fish
} from 'lucide-react';

export default function Leaderboard() {
  const { scores, refreshScores, navigate } = useBooth();
  const [searchTerm, setSearchTerm] = useState('');

  // 2.5초 주기 백그라운드 자동 폴링
  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshScores) {
        await refreshScores();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [refreshScores]);

  const filteredScores = scores.filter((item) =>
    (item.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = filteredScores[0];
  const top2 = filteredScores[1];
  const top3 = filteredScores[2];
  const restScores = filteredScores.slice(3); // 4위부터 끝까지

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            marginBottom: '14px',
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}
        >
          순위표
        </h1>

        {/* 검색 및 낚시하기 */}
        <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="glass-input"
              placeholder="닉네임 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', height: '44px', fontSize: '0.95rem' }}
            />
            <Search
              className="w-4 h-4 text-gray-400"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{ padding: '0 18px', height: '44px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}
          >
            <Fish className="w-4 h-4" />
            <span>낚시하기</span>
          </button>
        </div>
      </div>

      {/* ---------------- 올림픽 단상 레이아웃 (2등 | 1등 | 3등) ---------------- */}
      {filteredScores.length > 0 && !searchTerm && (
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
                background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '2px solid rgba(255, 215, 0, 0.75)',
                boxShadow: '0 12px 35px rgba(255, 215, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transform: 'translateY(-10px)'
              }}
            >
              <div>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    boxShadow: '0 0 22px rgba(255, 215, 0, 0.6)'
                  }}
                >
                  <Crown className="w-7 h-7" />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffd700' }}>1등</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 2px' }}>
                  {top1.nickname}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                  {top1.rod_level}단계
                </div>
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffd700', marginTop: '10px' }}>
                {top1.score}
                <span style={{ fontSize: '0.95rem', marginLeft: '2px' }}>점</span>
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
                minHeight: '175px',
                padding: '18px 12px 14px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(205, 127, 50, 0.12) 0%, rgba(180, 83, 9, 0.06) 100%)',
                border: '1.5px solid rgba(205, 127, 50, 0.45)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
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
                    background: '#cd7f32',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    boxShadow: '0 0 15px rgba(205, 127, 50, 0.4)'
                  }}
                >
                  <Medal className="w-4 h-4" />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fed7aa' }}>3등</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px' }}>
                  {top3.nickname}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {top3.rod_level}단계
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fed7aa', marginTop: '10px' }}>
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
        {filteredScores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(255, 255, 255, 0.5)' }}>
            <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>
              {searchTerm ? '검색된 참가자가 없습니다.' : '등록된 점수가 없습니다.'}
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
              낚시 시작하기
            </button>
          </div>
        ) : (
          <div>
            {/* 4위부터 차례대로 렌더링 */}
            {restScores.map((record, index) => {
              const rank = index + 4; // 4등부터 시작
              const isHighlight = rank === 4 || rank === 5; // [요청사항]: 4등, 5등까지만 이펙트 살짝 넣음

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
