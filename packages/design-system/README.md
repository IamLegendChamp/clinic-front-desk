# @iamlegendchamp/design-system

Reusable design system components (Button, TextField) for any React + MUI project. Part of the monorepo; can be used via workspaces or published to GitHub Packages.

## Install

From another app in this monorepo (workspace):

```bash
yarn add @iamlegendchamp/design-system
# or add to package.json: "@iamlegendchamp/design-system": "workspace:*"
```

From an external project (after publishing): see repo root **PUBLISHING.md**.

## Usage

```tsx
import { Button, TextField } from '@iamlegendchamp/design-system';

<Button onClick={() => {}}>Save</Button>
<TextField label="Email" type="email" />
```

## Peer dependencies

Your app must have: `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`.
