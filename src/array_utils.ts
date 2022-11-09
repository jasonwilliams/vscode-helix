export function arrayFindLast<T>(xs: T[], p: (x: T) => boolean): T | undefined {
  const filtered = xs.filter(p);

  if (filtered.length === 0) {
    return undefined;
  } else {
    return filtered[filtered.length - 1];
  }
}
