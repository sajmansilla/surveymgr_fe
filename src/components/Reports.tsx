'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts'

const marketVolatilityData = [
  { name: 'Low Volatility', value: 40, color: '#FFB74D' },
  { name: 'Medium Volatility', value: 30, color: '#FF7043' },
  { name: 'High Volatility', value: 30, color: '#9C27B0' }
]

const debtEquityData = [
  { quarter: 'Q4', value: 8 },
  { quarter: 'Q3', value: 6 },
  { quarter: 'Q2', value: 9 },
  { quarter: 'Q1', value: 4 }
]

const creditRatingData = [
  { name: 'AAA', value: 30, color: '#4CAF50' },
  { name: 'AA', value: 25, color: '#2196F3' },
  { name: 'A', value: 20, color: '#9C27B0' },
  { name: 'BBB', value: 25, color: '#FF9800' }
]

const interestRateData = [
  { month: 'Jan', rate: 2.8 },
  { month: 'Feb', rate: 4.2 },
  { month: 'Mar', rate: 3.6 },
  { month: 'Apr', rate: 5.1 },
  { month: 'May', rate: 4.8 }
]

const revenueGrowthData = [
  { year: '2020', value: 8 },
  { year: '2021', value: 6 },
  { year: '2022', value: 4 },
  { year: '2023', value: 3 },
  { year: '2024', value: 2 }
]

const operationalIncidentsData = [
  { quarter: 'Q4', value: 7 },
  { quarter: 'Q3', value: 4 },
  { quarter: 'Q2', value: 8 },
  { quarter: 'Q1', value: 3 }
]

export default function Component() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm">
          STATISTICAL INFOGRAPHIC
          <span className="ml-2 text-gray-500">2024</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">MANAGEMENT REPORT</h1>
        <h2 className="text-2xl font-bold tracking-tight text-muted-foreground">FINANCIAL RISK</h2>
        <p className="text-muted-foreground">
          The Financial Risk Management Report provides a comprehensive overview
          of key risk factors affecting the financial stability of the business.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Volatility</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around h-[200px]">
            {marketVolatilityData.map((data, index) => (
              <div key={index} className="text-center">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie
                      data={[data]}
                      innerRadius={30}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={data.color} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2">
                  <div className="font-medium">{data.value}%</div>
                  <div className="text-sm text-muted-foreground">{data.name}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Debt-to-Equity Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={debtEquityData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="quarter" type="category" />
                  <Bar dataKey="value" fill="#FF9800" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credit Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={creditRatingData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {creditRatingData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interest Rate Fluctuations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={interestRateData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={{ fill: '#2196F3', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Industry Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueGrowthData}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FF9800"
                    fill="#FFE0B2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={operationalIncidentsData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="quarter" type="category" />
                  <Bar dataKey="value" fill="#9C27B0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}