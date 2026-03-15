import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../components/common';

interface Step {
  description: string;
  values: number[];
  highlight: number[];
}

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(50);
  const [sorting, setSorting] = useState(false);
  const [algorithm, setAlgorithm] = useState<'bubble' | 'selection' | 'insertion' | 'quick'>('bubble');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const stopRef = useRef(false);

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  const generateArray = () => {
    const arr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
    setArray(arr);
    setSteps([]);
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
    stopRef.current = false;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async (arr: number[]) => {
    const stepsArr: Step[] = [];
    let comp = 0;
    let sw = 0;
    const a = [...arr];

    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        if (stopRef.current) return;
        comp++;
        stepsArr.push({ description: `比较 ${a[j]} 和 ${a[j + 1]}`, values: [...a], highlight: [j, j + 1] });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          sw++;
          stepsArr.push({ description: `交换 ${a[j + 1]} 和 ${a[j]}`, values: [...a], highlight: [j, j + 1] });
        }
      }
    }
    stepsArr.push({ description: '排序完成', values: [...a], highlight: [] });
    return { steps: stepsArr, comparisons: comp, swaps: sw };
  };

  const selectionSort = async (arr: number[]) => {
    const stepsArr: Step[] = [];
    let comp = 0;
    let sw = 0;
    const a = [...arr];

    for (let i = 0; i < a.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < a.length; j++) {
        if (stopRef.current) return;
        comp++;
        stepsArr.push({ description: `比较 ${a[j]} 和 ${a[minIdx]}`, values: [...a], highlight: [j, minIdx] });
        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        sw++;
        stepsArr.push({ description: `交换 ${a[minIdx]} 和 ${a[i]}`, values: [...a], highlight: [i, minIdx] });
      }
    }
    stepsArr.push({ description: '排序完成', values: [...a], highlight: [] });
    return { steps: stepsArr, comparisons: comp, swaps: sw };
  };

  const insertionSort = async (arr: number[]) => {
    const stepsArr: Step[] = [];
    let comp = 0;
    let sw = 0;
    const a = [...arr];

    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0 && a[j] > key) {
        if (stopRef.current) return;
        comp++;
        stepsArr.push({ description: `比较 ${a[j]} 和 ${key}`, values: [...a], highlight: [j, j + 1] });
        a[j + 1] = a[j];
        sw++;
        stepsArr.push({ description: `移动 ${a[j]} 到位置 ${j + 1}`, values: [...a], highlight: [j + 1] });
        j--;
      }
      a[j + 1] = key;
    }
    stepsArr.push({ description: '排序完成', values: [...a], highlight: [] });
    return { steps: stepsArr, comparisons: comp, swaps: sw };
  };

  const quickSort = async (arr: number[]) => {
    const stepsArr: Step[] = [];
    let comp = 0;
    let sw = 0;
    const a = [...arr];

    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = a[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        if (stopRef.current) return -1;
        comp++;
        stepsArr.push({ description: `比较 ${a[j]} 和基准 ${pivot}`, values: [...a], highlight: [j, high] });
        if (a[j] < pivot) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
          sw++;
          stepsArr.push({ description: `交换 ${a[j]} 和 ${a[i]}`, values: [...a], highlight: [i, j] });
        }
      }
      [a[i + 1], a[high]] = [a[high], a[i + 1]];
      sw++;
      stepsArr.push({ description: `将基准 ${pivot} 放到正确位置`, values: [...a], highlight: [i + 1] });
      return i + 1;
    };

    const sort = async (low: number, high: number): Promise<void> => {
      if (low < high) {
        const pi = await partition(low, high);
        if (pi === -1) return;
        await sort(low, pi - 1);
        await sort(pi + 1, high);
      }
    };

    await sort(0, a.length - 1);
    stepsArr.push({ description: '排序完成', values: [...a], highlight: [] });
    return { steps: stepsArr, comparisons: comp, swaps: sw };
  };

  const startSort = async () => {
    setSorting(true);
    stopRef.current = false;
    setSteps([]);
    setCurrentStep(0);

    let result;
    switch (algorithm) {
      case 'bubble':
        result = await bubbleSort(array);
        break;
      case 'selection':
        result = await selectionSort(array);
        break;
      case 'insertion':
        result = await insertionSort(array);
        break;
      case 'quick':
        result = await quickSort(array);
        break;
    }

    if (result && !stopRef.current) {
      setSteps(result.steps);
      setComparisons(result.comparisons);
      setSwaps(result.swaps);

      // Animate steps
      for (let i = 0; i < result.steps.length; i++) {
        if (stopRef.current) break;
        setCurrentStep(i);
        setArray(result.steps[i].values);
        await sleep(101 - speed);
      }
    }

    setSorting(false);
  };

  const stopSort = () => {
    stopRef.current = true;
    setSorting(false);
  };

  const maxVal = Math.max(...array, 1);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="排序算法可视化">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>算法</div>
              <select
                className="input"
                value={algorithm}
                onChange={e => setAlgorithm(e.target.value as typeof algorithm)}
                disabled={sorting}
              >
                <option value="bubble">冒泡排序</option>
                <option value="selection">选择排序</option>
                <option value="insertion">插入排序</option>
                <option value="quick">快速排序</option>
              </select>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                数组大小: {arraySize}
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={arraySize}
                onChange={e => setArraySize(parseInt(e.target.value))}
                disabled={sorting}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                速度: {speed}%
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={e => setSpeed(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!sorting ? (
              <Button variant="primary" onClick={startSort}>开始排序</Button>
            ) : (
              <Button variant="secondary" onClick={stopSort}>停止</Button>
            )}
            <Button variant="secondary" onClick={generateArray} disabled={sorting}>生成新数组</Button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>比较次数: <strong>{comparisons}</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>交换次数: <strong>{swaps}</strong></span>
          </div>

          {/* Visualization */}
          <div style={{
            height: '250px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
          }}>
            {array.map((val, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${(val / maxVal) * 100}%`,
                  background: steps[currentStep]?.highlight.includes(idx)
                    ? 'var(--accent-primary)'
                    : 'var(--accent-secondary)',
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.1s, background 0.1s',
                  minHeight: '4px',
                }}
                title={`${val}`}
              />
            ))}
          </div>

          {/* Current Step */}
          {steps.length > 0 && currentStep < steps.length && (
            <div style={{
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '14px' }}>{steps[currentStep].description}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                步骤 {currentStep + 1} / {steps.length}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="算法说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>冒泡排序</strong>: 重复遍历数组，比较相邻元素并交换。时间复杂度 O(n²)
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>选择排序</strong>: 每次找到最小元素放到已排序末尾。时间复杂度 O(n²)
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>插入排序</strong>: 构建有序序列，插入未排序元素。时间复杂度 O(n²)
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <strong>快速排序</strong>: 选择基准，分治递归。平均时间复杂度 O(n log n)
          </div>
        </div>
      </Card>
    </div>
  );
}