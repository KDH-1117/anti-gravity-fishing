import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import {
  Trophy,
  Crown,
  Medal,
  Search,
  Fish
} from 'lucide-react';

export default function Leaderboard() {
  const { scores, refreshScores, navigate } = useBooth();
  const [searchTerm, setSearchTerm] = useState('');

  // 2.5초 주기 백그라운드 자동 폴링 (화면 텍스트 노출 없이 백그라운드에서 실시간 갱신)
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

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
      {/* 헤더 섹션: 순위표만 간결하게 */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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

      {/* ---------------- 1~3위 포디움 ---------------- */}
      {filteredScores.length > 0 && !searchTerm && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '26px'
          }}
        >
          {top1 && (
            <div
              className="glass-panel glass-glow-gold"
              style={{
                padding: '22px 16px',
                textAlign: 'center',
                background: 'rgba(255, 215, 0, 0.12)',
                border: '2px solid rgba(255, 215, 0, 0.6)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}
              >
                <Crown className="w-6 h-6" />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffd700' }}>
                1위
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 2px' }}>
                {top1.nickname}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px' }}>
                낚싯대 {top1.rod_level}단계
              </div>

              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffd700' }}>
                {top1.score}
                <span style={{ fontSize: '0.9rem', marginLeft: '2px' }}>점</span>
              </div>
            </div>
          )}

          {top2 && (
            <div
              className="glass-panel"
              style={{
                padding: '22px 16px',
                textAlign: 'center',
                background: 'rgba(226, 232, 240, 0.08)',
                border: '1px solid rgba(226, 232, 240, 0.4)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#cbd5e1',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}
              >
                <Medal className="w-5 h-5" />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1' }}>
                2위
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px' }}>
                {top2.nickname}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px' }}>
                낚싯대 {top2.rod_level}단계
              </div>

              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#cbd5e1' }}>
                {top2.score}
                <span style={{ fontSize: '0.9rem', marginLeft: '2px' }}>점</span>
              </div>
            </div>
          )}

          {top3 && (
            <div
              className="glass-panel"
              style={{
                padding: '22px 16px',
                textAlign: 'center',
                background: 'rgba(205, 127, 50, 0.08)',
                border: '1px solid rgba(205, 127, 50, 0.4)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#cd7f32',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}
              >
                <Medal className="w-5 h-5" />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fed7aa' }}>
                3위
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px' }}>
                {top3.nickname}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px' }}>
                낚싯대 {top3.rod_level}단계
              </div>

              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fed7aa' }}>
                {top3.score}
                <span style={{ fontSize: '0.9rem', marginLeft: '2px' }}>점</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 전체 순위표 ---------------- */}
      <div className="glass-panel" style={{ padding: '20px 18px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredScores.map((record, index) => {
              const rank = index + 1;
              return (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background:
                      rank === 1
                        ? 'rgba(255, 215, 0, 0.1)'
                        : rank === 2
                        ? 'rgba(226, 232, 240, 0.08)'
                        : rank === 3
                        ? 'rgba(205, 127, 50, 0.08)'
                        : 'rgba(255, 255, 255, 0.04)',
                    border:
                      rank === 1
                        ? '1px solid rgba(255, 215, 0, 0.35)'
                        : rank === 2
                        ? '1px solid rgba(226, 232, 240, 0.25)'
                        : rank === 3
                        ? '1px solid rgba(205, 127, 50, 0.25)'
                        : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background:
                          rank === 1
                            ? '#ffd700'
                            : rank === 2
                            ? '#cbd5e1'
                            : rank === 3
                            ? '#cd7f32'
                            : 'rgba(255, 255, 255, 0.12)',
                        color: rank <= 3 ? '#000000' : '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {rank}
                    </div>

                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                        {record.nickname}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', marginTop: '1px' }}>
                        낚싯대 {record.rod_level || 1}단계
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 900,
                        color: rank === 1 ? '#ffd700' : rank === 2 ? '#e2e8f0' : rank === 3 ? '#fed7aa' : 'var(--aqua-cyan)'
                      }}
                    >
                      {record.score}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginLeft: '3px' }}>
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
