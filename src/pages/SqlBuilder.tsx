import { useState } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  autoIncrement: boolean;
  defaultValue: string;
}

type QueryType = 'select' | 'insert' | 'update' | 'delete' | 'create' | 'alter';

const columnTypes = [
  'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
  'VARCHAR(255)', 'VARCHAR(100)', 'VARCHAR(50)', 'TEXT', 'LONGTEXT',
  'DECIMAL(10,2)', 'FLOAT', 'DOUBLE',
  'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
  'BOOLEAN', 'BOOL',
  'JSON', 'BLOB',
];

export default function SqlBuilder() {
  const [queryType, setQueryType] = useState<QueryType>('select');
  const [tableName, setTableName] = useState('users');
  const [columns, setColumns] = useState<Column[]>([
    { name: 'id', type: 'INT', nullable: false, primaryKey: true, autoIncrement: true, defaultValue: '' },
    { name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false, autoIncrement: false, defaultValue: '' },
    { name: 'email', type: 'VARCHAR(255)', nullable: false, primaryKey: false, autoIncrement: false, defaultValue: '' },
    { name: 'created_at', type: 'TIMESTAMP', nullable: true, primaryKey: false, autoIncrement: false, defaultValue: 'CURRENT_TIMESTAMP' },
  ]);
  const [whereClause, setWhereClause] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [limit, setLimit] = useState('');
  const [output, setOutput] = useState('');
  const [customSql, setCustomSql] = useState('');

  const addColumn = () => {
    setColumns([...columns, {
      name: `column_${columns.length + 1}`,
      type: 'VARCHAR(255)',
      nullable: true,
      primaryKey: false,
      autoIncrement: false,
      defaultValue: '',
    }]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, updates: Partial<Column>) => {
    setColumns(columns.map((col, i) => i === index ? { ...col, ...updates } : col));
  };

  const generateQuery = () => {
    let sql = '';

    switch (queryType) {
      case 'select':
        sql = generateSelect();
        break;
      case 'insert':
        sql = generateInsert();
        break;
      case 'update':
        sql = generateUpdate();
        break;
      case 'delete':
        sql = generateDelete();
        break;
      case 'create':
        sql = generateCreate();
        break;
      case 'alter':
        sql = generateAlter();
        break;
    }

    setOutput(sql);
  };

  const generateSelect = (): string => {
    const selectColumns = columns.map(c => c.name).join(', ');
    let sql = `SELECT ${selectColumns}\nFROM ${tableName}`;

    if (whereClause) {
      sql += `\nWHERE ${whereClause}`;
    }

    if (orderBy) {
      sql += `\nORDER BY ${orderBy}`;
    }

    if (limit) {
      sql += `\nLIMIT ${limit}`;
    }

    sql += ';';
    return sql;
  };

  const generateInsert = (): string => {
    const columnNames = columns.filter(c => !c.autoIncrement).map(c => c.name).join(', ');
    const values = columns
      .filter(c => !c.autoIncrement)
      .map(c => {
        if (c.defaultValue) {
          return c.defaultValue.startsWith("'") ? c.defaultValue : `'${c.defaultValue}'`;
        }
        return c.nullable ? 'NULL' : '?';
      })
      .join(', ');

    return `INSERT INTO ${tableName} (${columnNames})\nVALUES (${values});`;
  };

  const generateUpdate = (): string => {
    const setClause = columns
      .filter(c => !c.primaryKey)
      .map(c => `${c.name} = ?`)
      .join(',\n    ');

    let sql = `UPDATE ${tableName}\nSET ${setClause}`;

    if (whereClause) {
      sql += `\nWHERE ${whereClause}`;
    }

    sql += ';';
    return sql;
  };

  const generateDelete = (): string => {
    let sql = `DELETE FROM ${tableName}`;

    if (whereClause) {
      sql += `\nWHERE ${whereClause}`;
    }

    sql += ';';
    return sql;
  };

  const generateCreate = (): string => {
    const primaryKeys = columns.filter(c => c.primaryKey).map(c => c.name);

    const columnDefs = columns.map(c => {
      let def = `    ${c.name} ${c.type}`;

      if (c.autoIncrement) {
        def += ' AUTO_INCREMENT';
      }

      if (!c.nullable && !c.autoIncrement) {
        def += ' NOT NULL';
      }

      if (c.defaultValue && !c.autoIncrement) {
        def += ` DEFAULT ${c.defaultValue}`;
      }

      return def;
    });

    if (primaryKeys.length > 0) {
      columnDefs.push(`    PRIMARY KEY (${primaryKeys.join(', ')})`);
    }

    return `CREATE TABLE ${tableName} (\n${columnDefs.join(',\n')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  };

  const generateAlter = (): string => {
    const statements: string[] = [];

    columns.forEach(c => {
      let def = `ADD COLUMN ${c.name} ${c.type}`;

      if (!c.nullable) {
        def += ' NOT NULL';
      }

      if (c.defaultValue) {
        def += ` DEFAULT ${c.defaultValue}`;
      }

      statements.push(`ALTER TABLE ${tableName} ${def};`);
    });

    return statements.join('\n\n');
  };

  const formatSql = () => {
    const sql = customSql || output;
    if (!sql) return;

    let formatted = sql
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',\n    ')
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
      .replace(/\bON\b/gi, '\n    ON')
      .replace(/\bAND\b/gi, '\n    AND')
      .replace(/\bOR\b/gi, '\n    OR')
      .replace(/\bSET\b/gi, '\nSET')
      .replace(/\bVALUES\b/gi, '\nVALUES')
      .trim();

    setCustomSql(formatted);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setOutput('');
    setCustomSql('');
    setWhereClause('');
    setOrderBy('');
    setLimit('');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="SQL 查询构建器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>查询类型：</span>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {(['select', 'insert', 'update', 'delete', 'create', 'alter'] as QueryType[]).map(type => (
                <button
                  key={type}
                  className={`tab ${queryType === type ? 'active' : ''}`}
                  onClick={() => setQueryType(type)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="表名"
            value={tableName}
            onChange={e => setTableName(e.target.value)}
            placeholder="users"
          />
        </div>
      </Card>

      <Card title="列定义">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>列名</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>类型</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>可空</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>主键</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>自增</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>默认值</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={col.name}
                        onChange={e => updateColumn(index, { name: e.target.value })}
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <select
                        value={col.type}
                        onChange={e => updateColumn(index, { type: e.target.value })}
                        className="select"
                        style={{ width: '100%' }}
                      >
                        {columnTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={col.nullable}
                        onChange={e => updateColumn(index, { nullable: e.target.checked })}
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={col.primaryKey}
                        onChange={e => updateColumn(index, { primaryKey: e.target.checked })}
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={col.autoIncrement}
                        onChange={e => updateColumn(index, { autoIncrement: e.target.checked })}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={col.defaultValue}
                        onChange={e => updateColumn(index, { defaultValue: e.target.value })}
                        className="input"
                        style={{ width: '100%' }}
                        placeholder="NULL"
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <Button variant="danger" size="sm" onClick={() => removeColumn(index)}>删除</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="secondary" onClick={addColumn}>添加列</Button>
        </div>
      </Card>

      {(queryType === 'select' || queryType === 'update' || queryType === 'delete') && (
        <Card title="查询条件">
          <div style={{ display: 'grid', gap: '12px' }}>
            <Input
              label="WHERE 条件"
              value={whereClause}
              onChange={e => setWhereClause(e.target.value)}
              placeholder="id = 1 AND status = 'active'"
            />
            {queryType === 'select' && (
              <>
                <Input
                  label="ORDER BY"
                  value={orderBy}
                  onChange={e => setOrderBy(e.target.value)}
                  placeholder="created_at DESC"
                />
                <Input
                  label="LIMIT"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  placeholder="10"
                />
              </>
            )}
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="primary" onClick={generateQuery}>生成 SQL</Button>
        <Button variant="secondary" onClick={clearAll}>清空</Button>
      </div>

      {output && (
        <Card title="生成的 SQL">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
          </div>
          <pre className="result-box" style={{ margin: 0, overflow: 'auto' }}>
            {output}
          </pre>
        </Card>
      )}

      <Card title="SQL 格式化">
        <TextArea
          value={customSql}
          onChange={e => setCustomSql(e.target.value)}
          placeholder="粘贴需要格式化的 SQL..."
          style={{ minHeight: '100px', fontFamily: 'monospace' }}
        />
        <div style={{ marginTop: '12px' }}>
          <Button variant="secondary" onClick={formatSql}>格式化</Button>
        </div>
      </Card>
    </div>
  );
}