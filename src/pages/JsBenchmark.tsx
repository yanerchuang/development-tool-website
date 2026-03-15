import { useState } from 'react';
import { Card, Button } from '../components/common';

interface BenchmarkResult {
  name: string;
  opsPerSecond: number;
  totalTime: number;
  sampleCount: number;
}

export default function JsBenchmark() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);
  const [code, setCode] = useState(`// 要测试的代码
// 可以访问变量: a, b, c, d, e, f, arr, obj

// 示例: 数组查找
arr.find(x => x === 5000);

// 示例: 对象属性访问
obj.nested.deep.value;

// 示例: 数学运算
Math.sqrt(a * a + b * b);`);

  const setupCode = `const a = 123;
const b = 456;
const c = 789;
const d = 1000;
const e = 2000;
const f = 3000;
const arr = Array.from({ length: 10000 }, (_, i) => i);
const obj = {
  nested: {
    deep: {
      value: 'test'
    }
  }
};`;

  const runBenchmark = () => {
    setRunning(true);
    setResults([]);

    setTimeout(() => {
      try {
        // Create setup context
        const setup = new Function(setupCode + '\nreturn { a, b, c, d, e, f, arr, obj };')();
        const { a, b, c, d, e, f, arr, obj } = setup;

        // Prepare test function
        const testFn = new Function('a', 'b', 'c', 'd', 'e', 'f', 'arr', 'obj', code);

        // Warmup
        for (let i = 0; i < 100; i++) {
          testFn(a, b, c, d, e, f, arr, obj);
        }

        // Actual benchmark
        const iterations = 10000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          testFn(a, b, c, d, e, f, arr, obj);
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const opsPerSecond = Math.round((iterations / totalTime) * 1000);

        setResults([{
          name: '自定义代码',
          opsPerSecond,
          totalTime,
          sampleCount: iterations,
        }]);
      } catch (err) {
        console.error(err);
        alert('代码执行错误: ' + (err instanceof Error ? err.message : '未知错误'));
      }
      setRunning(false);
    }, 50);
  };

  const runComparison = () => {
    setRunning(true);
    setResults([]);

    setTimeout(() => {
      try {
        const setup = new Function(setupCode + '\nreturn { a, b, c, arr, obj };')() as {
          a: number;
          b: number;
          c: number;
          arr: number[];
          obj: Record<string, unknown>;
        };
        const { a, b, c, arr, obj } = setup;

        const tests = [
          { name: 'Array.find', fn: () => arr.find((x: number) => x === 5000) },
          { name: 'Array.findIndex', fn: () => arr.findIndex((x: number) => x === 5000) },
          { name: 'Array.indexOf', fn: () => arr.indexOf(5000) },
          { name: 'for循环', fn: () => { for (let i = 0; i < arr.length; i++) { if (arr[i] === 5000) return i; } return -1; } },
          { name: 'for...of', fn: () => { for (const x of arr) { if (x === 5000) return x; } } },
          { name: 'Object.keys', fn: () => Object.keys(obj) },
          { name: 'Object.values', fn: () => Object.values(obj) },
          { name: 'Object.entries', fn: () => Object.entries(obj) },
          { name: 'JSON.stringify', fn: () => JSON.stringify(obj) },
          { name: 'JSON.parse', fn: () => JSON.parse('{"nested":{"deep":{"value":"test"}}}') },
          { name: 'Math.sqrt', fn: () => Math.sqrt(a * a + b * b) },
          { name: 'Math.pow', fn: () => Math.pow(a, 2) + Math.pow(b, 2) },
          { name: '模板字符串', fn: () => `value: ${a}, ${b}, ${c}` },
          { name: '字符串拼接', fn: () => 'value: ' + a + ', ' + b + ', ' + c },
          { name: 'Array.map', fn: () => arr.map((x: number) => x * 2) },
          { name: 'Array.filter', fn: () => arr.filter((x: number) => x > 5000) },
          { name: 'Array.reduce', fn: () => arr.reduce((sum: number, x: number) => sum + x, 0) },
          { name: 'Array.forEach', fn: () => { let sum = 0; arr.forEach((x: number) => sum += x); return sum; } },
          { name: 'for循环求和', fn: () => { let sum = 0; for (let i = 0; i < arr.length; i++) sum += arr[i]; return sum; } },
          { name: '展开运算符', fn: () => [...arr] },
          { name: 'Array.from', fn: () => Array.from(arr) },
          { name: 'Array.slice', fn: () => arr.slice() },
        ];

        const newResults: BenchmarkResult[] = [];

        for (const test of tests) {
          // Warmup
          for (let i = 0; i < 100; i++) {
            test.fn();
          }

          // Benchmark
          const iterations = 10000;
          const startTime = performance.now();

          for (let i = 0; i < iterations; i++) {
            test.fn();
          }

          const endTime = performance.now();
          const totalTime = endTime - startTime;
          const opsPerSecond = Math.round((iterations / totalTime) * 1000);

          newResults.push({
            name: test.name,
            opsPerSecond,
            totalTime,
            sampleCount: iterations,
          });
        }

        // Sort by ops per second
        newResults.sort((a, b) => b.opsPerSecond - a.opsPerSecond);
        setResults(newResults);
      } catch (err) {
        console.error(err);
        alert('执行错误: ' + (err instanceof Error ? err.message : '未知错误'));
      }
      setRunning(false);
    }, 50);
  };

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    return n.toFixed(0);
  };

  const maxOps = results.length > 0 ? Math.max(...results.map(r => r.opsPerSecond)) : 0;

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="JavaScript 性能测试">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={runBenchmark} disabled={running}>
              {running ? '测试中...' : '运行自定义测试'}
            </Button>
            <Button variant="secondary" onClick={runComparison} disabled={running}>
              运行对比测试
            </Button>
          </div>

          {/* Code Editor */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              自定义测试代码
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="input"
              style={{
                width: '100%',
                minHeight: '150px',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                测试结果 ({results[0].sampleCount.toLocaleString()} 次迭代)
              </div>
              {results.map((result, index) => (
                <div
                  key={result.name}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>
                      {index === 0 && '👑 '}
                      {result.name}
                    </span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {formatNumber(result.opsPerSecond)} ops/s
                    </span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(result.opsPerSecond / maxOps) * 100}%`,
                      background: index === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    总耗时: {result.totalTime.toFixed(2)}ms
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card title="注意事项">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 性能测试结果可能因浏览器、设备性能而异</div>
          <div>• JIT 编译优化可能会影响测试结果</div>
          <div>• 实际应用中的性能可能与微基准测试不同</div>
          <div>• 建议多次运行取平均值以获得更准确的结果</div>
          <div>• 自定义代码在沙箱环境中执行，但请注意安全</div>
        </div>
      </Card>
    </div>
  );
}