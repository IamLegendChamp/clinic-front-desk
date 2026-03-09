# How to publish to GitHub Packages (free, private)

This guide walks you through publishing `@iamlegendchamp/design-system` to GitHub Packages so only your team (or you) can install it. Use it to learn the flow and explain it in interviews.

---

## Prerequisites

- This repo pushed to GitHub (e.g. `https://github.com/IamLegendChamp/clinic-front-desk`).
- Package lives under `packages/design-system` with a **scoped** name: `@iamlegendchamp/design-system` (scope = GitHub username, lowercase).

---

## Step 1: Create a GitHub Personal Access Token (PAT)

1. On GitHub: **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token (classic)**. Give it a name (e.g. "npm GitHub Packages").
3. Choose expiration (e.g. 90 days or no expiration).
4. Scopes: enable **`write:packages`** (and **`read:packages`** if listed). For private repos, **`repo`** may be needed so the token can access the repo.
5. Generate and **copy the token**. Store it somewhere safe; you won’t see it again.

You’ll use this token as the “password” when logging in to the GitHub Packages registry.

---

## Step 2: Tell npm to use GitHub Packages for your scope

So that `publish` and `install` go to GitHub (not the public npm registry), configure the registry for your scope.

**Option A – Project-level (recommended)**  
In the **repo root** (or in `packages/design-system`), create or edit `.npmrc`:

```ini
@iamlegendchamp:registry=https://npm.pkg.github.com
```

So: for any package whose name starts with `@iamlegendchamp/`, npm uses GitHub Packages.

**Option B – Global**  
In your home directory, edit `~/.npmrc` (or create it) and add the same line. Then all projects use GitHub Packages for that scope.

---

## Step 3: Log in to GitHub Packages

npm needs to authenticate as your GitHub user when publishing (and when installing private packages).

From a terminal:

```bash
npm login --registry=https://npm.pkg.github.com
```

When prompted:

- **Username:** your GitHub username (e.g. `IamLegendChamp`).
- **Password:** paste the **PAT** from Step 1 (not your GitHub password).
- **Email:** your email (can be public or no-reply).

You only need to do this once per machine (or until the token expires).

---

## Step 4: Publish the package

From the **package directory**:

```bash
cd packages/design-system
npm publish
```

- npm uses the `publishConfig.registry` in `package.json` (pointing to `https://npm.pkg.github.com`), so the package is published to **GitHub Packages**.
- If the repo is **private**, the package is **private**: only accounts with read access to the repo can install it.
- The package will appear under your profile: **GitHub → Your profile → Packages**.

To publish a new version later: bump `version` in `packages/design-system/package.json`, then run `npm publish` again from `packages/design-system`.

---

## Step 5: Install the package in another project (e.g. your frontend)

Only people with **read access** to the repo (you, your team) can install the private package.

1. **Configure the scope** in the project where you want to install (e.g. `frontend/`). In that project root, create or edit `.npmrc`:

   ```ini
   @iamlegendchamp:registry=https://npm.pkg.github.com
   ```

2. **Log in** (if not already):  
   `npm login --registry=https://npm.pkg.github.com`  
   (same as Step 3; use a PAT with `read:packages` and repo access).

3. **Install**:

   ```bash
   npm install @iamlegendchamp/design-system
   # or
   yarn add @iamlegendchamp/design-system
   ```

That project will now depend on the published package from GitHub Packages.

---

## Summary (for interviews)

You can describe it in four parts:

1. **Scope and registry** – Use a scoped name (`@username/package-name`) and set `@username:registry=https://npm.pkg.github.com` so publish/install use GitHub Packages.
2. **Auth** – Create a PAT with `write:packages` (and `read:packages` / `repo` as needed), then `npm login --registry=https://npm.pkg.github.com` with username + PAT.
3. **Publish** – In the package directory, `npm publish`; `publishConfig.registry` in `package.json` sends it to GitHub Packages. Private repo ⇒ private package.
4. **Install** – In any project that has access to the repo, add the same `.npmrc` and auth, then `npm install @username/package-name`.

No cost: GitHub Packages is free for private repos within normal storage/bandwidth limits.

---

## Monorepo versioning & publish automation (optional)

**Nx, Changesets, and Lerna** are all **free and open-source**. They help in larger monorepos:

- **Nx** – Build system and caching; free. [Nx Cloud](https://nx.dev) (distributed cache, CI insights) is a paid add-on.
- **Changesets** – Version + changelog per package; you add a “changeset” file when you change a package, then a command bumps versions and can run publish. Free.
- **Lerna** – Older tool for multi-package version/publish; now maintained by the Nx team. Free.

For a single publishable package you can keep using manual `npm version` + `npm publish` from `packages/design-system`. Add one of these when you have more packages or want automated version bumps on release.
