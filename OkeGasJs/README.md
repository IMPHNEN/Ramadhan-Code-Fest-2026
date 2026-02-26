# OkeGasJS

A lightweight, modern, and "fun" Server-Side Rendering (SSR) framework built with Node.js and React. Inspired by Next.js Pages Router.

## Features 🚀

- **Server-Side Rendering (SSR)**: Fast initial load using React's `renderToString`.
- **File-based Routing**: Just create files in `src/pages`.
- **Dynamic Routing**: Support for parameters like `/product/[id]`.
- **API Routes**: Build backend endpoints easily in `src/pages/api`.
- **Layout System**: Global `_app.tsx` wrapper for persistent layouts.
- **Hot Reload**: Automatic live reload when you edit files.
- **TypeScript**: First-class support.
- **Tailwind CSS**: Pre-configured styling.
- **Metadata Inspection**: Custom `<okegas-route-announcer>` tags just like the pros.

## Getting Started

### Installation

Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The server will open `http://localhost:3000` automatically.

## Routing System

### Basic Routes

- `src/pages/index.tsx` → `http://localhost:3000/`
- `src/pages/about.tsx` → `http://localhost:3000/about`

### Dynamic Routes

Support for dynamic segments using square brackets:

- `src/pages/product/[id].tsx` → `http://localhost:3000/product/123`

Access the parameter in your component via `params` prop:

```tsx
export default function Product({ params }: { params: { id: string } }) {
  return <h1>Product: {params.id}</h1>;
}
```

### API Routes

Create server-side endpoints in `src/pages/api/`.

- `src/pages/api/hello.ts` → `http://localhost:3000/api/hello`

Example handler:

```typescript
import { IncomingMessage, ServerResponse } from "http";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello from OkeGas API!" }));
}
```

## Layout System (`_app.tsx`)

Use `src/pages/_app.tsx` to define your global layout (HTML structure, fonts, CSS).
This component wraps all your pages.

```tsx
export default function App({ Component, pageProps }: any) {
  return (
    <html>
      <head>...</head>
      <body>
        <Component {...pageProps} />
      </body>
    </html>
  );
}
```

## Project Structure

- `src/server.ts` - core logic (routing, rendering, hot reload).
- `src/pages/` - pages directory.
- `src/pages/api/` - api routes directory.
- `src/data/` - config files.

## Credits

Developed by **Dzikri Maulana**.

## License

MIT License. Open Source and Free.

## Disclaimer

This framework is created for **educational and entertainment purposes** (Project Bercandaan). Not intended for mission-critical commercial production use, but feel free to have fun with it!
