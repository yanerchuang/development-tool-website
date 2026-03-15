export interface DiffLine {
  type: 'add' | 'remove' | 'same';
  content: string;
  oldLine?: number;
  newLine?: number;
}

// 简单的行级别差异算法 (基于最长公共子序列)
export const computeDiff = (oldText: string, newText: string): DiffLine[] => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  // 计算 LCS (最长公共子序列)
  const lcs = computeLCS(oldLines, newLines);

  const result: DiffLine[] = [];
  let oldIndex = 0;
  let newIndex = 0;
  let lcsIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (lcsIndex < lcs.length) {
      const lcsLine = lcs[lcsIndex];

      // 添加旧文本中的删除行
      while (oldIndex < oldLines.length && oldLines[oldIndex] !== lcsLine) {
        result.push({
          type: 'remove',
          content: oldLines[oldIndex],
          oldLine: oldIndex + 1,
        });
        oldIndex++;
      }

      // 添加新文本中的新增行
      while (newIndex < newLines.length && newLines[newIndex] !== lcsLine) {
        result.push({
          type: 'add',
          content: newLines[newIndex],
          newLine: newIndex + 1,
        });
        newIndex++;
      }

      // 添加相同的行
      if (oldIndex < oldLines.length && newIndex < newLines.length) {
        result.push({
          type: 'same',
          content: oldLines[oldIndex],
          oldLine: oldIndex + 1,
          newLine: newIndex + 1,
        });
        oldIndex++;
        newIndex++;
        lcsIndex++;
      }
    } else {
      // 剩余的删除行
      while (oldIndex < oldLines.length) {
        result.push({
          type: 'remove',
          content: oldLines[oldIndex],
          oldLine: oldIndex + 1,
        });
        oldIndex++;
      }
      // 剩余的新增行
      while (newIndex < newLines.length) {
        result.push({
          type: 'add',
          content: newLines[newIndex],
          newLine: newIndex + 1,
        });
        newIndex++;
      }
    }
  }

  return result;
};

// 计算最长公共子序列
const computeLCS = (a: string[], b: string[]): string[] => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯找出 LCS
  const lcs: string[] = [];
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
};

// 统计差异
export const getDiffStats = (diff: DiffLine[]) => {
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  diff.forEach(line => {
    if (line.type === 'add') added++;
    else if (line.type === 'remove') removed++;
    else unchanged++;
  });

  return { added, removed, unchanged };
};