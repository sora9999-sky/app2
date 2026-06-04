# Dinar Desk — GitHub Actions: How to get your Windows EXE

This project is preconfigured to build a Windows `.exe` of Dinar Desk automatically using **GitHub Actions**. You do not need a Windows machine, you do not need Visual Studio, you do not need to install Electron locally. GitHub gives you a free Windows builder.

## Step-by-step

### 1. Create a GitHub repository

1. Sign in to GitHub.
2. Click **New repository** (e.g. name it `dinar-desk`).
3. Leave it Public or Private — either works.
4. Click **Create repository**.

### 2. Push this codebase to it

From your local machine where this project lives:

```bash
cd /app   # or wherever you copied this project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/dinar-desk.git
git push -u origin main
```

### 3. Watch GitHub Actions build your EXE

1. On your repo page, click the **Actions** tab.
2. You will see a workflow run named **“Build Windows EXE”** that started automatically on push.
3. Click it to follow progress (typically ≈ 5–10 minutes).

### 4. Download the EXE

When the run is finished (green checkmark):

1. Click the run name.
2. Scroll down to the **Artifacts** section.
3. Two zip files are available:
   - **`DinarDesk-Windows-Installer.zip`** → unzip it; inside you will find `DinarDesk-1.0.0-x64-nsis.exe`. Double-click to install Dinar Desk on Windows. It creates Desktop and Start Menu shortcuts.
   - **`DinarDesk-Portable.zip`** → unzip it; inside you will find `DinarDesk-Portable-1.0.0.exe`. This is a single-file portable EXE — you can run it directly without installation, even from a USB stick.

### 5. Run on Windows

Double-click the EXE. It runs fully offline. Your data is stored at:

```
%APPDATA%\Dinar Desk\dinar-desk-data.json
```

## Re-build (any time you update the code)

Every time you push a new commit to `main`, a fresh build runs and produces new artifacts. You can also trigger it manually:

1. Go to **Actions** tab.
2. Click **“Build Windows EXE”** on the left.
3. Click **Run workflow** → Run.

## Tagged releases

To cut a versioned build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Troubleshooting

- If the artifact ZIP is empty or the workflow fails, open the run logs and inspect the **“Package Electron app for Windows”** step. Usually it’s a transient network issue — click **Re-run all jobs** in the top-right.
- The EXE is unsigned (we did not configure a code-signing certificate). On first launch Windows may show a SmartScreen warning. Click **More info → Run anyway**. This is normal for any unsigned open-source app.
