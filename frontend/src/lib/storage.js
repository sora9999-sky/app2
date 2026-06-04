// Storage abstraction layer.
// In Electron, uses window.electronAPI (file system, JSON in userData).
// In browser preview, falls back to localStorage.

const LS_KEY = 'dinar_desk_data_v1';

export const isElectron = () =>
  typeof window !== 'undefined' && !!window.electronAPI;

export async function loadData() {
  try {
    if (isElectron()) {
      const data = await window.electronAPI.loadData();
      return data || null;
    }
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('loadData failed', e);
    return null;
  }
}

export async function saveData(data) {
  try {
    if (isElectron()) {
      await window.electronAPI.saveData(data);
      return true;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('saveData failed', e);
    return false;
  }
}

export async function exportBackup(data) {
  const payload = {
    app: 'DinarDesk',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  const json = JSON.stringify(payload, null, 2);

  if (isElectron()) {
    try {
      const res = await window.electronAPI.exportBackup(json);
      return res;
    } catch (e) {
      console.error('electron export failed', e);
    }
  }
  // Browser fallback: download as file
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  a.download = `dinar-desk-backup-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { ok: true };
}

export async function importBackupFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !parsed.data) {
          return reject(new Error('Invalid backup file'));
        }
        resolve(parsed.data);
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsText(file);
  });
}

export async function importBackupElectron() {
  if (!isElectron()) return null;
  const res = await window.electronAPI.importBackup();
  if (res && res.ok && res.json) {
    try {
      const parsed = JSON.parse(res.json);
      return parsed.data;
    } catch (e) {
      console.error('Invalid backup JSON', e);
    }
  }
  return null;
}
