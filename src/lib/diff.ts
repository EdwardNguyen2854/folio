export type DiffLine = {
  type: 'same' | 'added' | 'removed';
  left?: string;
  right?: string;
};

export function diffLines(leftText: string, rightText: string): DiffLine[] {
  const left = leftText.replace(/\r\n/g, '\n').split('\n');
  const right = rightText.replace(/\r\n/g, '\n').split('\n');
  const rows = left.length + 1;
  const cols = right.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      result.push({ type: 'same', left: left[i], right: right[j] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'removed', left: left[i] });
      i += 1;
    } else {
      result.push({ type: 'added', right: right[j] });
      j += 1;
    }
  }

  while (i < left.length) {
    result.push({ type: 'removed', left: left[i] });
    i += 1;
  }

  while (j < right.length) {
    result.push({ type: 'added', right: right[j] });
    j += 1;
  }

  return result;
}
