import { useState, useEffect } from 'react';
import { Card, Button } from '../components/common';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export default function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('devtools-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('devtools-notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setCurrentNote(newNote);
  };

  const updateNote = (updates: Partial<Note>) => {
    if (!currentNote) return;

    const updated = { ...currentNote, ...updates, updatedAt: Date.now() };
    setCurrentNote(updated);
    setNotes(prev => prev.map(n => n.id === currentNote.id ? updated : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportNotes = () => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setNotes(prev => [...imported, ...prev]);
        }
      } catch {
        alert('导入失败：无效的JSON文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="快速笔记">
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', minHeight: '500px' }}>
          {/* Notes List */}
          <div style={{ display: 'grid', gap: '12px', gridTemplateRows: 'auto auto 1fr' }}>
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索笔记..."
              className="input"
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="primary" onClick={createNote} style={{ flex: 1 }}>新建</Button>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gap: '8px', overflow: 'auto' }}>
              {filteredNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {searchQuery ? '没有找到匹配的笔记' : '暂无笔记'}
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setCurrentNote(note)}
                    style={{
                      padding: '12px',
                      background: currentNote?.id === note.id ? 'var(--bg-tertiary)' : 'transparent',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      border: currentNote?.id === note.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    }}
                  >
                    <div style={{
                      fontWeight: 500,
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {note.title || '无标题'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {note.content || '无内容'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {formatDate(note.updatedAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor */}
          <div style={{ display: 'grid', gap: '12px', gridTemplateRows: 'auto 1fr auto' }}>
            {currentNote ? (
              <>
                {/* Title */}
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={e => updateNote({ title: e.target.value })}
                  placeholder="标题"
                  className="input"
                  style={{ fontSize: '18px', fontWeight: 500 }}
                />

                {/* Content */}
                <textarea
                  value={currentNote.content}
                  onChange={e => updateNote({ content: e.target.value })}
                  placeholder="开始输入..."
                  className="input"
                  style={{
                    width: '100%',
                    height: '100%',
                    resize: 'none',
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}
                />

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    创建于 {formatDate(currentNote.createdAt)}
                    {currentNote.updatedAt !== currentNote.createdAt && (
                      <> · 更新于 {formatDate(currentNote.updatedAt)}</>
                    )}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => deleteNote(currentNote.id)}>
                    删除
                  </Button>
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                gridColumn: 'span 1',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <div>选择一个笔记或创建新笔记</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="导入/导出">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={exportNotes} disabled={notes.length === 0}>
            导出所有笔记
          </Button>
          <label style={{ cursor: 'pointer' }}>
            <span className="btn btn-secondary">导入笔记</span>
            <input
              type="file"
              accept=".json"
              onChange={importNotes}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          笔记数量: {notes.length}
        </div>
      </Card>
    </div>
  );
}