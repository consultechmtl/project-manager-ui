#!/bin/bash
cd "$(dirname "$0")"
npm install 2>/dev/null || pnpm install 2>/dev/null || bun install
npm run dev 2>/dev/null || pnpm dev 2>/dev/null || bun run dev
