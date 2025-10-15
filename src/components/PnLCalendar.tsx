import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface Trade {
  id: string;
  pair: string;
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
}

interface PnLCalendarProps {
  trades: Trade[];
}

interface DayData {
  date: Date;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  isCurrentMonth: boolean;
}

export function PnLCalendar({ trades }: PnLCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the starting date (might be from previous month to fill the week)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Get the ending date (might be from next month to fill the week)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    // Create array of all dates to display
    const dates: DayData[] = [];
    const currentDateIter = new Date(startDate);
    
    while (currentDateIter <= endDate) {
      const dateStr = currentDateIter.toDateString();
      const dayTrades = trades.filter(t => 
        t.status === 'closed' && t.timestamp.toDateString() === dateStr
      );
      
      const dayPnL = dayTrades.reduce((sum, t) => sum + t.result, 0);
      const wins = dayTrades.filter(t => t.result > 0).length;
      const losses = dayTrades.filter(t => t.result < 0).length;
      
      dates.push({
        date: new Date(currentDateIter),
        pnl: dayPnL,
        trades: dayTrades.length,
        wins,
        losses,
        isCurrentMonth: currentDateIter.getMonth() === month
      });
      
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    
    return dates;
  }, [trades, currentDate]);

  const monthStats = useMemo(() => {
    const monthTrades = trades.filter(t => {
      const tradeMonth = t.timestamp.getMonth();
      const tradeYear = t.timestamp.getFullYear();
      return t.status === 'closed' && 
             tradeMonth === currentDate.getMonth() && 
             tradeYear === currentDate.getFullYear();
    });
    
    const totalPnL = monthTrades.reduce((sum, t) => sum + t.result, 0);
    const wins = monthTrades.filter(t => t.result > 0).length;
    const losses = monthTrades.filter(t => t.result < 0).length;
    const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0;
    
    const profitDays = calendarData.filter(d => d.isCurrentMonth && d.pnl > 0).length;
    const lossDays = calendarData.filter(d => d.isCurrentMonth && d.pnl < 0).length;
    
    return {
      totalPnL,
      totalTrades: monthTrades.length,
      wins,
      losses,
      winRate,
      profitDays,
      lossDays,
      avgDailyPnL: monthTrades.length > 0 ? totalPnL / new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() : 0
    };
  }, [trades, currentDate, calendarData]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayCellColor = (dayData: DayData) => {
    if (!dayData.isCurrentMonth) return 'bg-muted/30';
    if (dayData.trades === 0) return 'bg-background';
    
    const intensity = Math.min(Math.abs(dayData.pnl) / 500, 1); // Normalize to 0-1
    
    if (dayData.pnl > 0) {
      // Green shades for profit
      const opacity = 0.1 + (intensity * 0.4);
      return `bg-green-500` + ` bg-opacity-${Math.round(opacity * 100)}`;
    } else {
      // Red shades for loss
      const opacity = 0.1 + (intensity * 0.4);
      return `bg-red-500` + ` bg-opacity-${Math.round(opacity * 100)}`;
    }
  };

  const getDayBgStyle = (dayData: DayData) => {
    if (!dayData.isCurrentMonth || dayData.trades === 0) return {};
    
    const intensity = Math.min(Math.abs(dayData.pnl) / 500, 1);
    const opacity = 0.1 + (intensity * 0.4);
    
    if (dayData.pnl > 0) {
      return { backgroundColor: `rgba(40, 167, 69, ${opacity})` };
    } else {
      return { backgroundColor: `rgba(220, 53, 69, ${opacity})` };
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl">P&L Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <span className="text-sm font-medium px-4">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Monthly P&L</p>
                <p className={`text-lg sm:text-2xl ${monthStats.totalPnL >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
                  ${monthStats.totalPnL.toFixed(2)}
                </p>
              </div>
              {monthStats.totalPnL >= 0 ? (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#28A745]" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Win Rate</p>
            <p className="text-lg sm:text-2xl">{monthStats.winRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {monthStats.wins}W / {monthStats.losses}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Profit/Loss Days</p>
            <p className="text-lg sm:text-2xl text-[#1E90FF]">
              {monthStats.profitDays} / {monthStats.lossDays}
            </p>
            <p className="text-xs text-muted-foreground">
              Profit / Loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Avg Daily P&L</p>
            <p className={`text-lg sm:text-2xl ${monthStats.avgDailyPnL >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
              ${monthStats.avgDailyPnL.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Daily P&L Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarData.map((dayData, index) => {
                const isToday = dayData.date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      relative min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 border rounded-lg
                      ${!dayData.isCurrentMonth ? 'opacity-40' : ''}
                      ${isToday ? 'ring-2 ring-[#1E90FF]' : ''}
                      transition-all hover:shadow-md
                    `}
                    style={getDayBgStyle(dayData)}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div className="text-xs sm:text-sm font-medium">
                        {dayData.date.getDate()}
                      </div>
                      
                      {dayData.trades > 0 && (
                        <div className="space-y-1">
                          <div className={`text-xs sm:text-sm font-bold ${dayData.pnl >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {dayData.pnl >= 0 ? '+' : ''}${dayData.pnl.toFixed(0)}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dayData.wins > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-100 text-green-700 border-green-300">
                                {dayData.wins}W
                              </Badge>
                            )}
                            {dayData.losses > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 bg-red-100 text-red-700 border-red-300">
                                {dayData.losses}L
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Legend:</p>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(40, 167, 69, 0.3)' }}></div>
                <span className="text-muted-foreground">Profit Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(220, 53, 69, 0.3)' }}></div>
                <span className="text-muted-foreground">Loss Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-[#1E90FF]"></div>
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-100 text-green-700 border-green-300">
                  W
                </Badge>
                <span className="text-muted-foreground">Win</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-red-100 text-red-700 border-red-300">
                  L
                </Badge>
                <span className="text-muted-foreground">Loss</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Color intensity indicates the size of profit/loss
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
