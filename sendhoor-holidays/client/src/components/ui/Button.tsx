import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-coral text-white shadow-lg shadow-coral/30 hover:bg-coral/90',
  secondary: 'bg-white text-ink ring-1 ring-ink/10 hover:bg-sand',
  ghost: 'text-ink ring-1 ring-ink/30 hover:bg-white/70',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 ${variants[variant]} ${className}`}
    />
  );
}
