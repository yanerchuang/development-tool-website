import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import './Home.css';

const tools = [
  { path: '/encoding', label: '编码工具', icon: <Code size={24} />, description: 'URL、HTML实体、Unicode编码转换' },
  { path: '/time', label: '时间工具', icon: <Clock size={24} />, description: '时间戳转换、时区转换、格式化' },
  { path: '/color', label: '颜色工具', icon: <Palette size={24} />, description: 'HEX/RGB/HSL转换、颜色选择器' },
  { path: '/crypto', label: '加解密', icon: <Lock size={24} />, description: 'MD5、SHA、AES、JWT解码' },
  { path: '/base64', label: 'Base64', icon: <FileCode size={24} />, description: '文本和图片Base64编解码' },
  { path: '/json', label: 'JSON', icon: <Braces size={24} />, description: 'JSON格式化、压缩、校验' },
  { path: '/text', label: '文本工具', icon: <Type size={24} />, description: '正则测试、差异对比、统计' },
  { path: '/image', label: '图片工具', icon: <Image size={24} />, description: '格式转换、压缩、裁剪' },
  { path: '/network', label: '网络工具', icon: <Globe size={24} />, description: 'URL解析、HTTP请求构造' },
  { path: '/dev', label: '开发工具', icon: <Wrench size={24} />, description: 'UUID、二维码、代码格式化' },
];

export default function Home() {
  return (
    <div className="home">
      <div className="home-header">
        <h1>开发者<span>工具箱</span></h1>
        <p>一站式在线开发工具集合，助力提升开发效率</p>
      </div>
      <div className="tools-grid">
        {tools.map(tool => (
          <Link key={tool.path} to={tool.path} className="tool-card">
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-info">
              <h3>{tool.label}</h3>
              <p>{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}