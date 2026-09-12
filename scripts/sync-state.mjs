import fs from 'node:fs';
import { createHash } from 'node:crypto';

export function createSyncStateReader(syncFile) {
  let cached = null;

  return {
    invalidate() {
      cached = null;
    },
    read() {
      let stats;
      try {
        stats = fs.statSync(syncFile);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        cached = null;
        return { content: Buffer.from('{"hasState":false}'), etag: null };
      }

      // ctime also detects same-size replacements that preserve the original mtime.
      const version = `${stats.dev}:${stats.ino}:${stats.size}:${stats.mtimeMs}:${stats.ctimeMs}`;
      if (cached?.version === version) return cached;

      const content = fs.readFileSync(syncFile);
      const etag = `"${createHash('sha256').update(content).digest('hex')}"`;
      cached = { version, content, etag };
      return cached;
    },
  };
}

export function matchesEtag(header, etag) {
  if (!header || !etag) return false;
  return header.split(',').some((candidate) => {
    const value = candidate.trim();
    return value === '*' || value.replace(/^W\//, '') === etag;
  });
}
