import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';

interface ValidationError {
  path: string;
  message: string;
}

export default function JsonSchemaValidator() {
  const [jsonInput, setJsonInput] = useState('');
  const [schemaInput, setSchemaInput] = useState('');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateJsonSchema = () => {
    setErrors([]);
    setIsValid(null);
    setOutput('');

    let jsonData: unknown;
    let schemaData: unknown;

    try {
      jsonData = JSON.parse(jsonInput);
    } catch {
      setErrors([{ path: 'JSON', message: 'JSON 数据格式无效' }]);
      return;
    }

    try {
      schemaData = JSON.parse(schemaInput);
    } catch {
      setErrors([{ path: 'Schema', message: 'JSON Schema 格式无效' }]);
      return;
    }

    const validationErrors = validateSchema(jsonData, schemaData, '');
    
    if (validationErrors.length === 0) {
      setIsValid(true);
      setOutput('✓ JSON 数据符合 Schema 定义');
    } else {
      setIsValid(false);
      setErrors(validationErrors);
    }
  };

  const validateSchema = (data: unknown, schema: unknown, path: string): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (typeof schema !== 'object' || schema === null) {
      return errors;
    }

    const schemaObj = schema as Record<string, unknown>;

    // type 验证
    if (schemaObj.type) {
      const typeError = validateType(data, schemaObj.type as string | string[], path);
      if (typeError) errors.push(typeError);
    }

    // enum 验证
    if (schemaObj.enum) {
      if (!(schemaObj.enum as unknown[]).includes(data)) {
        errors.push({
          path,
          message: `值必须是以下之一: ${(schemaObj.enum as unknown[]).join(', ')}`
        });
      }
    }

    // const 验证
    if (schemaObj.const !== undefined) {
      if (data !== schemaObj.const) {
        errors.push({
          path,
          message: `值必须等于: ${JSON.stringify(schemaObj.const)}`
        });
      }
    }

    // string 验证
    if (typeof data === 'string') {
      if (typeof schemaObj.minLength === 'number' && data.length < schemaObj.minLength) {
        errors.push({ path, message: `字符串长度至少为 ${schemaObj.minLength}` });
      }
      if (typeof schemaObj.maxLength === 'number' && data.length > schemaObj.maxLength) {
        errors.push({ path, message: `字符串长度最多为 ${schemaObj.maxLength}` });
      }
      if (typeof schemaObj.pattern === 'string') {
        const regex = new RegExp(schemaObj.pattern);
        if (!regex.test(data)) {
          errors.push({ path, message: `字符串不匹配模式: ${schemaObj.pattern}` });
        }
      }
      if (schemaObj.format === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data)) {
          errors.push({ path, message: '字符串不是有效的邮箱格式' });
        }
      }
      if (schemaObj.format === 'uri') {
        try {
          new URL(data);
        } catch {
          errors.push({ path, message: '字符串不是有效的 URI 格式' });
        }
      }
    }

    // number 验证
    if (typeof data === 'number') {
      if (typeof schemaObj.minimum === 'number' && data < schemaObj.minimum) {
        errors.push({ path, message: `数值必须 >= ${schemaObj.minimum}` });
      }
      if (typeof schemaObj.maximum === 'number' && data > schemaObj.maximum) {
        errors.push({ path, message: `数值必须 <= ${schemaObj.maximum}` });
      }
      if (typeof schemaObj.exclusiveMinimum === 'number' && data <= schemaObj.exclusiveMinimum) {
        errors.push({ path, message: `数值必须 > ${schemaObj.exclusiveMinimum}` });
      }
      if (typeof schemaObj.exclusiveMaximum === 'number' && data >= schemaObj.exclusiveMaximum) {
        errors.push({ path, message: `数值必须 < ${schemaObj.exclusiveMaximum}` });
      }
      if (typeof schemaObj.multipleOf === 'number' && data % schemaObj.multipleOf !== 0) {
        errors.push({ path, message: `数值必须是 ${schemaObj.multipleOf} 的倍数` });
      }
    }

    // array 验证
    if (Array.isArray(data)) {
      if (typeof schemaObj.minItems === 'number' && data.length < schemaObj.minItems) {
        errors.push({ path, message: `数组长度至少为 ${schemaObj.minItems}` });
      }
      if (typeof schemaObj.maxItems === 'number' && data.length > schemaObj.maxItems) {
        errors.push({ path, message: `数组长度最多为 ${schemaObj.maxItems}` });
      }
      if (schemaObj.uniqueItems === true) {
        const unique = new Set(data.map(item => JSON.stringify(item)));
        if (unique.size !== data.length) {
          errors.push({ path, message: '数组元素必须唯一' });
        }
      }
      if (schemaObj.items) {
        data.forEach((item, index) => {
          const itemErrors = validateSchema(item, schemaObj.items, `${path}[${index}]`);
          errors.push(...itemErrors);
        });
      }
    }

    // object 验证
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const dataObj = data as Record<string, unknown>;
      const properties = schemaObj.properties as Record<string, unknown> | undefined;
      const required = schemaObj.required as string[] | undefined;

      // required 验证
      if (required) {
        required.forEach((key: string) => {
          if (!(key in dataObj)) {
            errors.push({ path, message: `缺少必需属性: ${key}` });
          }
        });
      }

      // properties 验证
      if (properties) {
        Object.keys(properties).forEach(key => {
          if (key in dataObj) {
            const propErrors = validateSchema(dataObj[key], properties[key], path ? `${path}.${key}` : key);
            errors.push(...propErrors);
          }
        });
      }

      // additionalProperties 验证
      if (schemaObj.additionalProperties === false && properties) {
        Object.keys(dataObj).forEach(key => {
          if (!(key in properties)) {
            errors.push({ path, message: `不允许额外的属性: ${key}` });
          }
        });
      }

      // minProperties / maxProperties
      if (typeof schemaObj.minProperties === 'number' && Object.keys(dataObj).length < schemaObj.minProperties) {
        errors.push({ path, message: `对象属性数量至少为 ${schemaObj.minProperties}` });
      }
      if (typeof schemaObj.maxProperties === 'number' && Object.keys(dataObj).length > schemaObj.maxProperties) {
        errors.push({ path, message: `对象属性数量最多为 ${schemaObj.maxProperties}` });
      }
    }

    // anyOf / oneOf / allOf
    if (schemaObj.anyOf) {
      const anyValid = (schemaObj.anyOf as unknown[]).some(subSchema => 
        validateSchema(data, subSchema, path).length === 0
      );
      if (!anyValid) {
        errors.push({ path, message: '数据不满足 anyOf 条件' });
      }
    }

    if (schemaObj.oneOf) {
      const validCount = (schemaObj.oneOf as unknown[]).filter(subSchema => 
        validateSchema(data, subSchema, path).length === 0
      ).length;
      if (validCount !== 1) {
        errors.push({ path, message: '数据必须满足且仅满足一个 oneOf 条件' });
      }
    }

    if (schemaObj.allOf) {
      (schemaObj.allOf as unknown[]).forEach(subSchema => {
        const subErrors = validateSchema(data, subSchema, path);
        errors.push(...subErrors);
      });
    }

    return errors;
  };

  const validateType = (data: unknown, type: string | string[], path: string): ValidationError | null => {
    const types = Array.isArray(type) ? type : [type];
    const actualType = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data;
    
    if (!types.includes(actualType)) {
      return {
        path,
        message: `类型错误: 期望 ${types.join(' | ')}, 实际 ${actualType}`
      };
    }
    return null;
  };

  const generateSchema = () => {
    try {
      const data = JSON.parse(jsonInput);
      const schema = inferSchema(data);
      setSchemaInput(JSON.stringify(schema, null, 2));
    } catch {
      setErrors([{ path: 'JSON', message: 'JSON 数据格式无效' }]);
    }
  };

  const inferSchema = (data: unknown): Record<string, unknown> => {
    if (data === null) {
      return { type: 'null' };
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return { type: 'array' };
      }
      const itemSchemas = data.map(item => inferSchema(item));
      const firstSchema = JSON.stringify(itemSchemas[0]);
      const allSame = itemSchemas.every(s => JSON.stringify(s) === firstSchema);
      return {
        type: 'array',
        items: allSame ? itemSchemas[0] : { anyOf: itemSchemas }
      };
    }

    if (typeof data === 'object') {
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      
      Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
        properties[key] = inferSchema(value);
        required.push(key);
      });

      return {
        type: 'object',
        properties,
        required
      };
    }

    return { type: typeof data };
  };

  const clearAll = () => {
    setJsonInput('');
    setSchemaInput('');
    setOutput('');
    setErrors([]);
    setIsValid(null);
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify({
      name: "张三",
      age: 25,
      email: "zhangsan@example.com",
      skills: ["JavaScript", "TypeScript", "React"]
    }, null, 2));

    setSchemaInput(JSON.stringify({
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        age: { type: "number", minimum: 0, maximum: 150 },
        email: { type: "string", format: "email" },
        skills: {
          type: "array",
          items: { type: "string" },
          minItems: 1
        }
      },
      required: ["name", "age"]
    }, null, 2));
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600 }}>JSON Schema 验证器</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="JSON 数据">
          <TextArea
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            placeholder="输入要验证的 JSON 数据..."
            style={{ minHeight: '300px' }}
          />
        </Card>

        <Card title="JSON Schema">
          <TextArea
            value={schemaInput}
            onChange={e => setSchemaInput(e.target.value)}
            placeholder="输入 JSON Schema..."
            style={{ minHeight: '300px' }}
          />
        </Card>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={validateJsonSchema}>验证</Button>
        <Button variant="secondary" onClick={generateSchema}>从 JSON 生成 Schema</Button>
      </div>

      {isValid === true && (
        <div style={{ 
          padding: '16px', 
          background: 'var(--accent-success)', 
          color: 'white', 
          borderRadius: '8px',
          fontWeight: 500 
        }}>
          {output}
        </div>
      )}

      {isValid === false && errors.length > 0 && (
        <Card title="验证错误">
          <div style={{ display: 'grid', gap: '8px' }}>
            {errors.map((error, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--accent-danger)'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--accent-danger)', marginBottom: '4px' }}>
                  {error.path || '根节点'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}