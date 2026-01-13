import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-200'
  const hoverStyles = hover ? 'hover:bg-gray-50 hover:shadow-lg transition' : ''
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  }
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}

