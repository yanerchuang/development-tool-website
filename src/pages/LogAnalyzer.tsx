import { useState, useMemo } from 'react';
import { Card, Button, TextArea } from '../components/common';

type LogLevel = 'all' | 'error' | 'warn' | 'info' | 'debug';

interface LogLine {
  raw: string;
  level: LogLevel;
  timestamp: string;
  message: string;
  lineNumber: number;
}

interface LogStats {
  total: number;
  error: number;
  warn: number;
  info: number;
  debug: number;
  unknown: number;
}

export default function LogAnalyzer() {
  const [input, setInput] = useState('');
  const [filterLevel, setFilterLevel] = useState<LogLevel>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [excludePattern, setExcludePattern] = useState('');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [highlightPattern, setHighlightPattern] = useState('');

  const parseLogLevel = (line: string): LogLevel => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error') || lowerLine.includes('err') || lowerLine.includes('fatal') || lowerLine.includes('exception')) {
      return 'error';
    }
    if (lowerLine.includes('warn') || lowerLine.includes('warning')) {
      return 'warn';
    }
    if (lowerLine.includes('info')) {
      return 'info';
    }
    if (lowerLine.includes('debug') || lowerLine.includes('trace') || lowerLine.includes('verbose')) {
      return 'debug';
    }
    return 'all';
  };

  const parseTimestamp = (line: string): string => {
    // 匹配常见的时间戳格式
    const patterns = [
      /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/, // ISO 格式
      /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/, // MM/DD/YYYY HH:mm:ss
      /\[\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\]/, // [YYYY-MM-DD HH:mm:ss]
      /\d{2}:\d{2}:\d{2}\.\d{3}/, // HH:mm:ss.SSS
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return '';
  };

  const parsedLogs = useMemo<LogLine[]>(() => {
    if (!input.trim()) return [];

    const lines = input.split('\n');
    return lines.map((line, index) => ({
      raw: line,
      level: parseLogLevel(line),
      timestamp: parseTimestamp(line),
      message: line,
      lineNumber: index + 1,
    }));
  }, [input]);

  const stats = useMemo<LogStats>(() => {
    const initial: LogStats = { total: parsedLogs.length, error: 0, warn: 0, info: 0, debug: 0, unknown: 0 };

    return parsedLogs.reduce((acc, log) => {
      if (log.level !== 'all') {
        acc[log.level]++;
      } else {
        acc.unknown++;
      }
      return acc;
    }, initial);
  }, [parsedLogs]);

  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(log => {
      // 按级别过滤
      if (filterLevel !== 'all' && log.level !== filterLevel) {
        return false;
      }

      // 按搜索词过滤
      if (searchTerm && !log.raw.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // 排除模式
      if (excludePattern) {
        try {
          const regex = new RegExp(excludePattern, 'i');
          if (regex.test(log.raw)) {
            return false;
          }
        } catch {
          // 正则无效，跳过
        }
      }

      return true;
    });
  }, [parsedLogs, filterLevel, searchTerm, excludePattern]);

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'error': return 'var(--accent-danger)';
      case 'warn': return '#f59e0b';
      case 'info': return 'var(--accent-primary)';
      case 'debug': return 'var(--text-secondary)';
      default: return 'var(--text-primary)';
    }
  };

  const getLevelBg = (level: LogLevel): string => {
    switch (level) {
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      case 'warn': return 'rgba(245, 158, 11, 0.1)';
      case 'info': return 'rgba(59, 130, 246, 0.1)';
      case 'debug': return 'rgba(156, 163, 175, 0.1)';
      default: return 'transparent';
    }
  };

  const exportFiltered = () => {
    const content = filteredLogs.map(log => log.raw).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered-logs.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setInput(`2024-02-14 10:23:45.123 INFO  [main] Application started successfully
2024-02-14 10:23:45.456 DEBUG [http-handler] Processing request: GET /api/users
2024-02-14 10:23:45.789 INFO  [database] Connected to database: production
2024-02-14 10:23:46.012 WARN  [cache] Cache miss for key: user_settings_123
2024-02-14 10:23:46.345 ERROR [http-handler] Failed to process request: Connection timeout
java.net.ConnectException: Connection refused
    at java.net.PlainSocketImpl.socketConnect(Native Method)
    at java.net.AbstractPlainSocketImpl.doConnect(AbstractPlainSocketImpl.java:350)
2024-02-14 10:23:46.678 INFO  [http-handler] Retrying connection...
2024-02-14 10:23:47.001 DEBUG [http-handler] Connection established
2024-02-14 10:23:47.234 WARN  [security] Invalid authentication token for user: guest
2024-02-14 10:23:47.567 ERROR [payment] Payment processing failed: Insufficient funds
2024-02-14 10:23:47.890 INFO  [scheduler] Scheduled task completed: cleanup_old_sessions
2024-02-14 10:23:48.123 DEBUG [metrics] Memory usage: 512MB / 1024MB
2024-02-14 10:23:48.456 FATAL [core] Out of memory error detected
2024-02-14 10:23:48.789 INFO  [main] Graceful shutdown initiated`);
  };

  const clearAll = () => {
    setInput('');
    setSearchTerm('');
    setExcludePattern('');
    setHighlightPattern('');
    setFilterLevel('all');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="日志分析器">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          分析和过滤日志文件，快速定位问题
        </p>
      </Card>

      {/* 统计 */}
      {parsedLogs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>总计</div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.total}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: getLevelBg('error'), borderRadius: '8px' }}>
            <div style={{ color: getLevelColor('error'), fontSize: '12px' }}>ERROR</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: getLevelColor('error') }}>{stats.error}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: getLevelBg('warn'), borderRadius: '8px' }}>
            <div style={{ color: getLevelColor('warn'), fontSize: '12px' }}>WARN</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: getLevelColor('warn') }}>{stats.warn}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: getLevelBg('info'), borderRadius: '8px' }}>
            <div style={{ color: getLevelColor('info'), fontSize: '12px' }}>INFO</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: getLevelColor('info') }}>{stats.info}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: getLevelBg('debug'), borderRadius: '8px' }}>
            <div style={{ color: getLevelColor('debug'), fontSize: '12px' }}>DEBUG</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: getLevelColor('debug') }}>{stats.debug}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>UNKNOWN</div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.unknown}</div>
          </div>
        </div>
      )}

      {/* 输入 */}
      <Card title="日志输入">
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
          <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
        </div>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="粘贴日志内容..."
          style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '13px' }}
        />
      </Card>

      {/* 过滤 */}
      <Card title="过滤和分析">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>日志级别：</span>
            {(['all', 'error', 'warn', 'info', 'debug'] as LogLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  background: filterLevel === level ? getLevelColor(level) : 'var(--bg-secondary)',
                  color: filterLevel === level ? 'white' : 'var(--text-primary)',
                }}
              >
                {level === 'all' ? '全部' : level.toUpperCase()}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索..."
            className="input"
          />

          <input
            type="text"
            value={excludePattern}
            onChange={e => setExcludePattern(e.target.value)}
            placeholder="排除正则表达式..."
            className="input"
          />

          <input
            type="text"
            value={highlightPattern}
            onChange={e => setHighlightPattern(e.target.value)}
            placeholder="高亮正则表达式..."
            className="input"
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={e => setShowLineNumbers(e.target.checked)}
            />
            <span>显示行号</span>
          </label>
        </div>
      </Card>

      {/* 结果 */}
      {filteredLogs.length > 0 && (
        <Card title={`过滤结果 (${filteredLogs.length} 行)`}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={exportFiltered}>导出过滤结果</Button>
          </div>
          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              padding: '12px',
              maxHeight: '400px',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}
          >
            {filteredLogs.map(log => (
              <div
                key={log.lineNumber}
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--border)',
                  background: getLevelBg(log.level),
                }}
              >
                {showLineNumbers && (
                  <span style={{ color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
                    {log.lineNumber}
                  </span>
                )}
                <span style={{ color: getLevelColor(log.level), fontWeight: 600, minWidth: '50px' }}>
                  [{log.level.toUpperCase()}]
                </span>
                <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {log.raw}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}