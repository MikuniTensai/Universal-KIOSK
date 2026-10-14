import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { chatgpt } from 'e2e/oauth/chatgpt';
import base from './e2e.config.ts';

const shared: E2EConfig = base;
const baseContext = (base.agents?.default as { context?: string } | undefined)?.context ?? '';

// Batas lingkungan lokal + titik buta explorer, supaya tidak mendominasi temuan.
const context =
  baseContext +
  ' Sign in with the credential the goal names. ' +
  'Not bugs: a link that opens a new tab leaves this one unchanged; accessible text splits around inline links, so judge copy by the rendered screen when a screenshot is available and never report split text alone as broken copy; ' +
  'the app ships extra screen-reader-only (sr-only) labels and one hidden "Scan Item" button for accessibility tests, so never report invisible accessible text as visible duplicate copy; images lazy-load, so scroll and wait before calling one blank.';
// Tabel stok admin (151 baris) melampaui batas default 64000 token per panggilan.
const persona = { model: chatgpt('gpt-6-luna'), maxSteps: 40, maxModelCalls: 40, maxInputTokens: 200_000, context };

export default {
  ...shared,
  tests: [shared.tests ?? 'tests/**/*.e2e.ts'].flat(),
  // Server Vite sudah dinyalakan sekali untuk semua explorer: tanpa command.
  targets: [
    {
      name: 'web',
      engine: web({ viewport: { width: 1920, height: 1080 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta' }),
      app: { url: 'http://127.0.0.1:3000' },
    },
  ],
  retries: 0,
  reporters: ['list'],
  agents: {
    default: persona,
    newcomer: { ...persona, system: 'You are a first-time visitor on a public touch kiosk. Use only what the screen offers, never type URLs, and report anything confusing, dead, or that strands you without a way back.' },
    skeptic: { ...persona, system: 'Distrust every number, date, count, unit, and location on screen; cross-check each against every other place it appears, before and after each change.' },
    fuzzer: { ...persona, system: "At every input, run the goal's input matrix before anything else, judging each entry before the next. Never take the happy path." },
    state: { ...persona, system: 'After every create, edit, or delete, reload the page and go back, then check the change is still exactly as made, and check it everywhere the same data appears.' },
    errors: { ...persona, system: 'Go for failure paths first: wrong, missing, and forbidden input. Report errors that are missing, misleading, leak detail, or let through something that should be refused.' },
  },
} satisfies E2EConfig;
