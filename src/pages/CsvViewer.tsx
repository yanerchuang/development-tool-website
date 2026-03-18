import { useState, useMemo } from 'react';
import { Card, Button, TextArea } from '../components/common';

interface CsvData {
  headers: string[];
  rows: string[][];
}

export default function CsvViewer() {
  const [input, setInput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [editCell, setEditCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const parsedData = useMemo<CsvData | null>(() => {
    if (!input.trim()) return null;
    
    try {
      const lines = input.trim().split('\n');
      if (lines.length === 0) return null;

      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (inQuotes) {
            if (char === '"') {
              if (line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = false;
              }
            } else {
              current += char;
            }
          } else {
            if (char === '"') {
              inQuotes = true;
            } else if (char === delimiter) {
              result.push(current);
              current = '';
            } else {
              current += char;
            }
          }
        }
        result.push(current);
        return result;
      };

      const rows = lines.map(parseCsvLine);
      const headers = hasHeader ? rows[0] : rows[0].map((_, i) => `列 ${i + 1}`);
      const dataRows = hasHeader ? rows.slice(1) : rows;

      return { headers, rows: dataRows };
    } catch {
      return null;
    }
  }, [input, delimiter, hasHeader]);

  const filteredAndSortedRows = useMemo(() => {
    if (!parsedData) return [];

    let rows = [...parsedData.rows];

    // 搜索过滤
    if (searchTerm) {
      rows = rows.filter(row =>
        row.some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 排序
    if (sortColumn !== null) {
      rows.sort((a, b) => {
        const aVal = a[sortColumn] || '';
        const bVal = b[sortColumn] || '';
        const comparison = aVal.localeCompare(bVal, 'zh-CN');
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return rows;
  }, [parsedData, searchTerm, sortColumn, sortDirection]);

  const handleCellClick = (row: number, col: number) => {
    if (parsedData) {
      setEditCell({ row, col });
      setEditValue(parsedData.rows[row][col] || '');
    }
  };

  const handleCellSave = () => {
    if (editCell && parsedData) {
      const newRows = [...parsedData.rows];
      newRows[editCell.row] = [...newRows[editCell.row]];
      newRows[editCell.row][editCell.col] = editValue;
      
      const newInput = hasHeader
        ? [parsedData.headers.join(delimiter), ...newRows.map(r => r.join(delimiter))].join('\n')
        : newRows.map(r => r.join(delimiter)).join('\n');
      
      setInput(newInput);
      setEditCell(null);
    }
  };

  const handleSort = (col: number) => {
    if (sortColumn === col) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const exportToJson = () => {
    if (!parsedData) return;
    const json = parsedData.rows.map(row => {
      const obj: Record<string, string> = {};
      parsedData.headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCsv = () => {
    const blob = new Blob([input], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setSearchTerm('');
    setSortColumn(null);
  };

  const loadSample = () => {
    setInput(`姓名,年龄,城市,职业
张三,28,北京,工程师
李四,32,上海,设计师
王五,25,广州,产品经理
赵六,30,深圳,数据分析师
钱七,27,杭州,前端开发`);
  };

  const stats = useMemo(() => {
    if (!parsedData) return null;
    return {
      columns: parsedData.headers.length,
      rows: parsedData.rows.length,
      filtered: filteredAndSortedRows.length
    };
  }, [parsedData, filteredAndSortedRows]);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="CSV 查看器">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
          </div>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入 CSV 数据，或粘贴 Excel 数据..."
            style={{ minHeight: '150px' }}
          />
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-secondary)' }}>分隔符：</span>
        <select value={delimiter} onChange={e => setDelimiter(e.target.value)} className="select" style={{ width: '80px' }}>
          <option value=",">逗号 ,</option>
          <option value=";">分号 ;</option>
          <option value="	">Tab</option>
          <option value="|">竖线 |</option>
        </select>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={e => setHasHeader(e.target.checked)}
          />
          <span>首行为表头</span>
        </label>

        <div style={{ flex: 1 }} />

        {parsedData && (
          <>
            <Button variant="secondary" onClick={exportToJson}>导出 JSON</Button>
            <Button variant="secondary" onClick={exportToCsv}>导出 CSV</Button>
          </>
        )}
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          <span>列数: {stats.columns}</span>
          <span>行数: {stats.rows}</span>
          {searchTerm && <span>筛选结果: {stats.filtered} 行</span>}
        </div>
      )}

      {parsedData && (
        <Card title="数据表格">
          <div style={{ display: 'grid', gap: '12px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索..."
              className="input"
              style={{ maxWidth: '300px' }}
            />
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--border)', width: '40px' }}>#</th>
                    {parsedData.headers.map((header, i) => (
                      <th 
                        key={i}
                        onClick={() => handleSort(i)}
                        style={{ 
                          padding: '12px', 
                          textAlign: 'left', 
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {header}
                          {sortColumn === i && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedRows.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{ background: rowIndex % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)' }}>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td 
                          key={colIndex}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer'
                          }}
                        >
                          {editCell?.row === rowIndex && editCell?.col === colIndex ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={e => e.key === 'Enter' && handleCellSave()}
                              className="input"
                              autoFocus
                              style={{ width: '100%', padding: '4px 8px' }}
                            />
                          ) : (
                            cell || <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedRows.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                {searchTerm ? '没有找到匹配的数据' : '暂无数据'}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}