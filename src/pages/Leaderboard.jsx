import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { sound } from '../lib/sound';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Search,
  Fish,
  Flame,
  Radio
} from 'lucide-react';

export default function Leaderboard() {
  const { scores, refreshScores, navigate, isSupabaseConnected } = useBooth();
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 2.5초 주기 백그라운드 자동 폴링 (새로고침 없이 실시간 갱신)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshScores) {
        await refreshScores();
        setLastUpdated(new Date());
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [refreshScores]);

  // 닉네임 검색 필터링
  const filteredScores = scores.filter((item) =>
    (item.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = filteredScores[0];
  const top2 = filteredScores[1];
  const top3 = filteredScores[2];

  // 1위 축하 폭죽 발사
  const triggerCelebration = () => {
    sound.playCelebrate();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
      {/* 헤더 섹션 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div
            className="badge badge-gold"
            style={{ padding: '8px 18px', cursor: 'pointer' }}
            onClick={triggerCelebration}
            title="클릭 시 축하 폭죽!"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>실시간 순위표 전광판</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>

          {/* 자동 폴링 상태 뱃지 */}
          <div className="badge badge-green" style={{ padding: '8px 14px' }}>
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>자동 갱신 중 (2.5초 주기)</span>
          </div>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 60%, var(--aqua-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}
        >
          1학년 5반 낚시 챔피언십
        </h1>

        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
          현재 총 <strong style={{ color: 'var(--aqua-cyan)' }}>{scores.length}</strong>명 참가 |{' '}
          마지막 갱신: {lastUpdated.toLocaleTimeString()}
        </p>

        {/* 검색 및 낚시하기 바 */}
        <div style={{ maxWidth: '480px', margin: '20px auto 0', display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="glass-input"
              placeholder="참가자 닉네임 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px', paddingRight: '14px', height: '46px' }}
            />
            <Search
              className="w-4 h-4 text-gray-400"
              style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{ padding: '0 20px', height: '46px', whiteSpace: 'nowrap' }}
          >
            <Fish className="w-4 h-4" />
            <span>낚시하기</span>
          </button>
        </div>
      </div>

      {/* ---------------- 1~3위 포디움 카드 ---------------- */}
      {filteredScores.length > 0 && !searchTerm && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}
        >
          {/* 1위 금메달 */}
          {top1 && (
            <div
              className="glass-panel glass-glow-gold"
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.18), rgba(245, 158, 11, 0.08))',
                border: '2px solid rgba(255, 215, 0, 0.7)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)'
                }}
              >
                <Crown className="w-7 h-7" />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fef08a', letterSpacing: '0.05em' }}>
                🥇 1ST PLACE CHAMPION
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '6px 0 2px' }}>
                {top1.nickname}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '14px' }}>
                장착: <strong>낚싯대 {top1.rod_level}단계</strong>
              </div>

              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#ffd700',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                }}
              >
                {top1.score}
                <span style={{ fontSize: '1rem', marginLeft: '3px', color: '#fef08a' }}>점</span>
              </div>
            </div>
          )}

          {/* 2위 은메달 */}
          {top2 && (
            <div
              className="glass-panel"
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.14), rgba(148, 163, 184, 0.06))',
                border: '1px solid rgba(226, 232, 240, 0.5)'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 0 20px rgba(226, 232, 240, 0.4)'
                }}
              >
                <Medal className="w-6 h-6" />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.05em' }}>
                🥈 2ND PLACE
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
                {top2.nickname}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '14px' }}>
                장착: <strong>낚싯대 {top2.rod_level}단계</strong>
              </div>

              <div
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  color: '#e2e8f0',
                  textShadow: '0 0 15px rgba(226, 232, 240, 0.4)'
                }}
              >
                {top2.score}
                <span style={{ fontSize: '1rem', marginLeft: '3px', color: '#cbd5e1' }}>점</span>
              </div>
            </div>
          )}

          {/* 3위 동메달 */}
          {top3 && (
            <div
              className="glass-panel"
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.16), rgba(180, 83, 9, 0.06))',
                border: '1px solid rgba(205, 127, 50, 0.5)'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #cd7f32, #b45309)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 0 20px rgba(205, 127, 50, 0.4)'
                }}
              >
                <Medal className="w-6 h-6" />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fed7aa', letterSpacing: '0.05em' }}>
                🥉 3RD PLACE
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
                {top3.nickname}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '14px' }}>
                장착: <strong>낚싯대 {top3.rod_level}단계</strong>
              </div>

              <div
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  color: '#fed7aa',
                  textShadow: '0 0 15px rgba(205, 127, 50, 0.4)'
                }}
              >
                {top3.score}
                <span style={{ fontSize: '1rem', marginLeft: '3px', color: '#fdba74' }}>점</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 전체 순위표 ---------------- */}
      <div className="glass-panel" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame className="w-5 h-5 text-cyan-400" />
            <span>전체 낚시 랭킹 순위</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.55)' }}>
            점수 높은 순 실시간 자동 정렬
          </span>
        </div>

        {filteredScores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255, 255, 255, 0.5)' }}>
            <Fish className="w-12 h-12 mx-auto mb-3 text-cyan-400 opacity-40 animate-bounce" />
            <p style={{ fontSize: '1rem', marginBottom: '16px' }}>
              {searchTerm ? '검색된 닉네임이 없습니다.' : '아직 등록된 낚시 점수가 없습니다.'}
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              첫 번째로 낚시 도전하기!
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredScores.map((record, index) => {
              const rank = index + 1;
              return (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background:
                      rank === 1
                        ? 'rgba(255, 215, 0, 0.12)'
                        : rank === 2
                        ? 'rgba(226, 232, 240, 0.1)'
                        : rank === 3
                        ? 'rgba(205, 127, 50, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border:
                      rank === 1
                        ? '1px solid rgba(255, 215, 0, 0.4)'
                        : rank === 2
                        ? '1px solid rgba(226, 232, 240, 0.3)'
                        : rank === 3
                        ? '1px solid rgba(205, 127, 50, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background:
                          rank === 1
                            ? '#ffd700'
                            : rank === 2
                            ? '#cbd5e1'
                            : rank === 3
                            ? '#cd7f32'
                            : 'rgba(255, 255, 255, 0.15)',
                        color: rank <= 3 ? '#000000' : '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {rank}
                    </div>

                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                        {record.nickname}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>
                        낚싯대 {record.rod_level || 1}단계
                        {record.created_at && (
                          <span style={{ marginLeft: '8px' }}>
                            • {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: rank === 1 ? '#ffd700' : rank === 2 ? '#e2e8f0' : rank === 3 ? '#fed7aa' : 'var(--aqua-cyan)'
                      }}
                    >
                      {record.score}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginLeft: '3px' }}>
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
