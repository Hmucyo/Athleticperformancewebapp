# 🚀 Quick Start: Push to GitHub

## Prerequisites
- Git installed on your computer
- GitHub account created
- Terminal/Command Prompt access

## Step-by-Step Guide

### 1️⃣ Open Terminal/Command Prompt
Navigate to your project directory:
```bash
cd /path/to/your/project
```

### 2️⃣ Initialize Git (if not already done)
```bash
git init
```

### 3️⃣ Configure Git (first time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4️⃣ Add All Files
```bash
git add .
```

### 5️⃣ Create Initial Commit
```bash
git commit -m "Initial commit: AFSP Platform v1.0

- Phase 1: Authentication, athlete dashboard, program management
- Phase 2: Journal with media uploads, real-time chat, admin dashboard
- Phase 2.5: Improved program enrollment flow with custom builder
- Features: Exercise tracking, progress charts, athlete management
- Tech: React, TypeScript, Supabase, Tailwind CSS"
```

### 6️⃣ Create GitHub Repository

**Option A: Via GitHub Website**
1. Go to https://github.com
2. Click the "+" icon (top right) → "New repository"
3. Repository name: `afsp-platform`
4. Description: "Athletic performance webapp with athlete and admin dashboards"
5. Choose: Public or Private
6. **DO NOT** check "Initialize with README" (we already have one)
7. Click "Create repository"

**Option B: Via GitHub CLI** (if installed)
```bash
gh repo create afsp-platform --private --source=. --remote=origin
```

### 7️⃣ Connect to GitHub Repository

Copy the commands from GitHub (they'll look like this):
```bash
git remote add origin https://github.com/YOUR-USERNAME/afsp-platform.git
git branch -M main
git push -u origin main
```

**Or if using SSH:**
```bash
git remote add origin git@github.com:YOUR-USERNAME/afsp-platform.git
git branch -M main
git push -u origin main
```

### 8️⃣ Verify Upload
Go to your GitHub repository URL:
```
https://github.com/YOUR-USERNAME/afsp-platform
```

You should see all your files!

## 🎉 Success!

Your project is now on GitHub. Here's what you have:

### 📂 Repository Contents
- ✅ Complete source code
- ✅ README.md with full documentation
- ✅ DEPLOYMENT.md with setup instructions
- ✅ CHANGELOG.md with version history
- ✅ .gitignore to exclude sensitive files
- ✅ package.json with dependencies

### 🔐 Before Going Public

If you haven't already:
1. Remove any hardcoded credentials from `/utils/supabase/info.tsx`
2. Use environment variables for sensitive data
3. Review all files to ensure no API keys are committed

### 📝 Next Steps

1. **Set up Supabase** (see DEPLOYMENT.md)
2. **Deploy Edge Function** 
   ```bash
   supabase functions deploy server
   ```
3. **Create admin account** via API
4. **Deploy to production** (Vercel/Netlify)

### 🔄 Future Updates

When you make changes:
```bash
git add .
git commit -m "Description of changes"
git push
```

## 🆘 Troubleshooting

### "git: command not found"
Install Git: https://git-scm.com/downloads

### Authentication failed
- Use Personal Access Token instead of password
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate new token with "repo" scope
- Use token as password when pushing

### Remote already exists
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/afsp-platform.git
```

### Files not showing up
```bash
# Check status
git status

# Make sure files are added
git add .

# Commit again
git commit -m "Add missing files"

# Push
git push
```

## 📧 Need Help?

- GitHub Docs: https://docs.github.com
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- Supabase Docs: https://supabase.com/docs

---

**Congratulations! Your AFSP Platform is now version controlled and backed up on GitHub!** 🎊
