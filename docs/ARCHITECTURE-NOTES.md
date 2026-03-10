# Architecture notes

## Library vs Module Federation vs Web Components

**Can Module Federation + Web Components replace the design-system library?**

- **Module Federation (MF)** can replace the library as the *way you ship React components* to your own apps. Instead of publishing `@iamlegendchamp/design-system` to npm and installing it in the frontend, you build the design system as a remote and the host app loads it at runtime from a URL. Same React components, different distribution: runtime remote vs npm package. Good for independently deployable apps that share UI without a shared node_modules.

- **Web Components** are a *different artifact* (custom elements like `<my-button>`), not a drop-in replacement for the React library inside a React app. They complement the library: use them when you need framework-agnostic or embeddable UI (other frameworks, static pages, micro-frontends that mix stacks). You can build both from the same design tokens.

**Recommendation:** Use **Module Federation** to serve your React design system to host apps (replacing npm-link or a published package for your own ecosystem). Use **Web Components** where you need maximum portability or non-React consumers. You can keep a thin npm package that re-exports the remote entry or the web components script for convenience; MF + web components can replace the library as the primary distribution if that fits your deployment model.
