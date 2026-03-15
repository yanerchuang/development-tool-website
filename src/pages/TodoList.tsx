import { useState, useEffect } from 'react';
import { Card, Button } from '../components/common';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('devtools-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    localStorage.setItem('devtools-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      createdAt: Date.now(),
    }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = todos.filter(t => !t.completed).length;

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="待办事项">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="添加新任务..."
              className="input"
              style={{ flex: 1 }}
            />
            <Button variant="primary" onClick={addTodo}>添加</Button>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  background: filter === f ? 'var(--accent-primary)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--text-primary)',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
              </button>
            ))}
            {completedCount > 0 && (
              <Button variant="secondary" size="sm" onClick={clearCompleted} style={{ marginLeft: 'auto' }}>
                清除已完成
              </Button>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>总计: {todos.length}</span>
            <span>进行中: {activeCount}</span>
            <span>已完成: {completedCount}</span>
          </div>

          {/* List */}
          <div style={{ display: 'grid', gap: '8px' }}>
            {filteredTodos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                {filter === 'all' ? '暂无任务' : filter === 'active' ? '没有进行中的任务' : '没有已完成的任务'}
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{
                    flex: 1,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  }}>
                    {todo.text}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    删除
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 输入任务并按回车或点击"添加"</div>
          <div>• 点击复选框标记任务完成</div>
          <div>• 使用筛选器查看不同状态的任务</div>
          <div>• 数据保存在浏览器本地存储中</div>
        </div>
      </Card>
    </div>
  );
}