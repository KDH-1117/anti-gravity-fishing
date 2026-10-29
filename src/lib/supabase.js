import { createClient } from '@supabase/supabase-js';

// 기본 단계별 확률 설정값 (1단계~4단계)
export const DEFAULT_STAGE_PROBABILITIES = {
  1: {
    display: { success: 60, keep: 40, downgrade: 0 },
    hidden: { success: 50, keep: 50, downgrade: 0 }
  },
  2: {
    display: { success: 50, keep: 30, downgrade: 20 },
    hidden: { success: 35, keep: 35, downgrade: 30 }
  },
  3: {
    display: { success: 40, keep: 30, downgrade: 30 },
    hidden: { success: 25, keep: 35, downgrade: 40 }
  },
  4: {
    display: { success: 30, keep: 30, downgrade: 40 },
    hidden: { success: 15, keep: 35, downgrade: 50 }
  }
};

// 기본 설정값
export const DEFAULT_SETTINGS = {
  id: 1,
  time_limit: 60,
  cost_text: '1 ESTA',
  display_success: 50,
  display_keep: 30,
  display_downgrade: 20,
  hidden_success: 25,
  hidden_keep: 35,
  hidden_downgrade: 40,
  stage_probabilities: DEFAULT_STAGE_PROBABILITIES,
  auth_password: '12345678',
  admin_password: '12345678'
};

const BROADCAST_CHANNEL_NAME = 'fish_booth_sync_v1';
const LOCAL_STORAGE_SCORES_KEY = 'fish_booth_scores_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'fish_booth_settings_v1';
const LOCAL_STORAGE_CONFIG_KEY = 'fish_booth_custom_supabase_config';

// Supabase 클라이언트 초기화 함수
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || 'https://woctlwqxnitskqcddzno.supabase.co';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY3Rsd3F4bml0c2txY2Rkem5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTg0NTcsImV4cCI6MjEwODIzNDQ1N30.GsPkeUafOah1gUzAzfbj0Hi8lkrt-iuotlTqzj8r7HM';
  let custom = null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (raw) custom = JSON.parse(raw);
  } catch (e) {
    console.warn('Config parse error', e);
  }

  const url = custom?.url || envUrl;
  const key = custom?.key || envKey;
  return { url: url.trim(), key: key.trim() };
}

let supabaseInstance = null;
const creds = getSupabaseCredentials();

if (creds.url && creds.key && creds.url.startsWith('http')) {
  try {
    supabaseInstance = createClient(creds.url, creds.key);
  } catch (err) {
    console.error('Supabase initialization error:', err);
    supabaseInstance = null;
  }
}

export const supabase = supabaseInstance;

// 로컬 동기화용 브로드캐스트 채널
let localBroadcast = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  localBroadcast = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

// ----------------- DB / 로컬 데이터 접근 함수 -----------------

// 1. 설정 불러오기
export async function getSettings() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('booth_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) {
        const merged = {
          ...DEFAULT_SETTINGS,
          ...data,
          stage_probabilities: data.stage_probabilities || DEFAULT_STAGE_PROBABILITIES
        };
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn('Supabase getSettings fallback to local:', e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        stage_probabilities: parsed.stage_probabilities || DEFAULT_STAGE_PROBABILITIES
      };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

// 2. 설정 업데이트
export async function updateSettings(newSettings) {
  const payload = {
    ...newSettings,
    id: 1,
    updated_at: new Date().toISOString()
  };

  // 로컬 저장 & 브로드캐스트
  localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(payload));
  if (localBroadcast) {
    localBroadcast.postMessage({ type: 'SETTINGS_UPDATED', data: payload });
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('booth_settings')
        .update(payload)
        .eq('id', 1);

      if (error) {
        console.warn('Supabase update failed, attempting upsert:', error);
        const { error: upsertErr } = await supabase
          .from('booth_settings')
          .upsert(payload);
        if (upsertErr) {
          console.error('Supabase upsert also failed:', upsertErr);
          throw upsertErr;
        }
      }
    } catch (e) {
      console.error('Supabase updateSettings fatal error:', e);
      throw e;
    }
  }

  return payload;
}

// 3. 점수 목록 불러오기
export async function getScores() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('booth_scores')
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true });
      if (!error && data) {
        localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Supabase getScores fallback to local:', e);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return parsed.sort((a, b) => b.score - a.score);
    }
  } catch (e) {
    // fallback
  }
  return [];
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 4. 새 참가자 점수 등록
export async function addScore(record) {
  const newRecord = {
    id: generateUUID(),
    nickname: record.nickname,
    student_id: record.student_id,
    student_name: record.student_name,
    rod_level: Number(record.rod_level) || 1,
    score: Number(record.score) || 0,
    created_at: new Date().toISOString()
  };

  // 로컬 스토리지에 즉시 추가
  let currentList = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
    if (raw) currentList = JSON.parse(raw);
  } catch (e) {}

  currentList.unshift(newRecord);
  currentList.sort((a, b) => b.score - a.score);
  localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(currentList));

  // 브로드캐스트로 다른 탭에 즉시 전파
  if (localBroadcast) {
    localBroadcast.postMessage({ type: 'SCORE_ADDED', data: newRecord });
  }

  // Supabase에 저장
  if (supabase) {
    try {
      const { error } = await supabase
        .from('booth_scores')
        .insert([newRecord]);
      if (error) console.error('Supabase addScore error:', error);
    } catch (e) {
      console.warn('Supabase addScore error:', e);
    }
  }

  return newRecord;
}

// 5. 점수 단건 삭제
export async function deleteScore(id) {
  let currentList = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
    if (raw) currentList = JSON.parse(raw);
  } catch (e) {}

  currentList = currentList.filter(item => item.id !== id);
  localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(currentList));

  if (localBroadcast) {
    localBroadcast.postMessage({ type: 'SCORE_DELETED', data: { id } });
  }

  if (supabase) {
    try {
      await supabase.from('booth_scores').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }
}

// 6. 점수 전체 초기화
export async function resetAllScores() {
  localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify([]));

  if (localBroadcast) {
    localBroadcast.postMessage({ type: 'SCORES_RESET' });
  }

  if (supabase) {
    try {
      await supabase.from('booth_scores').delete().neq('score', -999999);
    } catch (e) {
      console.warn('Supabase reset error:', e);
    }
  }
}

// 7. 실시간 리스너 구독 (Supabase Realtime + BroadcastChannel 크로스탭)
export function subscribeBoothRealtime(onSettingsChange, onScoresChange) {
  const unsubscribers = [];

  // 브로드캐스트 채널 리스너
  if (localBroadcast) {
    const handleBroadcast = (event) => {
      const { type, data } = event.data || {};
      if (type === 'SETTINGS_UPDATED' && onSettingsChange) {
        onSettingsChange(data);
      } else if ((type === 'SCORE_ADDED' || type === 'SCORE_DELETED' || type === 'SCORES_RESET') && onScoresChange) {
        getScores().then(onScoresChange);
      }
    };
    localBroadcast.addEventListener('message', handleBroadcast);
    unsubscribers.push(() => localBroadcast.removeEventListener('message', handleBroadcast));
  }

  // 윈도우 스토리지 변경 감지
  const handleStorage = (e) => {
    if (e.key === LOCAL_STORAGE_SETTINGS_KEY && onSettingsChange) {
      try { onSettingsChange(JSON.parse(e.newValue)); } catch (err) {}
    }
    if (e.key === LOCAL_STORAGE_SCORES_KEY && onScoresChange) {
      try { onScoresChange(JSON.parse(e.newValue)); } catch (err) {}
    }
  };
  window.addEventListener('storage', handleStorage);
  unsubscribers.push(() => window.removeEventListener('storage', handleStorage));

  // Supabase Realtime 채널
  if (supabase) {
    const channel = supabase.channel('booth_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booth_settings' }, (payload) => {
        if (payload.new && onSettingsChange) {
          onSettingsChange(payload.new);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booth_scores' }, () => {
        if (onScoresChange) {
          getScores().then(onScoresChange);
        }
      })
      .subscribe();

    unsubscribers.push(() => {
      supabase.removeChannel(channel);
    });
  }

  return () => {
    unsubscribers.forEach(fn => fn());
  };
}
