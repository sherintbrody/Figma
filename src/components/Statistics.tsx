import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

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

interface StatisticsProps {
  trades: Trade[];
}

const COLORS = ['#1E90FF', '#28A745', '#DC3545', '#FFC107', '#6F42C1'];

export function Statistics({ trades }: StatisticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const filteredTrades = useMemo(() => {
    const now = new Date();
    const closedTrades = trades.filter(t => t.status === 'closed');
    
    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return closedTrades.filter(t => t.timestamp >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return closedTrades.filter(t => t.timestamp >= monthAgo);
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return closedTrades.filter(t => t.timestamp >= quarterAgo);
      default:
        return closedTrades;
    }
  }, [trades, selectedPeriod]);

  const advancedStats = useMemo(() => {
    const winTrades = filteredTrades.filter(t => t.result > 0);
    const lossTrades = filteredTrades.filter(t => t.result < 0);
    
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.result, 0);
    const winRate = filteredTrades.length > 0 ? (winTrades.length / filteredTrades.length) * 100 : 0;
    
    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + t.result, 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((sum, t) => sum + t.result, 0) / lossTrades.length) : 0;
    
    const largestWin = Math.max(...winTrades.map(t => t.result), 0);
    const largestLoss = Math.min(...lossTrades.map(t => t.result), 0);
    
    const profitFactor = avgLoss > 0 ? (avgWin * winTrades.length) / (avgLoss * lossTrades.length) : 0;
    
    const consecutiveWins = calculateConsecutiveWins(filteredTrades);
    const consecutiveLosses = calculateConsecutiveLosses(filteredTrades);
    
    return {
      totalPnL,
      winRate,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      profitFactor,
      consecutiveWins,
      consecutiveLosses,
      totalTrades: filteredTrades.length,
      winTrades: winTrades.length,
      lossTrades: lossTrades.length
    };
  }, [filteredTrades]);

  const monthlyData = useMemo(() => {
    const monthlyStats = filteredTrades.reduce((acc, trade) => {
      const month = trade.timestamp.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, profit: 0, trades: 0 };
      }
      acc[month].profit += trade.result;
      acc[month].trades += 1;
      return acc;
    }, {} as Record<string, { month: string; profit: number; trades: number }>);

    return Object.values(monthlyStats).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [filteredTrades]);

  const instrumentPerformance = useMemo(() => {
    const instrumentStats = filteredTrades.reduce((acc, trade) => {
      if (!acc[trade.instrument]) {
        acc[trade.instrument] = { instrument: trade.instrument, profit: 0, trades: 0, wins: 0 };
      }
      acc[trade.instrument].profit += trade.result;
      acc[trade.instrument].trades += 1;
      if (trade.result > 0) acc[trade.instrument].wins += 1;
      return acc;
    }, {} as Record<string, { instrument: string; profit: number; trades: number; wins: number }>);

    return Object.values(instrumentStats)
      .map(stat => ({
        ...stat,
        winRate: stat.trades > 0 ? (stat.wins / stat.trades) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [filteredTrades]);

  const emotionAnalysis = useMemo(() => {
    const emotionStats = filteredTrades.reduce((acc, trade) => {
      if (!trade.emotion) return acc;
      if (!acc[trade.emotion]) {
        acc[trade.emotion] = { emotion: trade.emotion, count: 0, totalPnL: 0, wins: 0 };
      }
      acc[trade.emotion].count += 1;
      acc[trade.emotion].totalPnL += trade.result;
      if (trade.result > 0) acc[trade.emotion].wins += 1;
      return acc;
    }, {} as Record<string, { emotion: string; count: number; totalPnL: number; wins: number }>);

    return Object.values(emotionStats)
      .map(stat => ({
        ...stat,
        avgPnL: stat.totalPnL / stat.count,
        winRate: (stat.wins / stat.count) * 100
      }))
      .sort((a, b) => b.avgPnL - a.avgPnL);
  }, [filteredTrades]);

  const dayOfWeekAnalysis = useMemo(() => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = filteredTrades.reduce((acc, trade) => {
      const day = daysOfWeek[trade.timestamp.getDay()];
      if (!acc[day]) {
        acc[day] = { day, trades: 0, wins: 0, totalPnL: 0 };
      }
      acc[day].trades += 1;
      acc[day].totalPnL += trade.result;
      if (trade.result > 0) acc[day].wins += 1;
      return acc;
    }, {} as Record<string, { day: string; trades: number; wins: number; totalPnL: number }>);

    return daysOfWeek.map(day => ({
      day,
      trades: dayStats[day]?.trades || 0,
      winRate: dayStats[day] ? (dayStats[day].wins / dayStats[day].trades) * 100 : 0,
      avgPnL: dayStats[day] ? dayStats[day].totalPnL / dayStats[day].trades : 0
    }));
  }, [filteredTrades]);

  function calculateConsecutiveWins(trades: Trade[]): number {
    let maxWins = 0;
    let currentWins = 0;
    
    trades.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).forEach(trade => {
      if (trade.result > 0) {
        currentWins++;
        maxWins = Math.max(maxWins, currentWins);
      } else {
        currentWins = 0;
      }
    });
    
    return maxWins;
  }

  function calculateConsecutiveLosses(trades: Trade[]): number {
    let maxLosses = 0;
    let currentLosses = 0;
    
    trades.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).forEach(trade => {
      if (trade.result < 0) {
        currentLosses++;
        maxLosses = Math.max(maxLosses, currentLosses);
      } else {
        currentLosses = 0;
      }
    });
    
    return maxLosses;
  }

  const exportData = (format: string) => {
    toast.success(`Export ${format.toUpperCase()} will start...`);
    // Implementation would go here for actual export
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl">Trading Statistical Analysis</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => exportData('csv')} className="text-sm">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export </span>CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('pdf')} className="text-sm">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export </span>PDF
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedPeriod === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('all')}
          className={selectedPeriod === 'all' ? 'bg-[#1E90FF]' : ''}
        >
          All Time
        </Button>
        <Button
          variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('quarter')}
          className={selectedPeriod === 'quarter' ? 'bg-[#1E90FF]' : ''}
        >
          3 Months
        </Button>
        <Button
          variant={selectedPeriod === 'month' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('month')}
          className={selectedPeriod === 'month' ? 'bg-[#1E90FF]' : ''}
        >
          1 Month
        </Button>
        <Button
          variant={selectedPeriod === 'week' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('week')}
          className={selectedPeriod === 'week' ? 'bg-[#1E90FF]' : ''}
        >
          1 Week
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="psychology">Psychology</TabsTrigger>
          <TabsTrigger value="instruments">Instruments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Advanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Profit Factor</p>
                    <p className="text-lg sm:text-2xl">{advancedStats.profitFactor.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#28A745]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Win</p>
                    <p className="text-2xl text-[#28A745]">${advancedStats.avgWin.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#28A745]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Loss</p>
                    <p className="text-2xl text-red-500">$-{advancedStats.avgLoss.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Max Consecutive Wins</p>
                    <p className="text-2xl">{advancedStats.consecutiveWins}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-[#1E90FF]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#1E90FF" 
                    fill="#1E90FF" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Win/Loss Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Wins', value: advancedStats.winTrades, fill: '#28A745' },
                        { name: 'Losses', value: advancedStats.lossTrades, fill: '#DC3545' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Largest Win</p>
                    <p className="text-lg text-[#28A745]">${advancedStats.largestWin.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Largest Loss</p>
                    <p className="text-lg text-red-500">${advancedStats.largestLoss.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Consecutive Losses</p>
                    <p className="text-lg">{advancedStats.consecutiveLosses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-lg">{advancedStats.winRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Win Rate by Trading Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dayOfWeekAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="winRate" fill="#1E90FF" name="winRate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="psychology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emotionAnalysis.map((emotion, index) => (
                  <div key={emotion.emotion} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{emotion.emotion}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {emotion.count} trades
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-sm ${emotion.avgPnL >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
                          Avg: ${emotion.avgPnL.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Win Rate: {emotion.winRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instruments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Win Rate by Instrument</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={instrumentPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="instrument" type="category" width={80} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                    />
                    <Bar dataKey="winRate" fill="#1E90FF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instrument Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {instrumentPerformance.map((item, index) => (
                    <div key={item.instrument} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.instrument}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.trades} trades
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`${item.profit >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
                            ${item.profit.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Win Rate: {item.winRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

