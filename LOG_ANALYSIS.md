# Log Analysis Guide

## Where to Look

### 1. Terminal/Server Logs (when you start `npm run dev`)

Look for this line when Vite starts:
```
[VITE-CONFIG] 🔍 OpenAI API Key Check: { ... }
```

**What to check:**
- `hasViteOpenAIKey: true/false` - Is Vite seeing the key?
- `allViteKeys: [...]` - List of all VITE_ keys found
- `openaiInViteKeys: true/false` - Is it in the list?

**If `hasViteOpenAIKey: false` but other keys are found:**
→ Formatting issue in .env.local file

---

### 2. Browser Console (F12 → Console tab)

When the page loads, look for:
```
[VOICE-WIDGET] 🔍 Environment Check on Mount: { ... }
```

**What to check:**
- `hasViteOpenAIKey: true/false` - Does the client see it?
- `allViteKeys: [...]` - What VITE_ keys are available?
- `hasViteOpenAI: true/false` - Is the key in the object?

**If `hasViteOpenAIKey: false`:**
→ Vite didn't expose it to the client (formatting issue)

---

### 3. When You Click "Start Conversation"

Look for:
```
[VOICE-WIDGET] 🔌 connectToVoiceAgent called
[VOICE-WIDGET] 🔑 API Key check (DETAILED): { ... }
[VOICE-WIDGET] 📋 All VITE_ prefixed keys: [...]
```

**What to check:**
- `hasKey: true/false` - Final check before connection
- `allViteKeys: [...]` - Complete list
- Each key logged: `- VITE_XXX: sk-...` - See if OpenAI key is listed

---

### 4. Server-Side Test Endpoint

Visit: `http://localhost:3000/api/test-openai`

Check terminal for:
```
[TEST-OPENAI] Environment check: { ... }
[TEST-OPENAI] All VITE_ keys: [...]
```

**What to check:**
- `hasVITE_OPENAI_API_KEY: true/false` - Server-side check
- `allViteKeys: [...]` - Server sees these keys

---

## Common Scenarios

### Scenario 1: Vite sees it, but client doesn't
```
Terminal: hasViteOpenAIKey: true
Browser: hasViteOpenAIKey: false
```
→ Vite config issue or cache problem

### Scenario 2: Neither sees it
```
Terminal: hasViteOpenAIKey: false
Browser: hasViteOpenAIKey: false
allViteKeys: ['VITE_GEMINI_API_KEY', 'VITE_SUPABASE_URL', ...]
```
→ Formatting issue in .env.local (most common)

### Scenario 3: Server sees it, Vite doesn't
```
/api/test-openai: hasVITE_OPENAI_API_KEY: true
Terminal: hasViteOpenAIKey: false
```
→ Vite's loadEnv not picking it up

---

## Quick Diagnostic Commands

1. **Check .env.local formatting:**
   ```bash
   npm run check-env
   ```

2. **See what Vite loads:**
   ```bash
   npm run dev:debug
   ```

3. **Test server-side:**
   ```bash
   curl http://localhost:3000/api/test-openai
   ```

---

## What to Share

If you're still having issues, share:

1. **Terminal output** when you run `npm run dev` (look for `[VITE-CONFIG]`)
2. **Browser console** output (look for `[VOICE-WIDGET] 🔍`)
3. **Output of:** `npm run check-env`
4. **Output of:** `npm run dev:debug` (first few lines)

This will tell us exactly where the key is getting lost!

