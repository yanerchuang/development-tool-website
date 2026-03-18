import { useState } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

type OutputStyle = 'interface' | 'type' | 'class';

interface TypeOptions {
  optionalNullable: boolean;
  useUnknown: boolean;
  addReadonly: boolean;
  exportType: boolean;
}

export default function TypeScriptGenerator() {
  const [jsonInput, setJsonInput] = useState('');
  const [typeName, setTypeName] = useState('GeneratedType');
  const [outputStyle, setOutputStyle] = useState<OutputStyle>('interface');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<TypeOptions>({
    optionalNullable: false,
    useUnknown: false,
    addReadonly: false,
    exportType: true,
  });

  const inferType = (value: unknown, depth = 0): string => {
    if (value === null) {
      return options.optionalNullable ? 'null' : 'null';
    }

    if (value === undefined) {
      return 'undefined';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return 'never[]';
      }

      const types = new Set(value.map(item => inferType(item, depth + 1)));

      if (types.size === 1) {
        return `${Array.from(types)[0]}[]`;
      }

      return `(${Array.from(types).join(' | ')})[]`;
    }

    if (typeof value === 'object') {
      return generateObjectInterface(value as Record<string, unknown>, depth);
    }

    if (typeof value === 'string') {
      // 尝试检测特殊字符串格式
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'string'; // 日期
      if (/^https?:\/\//.test(value)) return 'string'; // URL
      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'string'; // 邮箱
      return 'string';
    }

    if (typeof value === 'number') {
      return 'number';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    return options.useUnknown ? 'unknown' : 'any';
  };

  const generateObjectInterface = (obj: Record<string, unknown>, depth: number): string => {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return 'Record<string, never>';
    }

    const lines = entries.map(([key, value]) => {
      const inferredType = inferType(value, depth + 1);
      const isOptional = value === null || value === undefined;
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const optionalStr = isOptional ? '?' : '';
      const readonlyStr = options.addReadonly ? 'readonly ' : '';

      return `${readonlyStr}${keyStr}${optionalStr}: ${inferredType};`;
    });

    return `{\n${lines.map(l => '  '.repeat(depth + 1) + l).join('\n')}\n${'  '.repeat(depth)}}`;
  };

  const generateType = () => {
    if (!jsonInput.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      let result = '';

      const exportStr = options.exportType ? 'export ' : '';

      switch (outputStyle) {
        case 'interface':
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            const body = generateObjectInterface(parsed as Record<string, unknown>, 0);
            result = `${exportStr}interface ${typeName} ${body}`;
          } else {
            const inferredType = inferType(parsed);
            result = `${exportStr}type ${typeName} = ${inferredType};`;
          }
          break;

        case 'type':
          const typeValue = inferType(parsed);
          result = `${exportStr}type ${typeName} = ${typeValue};`;
          break;

        case 'class':
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            const entries = Object.entries(parsed);
            const properties = entries.map(([key, value]) => {
              const inferredType = inferType(value);
              const isOptional = value === null || value === undefined;
              const optionalStr = isOptional ? '?' : '';
              return `  ${key}${optionalStr}: ${inferredType};`;
            }).join('\n');

            const constructorParams = entries.map(([key, value]) => {
              const inferredType = inferType(value);
              const isOptional = value === null || value === undefined;
              const optionalStr = isOptional ? '?' : '';
              return `    public ${key}${optionalStr}: ${inferredType},`;
            }).join('\n');

            result = `${exportStr}class ${typeName} {
${properties}

  constructor(
${constructorParams}
  ) {}
}`;
          } else {
            result = '// Class generation only supports objects';
          }
          break;
      }

      setOutput(result);
    } catch (e) {
      setOutput(`// 解析错误: ${(e as Error).message}`);
    }
  };

  const generateZodSchema = () => {
    if (!jsonInput.trim()) return;

    try {
      const parsed = JSON.parse(jsonInput);
      const schema = generateZodFromValue(parsed, '  ');
      setOutput(`import { z } from 'zod';\n\nexport const ${typeName}Schema = z.object({\n${schema}\});\n\nexport type ${typeName} = z.infer<typeof ${typeName}Schema>;`);
    } catch (e) {
      setOutput(`// 解析错误: ${(e as Error).message}`);
    }
  };

  const generateZodFromValue = (value: unknown, indent: string): string => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const entries = Object.entries(value as Record<string, unknown>);
      return entries.map(([key, val]) => {
        const zodType = getZodType(val, indent);
        const isOptional = val === null || val === undefined;
        const optionalStr = isOptional ? '.optional()' : '';
        return `${indent}  ${key}: ${zodType}${optionalStr},`;
      }).join('\n');
    }
    return getZodType(value, indent);
  };

  const getZodType = (value: unknown, indent: string): string => {
    if (value === null || value === undefined) return 'z.null()';
    if (typeof value === 'string') return 'z.string()';
    if (typeof value === 'number') return 'z.number()';
    if (typeof value === 'boolean') return 'z.boolean()';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'z.array(z.any())';
      const itemType = getZodType(value[0], indent);
      return `z.array(${itemType})`;
    }
    if (typeof value === 'object') {
      const inner = generateZodFromValue(value, indent + '  ');
      return `z.object({\n${inner}\n${indent}})`;
    }
    return 'z.any()';
  };

  const generateJoiSchema = () => {
    if (!jsonInput.trim()) return;

    try {
      const parsed = JSON.parse(jsonInput);
      const schema = generateJoiFromValue(parsed, '  ');
      setOutput(`import Joi from 'joi';\n\nexport const ${typeName}Schema = Joi.object({\n${schema}\});`);
    } catch (e) {
      setOutput(`// 解析错误: ${(e as Error).message}`);
    }
  };

  const generateJoiFromValue = (value: unknown, indent: string): string => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const entries = Object.entries(value as Record<string, unknown>);
      return entries.map(([key, val]) => {
        const joiType = getJoiType(val, indent);
        const isOptional = val === null || val === undefined;
        const requiredStr = isOptional ? '' : '.required()';
        return `${indent}  ${key}: ${joiType}${requiredStr},`;
      }).join('\n');
    }
    return getJoiType(value, indent);
  };

  const getJoiType = (value: unknown, indent: string): string => {
    if (value === null || value === undefined) return 'Joi.any()';
    if (typeof value === 'string') return 'Joi.string()';
    if (typeof value === 'number') return 'Joi.number()';
    if (typeof value === 'boolean') return 'Joi.boolean()';
    if (Array.isArray(value)) {
      return 'Joi.array()';
    }
    if (typeof value === 'object') {
      const inner = generateJoiFromValue(value, indent + '  ');
      return `Joi.object({\n${inner}\n${indent}})`;
    }
    return 'Joi.any()';
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setJsonInput('');
    setOutput('');
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify({
      id: 1,
      name: "张三",
      email: "zhangsan@example.com",
      age: 25,
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
      tags: ["developer", "designer"],
      profile: {
        avatar: "https://example.com/avatar.jpg",
        bio: "前端开发工程师",
        social: {
          github: "zhangsan",
          twitter: null
        }
      },
      settings: null
    }, null, 2));
    setTypeName('User');
  };

  const toggleOption = (key: keyof TypeOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="TypeScript 类型生成器">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          从 JSON 自动生成 TypeScript 类型、Zod/Joi Schema
        </p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="JSON 输入">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
          </div>
          <TextArea
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            placeholder="粘贴 JSON..."
            style={{ minHeight: '300px', fontFamily: 'monospace' }}
          />
        </Card>

        <Card title="类型输出">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
          </div>
          <pre className="result-box" style={{ minHeight: '300px', margin: 0, overflow: 'auto' }}>
            {output || <span style={{ color: 'var(--text-muted)' }}>生成后显示...</span>}
          </pre>
        </Card>
      </div>

      <Card title="配置">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="类型名称"
              value={typeName}
              onChange={e => setTypeName(e.target.value)}
              placeholder="GeneratedType"
            />
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>输出样式</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['interface', 'type', 'class'] as OutputStyle[]).map(style => (
                  <button
                    key={style}
                    onClick={() => setOutputStyle(style)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      background: outputStyle === style ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: outputStyle === style ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.exportType} onChange={() => toggleOption('exportType')} />
              <span>添加 export</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.addReadonly} onChange={() => toggleOption('addReadonly')} />
              <span>添加 readonly</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.useUnknown} onChange={() => toggleOption('useUnknown')} />
              <span>使用 unknown 代替 any</span>
            </label>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={generateType}>生成 TypeScript 类型</Button>
        <Button variant="secondary" onClick={generateZodSchema}>生成 Zod Schema</Button>
        <Button variant="secondary" onClick={generateJoiSchema}>生成 Joi Schema</Button>
      </div>
    </div>
  );
}