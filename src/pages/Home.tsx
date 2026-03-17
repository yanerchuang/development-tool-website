import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  GripVertical,
  ExternalLink,
  Edit3,
  Trash2,
  Settings,
  FolderPlus,
  Folder,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import './Home.css';

interface NavItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon?: string;
  collapsed?: boolean;
  items: NavItem[];
}

const defaultGroups: NavGroup[] = [
  {
    id: 'g1',
    title: '开发工具',
    icon: '🛠️',
    items: [
      { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
      { id: '2', title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚' },
      { id: '3', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📖' },
    ],
  },
  {
    id: 'g2',
    title: 'AI 工具',
    icon: '🤖',
    items: [
      { id: '4', title: 'ChatGPT', url: 'https://chat.openai.com', icon: '💬' },
      { id: '5', title: 'Claude', url: 'https://claude.ai', icon: '💜' },
    ],
  },
  {
    id: 'g3',
    title: '搜索引擎',
    icon: '🔍',
    items: [
      { id: '6', title: 'Google', url: 'https://google.com', icon: '🔍' },
      { id: '7', title: 'Bing', url: 'https://bing.com', icon: '🅱️' },
    ],
  },
];

const STORAGE_KEY = 'devtools-nav-groups';

export default function Home() {
  const [groups, setGroups] = useState<NavGroup[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // 链接编辑状态
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addItemToGroupId, setAddItemToGroupId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('');

  // 分组编辑状态
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<NavGroup | null>(null);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('');

  // 拖拽状态
  const [draggedItem, setDraggedItem] = useState<{ groupId: string; index: number } | null>(null);
  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ groupId: string; index: number } | null>(null);
  const [dragOverGroupIndex, setDragOverGroupIndex] = useState<number | null>(null);

  const addFormRef = useRef<HTMLDivElement>(null);

  // 加载数据
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setGroups(JSON.parse(saved));
      } catch {
        setGroups(defaultGroups);
      }
    } else {
      setGroups(defaultGroups);
    }
  }, []);

  // 保存数据
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups]);

  // 重置为默认
  const resetToDefault = () => {
    setGroups(defaultGroups);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGroups));
  };

  // 切换分组折叠
  const toggleGroupCollapse = (groupId: string) => {
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    ));
  };

  // ========== 分组操作 ==========

  // 打开添加分组表单
  const openAddGroupForm = () => {
    setEditingGroup(null);
    setNewGroupTitle('');
    setNewGroupIcon('');
    setShowGroupForm(true);
  };

  // 打开编辑分组表单
  const openEditGroupForm = (group: NavGroup) => {
    setEditingGroup(group);
    setNewGroupTitle(group.title);
    setNewGroupIcon(group.icon || '');
    setShowGroupForm(true);
  };

  // 保存分组
  const handleSaveGroup = () => {
    if (!newGroupTitle.trim()) return;

    if (editingGroup) {
      // 编辑分组
      setGroups(groups.map(g =>
        g.id === editingGroup.id
          ? { ...g, title: newGroupTitle.trim(), icon: newGroupIcon.trim() || '📁' }
          : g
      ));
    } else {
      // 添加分组
      const newGroup: NavGroup = {
        id: Date.now().toString(),
        title: newGroupTitle.trim(),
        icon: newGroupIcon.trim() || '📁',
        items: [],
      };
      setGroups([...groups, newGroup]);
    }

    setEditingGroup(null);
    setNewGroupTitle('');
    setNewGroupIcon('');
    setShowGroupForm(false);
  };

  // 删除分组
  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  // 取消分组表单
  const cancelGroupForm = () => {
    setEditingGroup(null);
    setNewGroupTitle('');
    setNewGroupIcon('');
    setShowGroupForm(false);
  };

  // ========== 链接操作 ==========

  // 打开添加链接表单
  const openAddItemForm = (groupId: string) => {
    setEditingItem(null);
    setAddItemToGroupId(groupId);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setShowAddForm(true);
  };

  // 打开编辑链接表单
  const openEditItemForm = (groupId: string, item: NavItem) => {
    setEditingItem(item);
    setEditingGroupId(groupId);
    setNewTitle(item.title);
    setNewUrl(item.url);
    setNewIcon(item.icon || '');
    setShowAddForm(true);
  };

  // 添加链接
  const handleAddItem = () => {
    if (!newTitle.trim() || !newUrl.trim() || !addItemToGroupId) return;

    const newItem: NavItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: newUrl.trim(),
      icon: newIcon.trim() || '🔗',
    };

    setGroups(groups.map(g =>
      g.id === addItemToGroupId
        ? { ...g, items: [...g.items, newItem] }
        : g
    ));

    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setShowAddForm(false);
    setAddItemToGroupId(null);
  };

  // 更新链接
  const handleUpdateItem = () => {
    if (!editingItem || !editingGroupId || !newTitle.trim() || !newUrl.trim()) return;

    setGroups(groups.map(g =>
      g.id === editingGroupId
        ? {
            ...g,
            items: g.items.map(item =>
              item.id === editingItem.id
                ? { ...item, title: newTitle.trim(), url: newUrl.trim(), icon: newIcon.trim() || '🔗' }
                : item
            ),
          }
        : g
    ));

    setEditingItem(null);
    setEditingGroupId(null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setShowAddForm(false);
  };

  // 删除链接
  const handleDeleteItem = (groupId: string, itemId: string) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, items: g.items.filter(item => item.id !== itemId) }
        : g
    ));
  };

  // 取消链接表单
  const cancelItemForm = () => {
    setEditingItem(null);
    setEditingGroupId(null);
    setAddItemToGroupId(null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setShowAddForm(false);
  };

  // ========== 分组拖拽 ==========

  const handleGroupDragStart = (e: React.DragEvent, index: number) => {
    setDraggedGroupIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `group-${index}`);
  };

  const handleGroupDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedGroupIndex === null || draggedGroupIndex === index) return;
    setDragOverGroupIndex(index);
  };

  const handleGroupDragLeave = () => {
    setDragOverGroupIndex(null);
  };

  const handleGroupDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedGroupIndex === null || draggedGroupIndex === dropIndex) return;

    const newGroups = [...groups];
    const [draggedGroup] = newGroups.splice(draggedGroupIndex, 1);
    newGroups.splice(dropIndex, 0, draggedGroup);
    setGroups(newGroups);

    setDraggedGroupIndex(null);
    setDragOverGroupIndex(null);
  };

  const handleGroupDragEnd = () => {
    setDraggedGroupIndex(null);
    setDragOverGroupIndex(null);
  };

  // ========== 链接拖拽 ==========

  const handleItemDragStart = (e: React.DragEvent, groupId: string, index: number) => {
    setDraggedItem({ groupId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `item-${groupId}-${index}`);
  };

  const handleItemDragOver = (e: React.DragEvent, groupId: string, index: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.groupId !== groupId) return;
    if (draggedItem.index === index) return;
    setDragOverItem({ groupId, index });
  };

  const handleItemDragLeave = () => {
    setDragOverItem(null);
  };

  const handleItemDrop = (e: React.DragEvent, groupId: string, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.groupId !== groupId) return;
    if (draggedItem.index === dropIndex) return;

    setGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      const newItems = [...g.items];
      const [draggedItemData] = newItems.splice(draggedItem.index, 1);
      newItems.splice(dropIndex, 0, draggedItemData);
      return { ...g, items: newItems };
    }));

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // 判断是否外部链接
  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <div className="home">
      {/* 头部 */}
      <div className="home-header">
        <h1>快速<span>导航</span></h1>
        <p>自定义你的常用链接，支持分组管理和拖拽排序</p>

        {/* 控制按钮 */}
        <div className="header-actions">
          {isEditing && (
            <button className="edit-toggle-btn add-group-btn" onClick={openAddGroupForm}>
              <FolderPlus size={16} />
              添加分组
            </button>
          )}
          <button
            className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings size={16} />
            {isEditing ? '完成编辑' : '编辑导航'}
          </button>
        </div>
      </div>

      {/* 分组列表 */}
      <div className="groups-container">
        {groups.map((group, groupIndex) => (
          <div
            key={group.id}
            className={`nav-group ${draggedGroupIndex === groupIndex ? 'dragging' : ''} ${dragOverGroupIndex === groupIndex ? 'drag-over' : ''}`}
            draggable={isEditing}
            onDragStart={(e) => handleGroupDragStart(e, groupIndex)}
            onDragOver={(e) => handleGroupDragOver(e, groupIndex)}
            onDragLeave={handleGroupDragLeave}
            onDrop={(e) => handleGroupDrop(e, groupIndex)}
            onDragEnd={handleGroupDragEnd}
          >
            {/* 分组头部 */}
            <div className="group-header" onClick={() => !isEditing && toggleGroupCollapse(group.id)}>
              <div className="group-header-left">
                {isEditing && (
                  <div className="drag-handle group-drag-handle">
                    <GripVertical size={16} />
                  </div>
                )}
                <span className="group-icon">{group.icon || '📁'}</span>
                <h2 className="group-title">{group.title}</h2>
                <span className="group-count">{group.items.length}</span>
              </div>
              <div className="group-header-right">
                {isEditing ? (
                  <>
                    <button
                      className="group-action-btn"
                      onClick={(e) => { e.stopPropagation(); openAddItemForm(group.id); }}
                      title="添加链接"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="group-action-btn"
                      onClick={(e) => { e.stopPropagation(); openEditGroupForm(group); }}
                      title="编辑分组"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="group-action-btn delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                      title="删除分组"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <span className="collapse-icon">
                    {group.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </span>
                )}
              </div>
            </div>

            {/* 分组内容 */}
            {!group.collapsed && (
              <div className="nav-grid">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className={`nav-card ${draggedItem?.groupId === group.id && draggedItem.index === itemIndex ? 'dragging' : ''} ${dragOverItem?.groupId === group.id && dragOverItem.index === itemIndex ? 'drag-over' : ''}`}
                    draggable={isEditing}
                    onDragStart={(e) => handleItemDragStart(e, group.id, itemIndex)}
                    onDragOver={(e) => handleItemDragOver(e, group.id, itemIndex)}
                    onDragLeave={handleItemDragLeave}
                    onDrop={(e) => handleItemDrop(e, group.id, itemIndex)}
                    onDragEnd={handleItemDragEnd}
                  >
                    {isEditing && (
                      <div className="drag-handle">
                        <GripVertical size={16} />
                      </div>
                    )}

                    {isExternalUrl(item.url) ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link"
                      >
                        <div className="nav-icon">{item.icon || '🔗'}</div>
                        <div className="nav-content">
                          <span className="nav-title">{item.title}</span>
                          <span className="nav-url">{item.url}</span>
                        </div>
                        <ExternalLink size={14} className="external-icon" />
                      </a>
                    ) : (
                      <a href={item.url} className="nav-link">
                        <div className="nav-icon">{item.icon || '🔗'}</div>
                        <div className="nav-content">
                          <span className="nav-title">{item.title}</span>
                          <span className="nav-url">{item.url}</span>
                        </div>
                      </a>
                    )}

                    {isEditing && (
                      <div className="card-actions">
                        <button className="action-btn edit" onClick={() => openEditItemForm(group.id, item)} title="编辑">
                          <Edit3 size={14} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDeleteItem(group.id, item.id)} title="删除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* 空状态 */}
                {group.items.length === 0 && (
                  <div className="empty-group">
                    <Folder size={32} />
                    <p>暂无链接</p>
                    {isEditing && (
                      <button className="btn btn-sm btn-secondary" onClick={() => openAddItemForm(group.id)}>
                        添加链接
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* 空状态 */}
        {groups.length === 0 && (
          <div className="empty-groups">
            <FolderPlus size={48} />
            <h3>暂无导航分组</h3>
            <p>点击上方「添加分组」创建你的第一个导航分组</p>
            {isEditing && (
              <button className="btn btn-primary" onClick={openAddGroupForm}>
                添加分组
              </button>
            )}
          </div>
        )}
      </div>

      {/* 分组表单 */}
      {showGroupForm && (
        <div className="modal-overlay" onClick={cancelGroupForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGroup ? '编辑分组' : '添加分组'}</h3>
              <button className="close-btn" onClick={cancelGroupForm}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>图标 (emoji)</label>
                <input
                  type="text"
                  value={newGroupIcon}
                  onChange={(e) => setNewGroupIcon(e.target.value)}
                  placeholder="例如: 🛠️"
                  className="input"
                  maxLength={4}
                />
              </div>

              <div className="form-group">
                <label>分组名称 *</label>
                <input
                  type="text"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="例如: 开发工具"
                  className="input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelGroupForm}>
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveGroup}
                disabled={!newGroupTitle.trim()}
              >
                {editingGroup ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 链接表单 */}
      {showAddForm && (
        <div className="modal-overlay" onClick={cancelItemForm}>
          <div className="modal" ref={addFormRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? '编辑链接' : '添加链接'}</h3>
              <button className="close-btn" onClick={cancelItemForm}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>图标 (emoji)</label>
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="例如: 🐙"
                  className="input"
                  maxLength={4}
                />
              </div>

              <div className="form-group">
                <label>标题 *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如: GitHub"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>URL *</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="例如: https://github.com"
                  className="input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelItemForm}>
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                disabled={!newTitle.trim() || !newUrl.trim()}
              >
                {editingItem ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部操作 */}
      {isEditing && (
        <div className="footer-actions">
          <button className="btn btn-secondary" onClick={resetToDefault}>
            重置为默认
          </button>
        </div>
      )}
    </div>
  );
}