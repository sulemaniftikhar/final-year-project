import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl border-transparent',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-md hover:shadow-lg border-transparent',
  outline: 'bg-transparent border-2 border-neutral-300 text-neutral-700 hover:border-primary-500 hover:text-primary-600',
  ghost: 'bg-transparent text-primary-600 hover:text-primary-700 hover:bg-primary-50 border-transparent',
  danger: 'bg-error text-white hover:bg-red-600 shadow-md hover:shadow-lg border-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3.5 text-base',
  lg: 'px-8 py-4 text-lg',
  icon: 'p-2',
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false, 
  disabled = false, 
  icon: Icon,
  type = 'button',
  onClick,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-5 h-5 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
