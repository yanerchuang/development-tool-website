import { useState } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

interface EnvVariable {
  key: string;
  value: string;
  enabled: boolean;
  description: string;
}

interface EnvPreset {
  name: string;
  variables: EnvVariable[];
}

const presets: EnvPreset[] = [
  {
    name: 'Node.js',
    variables: [
      { key: 'NODE_ENV', value: 'development', enabled: true, description: '运行环境' },
      { key: 'PORT', value: '3000', enabled: true, description: '服务端口' },
      { key: 'HOST', value: 'localhost', enabled: true, description: '主机地址' },
    ],
  },
  {
    name: 'React',
    variables: [
      { key: 'REACT_APP_API_URL', value: '', enabled: true, description: 'API 地址' },
      { key: 'REACT_APP_ENV', value: 'development', enabled: true, description: '环境标识' },
      { key: 'REACT_APP_VERSION', value: '1.0.0', enabled: true, description: '应用版本' },
    ],
  },
  {
    name: 'Next.js',
    variables: [
      { key: 'NEXT_PUBLIC_API_URL', value: '', enabled: true, description: '公开 API 地址' },
      { key: 'NEXT_PUBLIC_ENV', value: 'development', enabled: true, description: '环境标识' },
      { key: 'DATABASE_URL', value: '', enabled: true, description: '数据库连接' },
      { key: 'NEXTAUTH_SECRET', value: '', enabled: true, description: '认证密钥' },
      { key: 'NEXTAUTH_URL', value: '', enabled: true, description: '认证回调 URL' },
    ],
  },
  {
    name: 'Database',
    variables: [
      { key: 'DB_HOST', value: 'localhost', enabled: true, description: '数据库主机' },
      { key: 'DB_PORT', value: '5432', enabled: true, description: '数据库端口' },
      { key: 'DB_NAME', value: '', enabled: true, description: '数据库名称' },
      { key: 'DB_USER', value: '', enabled: true, description: '数据库用户' },
      { key: 'DB_PASSWORD', value: '', enabled: true, description: '数据库密码' },
    ],
  },
  {
    name: 'Redis',
    variables: [
      { key: 'REDIS_HOST', value: 'localhost', enabled: true, description: 'Redis 主机' },
      { key: 'REDIS_PORT', value: '6379', enabled: true, description: 'Redis 端口' },
      { key: 'REDIS_PASSWORD', value: '', enabled: true, description: 'Redis 密码' },
      { key: 'REDIS_DB', value: '0', enabled: true, description: 'Redis 数据库' },
    ],
  },
  {
    name: 'JWT',
    variables: [
      { key: 'JWT_SECRET', value: '', enabled: true, description: 'JWT 密钥' },
      { key: 'JWT_EXPIRES_IN', value: '7d', enabled: true, description: '过期时间' },
      { key: 'JWT_REFRESH_SECRET', value: '', enabled: true, description: '刷新密钥' },
    ],
  },
  {
    name: 'AWS',
    variables: [
      { key: 'AWS_ACCESS_KEY_ID', value: '', enabled: true, description: '访问密钥 ID' },
      { key: 'AWS_SECRET_ACCESS_KEY', value: '', enabled: true, description: '访问密钥' },
      { key: 'AWS_REGION', value: 'us-east-1', enabled: true, description: '区域' },
      { key: 'AWS_S3_BUCKET', value: '', enabled: true, description: 'S3 存储桶' },
    ],
  },
  {
    name: 'OAuth',
    variables: [
      { key: 'GOOGLE_CLIENT_ID', value: '', enabled: true, description: 'Google Client ID' },
      { key: 'GOOGLE_CLIENT_SECRET', value: '', enabled: true, description: 'Google Client Secret' },
      { key: 'GITHUB_CLIENT_ID', value: '', enabled: true, description: 'GitHub Client ID' },
      { key: 'GITHUB_CLIENT_SECRET', value: '', enabled: true, description: 'GitHub Client Secret' },
    ],
  },
];

export default function EnvManager() {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [importText, setImportText] = useState('');
  const [output, setOutput] = useState('');
  const [showValues, setShowValues] = useState(false);
  const [envType, setEnvType] = useState<'dotenv' | 'bash' | 'json'>('dotenv');

  const addVariable = () => {
    if (newKey.trim()) {
      setVariables([...variables, {
        key: newKey.trim(),
        value: newValue,
        enabled: true,
        description: newDescription,
      }]);
      setNewKey('');
      setNewValue('');
      setNewDescription('');
    }
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, updates: Partial<EnvVariable>) => {
    setVariables(variables.map((v, i) => i === index ? { ...v, ...updates } : v));
  };

  const toggleVariable = (index: number) => {
    updateVariable(index, { enabled: !variables[index].enabled });
  };

  const loadPreset = (preset: EnvPreset) => {
    setVariables(preset.variables.map(v => ({ ...v })));
  };

  const importEnv = () => {
    try {
      const lines = importText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      const parsed: EnvVariable[] = lines.map(line => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        return {
          key: key.trim(),
          value: value.trim(),
          enabled: true,
          description: '',
        };
      });
      setVariables(parsed);
      setImportText('');
    } catch {
      alert('导入失败，请检查格式');
    }
  };

  const generateSecret = (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const generateOutput = () => {
    const enabledVars = variables.filter(v => v.enabled);

    let result = '';

    switch (envType) {
      case 'dotenv':
        result = enabledVars.map(v => {
          const value = v.value.includes(' ') || v.value.includes('#') ? `"${v.value}"` : v.value;
          return `${v.key}=${value}`;
        }).join('\n');
        break;

      case 'bash':
        result = enabledVars.map(v => `export ${v.key}="${v.value}"`).join('\n');
        break;

      case 'json':
        const jsonObj: Record<string, string> = {};
        enabledVars.forEach(v => {
          jsonObj[v.key] = v.value;
        });
        result = JSON.stringify(jsonObj, null, 2);
        break;
    }

    setOutput(result);
  };

  const generateExample = () => {
    const result = variables.map(v => {
      let exampleValue = v.value || '<value>';
      if (v.key.includes('SECRET') || v.key.includes('PASSWORD') || v.key.includes('KEY')) {
        exampleValue = 'your-secret-here';
      }
      return `${v.key}=${exampleValue}`;
    }).join('\n');
    setOutput(result);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const downloadEnv = (filename: string) => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setVariables([]);
    setOutput('');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="环境变量管理器">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          管理项目环境变量，支持预设模板、导入导出
        </p>
      </Card>

      {/* 预设模板 */}
      <Card title="预设模板">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {presets.map(preset => (
            <Button key={preset.name} variant="secondary" size="sm" onClick={() => loadPreset(preset)}>
              {preset.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* 添加变量 */}
      <Card title="添加变量">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <Input
            label="变量名"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            placeholder="NODE_ENV"
          />
          <Input
            label="值"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            placeholder="development"
            type={showValues ? 'text' : 'password'}
          />
          <Input
            label="描述"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="运行环境"
          />
          <Button variant="primary" onClick={addVariable}>添加</Button>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showValues} onChange={e => setShowValues(e.target.checked)} />
            <span>显示值</span>
          </label>
          <Button variant="secondary" size="sm" onClick={() => {
            const secret = generateSecret();
            setNewValue(secret);
          }}>
            生成随机密钥
          </Button>
        </div>
      </Card>

      {/* 变量列表 */}
      {variables.length > 0 && (
        <Card title={`变量列表 (${variables.filter(v => v.enabled).length}/${variables.length})`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '10px', textAlign: 'center', width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={variables.every(v => v.enabled)}
                      onChange={e => setVariables(variables.map(v => ({ ...v, enabled: e.target.checked })))}
                    />
                  </th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>变量名</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>值</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>描述</th>
                  <th style={{ padding: '10px', textAlign: 'center', width: '80px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {variables.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', opacity: v.enabled ? 1 : 0.5 }}>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={v.enabled}
                        onChange={() => toggleVariable(i)}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={v.key}
                        onChange={e => updateVariable(i, { key: e.target.value })}
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type={showValues ? 'text' : 'password'}
                        value={v.value}
                        onChange={e => updateVariable(i, { value: e.target.value })}
                        className="input"
                        style={{ width: '100%', fontFamily: 'monospace' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        value={v.description}
                        onChange={e => updateVariable(i, { description: e.target.value })}
                        className="input"
                        style={{ width: '100%' }}
                        placeholder="描述..."
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <Button variant="danger" size="sm" onClick={() => removeVariable(i)}>删除</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 导入 */}
      <Card title="导入 .env">
        <TextArea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder="粘贴 .env 内容...&#10;NODE_ENV=development&#10;PORT=3000"
          style={{ minHeight: '100px' }}
        />
        <div style={{ marginTop: '12px' }}>
          <Button variant="secondary" onClick={importEnv}>导入</Button>
        </div>
      </Card>

      {/* 导出选项 */}
      <Card title="导出">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>格式：</span>
            <div className="tabs" style={{ marginBottom: 0 }}>
              <button className={`tab ${envType === 'dotenv' ? 'active' : ''}`} onClick={() => setEnvType('dotenv')}>.env</button>
              <button className={`tab ${envType === 'bash' ? 'active' : ''}`} onClick={() => setEnvType('bash')}>Bash</button>
              <button className={`tab ${envType === 'json' ? 'active' : ''}`} onClick={() => setEnvType('json')}>JSON</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={generateOutput}>生成</Button>
            <Button variant="secondary" onClick={generateExample}>生成示例 (.env.example)</Button>
            <Button variant="secondary" onClick={clearAll}>清空</Button>
          </div>
        </div>
      </Card>

      {/* 输出 */}
      {output && (
        <Card title="输出结果">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
            {envType === 'dotenv' && (
              <>
                <Button variant="primary" size="sm" onClick={() => downloadEnv('.env')}>下载 .env</Button>
                <Button variant="secondary" size="sm" onClick={() => downloadEnv('.env.example')}>下载 .env.example</Button>
              </>
            )}
            {envType === 'bash' && (
              <Button variant="primary" size="sm" onClick={() => downloadEnv('env.sh')}>下载 env.sh</Button>
            )}
            {envType === 'json' && (
              <Button variant="primary" size="sm" onClick={() => downloadEnv('env.json')}>下载 env.json</Button>
            )}
          </div>
          <pre className="result-box" style={{ margin: 0, maxHeight: '300px', overflow: 'auto' }}>
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
}