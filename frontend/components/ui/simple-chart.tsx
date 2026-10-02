'use client'

import { ReactNode } from 'react'

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  height?: number
  className?: string
}

export function SimpleBarChart({ data, height = 200, className = "" }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className={`flex items-end space-x-2 ${className}`} style={{ height }}>
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0
        const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
        
        return (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
              style={{ 
                height: `${barHeight}px`,
                backgroundColor: color,
                minHeight: '4px'
              }}
              title={`${item.label}: ${item.value}`}
            />
            <div className="text-xs text-gray-500 mt-2 text-center truncate w-full">
              {item.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface SimpleLineChartProps {
  data: Array<{ label: string; value: number }>
  height?: number
  color?: string
  className?: string
}

export function SimpleLineChart({ data, height = 200, color = "#3B82F6", className = "" }: SimpleLineChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  const minValue = Math.min(...data.map(item => item.value))
  const range = maxValue - minValue || 1
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 80 // 80% of height for the line
    return `${x},${y}`
  }).join(' ')
  
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
        
        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 80
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="drop-shadow-sm hover:r-4 transition-all duration-200"
            >
              <title>{`${item.label}: ${item.value}`}</title>
            </circle>
          )
        })}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index} className="truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

interface SimplePieChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  size?: number
  className?: string
}

export function SimplePieChart({ data, size = 200, className = "" }: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0
  
  const slices = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle += angle
    
    const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    
    // Calculate path for pie slice
    const radius = 80
    const centerX = 100
    const centerY = 100
    
    const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
    const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
    const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
    const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ')
    
    return {
      ...item,
      pathData,
      color,
      percentage
    }
  })
  
  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      <div style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <title>{`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>
      </div>
      
      <div className="space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-gray-700">
              {slice.label} ({slice.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}