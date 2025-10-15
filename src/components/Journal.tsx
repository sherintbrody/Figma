import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar as CalendarIcon, Plus, Search, TrendingUp, TrendingDown, BookOpen, Target, Lightbulb } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

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

interface JournalEntry {
  id: string;
  date: Date;
  mood: string;
  marketConditions: string;
  lessonsLearned: string;
  whatWentWell: string;
  whatToImprove: string;
  goalsForTomorrow: string;
  overallReflection: string;
  gratitude: string;
}

interface JournalProps {
  trades: Trade[];
}

const MOODS = [
  'Excellent', 'Good', 'Neutral', 'Anxious', 'Frustrated', 'Confident', 'Uncertain', 'Motivated'
];

const MARKET_CONDITIONS = [
  'Trending', 'Ranging', 'Volatile', 'Quiet', 'News-driven', 'Mixed'
];

export function Journal({ trades }: JournalProps) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [newEntry, setNewEntry] = useState<Omit<JournalEntry, 'id'>>({
    date: new Date(),
    mood: '',
    marketConditions: '',
    lessonsLearned: '',
    whatWentWell: '',
    whatToImprove: '',
    goalsForTomorrow: '',
    overallReflection: '',
    gratitude: ''
  });

  const getDayStats = (date: Date) => {
    const dayTrades = trades.filter(t => 
      t.status === 'closed' && 
      t.timestamp.toDateString() === date.toDateString()
    );
    
    const totalPnL = dayTrades.reduce((sum, t) => sum + t.result, 0);
    const wins = dayTrades.filter(t => t.result > 0).length;
    const losses = dayTrades.filter(t => t.result < 0).length;
    const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;
    
    return {
      totalTrades: dayTrades.length,
      totalPnL,
      wins,
      losses,
      winRate,
      trades: dayTrades
    };
  };

  const todayStats = useMemo(() => getDayStats(new Date()), [trades]);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      const matchesSearch = 
        entry.lessonsLearned.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.overallReflection.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.whatWentWell.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.whatToImprove.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMood = filterMood === 'all' || entry.mood === filterMood;
      
      return matchesSearch && matchesMood;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [journalEntries, searchTerm, filterMood]);

  const handleAddEntry = () => {
    if (!newEntry.mood || !newEntry.overallReflection) {
      toast.error('Please fill in at least mood and overall reflection');
      return;
    }

    const entry: JournalEntry = {
      ...newEntry,
      id: Date.now().toString(),
      date: new Date()
    };

    setJournalEntries(prev => [entry, ...prev]);
    toast.success('Journal entry added successfully!');
    
    // Reset form
    setNewEntry({
      date: new Date(),
      mood: '',
      marketConditions: '',
      lessonsLearned: '',
      whatWentWell: '',
      whatToImprove: '',
      goalsForTomorrow: '',
      overallReflection: '',
      gratitude: ''
    });
    setIsAddingEntry(false);
  };

  const updateField = (field: keyof Omit<JournalEntry, 'id'>, value: string) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#1E90FF]" />
            Trading Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daily reflections and trading insights
          </p>
        </div>
        <Button 
          onClick={() => setIsAddingEntry(!isAddingEntry)}
          className="bg-[#1E90FF] hover:bg-[#1E90FF]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isAddingEntry ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      {/* Today's Trading Summary */}
      <Card className="bg-gradient-to-br from-[#1E90FF]/10 to-transparent border-[#1E90FF]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#1E90FF]" />
            Today's Trading Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold text-[#1E90FF]">{todayStats.totalTrades}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">P&L</p>
              <p className={`text-2xl font-bold ${todayStats.totalPnL >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
                ${todayStats.totalPnL.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">{todayStats.winRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">W/L</p>
              <p className="text-2xl font-bold">
                <span className="text-[#28A745]">{todayStats.wins}</span>
                /
                <span className="text-red-500">{todayStats.losses}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry Form */}
      {isAddingEntry && (
        <Card className="border-[#1E90FF]/30">
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mood">How are you feeling today? *</Label>
                <Select value={newEntry.mood} onValueChange={(value) => updateField('mood', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((mood) => (
                      <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketConditions">Market Conditions</Label>
                <Select value={newEntry.marketConditions} onValueChange={(value) => updateField('marketConditions', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select market conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKET_CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatWentWell" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#28A745]" />
                What went well today?
              </Label>
              <Textarea
                id="whatWentWell"
                value={newEntry.whatWentWell}
                onChange={(e) => updateField('whatWentWell', e.target.value)}
                placeholder="Describe your wins, good decisions, and positive moments..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatToImprove" className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#1E90FF]" />
                What can be improved?
              </Label>
              <Textarea
                id="whatToImprove"
                value={newEntry.whatToImprove}
                onChange={(e) => updateField('whatToImprove', e.target.value)}
                placeholder="Areas for improvement, mistakes made, things to avoid..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonsLearned" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#FFC107]" />
                Key Lessons Learned
              </Label>
              <Textarea
                id="lessonsLearned"
                value={newEntry.lessonsLearned}
                onChange={(e) => updateField('lessonsLearned', e.target.value)}
                placeholder="Important insights and lessons from today's trading..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalsForTomorrow">Goals for Tomorrow</Label>
              <Textarea
                id="goalsForTomorrow"
                value={newEntry.goalsForTomorrow}
                onChange={(e) => updateField('goalsForTomorrow', e.target.value)}
                placeholder="What do you want to achieve tomorrow? What will you focus on?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overallReflection">Overall Reflection *</Label>
              <Textarea
                id="overallReflection"
                value={newEntry.overallReflection}
                onChange={(e) => updateField('overallReflection', e.target.value)}
                placeholder="Your overall thoughts about today's trading session..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gratitude">Gratitude</Label>
              <Textarea
                id="gratitude"
                value={newEntry.gratitude}
                onChange={(e) => updateField('gratitude', e.target.value)}
                placeholder="What are you grateful for today?"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry} className="bg-[#1E90FF] hover:bg-[#1E90FF]/90">
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search journal entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterMood} onValueChange={setFilterMood}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {MOODS.map((mood) => (
                  <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries Timeline */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start documenting your trading journey by creating your first entry
              </p>
              <Button 
                onClick={() => setIsAddingEntry(true)}
                className="bg-[#1E90FF] hover:bg-[#1E90FF]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const dayStats = getDayStats(entry.date);
            
            return (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-[#1E90FF]" />
                        {entry.date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-[#1E90FF]/10">
                        {entry.mood}
                      </Badge>
                      {entry.marketConditions && (
                        <Badge variant="secondary">
                          {entry.marketConditions}
                        </Badge>
                      )}
                      <Badge 
                        variant={dayStats.totalPnL >= 0 ? 'default' : 'destructive'}
                        className={dayStats.totalPnL >= 0 ? 'bg-[#28A745]' : ''}
                      >
                        ${dayStats.totalPnL.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Day's Trading Stats */}
                  {dayStats.totalTrades > 0 && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Trading Summary</p>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Trades</p>
                          <p className="font-medium">{dayStats.totalTrades}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Win Rate</p>
                          <p className="font-medium">{dayStats.winRate.toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Wins</p>
                          <p className="font-medium text-[#28A745]">{dayStats.wins}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Losses</p>
                          <p className="font-medium text-red-500">{dayStats.losses}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {entry.whatWentWell && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-[#28A745]">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        What Went Well
                      </h4>
                      <p className="text-sm text-muted-foreground">{entry.whatWentWell}</p>
                    </div>
                  )}

                  {entry.whatToImprove && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-[#1E90FF]">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Areas to Improve
                      </h4>
                      <p className="text-sm text-muted-foreground">{entry.whatToImprove}</p>
                    </div>
                  )}

                  {entry.lessonsLearned && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-l-4 border-[#FFC107]">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Key Lessons
                      </h4>
                      <p className="text-sm text-muted-foreground">{entry.lessonsLearned}</p>
                    </div>
                  )}

                  {entry.goalsForTomorrow && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Goals for Tomorrow</h4>
                      <p className="text-sm text-muted-foreground">{entry.goalsForTomorrow}</p>
                    </div>
                  )}

                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Overall Reflection</h4>
                    <p className="text-sm text-muted-foreground">{entry.overallReflection}</p>
                  </div>

                  {entry.gratitude && (
                    <div className="p-3 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Gratitude</h4>
                      <p className="text-sm text-muted-foreground italic">"{entry.gratitude}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Journal Tips */}
      <Card className="bg-gradient-to-br from-[#1E90FF]/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-base">Journaling Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Write your journal entry at the end of each trading day while everything is fresh</li>
            <li>• Be honest about your emotions and decisions - this is for your growth</li>
            <li>• Focus on the process, not just the results</li>
            <li>• Review past entries weekly to identify patterns and progress</li>
            <li>• Use specific examples rather than general statements</li>
            <li>• Celebrate small wins and learn from every mistake</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
