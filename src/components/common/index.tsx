import React from 'react';
import { useClipboard } from '../../hooks/useClipboard';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <input className={`input ${className}`.trim()} {...props} />
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {label && <label className="label">{label}</label>}
      <textarea className={`textarea ${className}`.trim()} style={{ flex: 1, ...props.style }} {...props} />
    </div>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export function Card({ title, children, className = '', style, ...props }: CardProps) {
  return (
    <div className={`card ${className}`.trim()} style={style} {...props}>
      {title && <div className="card-header">{title}</div>}
      {children}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <select className={`select ${className}`.trim()} {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const { copy, copied } = useClipboard();

  return (
    <button
      className="btn btn-secondary btn-sm"
      onClick={() => copy(text)}
    >
      {copied ? '已复制' : '复制'}
    </button>
  );
}