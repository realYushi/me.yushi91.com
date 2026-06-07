# Deploy runbook — Cloudflare Pages (apex + 301)

Covers [#7](https://github.com/realYushi/me.yushi91.com/issues/7): ship the static
build to the apex `yushi91.com` and 301-redirect the old `me.yushi91.com`.

The build is already apex-correct (`astro.config.mjs` `site`, canonical, sitemap,
and Person JSON-LD all use `https://yushi91.com` — guarded by
`tests/deploy-readiness.test.ts`). The remaining steps are **HITL**: they touch
the Cloudflare account and live DNS and must be done by a human.

## 1. Create the Pages project (git integration → auto-deploy)

In the Cloudflare dashboard → **Workers & Pages → Create → the `Pages` tab →
Connect to Git**.

> **Do _not_ use "Import a repository" / the Workers flow.** That creates a
> **Worker**, whose `wrangler deploy` auto-config detects Astro, tries to
> codemod in the `@astrojs/cloudflare` adapter, and crashes a static build with
> `require_dist is not a function` (seen as `[@astrojs/cloudflare] Enabling …
> Cloudflare Images / KV sessions` followed by a wrangler stack trace). This
> site is pure static — it needs no adapter, no Worker runtime. Use **Pages**.

- Repository: `realYushi/me.yushi91.com`
- Production branch: `main` (pushes to `main` auto-deploy)
- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: Astro

## 2. Move the zone to Cloudflare first (prerequisite)

`yushi91.com` is **registered at Porkbun and its DNS is authoritative there**
(`*.ns.porkbun.com`), currently pointing the apex at **GitHub Pages**
(`185.199.108–111.153`). Adding a "custom domain" in Pages does **not** touch
DNS that lives at Porkbun, so the apex must be moved onto Cloudflare — this is
also required for the step-3 Redirect Rule (a zone-level feature).

1. Cloudflare → **Add a site** → `yushi91.com` (Free plan); let it import DNS.
2. Cloudflare assigns two nameservers (e.g. `x.ns.cloudflare.com`).
3. Porkbun → `yushi91.com` → **Authoritative Nameservers** → replace the four
   `*.ns.porkbun.com` entries with Cloudflare's two. Wait for the zone to go
   "Active" (minutes–hours).

## 3. Point the apex at the project

Pages project → **Custom domains → Set up a custom domain** → `yushi91.com`.
Now that Cloudflare is authoritative, it creates the record + TLS cert and
routes the apex to the Pages project. Remove any leftover GitHub Pages `A`/`AAAA`
records on the apex if the import carried them over.

Do **not** add `me.yushi91.com` as a custom domain on this Pages project — see
step 4 for why.

## 4. 301-redirect `me.yushi91.com` → apex (preserves the LinkedIn "Featured" link)

Use a zone-level **Redirect Rule**, *not* a Pages `_redirects` file. Pages
`_redirects` matches on **path only, not hostname**, and applies to every custom
domain on the project — so it cannot express "redirect this host to that host"
without looping the apex onto itself.

Dashboard → the `yushi91.com` zone → **Rules → Redirect Rules → Create rule**:

- When incoming requests match: `Hostname` equals `me.yushi91.com`
- Then: Dynamic redirect → expression
  `concat("https://yushi91.com", http.request.uri.path)` (preserves the path)
  - Status code: **301 (Permanent)**
  - Preserve query string: on

API equivalent (replace `$ZONE_ID` / `$TOKEN`):

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{
    "name": "me -> apex 301",
    "kind": "zone",
    "phase": "http_request_dynamic_redirect",
    "rules": [{
      "expression": "(http.host eq \"me.yushi91.com\")",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": { "expression": "concat(\"https://yushi91.com\", http.request.uri.path)" },
          "preserve_query_string": true
        }
      }
    }]
  }'
```

## 5. Post-deploy verification (maps to the acceptance criteria)

- [ ] `https://yushi91.com` serves the static build (correct fonts/palette).
- [ ] `curl -sI https://me.yushi91.com` returns `301` with
      `location: https://yushi91.com/`.
- [ ] A push to `main` triggers a new Pages deployment.
- [ ] Homepage has valid Person JSON-LD (`@type` Person, name "Yushi Cui",
      `url` the apex) and a fast first load.
