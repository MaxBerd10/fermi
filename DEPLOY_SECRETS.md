# Secrets — not in git anymore

The OpenAI key used to be committed (base64) in `.env` / `.env.production`. OpenAI's
GitHub leak-scanner found it and revoked it — this is almost certainly why the AI
chat widget and Telegram translation stopped working, and may explain unexpected
usage on the account before it was revoked.

Real secrets now live in files git already ignores (`.env.local`, `.env.*.local` —
see `.gitignore`). The committed `.env` / `.env.development` / `.env.production`
only hold non-secret config.

## What goes where

- **Local dev** (`npm run dev` / `npm run preview`): `.env.local`
- **Production server** (`node server/production-server.mjs`, and `npm run build`
  if you build on the server itself): `.env.production.local`

Both files already exist in this repo with the right variable names — they're just
empty/placeholder for `OPENAI_API_KEY_B64`. Fill in the real key:

```bash
node -e "console.log(Buffer.from('sk-...your-new-key...').toString('base64'))"
```

Paste the output as `OPENAI_API_KEY_B64=...` in the relevant `.local` file.

## Deploying to the actual server

`.env.production.local` is gitignored, so it does **not** travel with `git pull` /
`git push`. Create it directly on the server (or copy it over once via `scp`/`sftp`)
— it only needs to be done once; redeploys won't touch it.

## If a key ever leaks again

Revoke it immediately at https://platform.openai.com/account/api-keys, generate a
new one, and set a hard monthly budget limit on the account (Settings → Limits) —
that caps worst-case damage even if a key leaks again before you notice.
