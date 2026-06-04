# plan.md

## 1) Objectives
- Deliver an offline, lifetime-usable personal accounting **desktop (Windows EXE)** app in **IQD** with **no internet required**.
- Implement 4 screens: **Safe**, **Supplier Accounts (with bills/payments + PDF export)**, **Notifications**, **Expenses**.
- Store all data **locally as JSON** in Electron app data folder; provide **Export Backup (JSON)** + **Import/Restore (JSON)**.
- Provide **EN/AR** UI with language toggle; Arabic uses **RTL**.
- Package via **GitHub Actions** to produce a downloadable **.exe artifact**.

## 2) Implementation Steps

### Phase 1: Core Flow POC (offline storage + supplier account ledger + PDF + due logic)
_User stories_
1. As a user, I can create a supplier account and see it listed as a card.
2. As a user, I can add a bill with due-in months and see it on the left with a unique ID.
3. As a user, I can add a payment linked to a bill and see it on the right with a unique ID and different color.
4. As a user, I can export a supplier account statement PDF with header + totals.
5. As a user, I can close/reopen the app and all data persists locally.

_Steps_
- Build minimal data model + repository:
  - Entities: SafeRevenue, SupplierAccount, Bill, Payment, ExpenseType, Expense, NotificationState.
  - ID generation (monotonic or UUID) with separate sequences for bills vs payments.
- Implement **storage abstraction**:
  - Browser preview: localStorage.
  - Electron: JSON file read/write via IPC (userData path).
- Implement Supplier Accounts POC UI:
  - Accounts list + create account.
  - Account page: bills column (left), payments column (right), add-bill/add-payment dialogs.
  - Compute derived totals (total bills, total payments, outstanding by bill).
- Implement PDF export POC:
  - jsPDF + autotable; include header (name/ID, totals, generation date) + tables.
- Implement due-date computation:
  - Bill has date + “time until payment” (months/weeks/days MVP: months).
  - Compute dueDate; mark bill paid when fully covered by linked payments.
- POC validation in preview (and then in Electron run) before expanding.

### Phase 2: V1 App Development (all 4 screens + bilingual + backup/restore)
_User stories_
1. As a user, I can see my Safe balance and add daily revenue with auto date.
2. As a user, I can clear revenue history and the balance stays correct.
3. As a user, I can add expenses by type and date and see expense history.
4. As a user, I can export a JSON backup and later restore it to recover everything.
5. As a user, I can switch EN/AR and the layout switches to RTL in Arabic.

_Steps_
- App shell:
  - Routing: Safe / Supplier Accounts / Notifications / Expenses.
  - Theme: sky-blue + white, consistent cards, tables, dialogs.
  - i18n: EN/AR dictionary + toggle; set `dir=rtl` for Arabic.
- Safe screen:
  - Balance display; Add Revenue modal (amount); append to history with current date/time.
  - Clear history action.
- Supplier Accounts:
  - Full ledger behavior: bills don’t change safe; payments deduct from safe.
  - Enforce safe can’t go negative (block or confirm with warning).
  - Bill/payment linking UI (select bill ID; show outstanding).
  - PDF export polished.
- Expenses screen:
  - Manage expense types; add expense; list + clear history.
- Backup/Restore:
  - Export: download JSON snapshot (single file).
  - Import: select JSON, validate schema/version, replace local dataset.
- Conclude Phase 2 with 1 round of **testing_agent_v3** end-to-end tests in browser preview.

### Phase 3: Electron Packaging + Disk Persistence + GitHub Actions EXE
_User stories_
1. As a user, my data is saved under my Windows user profile automatically.
2. As a user, I can install/run the EXE without internet.
3. As a developer, I can push to GitHub and get a Windows EXE artifact from Actions.
4. As a user, backup export/import works in the packaged app.
5. As a user, notifications appear while the app is open.

_Steps_
- Electron integration:
  - `main` process: create window; handle IPC for read/write JSON to `app.getPath('userData')`.
  - `preload`: expose `electronAPI` (loadData/saveData/exportBackup/importBackup/showNotification).
- Notifications engine (app-open only):
  - On app start + periodic timer (e.g., hourly): find bills due within 14 days and not paid.
  - Create notification items; resend every 2 days until paid.
  - Click notification navigates to supplier account + bill anchor; allow disable per bill.
- GitHub Actions:
  - Workflow to install deps, build React, run electron-builder, upload artifact.
  - Verify artifact includes .exe (and necessary assets).
- Conclude Phase 3 with testing_agent_v3 basic regression (backup, supplier ledger, expenses) + manual checklist for Electron build.

### Phase 4: Hardening, UX polish, and comprehensive testing
_User stories_
1. As a user, I can quickly search/filter supplier bills/payments in an account.
2. As a user, I can’t accidentally delete data without confirmation.
3. As a user, I can see clear validation errors for missing/invalid amounts/dates.
4. As a user, I can identify overdue vs due-soon vs paid bills at a glance.
5. As a user, I can trust totals (safe balance, supplier totals, expenses totals) are consistent.

_Steps_
- Validation + edge cases: number formatting (IQD), negative/zero amounts, date parsing, restore validation.
- Add small productivity UX: filter by bill number/ID, status chips (Paid/Due soon/Overdue), sort by date.
- Stability: atomic writes (write temp then rename), schema versioning.
- Final full E2E test pass + bug fixes.

## 3) Next Actions
1. Implement storage abstraction + base data schema/version.
2. Build Phase 1 POC UI for Supplier Accounts (accounts list + account page + add bill/payment).
3. Add PDF export POC and due-date calculation.
4. Validate persistence in browser preview, then wire Electron file storage.

## 4) Success Criteria
- All 4 screens functional with correct IQD totals and histories.
- Supplier bills/payments render in two columns with distinct colors and stable IDs; payments deduct from Safe.
- Notifications fire for due-in-14-days and repeat every 2 days until paid; can disable per bill; click navigates correctly.
- Backup export/import restores the full dataset accurately.
- EN/AR toggle works; Arabic switches to RTL.
- GitHub Actions reliably produces a Windows **.exe** artifact that runs offline and persists data locally.
