import { useState, useMemo } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

interface Translation {
  key: string;
  translations: Record<string, string>;
}

interface Language {
  code: string;
  name: string;
}

export default function I18nTool() {
  const [languages, setLanguages] = useState<Language[]>([
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en', name: 'English' },
  ]);
  const [translations, setTranslations] = useState<Translation[]>([
    { key: 'common.save', translations: { 'zh-CN': '保存', 'en': 'Save' } },
    { key: 'common.cancel', translations: { 'zh-CN': '取消', 'en': 'Cancel' } },
    { key: 'common.delete', translations: { 'zh-CN': '删除', 'en': 'Delete' } },
  ]);
  const [newKey, setNewKey] = useState('');
  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');
  const [importJson, setImportJson] = useState('');
  const [output, setOutput] = useState('');
  const [outputLang, setOutputLang] = useState('zh-CN');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTranslations = useMemo(() => {
    if (!searchTerm) return translations;
    const term = searchTerm.toLowerCase();
    return translations.filter(t =>
      t.key.toLowerCase().includes(term) ||
      Object.values(t.translations).some(v => v.toLowerCase().includes(term))
    );
  }, [translations, searchTerm]);

  const addLanguage = () => {
    if (newLangCode && newLangName && !languages.find(l => l.code === newLangCode)) {
      setLanguages([...languages, { code: newLangCode, name: newLangName }]);
      setNewLangCode('');
      setNewLangName('');
    }
  };

  const removeLanguage = (code: string) => {
    setLanguages(languages.filter(l => l.code !== code));
    setTranslations(translations.map(t => {
      const { [code]: _, ...rest } = t.translations;
      return { ...t, translations: rest };
    }));
  };

  const addKey = () => {
    if (newKey && !translations.find(t => t.key === newKey)) {
      const newTranslation: Translation = {
        key: newKey,
        translations: {},
      };
      languages.forEach(lang => {
        newTranslation.translations[lang.code] = '';
      });
      setTranslations([...translations, newTranslation]);
      setNewKey('');
    }
  };

  const removeKey = (key: string) => {
    setTranslations(translations.filter(t => t.key !== key));
  };

  const updateTranslation = (key: string, langCode: string, value: string) => {
    setTranslations(translations.map(t =>
      t.key === key
        ? { ...t, translations: { ...t.translations, [langCode]: value } }
        : t
    ));
  };

  const importFromJson = () => {
    try {
      const parsed = JSON.parse(importJson);
      const newTranslations: Translation[] = [];

      const traverse = (obj: Record<string, unknown>, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            traverse(value as Record<string, unknown>, fullKey);
          } else if (typeof value === 'string') {
            // Find existing translation or create new
            const existing = newTranslations.find(t => t.key === fullKey);
            if (existing) {
              existing.translations[outputLang] = value;
            } else {
              const t: Translation = { key: fullKey, translations: {} };
              t.translations[outputLang] = value;
              newTranslations.push(t);
            }
          }
        });
      };

      traverse(parsed);

      // Merge with existing
      const merged = [...translations];
      newTranslations.forEach(nt => {
        const existing = merged.find(t => t.key === nt.key);
        if (existing) {
          existing.translations = { ...existing.translations, ...nt.translations };
        } else {
          merged.push(nt);
        }
      });

      setTranslations(merged);
      setImportJson('');
    } catch {
      alert('JSON 格式无效');
    }
  };

  const generateOutput = () => {
    const result: Record<string, unknown> = {};
    translations.forEach(t => {
      if (t.translations[outputLang]) {
        // Convert dot notation to nested object
        const parts = t.key.split('.');
        let current: Record<string, unknown> = result;
        parts.forEach((part, i) => {
          if (i === parts.length - 1) {
            current[part] = t.translations[outputLang];
          } else {
            if (!current[part] || typeof current[part] !== 'object') {
              current[part] = {};
            }
            current = current[part] as Record<string, unknown>;
          }
        });
      }
    });
    setOutput(JSON.stringify(result, null, 2));
  };

  const generateFlatOutput = () => {
    const result: Record<string, string> = {};
    translations.forEach(t => {
      if (t.translations[outputLang]) {
        result[t.key] = t.translations[outputLang];
      }
    });
    setOutput(JSON.stringify(result, null, 2));
  };

  const generateTypeScript = () => {
    const keys = translations.map(t => `"${t.key}"`);
    const ts = `// Auto-generated i18n types
export type I18nKey = \n  | ${keys.join('\n  | ')};

export interface I18nTranslations {
${translations.map(t => `  "${t.key}": string;`).join('\n')}
}

export const translations: Record<string, I18nTranslations> = {
${languages.map(lang => `  "${lang.code}": require('./${lang.code}.json')`).join(',\n')}
};

export function t(key: I18nKey, lang: string = 'zh-CN'): string {
  return translations[lang]?.[key] || key;
}
`;
    setOutput(ts);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outputLang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = () => {
    languages.forEach(lang => {
      const result: Record<string, string> = {};
      translations.forEach(t => {
        if (t.translations[lang.code]) {
          result[t.key] = t.translations[lang.code];
        }
      });

      const content = JSON.stringify(result, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lang.code}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const clearAll = () => {
    setTranslations([]);
    setOutput('');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="国际化 i18n 工具">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          管理多语言翻译，支持导入导出、生成 TypeScript 类型
        </p>
      </Card>

      {/* 语言管理 */}
      <Card title="语言管理">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {languages.map(lang => (
              <div
                key={lang.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '6px',
                }}
              >
                <span style={{ fontWeight: 500 }}>{lang.code}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{lang.name}</span>
                {languages.length > 1 && (
                  <button
                    onClick={() => removeLanguage(lang.code)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--accent-danger)',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input
              value={newLangCode}
              onChange={e => setNewLangCode(e.target.value)}
              placeholder="语言代码 (如: ja)"
              style={{ width: '150px' }}
            />
            <Input
              value={newLangName}
              onChange={e => setNewLangName(e.target.value)}
              placeholder="语言名称 (如: 日本語)"
              style={{ width: '150px' }}
            />
            <Button variant="secondary" onClick={addLanguage}>添加语言</Button>
          </div>
        </div>
      </Card>

      {/* 翻译管理 */}
      <Card title="翻译管理">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder="新增翻译键 (如: common.submit)"
              style={{ flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && addKey()}
            />
            <Button variant="primary" onClick={addKey}>添加</Button>
            <Button variant="secondary" onClick={clearAll}>清空所有</Button>
          </div>

          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索翻译..."
          />

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', minWidth: '200px' }}>键</th>
                  {languages.map(lang => (
                    <th key={lang.code} style={{ padding: '12px', textAlign: 'left', minWidth: '150px' }}>
                      {lang.name}
                    </th>
                  ))}
                  <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTranslations.map(t => (
                  <tr key={t.key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{t.key}</td>
                    {languages.map(lang => (
                      <td key={lang.code} style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={t.translations[lang.code] || ''}
                          onChange={e => updateTranslation(t.key, lang.code, e.target.value)}
                          className="input"
                          style={{ width: '100%' }}
                        />
                      </td>
                    ))}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <Button variant="danger" size="sm" onClick={() => removeKey(t.key)}>删除</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 导入 */}
      <Card title="导入 JSON">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>导入到：</span>
            <select
              value={outputLang}
              onChange={e => setOutputLang(e.target.value)}
              className="select"
              style={{ width: '120px' }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <TextArea
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            placeholder='{"common.save": "Save", ...} 或嵌套格式'
            style={{ minHeight: '100px' }}
          />
          <Button variant="secondary" onClick={importFromJson}>导入</Button>
        </div>
      </Card>

      {/* 导出 */}
      <Card title="导出">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>导出语言：</span>
            <select
              value={outputLang}
              onChange={e => setOutputLang(e.target.value)}
              className="select"
              style={{ width: '120px' }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={generateOutput}>导出嵌套 JSON</Button>
            <Button variant="secondary" onClick={generateFlatOutput}>导出扁平 JSON</Button>
            <Button variant="secondary" onClick={generateTypeScript}>生成 TypeScript</Button>
            <Button variant="secondary" onClick={exportAll}>导出所有语言</Button>
          </div>
        </div>
      </Card>

      {output && (
        <Card title="输出结果">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
            <Button variant="primary" size="sm" onClick={downloadOutput}>下载</Button>
          </div>
          <pre className="result-box" style={{ margin: 0, maxHeight: '400px', overflow: 'auto' }}>
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
}