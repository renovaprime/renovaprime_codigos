import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export default function Card({ children, className = '', hover = false, style }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 ${
        hover ? 'transition-all hover:shadow-xl hover:-translate-y-1' : ''
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
