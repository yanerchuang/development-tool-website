import { useState } from 'react';
import { Card, Button } from '../components/common';

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: number;
}

const languages = ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL', 'JSON', 'Bash', 'Java', 'Go', 'Rust', 'PHP'];

export default function CodeSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const saved = localStorage.getItem('devtools-snippets');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    language: 'JavaScript',
    code: '',
    tags: '',
  });

  const saveSnippets = (newSnippets: Snippet[]) => {
    setSnippets(newSnippets);
    localStorage.setItem('devtools-snippets', JSON.stringify(newSnippets));
  };

  const createSnippet = () => {
    const newSnippet: Snippet = {
      id: Date.now().toString(),
      title: editForm.title || '未命名代码片段',
      language: editForm.language,
      code: editForm.code,
      tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: Date.now(),
    };
    saveSnippets([newSnippet, ...snippets]);
    setSelectedSnippet(newSnippet);
    setIsEditing(false);
    setEditForm({ title: '', language: 'JavaScript', code: '', tags: '' });
  };

  const updateSnippet = () => {
    if (!selectedSnippet) return;
    const updated = {
      ...selectedSnippet,
      title: editForm.title || '未命名代码片段',
      language: editForm.language,
      code: editForm.code,
      tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    saveSnippets(snippets.map(s => s.id === selectedSnippet.id ? updated : s));
    setSelectedSnippet(updated);
    setIsEditing(false);
  };

  const deleteSnippet = (id: string) => {
    saveSnippets(snippets.filter(s => s.id !== id));
    if (selectedSnippet?.id === id) {
      setSelectedSnippet(null);
    }
  };

  const copyCode = () => {
    if (selectedSnippet) {
      navigator.clipboard.writeText(selectedSnippet.code);
    }
  };

  const startEdit = () => {
    if (selectedSnippet) {
      setEditForm({
        title: selectedSnippet.title,
        language: selectedSnippet.language,
        code: selectedSnippet.code,
        tags: selectedSnippet.tags.join(', '),
      });
      setIsEditing(true);
    }
  };

  const startNew = () => {
    setEditForm({ title: '', language: 'JavaScript', code: '', tags: '' });
    setIsEditing(true);
    setSelectedSnippet(null);
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = searchQuery === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLang = filterLang === '' || s.language === filterLang;
    return matchesSearch && matchesLang;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="代码片段管理">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', minHeight: '500px' }}>
          {/* Sidebar */}
          <div style={{ display: 'grid', gap: '12px', gridTemplateRows: 'auto auto auto 1fr' }}>
            <Button variant="primary" onClick={startNew}>新建片段</Button>

            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className="input"
            />

            <select
              className="input"
              value={filterLang}
              onChange={e => setFilterLang(e.target.value)}
            >
              <option value="">所有语言</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <div style={{ display: 'grid', gap: '8px', overflow: 'auto' }}>
              {filteredSnippets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  暂无代码片段
                </div>
              ) : (
                filteredSnippets.map(snippet => (
                  <div
                    key={snippet.id}
                    onClick={() => {
                      setSelectedSnippet(snippet);
                      setIsEditing(false);
                    }}
                    style={{
                      padding: '12px',
                      background: selectedSnippet?.id === snippet.id ? 'var(--bg-tertiary)' : 'transparent',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      border: selectedSnippet?.id === snippet.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{snippet.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {snippet.language} · {formatDate(snippet.createdAt)}
                    </div>
                    {snippet.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {snippet.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            style={{
                              padding: '2px 6px',
                              background: 'var(--bg-secondary)',
                              borderRadius: '4px',
                              fontSize: '11px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'grid', gap: '12px', gridTemplateRows: 'auto 1fr auto' }}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="标题"
                  className="input"
                  style={{ fontSize: '18px', fontWeight: 500 }}
                />
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                      className="input"
                      value={editForm.language}
                      onChange={e => setEditForm(prev => ({ ...prev, language: e.target.value }))}
                      style={{ width: '150px' }}
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={e => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="标签 (逗号分隔)"
                      className="input"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <textarea
                    value={editForm.code}
                    onChange={e => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="代码..."
                    className="input"
                    style={{
                      width: '100%',
                      height: '300px',
                      resize: 'vertical',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="primary" onClick={selectedSnippet ? updateSnippet : createSnippet}>
                    {selectedSnippet ? '保存' : '创建'}
                  </Button>
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>取消</Button>
                </div>
              </>
            ) : selectedSnippet ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>{selectedSnippet.title}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" size="sm" onClick={copyCode}>复制</Button>
                    <Button variant="secondary" size="sm" onClick={startEdit}>编辑</Button>
                    <Button variant="secondary" size="sm" onClick={() => deleteSnippet(selectedSnippet.id)}>删除</Button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {selectedSnippet.language}
                  </span>
                  {selectedSnippet.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 8px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <pre style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {selectedSnippet.code}
                </pre>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  创建于 {formatDate(selectedSnippet.createdAt)}
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <div>选择一个代码片段或创建新的</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 保存常用的代码片段，方便随时查阅</div>
          <div>• 支持多种编程语言的语法高亮标记</div>
          <div>• 使用标签对代码片段进行分类</div>
          <div>• 数据保存在浏览器本地存储中</div>
          <div>• 支持搜索和按语言筛选</div>
        </div>
      </Card>
    </div>
  );
}