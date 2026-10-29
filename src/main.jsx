import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initClientSecurity } from './lib/security';

// 클라이언트 보안 실드 즉시 가동 (우클릭, DevTools, 단축키, 드래그 방지)
initClientSecurity();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
