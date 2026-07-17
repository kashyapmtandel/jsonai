import Layout from './Layout';
import Home from './pages/Home';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    entry: 'src/Layout.jsx',
    children: [
      { index: true, Component: Home },
      { path: 'json-formatter', lazy: () => import('./pages/Formatter').then(m => ({ Component: m.default })) },
      { path: 'json-validator', lazy: () => import('./pages/Validator').then(m => ({ Component: m.default })) },
      { path: 'json-converter', lazy: () => import('./pages/Converter').then(m => ({ Component: m.default })) },
      { path: 'json-diff', lazy: () => import('./pages/DiffTool').then(m => ({ Component: m.default })) },
      { path: 'json-path-finder', lazy: () => import('./pages/PathFinder').then(m => ({ Component: m.default })) },
      { path: 'json-schema', lazy: () => import('./pages/SchemaGenerator').then(m => ({ Component: m.default })) },
      { path: 'json-editor', lazy: () => import('./pages/TreeEditor').then(m => ({ Component: m.default })) },
      { path: 'json-ai-assistant', lazy: () => import('./pages/AiAssistant').then(m => ({ Component: m.default })) },
      { path: 'json-type-generator', lazy: () => import('./pages/TypeGenerator').then(m => ({ Component: m.default })) },
      { path: 'json-minifier', lazy: () => import('./pages/JsonMinifier').then(m => ({ Component: m.default })) },
      { path: 'json-prompt-builder', lazy: () => import('./pages/PromptBuilder').then(m => ({ Component: m.default })) },
      { path: 'json-escape', lazy: () => import('./pages/EscapeTool').then(m => ({ Component: m.default })) },
      { path: 'privacy', lazy: () => import('./pages/PrivacyPolicy').then(m => ({ Component: m.default })) },
      { path: 'terms', lazy: () => import('./pages/TermsOfService').then(m => ({ Component: m.default })) },
      { path: 'about', lazy: () => import('./pages/About').then(m => ({ Component: m.default })) },
      { path: 'contact', lazy: () => import('./pages/Contact').then(m => ({ Component: m.default })) },
      { path: '*', lazy: () => import('./pages/NotFound').then(m => ({ Component: m.default })) },
    ],
  },
];
