import { useState, useEffect } from 'react';
import { Card, Button } from '../components/common';

interface Tab {
  id: string;
  title: string;
  content: string;
}

export default function MultiClipboard() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = localStorage.getItem('devtools-multiclip');
    return saved ? JSON.parse(saved) : [{ id: '1', title: '剪贴板 1', content: '' }];
  });
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '1');
  const [history, setHistory] = useState<{ content: string; time: number }[]>([]);

  useEffect(() => {
    localStorage.setItem('devtools-multiclip', JSON.stringify(tabs));
  }, [tabs]);

  const currentTab = tabs.find(t => t.id === activeTab);

  const updateContent = (content: string) => {
    setTabs(prev => prev.map(t =>
      t.id === activeTab ? { ...t, content } : t
    ));
  };

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: `剪贴板 ${tabs.length + 1}`,
      content: '',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const removeTab = (id: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) {
      setActiveTab(newTabs[0].id);
    }
  };

  const renameTab = (id: string, title: string) => {
    setTabs(prev => prev.map(t =>
      t.id === id ? { ...t, title } : t
    ));
  };

  const copyContent = () => {
    if (currentTab?.content) {
      navigator.clipboard.writeText(currentTab.content);
      setHistory(prev => [{ content: currentTab.content, time: Date.now() }, ...prev.slice(0, 19)]);
    }
  };

  const pasteContent = async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateContent(text);
    } catch {
      alert('无法访问剪贴板，请手动粘贴');
    }
  };

  const clearContent = () => {
    updateContent('');
  };

  const copyFromHistory = (content: string) => {
    navigator.clipboard.writeText(content);
    updateContent(content);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN');
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="多剪贴板">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            {tabs.map(tab => (
              <div
                key={tab.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
                  borderRadius: 'var(--border-radius)',
                  overflow: 'hidden',
                }}
              >
                <input
                  type="text"
                  value={tab.title}
                  onChange={e => renameTab(tab.id, e.target.value)}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    padding: '8px 12px',
                    width: '100px',
                    cursor: 'pointer',
                  }}
                />
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'inherit',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      opacity: 0.7,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTab}
              style={{
                padding: '8px 12px',
                border: '1px dashed var(--border)',
                background: 'transparent',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              + 新建
            </button>
          </div>

          {/* Editor */}
          <textarea
            value={currentTab?.content || ''}
            onChange={e => updateContent(e.target.value)}
            placeholder="输入或粘贴内容..."
            className="input"
            style={{
              width: '100%',
              minHeight: '300px',
              resize: 'vertical',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={copyContent}>复制</Button>
            <Button variant="secondary" onClick={pasteContent}>粘贴</Button>
            <Button variant="secondary" onClick={clearContent}>清空</Button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>字符: {currentTab?.content.length || 0}</span>
            <span>单词: {(currentTab?.content || '').split(/\s+/).filter(Boolean).length}</span>
            <span>行数: {(currentTab?.content || '').split('\n').length}</span>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card title="复制历史">
        <div style={{ display: 'grid', gap: '12px' }}>
          {history.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="sm" onClick={clearHistory}>清空历史</Button>
            </div>
          )}
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              暂无复制历史
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
              {history.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                  }}
                  onClick={() => copyFromHistory(item.content)}
                >
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    marginBottom: '4px',
                  }}>
                    {item.content}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {formatTime(item.time)} · {item.content.length} 字符
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 可以创建多个剪贴板标签，方便管理不同内容</div>
          <div>• 点击标签名称可以重命名</div>
          <div>• 内容自动保存到浏览器本地存储</div>
          <div>• 复制历史记录最近20条</div>
          <div>• 点击历史记录可以快速恢复内容</div>
        </div>
      </Card>
    </div>
  );
}