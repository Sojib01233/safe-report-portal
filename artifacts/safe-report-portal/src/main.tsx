import { createRoot } from 'react-dom/client';

import App from './App';
import { setBaseUrl } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

setBaseUrl(
  'https://97572420-3466-41d8-9b8e-ea34223b0568-00-130u4o0d6yf5.pike.replit.dev'
);

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
