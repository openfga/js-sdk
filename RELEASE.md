# Release guide

This project uses [release-please](https://github.com/googleapis/release-please) via a
`workflow_dispatch`-triggered GitHub Actions workflow. This document explains how to cut
a release and what to watch out for.

---

## Versioning rules for this project

We are pre-1.0.0. Semver conventions are relaxed:

| Change type      | Bump                  | Example             |
|---               |---                    |---                  |
| Breaking change  | **Minor** (`0.x.0`)   | `0.9.0` → `0.10.0` |
| Everything else  | **Patch** (`0.0.x`)   | `0.9.3` → `0.9.4`  |

Major bumps (`1.0.0`) are reserved for a deliberate stable-API graduation decision — not for
routine breaking changes.

---

## Cutting a release

1. Go to **Actions → release-please** and click **Run workflow**.
2. Choose a bump type:
   - `patch` — bugfixes, docs, small changes
   - `minor` — breaking changes (see above)
   - `explicit` — you specify the exact version string (e.g. `0.10.0` or `0.10.0-beta.1`)
3. The workflow creates a release PR. Review it, then merge.
4. The GitHub Release and tag are created automatically on merge.

> **Note — release-please only understands `auto` or an explicit version string.**
> The `patch`, `minor`, and `major` options in the workflow dropdown are conveniences
> implemented in the workflow. The workflow reads the current manifest version, computes
> the next version (e.g. `0.9.3` + patch = `0.9.4`), and passes that computed string
> to release-please as an explicit `Release-As:` commit — exactly the same as choosing
> `explicit` and typing it yourself. There is no native patch/minor/major mode in
> release-please. This is why `explicit` is always the safest option when in doubt —
> you are just skipping the arithmetic step.

---

## When to use `explicit`

Use `explicit` and type the version yourself in any of these situations:

**After a beta or non-conventional tag.**
If the previous release was something like `0.9.3-beta.1`, release-please tracks the
base semver (`0.9.3`) but cannot reliably decide whether the next release should be
`0.9.3`, `0.9.4`, or `0.10.0`. It will often guess wrong.

The rule of thumb: **if the last tag had a pre-release suffix, always use `explicit` for
the next release.**

**After a manually created tag.**
Any tag created outside of the release-please workflow (e.g. hotfixes, manual git tags)
is invisible to release-please's version logic. Use `explicit` to anchor the next version
correctly.

**When you want a beta.**
Release-please does not increment pre-release suffixes automatically. Use `explicit` for
every beta, incrementing the suffix manually:
```
0.10.0-beta.1  →  explicit: 0.10.0-beta.2  →  explicit: 0.10.0
```

---

## What goes in the changelog

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)
for release-please to group them correctly:

```
feat: add support for batch check          → Added
fix: correct retry logic for transient errors  → Fixed
docs: update API reference                 → Documentation
perf: cache DNS lookups                    → Changed
refactor: extract auth helper              → (hidden)
chore: bump dependencies                   → (hidden)
```

---

## Experimental releases from `develop`

For pre-release builds (beta/rc) of code that isn't on `main` yet, use the
separate `release-please-develop` workflow. It targets `develop`, only cuts
pre-release versions, and never touches the stable `main` flow. (It's a thin
caller around the shared `openfga/.github` `release-please-prerelease.yml`, so
other SDKs can reuse it.)

`develop` is upstream of `main`:

```
develop  ●──────●──────●  (0.10.0-beta.1, -beta.2, -rc.1)
          \             \  promote the code via a normal PR
main ──────●─────────────●  (0.10.0)
```

**Promote code, not release commits.** Move features `develop → main` with a
normal PR. Never merge `develop`'s manifest/CHANGELOG bumps into `main` — they
set `main` to a pre-release version and break release-please there.

> If the code is already on `main`, you don't need `develop` — cut the beta from
> `main` with `release-please` using `explicit` (e.g. `0.10.0-beta.1`).

### Cutting a beta

1. Land the code on `develop`.
2. **Actions → release-please-develop → Run workflow**, enter an explicit
   pre-release version (e.g. `0.10.0-beta.1`; stable versions are rejected).
3. Merge the release PR it opens against `develop`. A signed `v0.10.0-beta.1`
   tag is pushed and published to npm under the `beta` dist-tag (`npm i @openfga/sdk@beta`).

```text
  ┌─────────────────────────────────────────────┐
  │  Run workflow  →  version: 0.10.0-beta.1     │
  └─────────────────────────────────────────────┘
                       │
                       ▼
     stage "Release-As" commit on release-develop
                       │
                       ▼
        release-please opens a release PR
                       │
                       ▼  (auto) retargeted to develop
                ┌──────────────┐
                │ you merge it │
                └──────────────┘
                       │
                       ▼
   signed tag  v0.10.0-beta.1  +  draft pre-release
                       │
                       ▼
        main.yaml publishes  →  npm dist-tag: beta
                       │
                       ▼
     release-develop reset to develop (next cycle)
```

> `release-develop` is an internal scratch branch the workflow manages and
> resets each run — you never touch it. Your only branch is `develop`.

### Graduating to stable

Promote the code to `main` via a normal PR, then release `0.10.0` on `main` with
`release-please` using `explicit`. To realign `develop` afterward, open a normal
`main → develop` PR — both branches are protected, so this stays a reviewed merge
(no force-pushes, no direct pushes).

---

## Troubleshooting

**"Invalid previous_tag parameter" error.**
The manifest version does not have a corresponding GitHub Release object. Reset the
manifest to the last valid tag via a PR (`main` is protected, so no direct push):
```bash
git checkout -b fix/reset-manifest
echo '{ ".": "0.x.y" }' > .release-please-manifest.json
git commit -am "chore: reset manifest to v0.x.y"
git push origin fix/reset-manifest
# then open and merge a PR into main
```

**Duplicate release PRs.**
Close all stale ones. The workflow auto-closes stale open PRs on each dispatch, but
merged duplicates need manual labelling with `autorelease: tagged`.

**Changelog shows everything ungrouped.**
Make sure `changelog-type` in `release-please-config.json` is set to `"default"`, not
`"github"`.
