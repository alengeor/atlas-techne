import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { LanguageProvider } from './i18n/Language';
import './styles/app.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element is missing');
createRoot(root).render(<StrictMode><LanguageProvider><App /></LanguageProvider></StrictMode>);
