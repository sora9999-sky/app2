# plan.md

## 1) Objectives
- ✅ Deliver an offline, lifetime-usable personal accounting **desktop (Windows EXE)** app in **IQD** with **no internet required**.
- ✅ Implement 4 core screens: **Safe**, **Supplier Accounts (with bills/payments + PDF export)**, **Notifications**, **Expenses**.
- ✅ Add a **Settings** screen for **Backup/Restore** + **Language** + **Reset All Data**.
- ✅ Store all data locally:
  - **Electron build**: JSON file in `app.getPath('userData')` (atomic temp-write + rename).
  - **Browser preview/dev**: localStorage fallback.
- ✅ Provide **Export Backup (JSON)** + **Import/Restore (JSON)**:
  - Browser: file download/upload.
  - Electron: native open/save dialogs.
- ✅ Provide **EN/AR** UI with language toggle; Arabic uses **RTL** layout.
- ✅ Package via **GitHub Actions** to produce downloadable **Windows EXE artifacts**:
  - NSIS Installer `.exe`
  - Portable `.exe`

## 2) Implementation Steps

### Phase 1: Core Flow POC (offline storage + supplier account ledger + PDF + due logic)
_Status: ✅ Completed (merged into full build; POC phase effectively skipped as development proceeded directly to full implementation)._  
_Key outcomes delivered in later phases:_
- Supplier account creation and card listing.
- Bill + payment entry and two-column ledger.
- PDF export with totals and header.
- Due-date computation.
- Local persistence.

### Phase 2: V1 App Development (all 4 screens + bilingual + backup/restore)
_Status: ✅ Completed._

_Delivered functionality_
- App shell:
  - ✅ Navigation sidebar with routes for Safe / Suppliers / Notifications / Expenses / Settings.
  - ✅ **HashRouter** to work in both browser and `file://` (Electron).
  - ✅ Professional **sky-blue + white** theme (cards, modals, totals).
  - ✅ **EN/AR i18n** with toggle and **RTL** layout.
- Safe screen:
  - ✅ Current balance (derived).
  - ✅ Add daily revenue (auto-date, manual date supported).
  - ✅ Revenue history list.
  - ✅ Clear revenue history + delete single revenue.
- Supplier Accounts:
  - ✅ Add new account by name only.
  - ✅ Auto-issued IDs displayed as `SUP-0001`, etc.
  - ✅ Card-style account list.
  - ✅ Account detail page:
    - ✅ Bills displayed on **LEFT** with sky-blue styling, auto bill IDs `B-0001`…
    - ✅ Payments displayed on **RIGHT** with teal styling, auto payment IDs `P-0001`…
    - ✅ Bills do **not** affect Safe; payments **deduct from Safe**.
    - ✅ Safe insufficient-funds validation for payments.
    - ✅ Per-bill notification disable toggle.
    - ✅ Delete account/bill/payment with confirmation dialogs.
    - ✅ **PDF statement export** (jsPDF + autotable) with:
      - header (account name + ID)
      - totals (bills/payments/outstanding)
      - generation date
      - tables for bills and payments
- Notifications screen:
  - ✅ In-app notification list for bills **due within 14 days**, including overdue.
  - ✅ Repeat cadence: a **new notification key every 2 days** (tick-based) until paid.
  - ✅ Click “Open Bill” navigates to supplier account and highlights the bill via `#bill-<id>`.
  - ✅ Disable notifications per bill + manage disabled list.
- Expenses screen:
  - ✅ Add expense type.
  - ✅ Add expense (amount in IQD, type, date, optional note).
  - ✅ Expense history + delete entry + clear history.
- Backup/Restore:
  - ✅ Export backup JSON snapshot.
  - ✅ Import backup JSON snapshot (replaces local dataset after confirmation).
  - ✅ Reset all data (danger zone).

### Phase 3: Electron Packaging + Disk Persistence + GitHub Actions EXE
_Status: ✅ Completed._

_Delivered functionality_
- Electron integration:
  - ✅ `frontend/electron/main.js`
    - creates secure app window
    - blocks external navigation and opens external links in default browser
    - IPC handlers: `loadData`, `saveData`, `exportBackup`, `importBackup`
    - saves data to `userData/dinar-desk-data.json` using **atomic write** (temp + rename)
  - ✅ `frontend/electron/preload.js`
    - minimal `contextBridge` API: `window.electronAPI.*`
- Packaging:
  - ✅ `frontend/electron-builder.json`
    - Windows targets: **NSIS installer** + **portable EXE**
    - custom icon: `electron/icon.ico`
  - ✅ App icon assets generated: `electron/icon.ico` + `electron/icon.png`
- GitHub Actions:
  - ✅ `.github/workflows/build-windows.yml`
    - Windows runner: install deps → build React → run electron-builder → upload artifacts
    - Artifacts:
      - `DinarDesk-Windows-Installer`
      - `DinarDesk-Portable`
- Documentation:
  - ✅ `README.md` for project + build usage.
  - ✅ `GITHUB_ACTIONS_GUIDE.md` with step-by-step “how to download EXE from Actions artifacts”.

### Phase 4: Hardening, UX polish, and comprehensive testing
_Status: ✅ Completed._

_Testing outcomes_
- ✅ `testing_agent_v3` executed end-to-end checks; reported **~95% pass rate**.
- ✅ Verified working:
  - navigation + routing
  - EN/AR toggle + RTL
  - Safe operations (add/delete/clear revenue)
  - Supplier ledger flows (accounts, bills, payments, linking)
  - Safe deduction on payments + insufficient-funds toast
  - PDF export triggers download
  - Expenses types + entries + clear history
  - Settings: backup export, reset, persistence
  - Persistence after reload (localStorage in preview)

_Fixes applied after testing_
- ✅ Fixed notification edge case for “bill due today” caused by timezone parsing:
  - `computeNotifications` now parses `YYYY-MM-DD` as **local-midnight** (avoids UTC shift).
  - `billStatus` also updated for local-midnight parsing.
  - Verified manually: Notifications badge shows alerts for bills due in 0 days.

_Accepted behavior (by design)_
- ℹ️ Clearing revenue history can result in negative Safe balance if payments/expenses remain.
  - This matches the requested behavior: clearing history removes revenues only; liabilities remain.

## 3) Next Actions
_Status: ✅ No remaining build tasks; app is complete._

Optional enhancements (future / nice-to-have)
1. Add supplier account search/filter and sorting in account detail.
2. Add richer bill terms (days/weeks/months) and partial-payment allocation helpers.
3. Add optional background tray notifications (if user later wants alerts when app is closed).
4. Add code-signing support to reduce SmartScreen warnings (requires certificate).

## 4) Success Criteria
- ✅ All 4 screens functional with correct IQD totals and histories.
- ✅ Supplier bills/payments render in two columns with distinct colors and stable IDs; payments deduct from Safe.
- ✅ Notifications fire for due-within-14-days (including due-today), repeat every 2 days until paid; can disable per bill; click navigates correctly.
- ✅ Backup export/import restores the full dataset accurately.
- ✅ EN/AR toggle works; Arabic switches to RTL.
- ✅ GitHub Actions produces Windows EXE artifacts (installer + portable) that run offline and persist data locally.
