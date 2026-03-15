import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower'>('upper');
  const [indentSize, setIndentSize] = useState(2);

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'INDEX', 'VIEW', 'DROP', 'ALTER',
    'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'NULL', 'IS', 'LIKE',
    'BETWEEN', 'ASC', 'DESC', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'AUTO_INCREMENT',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
    'FULL OUTER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN',
  ];

  const formatSQL = () => {
    let sql = input;

    // Normalize whitespace
    sql = sql.replace(/\s+/g, ' ').trim();

    // Handle multi-word keywords first (longer matches first)
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    for (const keyword of sortedKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const replacement = keywordCase === 'upper' ? keyword.toUpperCase() : keyword.toLowerCase();
      sql = sql.replace(regex, replacement);
    }

    // Add line breaks before major clauses
    const lineBreakKeywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
      'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'ON',
      'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
    ];

    for (const keyword of lineBreakKeywords) {
      const regex = new RegExp(`\\s+${keyword.replace(' ', '\\s+')}\\b`, 'gi');
      sql = sql.replace(regex, '\n' + (keywordCase === 'upper' ? keyword.toUpperCase() : keyword.toLowerCase()));
    }

    // Handle SELECT fields
    const lines = sql.split('\n');
    const formattedLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Split comma-separated fields in SELECT
      if (trimmedLine.toUpperCase().startsWith('SELECT')) {
        const selectMatch = trimmedLine.match(/^SELECT\s+(.*)$/i);
        if (selectMatch) {
          const fields = selectMatch[1].split(',').map(f => f.trim());
          if (fields.length > 1) {
            const indent = ' '.repeat(indentSize);
            formattedLines.push('SELECT');
            fields.forEach((field, index) => {
              formattedLines.push(indent + field + (index < fields.length - 1 ? ',' : ''));
            });
            continue;
          }
        }
      }

      formattedLines.push(trimmedLine);
    }

    setOutput(formattedLines.join('\n'));
  };

  const minifySQL = () => {
    let sql = input;
    // Remove extra whitespace and newlines
    sql = sql.replace(/\s+/g, ' ').trim();
    setOutput(sql);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  const loadExample = () => {
    setInput(`select id, name, email, created_at from users u left join orders o on u.id = o.user_id where u.status = 'active' and o.total > 100 group by u.id order by created_at desc limit 10`);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="SQL 格式化">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Settings */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>关键字:</span>
              <select
                value={keywordCase}
                onChange={e => setKeywordCase(e.target.value as 'upper' | 'lower')}
                className="input"
              >
                <option value="upper">大写</option>
                <option value="lower">小写</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>缩进:</span>
              <input
                type="number"
                value={indentSize}
                onChange={e => setIndentSize(parseInt(e.target.value) || 2)}
                className="input"
                style={{ width: '60px' }}
                min={1}
                max={8}
              />
            </div>
          </div>

          {/* Input */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>输入 SQL</div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="粘贴您的 SQL 语句..."
              className="input"
              style={{
                width: '100%',
                minHeight: '150px',
                fontFamily: 'monospace',
                fontSize: '13px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={formatSQL}>格式化</Button>
            <Button variant="secondary" onClick={minifySQL}>压缩</Button>
            <Button variant="secondary" onClick={loadExample}>加载示例</Button>
            <Button variant="secondary" onClick={clearAll}>清空</Button>
          </div>

          {/* Output */}
          {output && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>输出结果</span>
                <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
              </div>
              <pre
                className="result-box"
                style={{
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: '400px',
                  overflow: 'auto',
                }}
              >
                {output}
              </pre>
            </div>
          )}
        </div>
      </Card>

      <Card title="支持的 SQL 语句">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>SELECT</strong> - 查询语句</div>
          <div>• <strong>INSERT</strong> - 插入语句</div>
          <div>• <strong>UPDATE</strong> - 更新语句</div>
          <div>• <strong>DELETE</strong> - 删除语句</div>
          <div>• <strong>CREATE/ALTER/DROP</strong> - DDL 语句</div>
          <div>• <strong>JOIN</strong> - 连接查询</div>
          <div>• <strong>UNION</strong> - 联合查询</div>
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 粘贴 SQL 语句并点击"格式化"进行美化</div>
          <div>• 支持关键字大小写转换</div>
          <div>• 自动添加换行和缩进，提高可读性</div>
          <div>• "压缩"功能可移除多余空白，减小 SQL 体积</div>
        </div>
      </Card>
    </div>
  );
}