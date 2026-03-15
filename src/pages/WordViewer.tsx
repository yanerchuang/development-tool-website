import { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { Card, Button } from '../components/common';
import { Upload, FileText, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function WordViewer() {
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setContent('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setContent(result.value);

      if (result.messages.length > 0) {
        console.warn('Mammoth warnings:', result.messages);
      }
    } catch (err) {
      setError('无法解析文件，请确保是有效的 Word 文档 (.docx)');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      setError('仅支持 .docx 格式的 Word 文档');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setContent('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setContent(result.value);
    } catch (err) {
      setError('无法解析文件，请确保是有效的 Word 文档 (.docx)');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const resetZoom = () => setZoom(100);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="Word 文档预览">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".docx"
              style={{ display: 'none' }}
            />
            <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              上传文件
            </Button>
            {content && (
              <>
                <Button variant="secondary" onClick={zoomOut}>
                  <ZoomOut size={16} />
                </Button>
                <span style={{ fontSize: '13px', minWidth: '50px', textAlign: 'center' }}>{zoom}%</span>
                <Button variant="secondary" onClick={zoomIn}>
                  <ZoomIn size={16} />
                </Button>
                <Button variant="secondary" onClick={resetZoom}>
                  <Maximize2 size={16} />
                </Button>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {fileName}
                </span>
              </>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--bg-tertiary)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p>正在解析文档...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Empty State */}
          {!content && !loading && !error && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                padding: '60px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                border: '2px dashed var(--border-color)',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>拖放 Word 文档到此处</p>
              <p style={{ fontSize: '12px' }}>或点击上传按钮选择文件</p>
              <p style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>仅支持 .docx 格式</p>
            </div>
          )}

          {/* Document Preview */}
          {content && (
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                background: 'white',
                overflow: 'auto',
                maxHeight: '600px',
              }}
            >
              <div
                style={{
                  padding: '40px',
                  minHeight: '400px',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                  width: `${10000 / zoom}%`,
                  color: '#333',
                  fontFamily: 'Calibri, Arial, sans-serif',
                  lineHeight: 1.6,
                }}
              >
                <style>
                  {`
                    .word-content h1 { font-size: 24px; font-weight: bold; margin: 16px 0 8px; color: #333; }
                    .word-content h2 { font-size: 20px; font-weight: bold; margin: 14px 0 6px; color: #333; }
                    .word-content h3 { font-size: 16px; font-weight: bold; margin: 12px 0 4px; color: #333; }
                    .word-content p { margin: 8px 0; }
                    .word-content ul, .word-content ol { margin: 8px 0; padding-left: 24px; }
                    .word-content li { margin: 4px 0; }
                    .word-content table { border-collapse: collapse; width: 100%; margin: 12px 0; }
                    .word-content td, .word-content th { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .word-content th { background: #f5f5f5; font-weight: bold; }
                    .word-content img { max-width: 100%; height: auto; }
                    .word-content a { color: #0066cc; text-decoration: underline; }
                  `}
                </style>
                <div
                  className="word-content"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          )}

          {/* Document Info */}
          {content && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>文件名: {fileName}</span>
              <span>|</span>
              <span>预览比例: {zoom}%</span>
            </div>
          )}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>上传文件</strong>：点击上传按钮或拖放 .docx 文件到预览区域</div>
          <div>• <strong>缩放预览</strong>：使用缩放按钮调整文档显示大小</div>
          <div>• <strong>格式支持</strong>：支持标题、段落、列表、表格、图片等常见格式</div>
          <div>• <strong>注意</strong>：仅支持 .docx 格式，不支持旧版 .doc 格式</div>
        </div>
      </Card>

      <Card title="功能说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 本工具使用 mammoth.js 将 Word 文档转换为 HTML 进行预览</div>
          <div>• 部分复杂格式（如特殊字体、复杂表格）可能无法完美还原</div>
          <div>• 文档仅在本地处理，不会上传到服务器，保护您的隐私</div>
        </div>
      </Card>
    </div>
  );
}