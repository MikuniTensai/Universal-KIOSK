/**
 * Simple deterministic string hashing (e.g. for package hash in browser/node environment)
 */
export async function computePackageHash(pkg: Record<string, unknown>): Promise<string> {
  // Sort keys for deterministic JSON
  const serialized = JSON.stringify(pkg, Object.keys(pkg).sort());
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple checksum if crypto.subtle not available
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    const char = serialized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'pkg-' + Math.abs(hash).toString(16);
}
