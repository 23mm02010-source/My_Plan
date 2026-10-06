import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Sparkles,
  X,
  Server,
  Smartphone,
  Laptop,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FirebaseConfigParams, getSavedCustomConfig } from '../config/firebase';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({ isOpen, onClose }) => {
  const { isCloudConnected, cloudStatus, saveCloudConfig, resetCloudConfig } = useAuth();

  const [rawConfigInput, setRawConfigInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  const [activeTab, setActiveTab] = useState<'paste' | 'manual' | 'guide'>('paste');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  // Auto-fill from saved custom config if available
  const handleOpenInit = () => {
    const saved = getSavedCustomConfig();
    if (saved) {
      setApiKey(saved.apiKey || '');
      setProjectId(saved.projectId || '');
      setAuthDomain(saved.authDomain || '');
      setStorageBucket(saved.storageBucket || '');
      setMessagingSenderId(saved.messagingSenderId || '');
      setAppId(saved.appId || '');
    }
  };

  // Parse pasted Firebase config snippet like:
  // const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... };
  const parsePastedConfig = (text: string): FirebaseConfigParams | null => {
    try {
      // 1. Try JSON parse
      const parsedJson = JSON.parse(text);
      if (parsedJson.apiKey && parsedJson.projectId) {
        return {
          apiKey: parsedJson.apiKey,
          authDomain: parsedJson.authDomain || `${parsedJson.projectId}.firebaseapp.com`,
          projectId: parsedJson.projectId,
          storageBucket: parsedJson.storageBucket || `${parsedJson.projectId}.appspot.com`,
          messagingSenderId: parsedJson.messagingSenderId || '',
          appId: parsedJson.appId || ''
        };
      }
    } catch {
      // Not direct JSON, parse JavaScript object syntax using regex
    }

    const extractKey = (key: string) => {
      const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    const extractedApiKey = extractKey('apiKey');
    const extractedProjectId = extractKey('projectId');
    const extractedAuthDomain = extractKey('authDomain');
    const extractedStorageBucket = extractKey('storageBucket');
    const extractedSenderId = extractKey('messagingSenderId');
    const extractedAppId = extractKey('appId');

    if (extractedApiKey && extractedProjectId) {
      return {
        apiKey: extractedApiKey,
        projectId: extractedProjectId,
        authDomain: extractedAuthDomain || `${extractedProjectId}.firebaseapp.com`,
        storageBucket: extractedStorageBucket || `${extractedProjectId}.appspot.com`,
        messagingSenderId: extractedSenderId || '',
        appId: extractedAppId || ''
      };
    }

    return null;
  };

  const handleConnectPasted = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const parsed = parsePastedConfig(rawConfigInput);
    if (!parsed) {
      setError('Could not extract Firebase credentials. Please make sure the pasted text contains apiKey and projectId.');
      setIsLoading(false);
      return;
    }

    const res = await saveCloudConfig(parsed);
    setIsLoading(false);
    if (res.success) {
      setSuccess('Cloud Database connected successfully! Your progress will now sync across all devices.');
    } else {
      setError(res.error || 'Failed to connect to Firebase.');
    }
  };

  const handleConnectManual = async () => {
    setError(null);
    setSuccess(null);

    if (!apiKey.trim() || !projectId.trim()) {
      setError('API Key and Project ID are required.');
      return;
    }

    setIsLoading(true);
    const config: FirebaseConfigParams = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    const res = await saveCloudConfig(config);
    setIsLoading(false);
    if (res.success) {
      setSuccess('Cloud Database connected successfully! Syncing your progress across devices.');
    } else {
      setError(res.error || 'Failed to connect.');
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Cloud Database? The app will return to local storage mode.')) {
      resetCloudConfig();
      setSuccess('Disconnected from Cloud Database. Returned to local storage.');
      setError(null);
    }
  };

  const envSample = `# Add these to your Vercel Project Settings > Environment Variables:
VITE_FIREBASE_API_KEY=${apiKey || 'your_api_key'}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain || `${projectId || 'your_project_id'}.firebaseapp.com`}
VITE_FIREBASE_PROJECT_ID=${projectId || 'your_project_id'}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket || `${projectId || 'your_project_id'}.appspot.com`}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId || 'your_sender_id'}
VITE_FIREBASE_APP_ID=${appId || 'your_app_id'}`;

  const copyEnvToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-card-border/80 bg-surface-200/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Cloud Database & Multi-Device Sync
              </h2>
              <p className="text-xs text-slate-400">
                Continue your exact progress across mobile phones, laptops, and tablets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-3.5 bg-slate-900/60 border-b border-card-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-medium">Status:</span>
            {isCloudConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected (Project: {cloudStatus.projectId})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Local Mode (No cloud database connected)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-primary-400" /> Desktop
            </span>
            <span>⟷</span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Mobile
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'paste'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Firebase Config
            </button>
            <button
              onClick={() => { setActiveTab('manual'); handleOpenInit(); }}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'manual'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Manual Fields & Vercel Env
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'guide'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Free 2-Minute Setup Guide
            </button>
          </div>

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" /> Quick Connect:
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Go to Firebase Console &gt; Project Settings &gt; General &gt; Your apps &gt; Web app. Copy and paste the whole <code className="text-primary-300 bg-slate-950 px-1 py-0.5 rounded">firebaseConfig</code> code block below:
                </p>
              </div>

              <textarea
                rows={7}
                value={rawConfigInput}
                onChange={(e) => setRawConfigInput(e.target.value)}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "study-plan.firebaseapp.com",\n  projectId: "study-plan",\n  storageBucket: "study-plan.appspot.com",\n  messagingSenderId: "...",\n  appId: "..."\n};`}
                className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                {isCloudConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 rounded-xl transition-colors"
                  >
                    Disconnect Cloud
                  </button>
                ) : <div />}

                <button
                  type="button"
                  disabled={isLoading || !rawConfigInput.trim()}
                  onClick={handleConnectPasted}
                  className="px-5 py-2.5 text-xs font-semibold bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl shadow-md shadow-primary-600/30 transition-all flex items-center gap-2"
                >
                  {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Connect & Save to Cloud</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 font-medium mb-1 block">API Key *</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium mb-1 block">Project ID *</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="my-study-plan"
                    className="w-full p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium mb-1 block">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="project-id.firebaseapp.com"
                    className="w-full p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium mb-1 block">App ID</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleConnectManual}
                  disabled={isLoading || !apiKey.trim() || !projectId.trim()}
                  className="px-5 py-2.5 text-xs font-semibold bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
                >
                  Save & Connect
                </button>
              </div>

              {/* Vercel Environment Variables Code Block */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Vercel Environment Variables Format
                  </span>
                  <button
                    type="button"
                    onClick={copyEnvToClipboard}
                    className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedEnv ? 'Copied!' : 'Copy for Vercel'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {envSample}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary-400" />
                  How to create your Free Firebase Database (100% Free Forever)
                </h3>

                <ol className="space-y-2.5 list-decimal list-inside text-slate-300">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 underline font-semibold inline-flex items-center gap-1"
                    >
                      console.firebase.google.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    with your Google account.
                  </li>
                  <li>Click <strong>&quot;Add project&quot;</strong> and name it (e.g. <code>my-study-plan</code>). Disable Google Analytics (optional) and click <strong>Create</strong>.</li>
                  <li>
                    In the left sidebar, click <strong>Build &gt; Authentication</strong> &gt; <strong>Get started</strong> &gt; Select <strong>Email/Password</strong> and toggle <strong>Enable</strong> &gt; Save.
                  </li>
                  <li>
                    In the left sidebar, click <strong>Build &gt; Firestore Database</strong> &gt; <strong>Create database</strong> &gt; Choose <strong>Start in test mode</strong> &gt; Next &gt; Enable.
                  </li>
                  <li>
                    Click the <strong>Project Settings gear icon</strong> (top left) &gt; scroll down to <strong>&quot;Your apps&quot;</strong> &gt; Click the Web icon <code>&lt;/&gt;</code> &gt; Register app.
                  </li>
                  <li>
                    Copy the <code>firebaseConfig</code> block and paste it in the <strong>&quot;Paste Firebase Config&quot;</strong> tab!
                  </li>
                </ol>
              </div>

              <p className="text-[11px] text-slate-400">
                ✨ Once connected, any account you create on your desktop or phone will be stored centrally in Cloud Firestore. Logging in with that email & password on any phone or computer will instantly load your exact progress, streak, and completed problems!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-card-border/80 bg-surface-200/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
