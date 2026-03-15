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
  Globe,
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
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import './Navbar.css';

interface NavItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  children?: { path: string; label: string; icon: React.ReactNode }[];
}

const navGroups: NavItem[] = [
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
    ],
  },
  {
    label: '加解密',
    icon: <Lock size={16} />,
    children: [
      { path: '/crypto', label: 'AES/RSA加解密', icon: <Lock size={16} /> },
      { path: '/hash', label: 'Hash计算', icon: <Hash size={16} /> },
      { path: '/password', label: '密码生成', icon: <Key size={16} /> },
      { path: '/password-strength', label: '密码强度检测', icon: <Eye size={16} /> },
      { path: '/jwt', label: 'JWT解码', icon: <Shield size={16} /> },
      { path: '/file-hash', label: '文件哈希', icon: <FileSearch size={16} /> },
    ],
  },
  {
    label: '文本处理',
    icon: <Type size={16} />,
    children: [
      { path: '/text', label: '文本工具', icon: <Type size={16} /> },
      { path: '/json', label: 'JSON格式化', icon: <Braces size={16} /> },
      { path: '/json-yaml', label: 'JSON/YAML转换', icon: <Braces size={16} /> },
      { path: '/regex', label: '正则测试', icon: <RegexIcon size={16} /> },
      { path: '/regex-visualizer', label: '正则可视化', icon: <Eye size={16} /> },
      { path: '/diff', label: 'Diff对比', icon: <Diff size={16} /> },
      { path: '/lorem', label: '假文生成', icon: <FileText size={16} /> },
      { path: '/markdown', label: 'Markdown预览', icon: <FileCheck size={16} /> },
      { path: '/sql-formatter', label: 'SQL格式化', icon: <Database size={16} /> },
      { path: '/morse', label: '摩斯码转换', icon: <MessageSquare size={16} /> },
    ],
  },
  {
    label: '开发工具',
    icon: <Wrench size={16} />,
    children: [
      { path: '/uuid', label: 'UUID生成', icon: <Fingerprint size={16} /> },
      { path: '/cron', label: 'Cron解析', icon: <Timer size={16} /> },
      { path: '/unit', label: '单位转换', icon: <Ruler size={16} /> },
      { path: '/calculator', label: '计算器', icon: <CalcIcon size={16} /> },
      { path: '/code-formatter', label: '代码格式化', icon: <Code2 size={16} /> },
      { path: '/random', label: '随机数据', icon: <Shuffle size={16} /> },
      { path: '/dev', label: '开发常用', icon: <Wrench size={16} /> },
      { path: '/playground', label: 'Playground', icon: <Play size={16} /> },
      { path: '/api-tester', label: 'API测试', icon: <Radio size={16} /> },
      { path: '/websocket', label: 'WebSocket测试', icon: <Zap size={16} /> },
      { path: '/key-test', label: '键盘事件测试', icon: <Keyboard size={16} /> },
      { path: '/benchmark', label: 'JS性能测试', icon: <Gauge size={16} /> },
    ],
  },
  {
    label: '设计工具',
    icon: <Palette size={16} />,
    children: [
      { path: '/color', label: '颜色工具', icon: <Palette size={16} /> },
      { path: '/contrast', label: '颜色对比度', icon: <Contrast size={16} /> },
      { path: '/palette', label: '调色板生成', icon: <Palette size={16} /> },
      { path: '/qrcode', label: '二维码生成', icon: <QrCode size={16} /> },
      { path: '/gradient', label: 'CSS渐变', icon: <Sparkles size={16} /> },
      { path: '/shadow', label: 'CSS阴影', icon: <Square size={16} /> },
      { path: '/clip-path', label: 'CSS Clip-Path', icon: <Scissors size={16} /> },
      { path: '/code-image', label: '代码转图片', icon: <FileImage size={16} /> },
    ],
  },
  {
    label: '网络时间',
    icon: <Globe size={16} />,
    children: [
      { path: '/network', label: '网络工具', icon: <Globe size={16} /> },
      { path: '/time', label: '时间工具', icon: <Clock size={16} /> },
      { path: '/world-clock', label: '世界时钟', icon: <Globe2 size={16} /> },
      { path: '/ip-calc', label: 'IP计算器', icon: <Network size={16} /> },
      { path: '/stopwatch', label: '秒表', icon: <Timer size={16} /> },
      { path: 'countdown', label: '倒计时', icon: <Timer size={16} /> },
      { path: '/pomodoro', label: '番茄钟', icon: <Coffee size={16} /> },
    ],
  },
  {
    label: '图片工具',
    icon: <Image size={16} />,
    children: [
      { path: '/image', label: '图片处理', icon: <Image size={16} /> },
      { path: '/image-base64', label: '图片Base64', icon: <ImageOff size={16} /> },
      { path: '/image-compress', label: '图片压缩', icon: <Layers size={16} /> },
      { path: '/gif-generator', label: 'GIF生成器', icon: <Play size={16} /> },
      { path: '/picsum', label: '占位图片', icon: <ImagePlus size={16} /> },
    ],
  },
  {
    label: '健康工具',
    icon: <Heart size={16} />,
    children: [
      { path: '/health', label: '健康计算器', icon: <Heart size={16} /> },
      { path: '/advanced-health', label: '高级健康指标', icon: <Activity size={16} /> },
      { path: '/pregnancy', label: '预产期计算', icon: <Baby size={16} /> },
      { path: '/child-growth', label: '儿童发育评估', icon: <Baby size={16} /> },
    ],
  },
  {
    label: '效率工具',
    icon: <CheckSquare size={16} />,
    children: [
      { path: '/todo', label: '待办事项', icon: <CheckSquare size={16} /> },
      { path: '/notes', label: '快速笔记', icon: <StickyNote size={16} /> },
      { path: '/emoji', label: '表情符号', icon: <Smile size={16} /> },
    ],
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-logo">🛠️</span>
          <span className="navbar-title">DevTools</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="navbar-nav">
          {navGroups.map(group => (
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
          ))}
        </nav>

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