'use client'

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
  {
    name: 'Mon',
    appointments: Math.floor(Math.random() * 900) + 100,
    admissions: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: 'Tue',
    appointments: Math.floor(Math.random() * 900) + 100,
    admissions: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: 'Wed',
    appointments: Math.floor(Math.random() * 900) + 100,
    admissions: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: 'Thu',
    appointments: Math.floor(Math.random() * 900) + 100,
    admissions: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: 'Fri',
    appointments: Math.floor(Math.random() * 900) + 100,
    admissions: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: 'Sat',
    appointments: Math.floor(Math.random() * 900) + 100,
    admissions: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: 'Sun',
    appointments: Math.floor(Math.random() * 900) + 100,
    admissions: Math.floor(Math.random() * 700) + 80,
  },
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Area
          type='monotone'
          dataKey='appointments'
          stroke='currentColor'
          className='text-primary'
          fill='currentColor'
          fillOpacity={0.15}
        />
        <Area
          type='monotone'
          dataKey='admissions'
          stroke='currentColor'
          className='text-muted-foreground'
          fill='currentColor'
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
