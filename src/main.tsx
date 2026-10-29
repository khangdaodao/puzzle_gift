import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/600.css';
import './styles/app.css';
import App from './App';
import { AudioProvider } from './audio/AudioProvider';

createRoot(document.getElementById('root')!).render(<StrictMode><AudioProvider><App /></AudioProvider></StrictMode>);
