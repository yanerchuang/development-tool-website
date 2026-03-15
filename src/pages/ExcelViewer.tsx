import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Card, Button } from '../components/common';
import { Download, Upload, Plus, Trash2, X } from 'lucide-react';

interface SheetData {
  name: string;
  data: (string | number | boolean | null)[][];
}

export default function ExcelViewer() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [fileName, setFileName] = useState('');
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetList: SheetData[] = workbook.SheetNames.map(name => {
          const worksheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as (string | number | boolean | null)[][];
          return { name, data: jsonData };
        });

        setSheets(sheetList);
        setActiveSheet(0);
      } catch (error) {
        alert('无法解析文件，请确保是有效的 Excel 文件');
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCellEdit = (row: number, col: number) => {
    const value = sheets[activeSheet]?.data[row]?.[col];
    setEditValue(String(value ?? ''));
    setEditingCell({ row, col });
  };

  const handleCellSave = () => {
    if (editingCell === null) return;

    const newSheets = [...sheets];
    const { row, col } = editingCell;

    // Ensure row exists
    while (newSheets[activeSheet].data.length <= row) {
      newSheets[activeSheet].data.push([]);
    }
    // Ensure column exists
    while (newSheets[activeSheet].data[row].length <= col) {
      newSheets[activeSheet].data[row].push(null);
    }

    newSheets[activeSheet].data[row][col] = editValue === '' ? null : editValue;
    setSheets(newSheets);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const addRow = () => {
    if (sheets.length === 0) return;
    const newSheets = [...sheets];
    const maxCols = Math.max(...newSheets[activeSheet].data.map(row => row.length), 5);
    newSheets[activeSheet].data.push(Array(maxCols).fill(null));
    setSheets(newSheets);
  };

  const addColumn = () => {
    if (sheets.length === 0) return;
    const newSheets = [...sheets];
    newSheets[activeSheet].data = newSheets[activeSheet].data.map(row => {
      const newRow = [...row];
      newRow.push(null);
      return newRow;
    });
    setSheets(newSheets);
  };

  const deleteRow = (rowIndex: number) => {
    if (sheets.length === 0) return;
    const newSheets = [...sheets];
    newSheets[activeSheet].data.splice(rowIndex, 1);
    setSheets(newSheets);
  };

  const addSheet = () => {
    const newName = `Sheet${sheets.length + 1}`;
    setSheets([...sheets, { name: newName, data: [[null]] }]);
    setActiveSheet(sheets.length);
  };

  const deleteSheet = (index: number) => {
    if (sheets.length <= 1) return;
    const newSheets = sheets.filter((_, i) => i !== index);
    setSheets(newSheets);
    if (activeSheet >= newSheets.length) {
      setActiveSheet(newSheets.length - 1);
    }
  };

  const downloadExcel = () => {
    if (sheets.length === 0) return;

    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    XLSX.writeFile(workbook, fileName || 'spreadsheet.xlsx');
  };

  const createNewWorkbook = () => {
    setSheets([{ name: 'Sheet1', data: [[null]] }]);
    setActiveSheet(0);
    setFileName('new-workbook.xlsx');
  };

  const getColumnName = (index: number): string => {
    let name = '';
    index++;
    while (index > 0) {
      index--;
      name = String.fromCharCode(65 + (index % 26)) + name;
      index = Math.floor(index / 26);
    }
    return name;
  };

  const currentSheet = sheets[activeSheet];
  const maxCols = Math.max(...(currentSheet?.data.map(row => row.length) || [0]), 5);
  const maxRows = currentSheet?.data.length || 0;

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="Excel 文件编辑器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
            />
            <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              上传文件
            </Button>
            <Button variant="secondary" onClick={createNewWorkbook}>
              <Plus size={16} />
              新建工作簿
            </Button>
            {sheets.length > 0 && (
              <>
                <Button variant="primary" onClick={downloadExcel}>
                  <Download size={16} />
                  下载文件
                </Button>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {fileName}
                </span>
              </>
            )}
          </div>

          {sheets.length > 0 && (
            <>
              {/* Sheet Tabs */}
              <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
                {sheets.map((sheet, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: activeSheet === index ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: activeSheet === index ? 'white' : 'var(--text-primary)',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                    onClick={() => setActiveSheet(index)}
                  >
                    <span>{sheet.name}</span>
                    {sheets.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSheet(index);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0',
                          cursor: 'pointer',
                          color: 'inherit',
                          opacity: 0.7,
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSheet}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--bg-tertiary)',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Spreadsheet */}
              <div style={{ overflow: 'auto', maxHeight: '500px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: '100%' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                      <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', minWidth: '40px', textAlign: 'center' }}></th>
                      {Array.from({ length: maxCols }, (_, colIndex) => (
                        <th
                          key={colIndex}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid var(--border-color)',
                            borderRight: '1px solid var(--border-color)',
                            minWidth: '80px',
                            textAlign: 'center',
                            fontWeight: 500,
                          }}
                        >
                          {getColumnName(colIndex)}
                        </th>
                      ))}
                      <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        <button
                          onClick={addColumn}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          <Plus size={14} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxRows }, (_, rowIndex) => (
                      <tr key={rowIndex}>
                        <td
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid var(--border-color)',
                            borderRight: '1px solid var(--border-color)',
                            background: 'var(--bg-tertiary)',
                            textAlign: 'center',
                            fontWeight: 500,
                            fontSize: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{rowIndex + 1}</span>
                            <button
                              onClick={() => deleteRow(rowIndex)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 0 }}
                              title="删除行"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                        {Array.from({ length: maxCols }, (_, colIndex) => {
                          const cellValue = currentSheet?.data[rowIndex]?.[colIndex];
                          const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;

                          return (
                            <td
                              key={colIndex}
                              style={{
                                padding: 0,
                                borderBottom: '1px solid var(--border-color)',
                                borderRight: '1px solid var(--border-color)',
                                minWidth: '80px',
                              }}
                            >
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={handleCellSave}
                                  onKeyDown={handleKeyDown}
                                  autoFocus
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '2px solid var(--accent-primary)',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                  }}
                                />
                              ) : (
                                <div
                                  onClick={() => handleCellEdit(rowIndex, colIndex)}
                                  style={{
                                    padding: '8px',
                                    cursor: 'text',
                                    minHeight: '20px',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {cellValue ?? ''}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={maxCols + 2} style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={addRow}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--accent-primary)',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            margin: '0 auto',
                          }}
                        >
                          <Plus size={14} />
                          添加行
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>行数: {maxRows}</span>
                <span>列数: {maxCols}</span>
                <span>工作表: {sheets.length}</span>
              </div>
            </>
          )}

          {sheets.length === 0 && (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p>上传 Excel 文件或新建工作簿开始编辑</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>支持 .xlsx, .xls, .csv 格式</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>上传文件</strong>：点击上传按钮选择本地 Excel 文件</div>
          <div>• <strong>编辑单元格</strong>：点击单元格进行编辑，按 Enter 保存，Esc 取消</div>
          <div>• <strong>添加行/列</strong>：使用底部和右侧的添加按钮</div>
          <div>• <strong>多工作表</strong>：支持添加、切换和删除工作表</div>
          <div>• <strong>下载文件</strong>：编辑完成后可下载为 .xlsx 格式</div>
        </div>
      </Card>
    </div>
  );
}