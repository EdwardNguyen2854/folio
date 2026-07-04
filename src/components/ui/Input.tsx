import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="grid gap-[7px] text-muted text-sm font-[650]">
      {label}
      <input
        className={`w-full border border-border rounded-[10px] bg-surface text-text px-3 py-[10px] outline-none transition-[border,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)] ${className}`}
        {...props}
      />
    </label>
  );
}

type SelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
};

export function Select({ label, value, onChange, options, className = '' }: SelectProps) {
  return (
    <label className="grid gap-[7px] text-muted text-sm font-[650]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full border border-border rounded-[10px] bg-surface text-text px-3 py-[10px] outline-none transition-[border,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)] ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}
