import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Code,
  Clock,
  Palette,
  Lock,
  FileCode,
  Braces,
  Image,
  Type,
  Wrench,
  Home,
  Fingerprint,
  Regex as RegexIcon,
  Diff,
  QrCode,
  Hash,
  Key,
  Binary,
  FileText,
  Timer,
  Menu,
  X,
  ChevronDown,
  Ruler,
  Calculator as CalcIcon,
  Code2,
  Shield,
  Sparkles,
  FileCheck,
  Network,
  Square,
  Shuffle,
  FileImage,
  ImageOff,
  Heart,
  Database,
  Play,
  Activity,
  Layers,
  Baby,
  Zap,
  Radio,
  Eye,
  FileSearch,
  CheckSquare,
  Coffee,
  Keyboard,
  MessageSquare,
  StickyNote,
  Contrast,
  Globe2,
  Scissors,
  Smile,
  Gauge,
  ImagePlus,
  CreditCard,
  Users,
  ClipboardList,
  CodeXml,
  LockKeyhole,
  BarChart3,
  Percent,
  Banknote,
  Terminal,
  BarChart2,
  LayoutGrid,
  Columns,
  RotateCw,
  FileSpreadsheet,
  FileType,
  FileJson,
  Table,
  GitCompare,
  Search,
  FileMinus,
  Languages,
  Minimize2,
  PenTool,
  Container,
  FileKey,
  GitBranch,
  Clock4,
  ScrollText,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import './Navbar.css';

interface NavItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  children?: { path: string; label: string; icon: React.ReactNode }[];
}

// 第一排导航
const navGroupsRow1: NavItem[] = [
  {
    label: '首页',
    icon: <Home size={16} />,
    path: '/',
  },
  {
    label: '编码转换',
    icon: <Code size={16} />,
    children: [
      { path: '/encoding', label: 'URL/HTML编码', icon: <Code size={16} /> },
      { path: '/base64', label: 'Base64', icon: <FileCode size={16} /> },
      { path: '/numberbase', label: '进制转换', icon: <Binary size={16} /> },
      { path: '/html-entity', label: 'HTML实体', icon: <Code size={16} /> },
    ],
  },
  {
    label: '加解密',
    icon: <Lock size={16} />,
    children: [
      { path: '/crypto', label: 'AES/RSA加解密', icon: <Lock size={16} /> },
      { path: '/hash', label: 'Hash计算', icon: <Hash size={16} /> },
      { path: '/password', label: '密码生成', icon: <Key size={16} /> },
      { path: '/password-strength', label: '密码强度', icon: <Eye size={16} /> },
      { path: '/jwt', label: 'JWT解码', icon: <Shield size={16} /> },
      { path: '/rsa', label: 'RSA演示', icon: <LockKeyhole size={16} /> },
      { path: '/file-hash', label: '文件哈希', icon: <FileSearch size={16} /> },
      { path: '/credit-card', label: '信用卡验证', icon: <CreditCard size={16} /> },
    ],
  },
  {
    label: 'JSON工具',
    icon: <Braces size={16} />,
    children: [
      { path: '/json', label: 'JSON格式化', icon: <Braces size={16} /> },
      { path: '/json-path', label: 'JSONPath查询', icon: <Search size={16} /> },
      { path: '/json-schema', label: 'Schema验证', icon: <FileJson size={16} /> },
      { path: '/json-yaml', label: 'JSON/YAML', icon: <Braces size={16} /> },
      { path: '/ts-generator', label: 'TS类型生成', icon: <Braces size={16} /> },
    ],
  },
  {
    label: '文本工具',
    icon: <Type size={16} />,
    children: [
      { path: '/text', label: '文本处理', icon: <Type size={16} /> },
      { path: '/text-stats', label: '文本统计', icon: <BarChart2 size={16} /> },
      { path: '/case', label: '大小写转换', icon: <Type size={16} /> },
      { path: '/diff', label: 'Diff对比', icon: <Diff size={16} /> },
      { path: '/code-diff', label: '代码对比', icon: <GitCompare size={16} /> },
      { path: '/lorem', label: '假文生成', icon: <FileText size={16} /> },
      { path: '/morse', label: '摩斯码', icon: <MessageSquare size={16} /> },
      { path: '/ascii-art', label: 'ASCII艺术', icon: <Terminal size={16} /> },
    ],
  },
  {
    label: '正则工具',
    icon: <RegexIcon size={16} />,
    children: [
      { path: '/regex', label: '正则测试', icon: <RegexIcon size={16} /> },
      { path: '/regex-builder', label: '正则构建器', icon: <RegexIcon size={16} /> },
      { path: '/regex-visualizer', label: '正则可视化', icon: <Eye size={16} /> },
    ],
  },
  {
    label: '数据格式',
    icon: <Database size={16} />,
    children: [
      { path: '/xml', label: 'XML格式化', icon: <FileCode size={16} /> },
      { path: '/csv', label: 'CSV查看器', icon: <Table size={16} /> },
      { path: '/sql-formatter', label: 'SQL格式化', icon: <Database size={16} /> },
      { path: '/sql-builder', label: 'SQL构建器', icon: <Database size={16} /> },
      { path: '/markdown', label: 'Markdown', icon: <FileCheck size={16} /> },
      { path: '/excel', label: 'Excel编辑器', icon: <FileSpreadsheet size={16} /> },
      { path: '/word', label: 'Word预览', icon: <FileType size={16} /> },
    ],
  },
];

// 第二排导航
const navGroupsRow2: NavItem[] = [
  {
    label: '开发工具',
    icon: <Wrench size={16} />,
    children: [
      { path: '/uuid', label: 'UUID生成', icon: <Fingerprint size={16} /> },
      { path: '/cron', label: 'Cron解析', icon: <Timer size={16} /> },
      { path: '/random', label: '随机数据', icon: <Shuffle size={16} /> },
      { path: '/fake-data', label: '假数据生成', icon: <Users size={16} /> },
      { path: '/snippets', label: '代码片段', icon: <CodeXml size={16} /> },
      { path: '/dev', label: '开发常用', icon: <Wrench size={16} /> },
      { path: '/api-tester', label: 'API测试', icon: <Radio size={16} /> },
      { path: '/websocket', label: 'WebSocket测试', icon: <Zap size={16} /> },
      { path: '/key-test', label: '键盘事件', icon: <Keyboard size={16} /> },
    ],
  },
  {
    label: '代码工具',
    icon: <Code2 size={16} />,
    children: [
      { path: '/code-formatter', label: '代码格式化', icon: <Code2 size={16} /> },
      { path: '/code-minify', label: '代码压缩', icon: <Minimize2 size={16} /> },
      { path: '/playground', label: 'Playground', icon: <Play size={16} /> },
      { path: '/benchmark', label: '性能测试', icon: <Gauge size={16} /> },
      { path: '/sorting', label: '排序可视化', icon: <BarChart3 size={16} /> },
      { path: '/log-analyzer', label: '日志分析', icon: <ScrollText size={16} /> },
    ],
  },
  {
    label: '配置生成',
    icon: <FileMinus size={16} />,
    children: [
      { path: '/gitignore', label: 'Gitignore', icon: <FileMinus size={16} /> },
      { path: '/dockerfile', label: 'Dockerfile', icon: <Container size={16} /> },
      { path: '/env-manager', label: '环境变量', icon: <FileKey size={16} /> },
      { path: '/git-cheatsheet', label: 'Git速查', icon: <GitBranch size={16} /> },
      { path: '/i18n', label: '国际化', icon: <Languages size={16} /> },
    ],
  },
  {
    label: '设计工具',
    icon: <Palette size={16} />,
    children: [
      { path: '/color', label: '颜色工具', icon: <Palette size={16} /> },
      { path: '/contrast', label: '颜色对比度', icon: <Contrast size={16} /> },
      { path: '/palette', label: '调色板', icon: <Palette size={16} /> },
      { path: '/gradient', label: 'CSS渐变', icon: <Sparkles size={16} /> },
      { path: '/shadow', label: 'CSS阴影', icon: <Square size={16} /> },
      { path: '/clip-path', label: 'Clip-Path', icon: <Scissors size={16} /> },
      { path: '/css-grid', label: 'CSS Grid', icon: <LayoutGrid size={16} /> },
      { path: '/flexbox', label: 'Flexbox', icon: <Columns size={16} /> },
      { path: '/transform', label: 'Transform', icon: <RotateCw size={16} /> },
    ],
  },
  {
    label: '图片工具',
    icon: <Image size={16} />,
    children: [
      { path: '/image', label: '图片处理', icon: <Image size={16} /> },
      { path: '/image-base64', label: '图片Base64', icon: <ImageOff size={16} /> },
      { path: '/image-compress', label: '图片压缩', icon: <Layers size={16} /> },
      { path: '/svg-optimizer', label: 'SVG优化', icon: <PenTool size={16} /> },
      { path: '/qrcode', label: '二维码', icon: <QrCode size={16} /> },
      { path: '/gif-generator', label: 'GIF生成', icon: <Play size={16} /> },
      { path: '/code-image', label: '代码转图片', icon: <FileImage size={16} /> },
      { path: '/picsum', label: '占位图片', icon: <ImagePlus size={16} /> },
    ],
  },
  {
    label: '时间工具',
    icon: <Clock size={16} />,
    children: [
      { path: '/time', label: '时间工具', icon: <Clock size={16} /> },
      { path: '/timestamp-batch', label: '时间戳转换', icon: <Clock4 size={16} /> },
      { path: '/world-clock', label: '世界时钟', icon: <Globe2 size={16} /> },
      { path: '/stopwatch', label: '秒表', icon: <Timer size={16} /> },
      { path: '/countdown', label: '倒计时', icon: <Timer size={16} /> },
      { path: '/pomodoro', label: '番茄钟', icon: <Coffee size={16} /> },
    ],
  },
  {
    label: '网络工具',
    icon: <Network size={16} />,
    children: [
      { path: '/network', label: '网络工具', icon: <Network size={16} /> },
      { path: '/url-parser', label: 'URL解析', icon: <Network size={16} /> },
      { path: '/ip-calc', label: 'IP计算器', icon: <Network size={16} /> },
    ],
  },
  {
    label: '效率工具',
    icon: <CheckSquare size={16} />,
    children: [
      { path: '/todo', label: '待办事项', icon: <CheckSquare size={16} /> },
      { path: '/notes', label: '快速笔记', icon: <StickyNote size={16} /> },
      { path: '/emoji', label: '表情符号', icon: <Smile size={16} /> },
      { path: '/multi-clip', label: '多重剪贴板', icon: <ClipboardList size={16} /> },
      { path: '/calculator', label: '计算器', icon: <CalcIcon size={16} /> },
      { path: '/percentage', label: '百分比计算', icon: <Percent size={16} /> },
      { path: '/loan', label: '贷款计算', icon: <Banknote size={16} /> },
      { path: '/unit', label: '单位转换', icon: <Ruler size={16} /> },
      { path: '/number-format', label: '数字格式化', icon: <Hash size={16} /> },
    ],
  },
  {
    label: '健康工具',
    icon: <Heart size={16} />,
    children: [
      { path: '/health', label: '健康计算器', icon: <Heart size={16} /> },
      { path: '/advanced-health', label: '高级健康指标', icon: <Activity size={16} /> },
      { path: '/pregnancy', label: '预产期计算', icon: <Baby size={16} /> },
      { path: '/child-growth', label: '儿童发育', icon: <Baby size={16} /> },
    ],
  },
];

// 合并用于移动端
const navGroups = [...navGroupsRow1, ...navGroupsRow2];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const renderNavItem = (group: NavItem) => (
    <div key={group.label} className="navbar-item-wrapper">
      {group.path ? (
        <NavLink
          to={group.path}
          className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}
        >
          {group.icon}
          <span>{group.label}</span>
        </NavLink>
      ) : (
        <>
          <button
            className={`navbar-item dropdown-toggle ${openDropdown === group.label ? 'open' : ''}`}
            onClick={() => handleDropdownToggle(group.label)}
            onBlur={() => setTimeout(() => setOpenDropdown(null), 150)}
          >
            {group.icon}
            <span>{group.label}</span>
            <ChevronDown size={14} className={`chevron ${openDropdown === group.label ? 'rotated' : ''}`} />
          </button>
          {openDropdown === group.label && group.children && (
            <div className="dropdown-menu">
              {group.children.map(child => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={() => setOpenDropdown(null)}
                >
                  {child.icon}
                  <span>{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-logo">🛠️</span>
          <span className="navbar-title">DevTools</span>
        </NavLink>

        {/* Desktop Navigation - Two Rows */}
        <div className="navbar-nav-wrapper">
          <nav className="navbar-nav navbar-nav-row1">
            {navGroupsRow1.map(renderNavItem)}
          </nav>
          <nav className="navbar-nav navbar-nav-row2">
            {navGroupsRow2.map(renderNavItem)}
          </nav>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <ThemeToggle />
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          {navGroups.map(group => (
            <div key={group.label} className="mobile-nav-group">
              {group.path ? (
                <NavLink
                  to={group.path}
                  className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {group.icon}
                  <span>{group.label}</span>
                </NavLink>
              ) : (
                <>
                  <div className="mobile-nav-group-title">
                    {group.icon}
                    <span>{group.label}</span>
                  </div>
                  {group.children && (
                    <div className="mobile-nav-children">
                      {group.children.map(child => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) => `mobile-nav-item child ${isActive ? 'active' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}