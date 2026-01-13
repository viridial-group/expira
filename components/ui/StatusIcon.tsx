import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface StatusIconProps {
  status: 'active' | 'success' | 'warning' | 'error' | 'expired'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StatusIcon({
  status,
  size = 'md',
  className = '',
}: StatusIconProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }
  
  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-500' },
    success: { icon: CheckCircle, color: 'text-green-500' },
    warning: { icon: AlertCircle, color: 'text-yellow-500' },
    error: { icon: XCircle, color: 'text-red-500' },
    expired: { icon: XCircle, color: 'text-red-500' },
  }
  
  const config = statusConfig[status]
  const Icon = config.icon
  
  return <Icon className={`${sizes[size]} ${config.color} ${className}`} />
}

