import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Clock } from 'lucide-react';

interface Trade {
  id: string;
  instrument: string;
  lotSize: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  result: number;
  notes: string;
  emotion: string;
  mindsetBefore: string;
  mindsetAfter: string;
  timestamp: Date;
  type: 'buy' | 'sell';
  exitPrice?: number;
  status: 'open' | 'closed';
  openDate: Date;
  closeDate?: Date;
}

interface DashboardProps {
  trades: Trade[];
}

const COLORS = ['#1E90FF', '#28A745', '#DC3545', '#FFC107', '#6F42C1'];

export function Dashboard({ trades }: DashboardProps) {
  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed');
    const totalPnL = closedTrades.reduce((sum, trade) => sum + trade.result, 0);
    const winningTrades = closedTrades.filter(t => t.result > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + t.result, 0) / winningTrades.length 
      : 0;
    const avgLoss = Math.abs(closedTrades.filter(t => t.result < 0)
      .reduce((sum, t) => sum + t.result, 0) / Math.max(1, closedTrades.length - winningTrades.length));
    const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0;

    return {
      totalPnL,
      winRate,
      riskReward,
      totalTrades: closedTrades.length
    };
  }, [trades]);

  const equityData = useMemo(() => {
    let runningTotal = 0;
    return trades
      .filter(t => t.status === 'closed')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((trade, index) => {
        runningTotal += trade.result;
        return {
          trade: index + 1,
          equity: runningTotal,
          date: trade.timestamp.toLocaleDateString('en-US')
        };
      });
  }, [trades]);

  const instrumentDistribution = useMemo(() => {
    const distribution = trades.reduce((acc, trade) => {
      acc[trade.instrument] = (acc[trade.instrument] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([instrument, count]) => ({
      name: instrument,
      value: count
    }));
  }, [trades]);

  const hourlyData = useMemo(() => {
    const hourCounts = trades.reduce((acc, trade) => {
      const hour = trade.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      trades: hourCounts[hour] || 0
    }));
  }, [trades]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl md:text-2xl">Trading Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Total Trades: {stats.totalTrades}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm">Total P&L</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-lg sm:text-2xl ${stats.totalPnL >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
              ${stats.totalPnL.toFixed(2)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.totalPnL >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-[#28A745]" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              )}
              <span className="hidden sm:inline">Overall performance</span>
              <span className="sm:hidden">Performance</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm">Win Rate</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-2xl">{stats.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Success ratio</span>
              <span className="sm:hidden">Success</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm">R:R</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-2xl">1:{stats.riskReward.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Average ratio</span>
              <span className="sm:hidden">Avg ratio</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm">Trades</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-2xl text-[#1E90FF]">{stats.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Total trades</span>
              <span className="sm:hidden">Total</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equity Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trade" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                  labelFormatter={(label) => `Trade ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#1E90FF" 
                  strokeWidth={2}
                  dot={{ fill: '#1E90FF', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instrument Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={instrumentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {instrumentDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trading Hours Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trades" fill="#1E90FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
