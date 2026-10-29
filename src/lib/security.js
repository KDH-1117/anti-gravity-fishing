// =========================================================================
// 클라이언트 완벽 보안 실드 (Client Security Shield)
// 1-5 낚시 부스 전용: 참가자 기기 조작, 코드 검사, 개발자도구, 새로고침, 변조 완벽 차단
// =========================================================================

export function initClientSecurity() {
  if (typeof window === 'undefined') return;

  // 1. 우클릭 (Context Menu) 완벽 차단
  window.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    { capture: true }
  );

  // 2. 개발자 도구 및 소스 보기 단축키 전면 차단
  window.addEventListener(
    'keydown',
    (e) => {
      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Element selector)
      // Ctrl + Shift + K (Firefox console)
      if (e.ctrlKey && e.shiftKey) {
        const k = (e.key || '').toUpperCase();
        if (['I', 'J', 'C', 'K'].includes(k)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Ctrl + U (소스 보기)
      // Ctrl + S (페이지 저장)
      // Ctrl + P (인쇄)
      if (e.ctrlKey) {
        const k = (e.key || '').toUpperCase();
        if (['U', 'S', 'P'].includes(k)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Alt + Left / Alt + Right (브라우저 뒤로가기/앞으로가기 단축키 방지)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    { capture: true }
  );

  // 3. 텍스트 드래그 및 선택 차단 (단, input, textarea는 정상 허용)
  window.addEventListener(
    'selectstart',
    (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        return false;
      }
    },
    { capture: true }
  );

  // 4. 이미지 및 요소 드래그 앤 드롭 차단
  window.addEventListener(
    'dragstart',
    (e) => {
      e.preventDefault();
      return false;
    },
    { capture: true }
  );

  // 5. 복사/잘라내기 차단 (입력창 제외)
  window.addEventListener(
    'copy',
    (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        return false;
      }
    },
    { capture: true }
  );

  // 6. 콘솔 보호 및 경고 출력
  try {
    const bannerStyle = 'color: #00f2fe; background: #050b14; font-size: 16px; font-weight: bold; padding: 8px 12px; border: 1px solid #00f2fe; border-radius: 6px;';
    const warnStyle = 'color: #f87171; font-size: 13px; font-weight: bold;';
    console.log('%c🔒 1-5 낚시 부스 클라이언트 보안 모드 가동 중', bannerStyle);
    console.log('%c부스 기기 무단 조작 및 스크립트 실행은 엄격히 차단되며 즉시 실격 처리됩니다.', warnStyle);

    // 프로덕션 모드에서는 콘솔 오염 방지
    if (import.meta.env.PROD) {
      const noop = () => {};
      window.console.debug = noop;
      window.console.info = noop;
    }
  } catch (err) {
    // ignore
  }

  // 7. 창 크기 기반 개발자 도구 오픈 감지 시 콘솔 자동 클리어
  let devtoolsTriggered = false;
  window.addEventListener('resize', () => {
    const threshold = 160;
    const isOpened =
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold;
    if (isOpened && !devtoolsTriggered) {
      devtoolsTriggered = true;
      try {
        console.clear();
        console.log('%c[보안 알림] 무단 조작이 감지되었습니다.', 'color: #f87171; font-weight: bold;');
      } catch (e) {}
    }
  });
}
