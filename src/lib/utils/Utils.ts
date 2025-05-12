export function pickRandomElements<T>(array: T[], n: number): T[] {
  if (n <= 0) return [];
  if (n >= array.length) return [...array];

  const result: T[] = [];
  const usedIndices = new Set<number>();

  while (result.length < n) {
    const index = Math.floor(Math.random() * array.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      result.push(array[index]);
    }
  }

  return result;
}