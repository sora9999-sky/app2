import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Globe,
  Info,
  Trash2,
  HardDrive,
  Monitor,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { PageHeader, Card, PrimaryButton, GhostButton } from '../components/UI';
import {
  exportBackup,
  importBackupFromFile,
  importBackupElectron,
  isElectron,
} from '../lib/storage';

export default function SettingsPage() {
  const { state, tr, lang, setLanguage, replaceState, resetAll, showToast } = useApp();
  const fileRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const doExport = async () => {
    try {
      await exportBackup(state);
      showToast(tr('settings.exportSuccess'), 'success');
    } catch (e) {
      showToast(tr('settings.importFail'), 'error');
    }
  };

  const doImport = async () => {
    if (isElectron()) {
      try {
        const data = await importBackupElectron();
        if (data) setPendingImport(data);
      } catch (e) {
        showToast(tr('settings.importFail'), 'error');
      }
    } else {
      fileRef.current?.click();
    }
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = await importBackupFromFile(f);
      setPendingImport(data);
    } catch (err) {
      console.error(err);
      showToast(tr('settings.importFail'), 'error');
    }
  };

  return (
    <div data-testid="settings-page">
      <PageHeader title={tr('settings.title')} subtitle={tr('tagline')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div className="font-bold text-slate-800">{tr('settings.language')}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              data-testid="lang-en"
              className={`flex-1 py-2 rounded-lg font-medium border ${
                lang === 'en'
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tr('settings.english')}
            </button>
            <button
              onClick={() => setLanguage('ar')}
              data-testid="lang-ar"
              className={`flex-1 py-2 rounded-lg font-medium border ${
                lang === 'ar'
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tr('settings.arabic')}
            </button>
          </div>
        </Card>

        {/* Storage info */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              {isElectron() ? <HardDrive size={20} /> : <Monitor size={20} />}
            </div>
            <div className="font-bold text-slate-800">
              {tr('settings.storageLocation')}
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {isElectron()
              ? tr('settings.storageElectron')
              : tr('settings.storageBrowser')}
          </div>
        </Card>
      </div>

      {/* Backup */}
      <Card className="p-5 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Download size={20} />
          </div>
          <div className="font-bold text-slate-800">{tr('settings.backup')}</div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <PrimaryButton onClick={doExport} data-testid="export-backup-btn">
            <span className="inline-flex items-center gap-2">
              <Download size={16} /> {tr('settings.exportBackup')}
            </span>
          </PrimaryButton>
          <GhostButton onClick={doImport} data-testid="import-backup-btn">
            <span className="inline-flex items-center gap-2">
              <Upload size={16} /> {tr('settings.importBackup')}
            </span>
          </GhostButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onFile}
            data-testid="import-file-input"
          />
        </div>
      </Card>

      {/* About */}
      <Card className="p-5 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Info size={20} />
          </div>
          <div className="font-bold text-slate-800">{tr('settings.about')}</div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{tr('settings.aboutText')}</p>
      </Card>

      {/* Danger */}
      <Card className="p-5 mt-4 border-rose-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Trash2 size={20} />
          </div>
          <div className="font-bold text-rose-700">{tr('settings.dangerZone')}</div>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          data-testid="reset-all-btn"
          className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold"
        >
          {tr('settings.resetAll')}
        </button>
      </Card>

      <ConfirmDialog
        open={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        onConfirm={() => {
          if (pendingImport) {
            replaceState(pendingImport);
            showToast(tr('settings.importSuccess'), 'success');
          }
        }}
        title={tr('settings.importBackup')}
        message={tr('settings.importConfirm')}
        danger
      />
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll();
          showToast(tr('common.clear') + ' ✓', 'success');
        }}
        title={tr('settings.resetAll')}
        message={tr('settings.resetConfirm')}
        danger
      />
    </div>
  );
}
