"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react'

interface BillingStatsProps {
  stats: {
    total_revenue?: number
    total_outstanding?: number
    total_paid?: number
    bills_count?: number
    paid_bills_count?: number
    pending_bills_count?: number
    overdue_bills_count?: number
    monthly_revenue?: number[]
  }
}

export function BillingStats({ stats }: BillingStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue || 0),
      description: 'All time revenue',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Outstanding Amount',
      value: formatCurrency(stats.total_outstanding || 0),
      description: 'Unpaid bills',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Paid Amount',
      value: formatCurrency(stats.total_paid || 0),
      description: 'Total payments received',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      title: 'Total Bills',
      value: stats.bills_count?.toString() || '0',
      description: `${stats.paid_bills_count || 0} paid, ${stats.pending_bills_count || 0} pending, ${stats.overdue_bills_count || 0} overdue`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
