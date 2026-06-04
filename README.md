# Dinar Desk · Offline Personal Accounting (IQD)

**Dinar Desk** is a free, lifetime-usable, fully **offline** personal accounting desktop app for managing money in **Iraqi Dinar (IQD)**. Built with React + Electron. No internet, no cloud, no accounts. Your data lives only on your computer.

![Dinar Desk](https://img.shields.io/badge/platform-Windows-blue) ![Offline](https://img.shields.io/badge/network-offline-success) ![Currency](https://img.shields.io/badge/currency-IQD-orange) ![License](https://img.shields.io/badge/license-Free-brightgreen)

## Features

- 💰 **Safe** — Track your cash balance, add daily revenue with auto-dating, view and clear revenue history.
- 👥 **Supplier Accounts** — Create supplier accounts (auto-issued IDs), record bills (left column) and payments (right column), each color-coded.
  - Bills do **not** affect the safe.
  - Payments **deduct** from the safe.
  - Export account statements as professional **PDF**.
- 🔔 **Notifications** — Get alerted 14 days before any bill is due, repeated every 2 days until paid. Click to jump to the bill. Disable per bill.
- 🧾 **Expenses** — Custom expense types, log expenses with date, browse and clear history.
- 🌐 **Bilingual** — English ↔ العربية with full RTL layout.
- 💾 **Backup / Restore** — One-click export/import to/from a single JSON file.
- 🔒 **100% Offline** — Data stored locally as JSON in your Windows user folder.

## Download / Build the EXE via GitHub Actions

This repo is configured to build a Windows `.exe` automatically using GitHub Actions.

### How to get your EXE:

1. **Push** this repository to GitHub (or create a new repo and push these files).
2. Go to the **Actions** tab on your GitHub repository.
3. Select the workflow **“Build Windows EXE”** (it runs automatically on every push to `main`/`master`, on tags `v*`, or manually).
4. To trigger manually: click **“Run workflow”** → select branch → **Run**.
5. Wait ≈ 5–10 minutes for the build to finish.
6. Click the completed run → scroll to **Artifacts** at the bottom.
7. Download:
   - **`DinarDesk-Windows-Installer`** → a setup `.exe` that installs Dinar Desk.
   - **`DinarDesk-Portable`** → a single-file portable `.exe` you can run from anywhere (no install required).

Both EXEs are fully offline and work without internet.

### Triggering a release build with a version tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the workflow and produce versioned artifacts.

## Project Structure

```
/frontend
  /src              # React app (UI for all 4 screens)
  /electron
    main.js         # Electron main process (window + JSON file IO)
    preload.js      # Secure IPC bridge
  electron-builder.json # Windows packaging config
  package.json
/.github/workflows
  build-windows.yml # CI to produce Windows EXE
```

## Where is my data stored?

When running the installed/portable EXE, data is saved to:

```
%APPDATA%\Dinar Desk\dinar-desk-data.json
```

You can copy this file at any time as a manual backup, or use the built-in **Settings → Export Backup** option to save a JSON snapshot anywhere on your computer.

## Local Development

If you want to develop the app locally (optional):

```bash
cd frontend
yarn install

# Run the React UI in the browser (preview)
yarn start

# In a second terminal, run the Electron shell (loads from localhost:3000)
yarn electron:dev

# Or build the EXE locally (requires Windows or Wine)
yarn electron:build
```

## License

Free to use forever. No subscription, no telemetry, no online accounts required.
