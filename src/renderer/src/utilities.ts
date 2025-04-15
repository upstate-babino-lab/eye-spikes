export function capitalize(str: string) {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds: number = seconds % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = (
    remainingSeconds % 1 ? remainingSeconds.toFixed(2) : String(remainingSeconds)
  ).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function stableStringify(obj: unknown, skipPrivate = true): string {
  if (Array.isArray(obj)) {
    return `[${obj.map((item) => stableStringify(item, skipPrivate)).join(',')}]`;
  } else if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj)
      .filter((key) => !skipPrivate || !key.startsWith('_')) // Exclude private
      .sort();

    const entries = keys.map(
      (key) => `${JSON.stringify(key)}:${stableStringify(obj[key], skipPrivate)}`
    );

    return `{${entries.join(',')}}`;
  } else {
    return JSON.stringify(obj);
  }
}

// Compare elements JSON stableStringify (not counting _private properties)
// and ensure duplicates point to the same object
export function deepDeduplicate<T>(arr: T[]): T[] {
  const map = new Map<string, T>();
  const result: T[] = [];

  for (const obj of arr) {
    const json = stableStringify(obj);
    if (!map.has(json)) {
      map.set(json, obj);
    }
    const dedupedObj = map.get(json);
    if (!dedupedObj) {
      throw new Error('dedupedObj should not be null');
    }
    if (dedupedObj) {
      result.push(dedupedObj);
    }
  }
  return result;
}

export function logMARtoPx(logMAR: number, pxPerDegree: number): number {
  const degrees = Math.pow(10, logMAR) / 60;
  return Math.round(degrees * pxPerDegree);
}
