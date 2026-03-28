# 🔑 CRITICAL: API Key Rotation Guide

## ⚠️ IMMEDIATE ACTION REQUIRED

GitHub has detected a leaked Google API key in your repository. You must rotate ALL API keys immediately.

---

## 📋 Step-by-Step Rotation Process

### 1. **Rotate Google Gemini API Key** (CRITICAL - Do This First!)

#### A. Revoke the Compromised Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Find your current Gemini API key
4. Click on the key name
5. Click **DELETE** or **REGENERATE**
6. Confirm the deletion

#### B. Create a New API Key
1. In the same **Credentials** page, click **+ CREATE CREDENTIALS**
2. Select **API Key**
3. Copy the new key immediately
4. Click **RESTRICT KEY** (Important!)
5. Under **API restrictions**, select **Restrict key**
6. Choose **Generative Language API** (Gemini)
7. Under **Application restrictions**, choose:
   - **HTTP referrers** for web apps, OR
   - **IP addresses** for server apps
8. Add your server IP addresses or domains
9. Click **SAVE**

#### C. Update Your Application
1. Open your local `backend/.env` file (NOT in git!)
2. Replace the old `GEMINI_API_KEY` with the new one:
   ```
   GEMINI_API_KEY=your-new-api-key-here
   ```
3. Save the file

#### D. Update Production Environment
1. **For Render.com**:
   - Go to your Render dashboard
   - Select your backend service
   - Go to **Environment** tab
   - Find `GEMINI_API_KEY`
   - Click **Edit** and paste the new key
   - Click **Save Changes**
   - Render will automatically redeploy

2. **For other platforms**:
   - Update the environment variable in your deployment platform
   - Trigger a redeploy if necessary

---

### 2. **Rotate JWT Secret Key** (HIGH PRIORITY)

#### A. Generate a New Secret
```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### B. Update Local Environment
1. Open `backend/.env`
2. Replace `JWT_SECRET_KEY`:
   ```
   JWT_SECRET_KEY=your-new-secret-key-here
   ```

#### C. Update Production
- Update the `JWT_SECRET_KEY` in your deployment platform
- **WARNING**: This will invalidate all existing user sessions
- Users will need to log in again

---

### 3. **Rotate MongoDB Connection String** (If Exposed)

#### A. Check if MongoDB Credentials Were Exposed
```bash
# Search git history for MongoDB connection strings
git log --all --full-history -S "mongodb" --source --all
```

#### B. If Exposed, Rotate MongoDB Password
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database Access**
3. Find your database user
4. Click **Edit**
5. Click **Edit Password**
6. Generate a new password (use the auto-generate option)
7. Copy the new password
8. Click **Update User**

#### C. Update Connection String
1. Go to **Database** → **Connect** → **Connect your application**
2. Copy the new connection string
3. Replace `<password>` with your new password
4. Update `MONGODB_URL` in:
   - Local `backend/.env`
   - Production environment variables

---

## 🔍 Verify No Secrets in Git History

### Check for Exposed Secrets
```bash
# Check for API keys
git log --all --full-history -S "AIza" --source --all
git log --all --full-history -S "GEMINI_API_KEY" --source --all

# Check for MongoDB credentials
git log --all --full-history -S "mongodb+srv" --source --all

# Check for JWT secrets
git log --all --full-history -S "JWT_SECRET_KEY" --source --all
```

### If Secrets Found in Git History

**Option 1: Use git-filter-repo (Recommended)**
```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove sensitive file from history
git filter-repo --path backend/.env --invert-paths

# Force push (DANGEROUS - coordinate with team!)
git push origin --force --all
```

**Option 2: Use BFG Repo-Cleaner**
```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env files from history
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

**⚠️ WARNING**: Rewriting git history is destructive and will affect all collaborators!

---

## ✅ Post-Rotation Checklist

After rotating all keys:

- [ ] Old Google Gemini API key deleted
- [ ] New Google Gemini API key created and restricted
- [ ] New API key updated in local `.env`
- [ ] New API key updated in production environment
- [ ] Application tested with new API key
- [ ] JWT secret key rotated
- [ ] MongoDB credentials rotated (if exposed)
- [ ] All secrets removed from git history
- [ ] `.gitignore` updated to prevent future leaks
- [ ] Team notified of key rotation
- [ ] Monitoring enabled for unusual API usage

---

## 🚨 Monitor for Unauthorized Usage

### Google Cloud Console
1. Go to **APIs & Services** → **Credentials**
2. Click on your API key
3. View **API key metrics**
4. Check for:
   - Unusual spike in requests
   - Requests from unknown IP addresses
   - Requests outside normal hours

### Set Up Alerts
1. Go to **Monitoring** → **Alerting**
2. Create alert for:
   - API quota exceeded
   - Unusual request patterns
   - Requests from unexpected locations

---

## 📞 Report Security Incident

If you detect unauthorized usage:

1. **Immediately revoke the compromised key**
2. **Document the incident**:
   - When was the key exposed?
   - How long was it exposed?
   - What usage occurred?
3. **Report to Google Cloud Security**:
   - https://cloud.google.com/security
4. **Notify your team**
5. **Review and improve security practices**

---

## 🛡️ Prevent Future Leaks

### Use Environment Variables
- ✅ Store secrets in `.env` files (gitignored)
- ✅ Use environment variables in production
- ❌ NEVER hardcode secrets in code
- ❌ NEVER commit `.env` files

### Use Secret Management Tools
- **Development**: `.env` files with `python-dotenv`
- **Production**: 
  - Render: Environment variables
  - AWS: AWS Secrets Manager
  - Azure: Azure Key Vault
  - GCP: Secret Manager

### Enable Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
EOF

# Install hooks
pre-commit install
```

### Regular Security Audits
- [ ] Review access logs weekly
- [ ] Rotate API keys quarterly
- [ ] Audit environment variables monthly
- [ ] Run security scans on codebase
- [ ] Keep dependencies updated

---

## 📚 Additional Resources

- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)

---

**Last Updated**: 2026-03-28  
**Status**: CRITICAL - Immediate action required
