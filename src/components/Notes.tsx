import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CurrencyPairFilter } from './CurrencyPairFilter';
import { Search, Filter, Calendar, TrendingUp, TrendingDown, Edit } from 'lucide-react';

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

interface NotesProps {
  trades: Trade[];
}

export function Notes({ trades }: NotesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPair, setFilterPair] = useState('all');
  const [filterEmotion, setFilterEmotion] = useState('all');
  const [filterResult, setFilterResult] = useState('all');

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.mindsetBefore.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.mindsetAfter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.pair.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPair = filterPair === 'all' || trade.pair === filterPair;
      const matchesEmotion = filterEmotion === 'all' || trade.emotion === filterEmotion;
      const matchesResult = filterResult === 'all' || 
                           (filterResult === 'profit' && trade.result > 0) ||
                           (filterResult === 'loss' && trade.result < 0);
      
      return matchesSearch && matchesPair && matchesEmotion && matchesResult;
    });
  }, [trades, searchTerm, filterPair, filterEmotion, filterResult]);

  const uniquePairs = [...new Set(trades.map(t => t.pair))];
  const uniqueEmotions = [...new Set(trades.map(t => t.emotion).filter(e => e))];

  const emotionInsights = useMemo(() => {
    const emotionStats = trades.reduce((acc, trade) => {
      if (!trade.emotion) return acc;
      if (!acc[trade.emotion]) {
        acc[trade.emotion] = { count: 0, totalPnL: 0, wins: 0 };
      }
      acc[trade.emotion].count += 1;
      acc[trade.emotion].totalPnL += trade.result;
      if (trade.result > 0) acc[trade.emotion].wins += 1;
      return acc;
    }, {} as Record<string, { count: number; totalPnL: number; wins: number }>);

    return Object.entries(emotionStats)
      .map(([emotion, stats]) => ({
        emotion,
        ...stats,
        avgPnL: stats.totalPnL / stats.count,
        winRate: (stats.wins / stats.count) * 100
      }))
      .sort((a, b) => b.avgPnL - a.avgPnL);
  }, [trades]);

  const learningPoints = useMemo(() => {
    const points = new Set<string>();
    trades.forEach(trade => {
      if (trade.notes) {
        // Extract learning points from notes (simplified)
        const keywords = ['learn', 'lesson', 'mistake', 'improve', 'remember', 'avoid', 'next time'];
        keywords.forEach(keyword => {
          if (trade.notes.toLowerCase().includes(keyword)) {
            points.add(trade.notes);
          }
        });
      }
    });
    return Array.from(points).slice(0, 10); // Top 10 learning points
  }, [trades]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl md:text-2xl">Trading Notes & Analysis</h1>
        <Badge variant="secondary">{filteredTrades.length} notes</Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search in notes, mindset, or currency pair..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <CurrencyPairFilter
                value={filterPair}
                onValueChange={setFilterPair}
                availablePairs={uniquePairs}
                placeholder="Pair"
              />
              
              <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emotions</SelectItem>
                  {uniqueEmotions.map(emotion => (
                    <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterResult} onValueChange={setFilterResult}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="journal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journal">Trading Journal</TabsTrigger>
          <TabsTrigger value="insights">Psychology Insights</TabsTrigger>
          <TabsTrigger value="learning">Learning Points</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4">
          {filteredTrades.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No notes match the filter.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTrades.map((trade) => (
              <Card key={trade.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{trade.pair}</Badge>
                      <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                        {trade.type.toUpperCase()}
                      </Badge>
                      <Badge 
                        variant={trade.result >= 0 ? 'default' : 'destructive'}
                        className={trade.result >= 0 ? 'bg-[#28A745]' : ''}
                      >
                        {trade.result >= 0 ? '+' : ''}${trade.result.toFixed(2)}
                      </Badge>
                      {trade.emotion && (
                        <Badge variant="secondary">{trade.emotion}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {trade.timestamp.toLocaleDateString('en-US')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trade.notes && (
                    <div>
                      <h4 className="text-sm mb-2">Trading Notes:</h4>
                      <p className="text-sm bg-muted p-3 rounded-lg">{trade.notes}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trade.mindsetBefore && (
                      <div>
                        <h4 className="text-sm mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Mindset Before:
                        </h4>
                        <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border-l-4 border-[#1E90FF]">
                          {trade.mindsetBefore}
                        </p>
                      </div>
                    )}
                    
                    {trade.mindsetAfter && (
                      <div>
                        <h4 className="text-sm mb-2 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Mindset After:
                        </h4>
                        <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border-l-4 border-[#28A745]">
                          {trade.mindsetAfter}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Entry: {trade.entryPrice} | SL: {trade.stopLoss} | TP: {trade.takeProfit} | 
                    Lot: {trade.lotSize}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Emotion Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emotionInsights.map((insight) => (
                  <div key={insight.emotion} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={insight.avgPnL >= 0 ? 'default' : 'destructive'}
                        className={insight.avgPnL >= 0 ? 'bg-[#28A745]' : ''}
                      >
                        {insight.emotion}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {insight.count} trades
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${insight.avgPnL >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
                        Avg: ${insight.avgPnL.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Win Rate: {insight.winRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Psychology Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-[#28A745]">
                  <h4 className="text-sm">Best Emotion for Trading:</h4>
                  <p className="text-sm text-muted-foreground">
                    {emotionInsights.length > 0 && emotionInsights[0].emotion} - 
                    Average profit ${emotionInsights.length > 0 && emotionInsights[0].avgPnL.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500">
                  <h4 className="text-sm">Emotion to Avoid:</h4>
                  <p className="text-sm text-muted-foreground">
                    {emotionInsights.length > 0 && emotionInsights[emotionInsights.length - 1].emotion} - 
                    Average loss ${emotionInsights.length > 0 && emotionInsights[emotionInsights.length - 1].avgPnL.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-[#1E90FF]">
                  <h4 className="text-sm">Tips:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Record emotions before and after each trade</li>
                    <li>• Avoid trading when negative emotions are dominant</li>
                    <li>• Use relaxation techniques before trading</li>
                    <li>• Review emotion notes regularly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Learning Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningPoints.length > 0 ? (
                  learningPoints.map((point, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <p className="text-sm">{point}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Start writing learning notes to see insights here
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Notes Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <h4>Setup Analysis:</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Timeframe used</li>
                    <li>Confirmation indicators</li>
                    <li>Support/resistance levels</li>
                    <li>Market condition (trending/ranging)</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h4>Execution Notes:</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Entry reason</li>
                    <li>Risk management applied</li>
                    <li>Exit strategy</li>
                    <li>Emotion during execution</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h4>Post-Trade Review:</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>What went according to plan?</li>
                    <li>What can be improved?</li>
                    <li>Lessons for next trade</li>
                    <li>Trading psychology evaluation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}