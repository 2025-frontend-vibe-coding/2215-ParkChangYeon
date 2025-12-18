'use client';

// 브라우저 확장 프로그램 관련 에러를 무시하는 전역 에러 핸들러
export function setupErrorHandler() {
  if (typeof window === 'undefined') {
    return;
  }

  // Promise rejection 에러 핸들러
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';

    // 브라우저 확장 프로그램 관련 에러는 무시
    if (
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('A listener indicated an asynchronous response')
    ) {
      event.preventDefault();
      return;
    }
  };

  // 일반 에러 핸들러
  const handleError = (event: ErrorEvent) => {
    const errorMessage = event.message || '';

    // 브라우저 확장 프로그램 관련 에러는 무시
    if (
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('A listener indicated an asynchronous response')
    ) {
      event.preventDefault();
      return;
    }
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleError);

  // cleanup 함수 반환 (필요시 사용)
  return () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleError);
  };
}
