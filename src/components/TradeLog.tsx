import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { InstrumentSelect } from './InstrumentSelect';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Search, Edit, Trash2, Download, Filter } from 'lucide-react';
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

interface TradeLogProps {
  trades?: Trade[];
  onUpdateTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
}

const EMOTIONS = [
  'Calm', 'Confident', 'Fearful', 'Greedy', 'Frustrated', 'Euphoric', 
  'Hesitant', 'Focused', 'Stressed', 'Optimistic', 'Pessimistic', 'Neutral'
];

export function TradeLog({ trades: propTrades, onUpdateTrade, onDeleteTrade }: TradeLogProps) {
  const [localTrades, setLocalTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstrument, setFilterInstrument] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Load trades from localStorage on mount
  useEffect(() => {
    const loadTrades = () => {
      const storedTrades = localStorage.getItem('trades');
      if (storedTrades) {
        const parsed = JSON.parse(storedTrades);
        // Convert date strings back to Date objects
        const tradesWithDates = parsed.map((t: any) => ({
          ...t,
          openDate: new Date(t.openDate),
          closeDate: t.closeDate ? new Date(t.closeDate) : undefined,
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
        }));
        setLocalTrades(tradesWithDates);
      }
    };

    loadTrades();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadTrades();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tradesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tradesUpdated', handleStorageChange);
    };
  }, []);

  // Use local trades or prop trades
  const trades = propTrades || localTrades;

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = 
        trade.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.id.includes(searchTerm);
      
      const matchesInstrument = filterInstrument === 'all' || trade.instrument === filterInstrument;
      const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
      
      return matchesSearch && matchesInstrument && matchesStatus;
    }).sort((a, b) => b.openDate.getTime() - a.openDate.getTime());
  }, [trades, searchTerm, filterInstrument, filterStatus]);

  const uniqueInstruments = [...new Set(trades.map(t => t.instrument))];

  const handleEdit = (trade: Trade) => {
    setEditingTrade({ ...trade });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (tradeId: string) => {
    if (confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      // Delete from localStorage
      const storedTrades = localStorage.getItem('trades');
      if (storedTrades) {
        const parsed = JSON.parse(storedTrades);
        const updated = parsed.filter((t: Trade) => t.id !== tradeId);
        localStorage.setItem('trades', JSON.stringify(updated));
        
        // Update local state
        setLocalTrades(updated.map((t: any) => ({
          ...t,
          openDate: new Date(t.openDate),
          closeDate: t.closeDate ? new Date(t.closeDate) : undefined,
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
        })));
        
        // Trigger update event
        window.dispatchEvent(new Event('tradesUpdated'));
      }

      // Call parent callback if provided
      if (onDeleteTrade) {
        onDeleteTrade(tradeId);
      }

      toast.success('Trade deleted successfully');
    }
  };

  const handleSaveEdit = () => {
    if (!editingTrade) return;

    if (!editingTrade.instrument || !editingTrade.lotSize || !editingTrade.entryPrice) {
      toast.error('Please complete Instrument, Entry Price, and Lot Size');
      return;
    }

    // Save to localStorage
    const storedTrades = localStorage.getItem('trades');
    if (storedTrades) {
      const parsed = JSON.parse(storedTrades);
      const updated = parsed.map((t: Trade) => 
        t.id === editingTrade.id ? editingTrade : t
      );
      localStorage.setItem('trades', JSON.stringify(updated));
      
      // Update local state
      setLocalTrades(updated.map((t: any) => ({
        ...t,
        openDate: new Date(t.openDate),
        closeDate: t.closeDate ? new Date(t.closeDate) : undefined,
        timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
      })));
      
      // Trigger update event
      window.dispatchEvent(new Event('tradesUpdated'));
    }

    // Call parent callback if provided
    if (onUpdateTrade) {
      onUpdateTrade(editingTrade);
    }

    toast.success('Trade updated successfully!');
    setIsEditDialogOpen(false);
    setEditingTrade(null);
  };

  const updateEditField = (field: keyof Trade, value: any) => {
    if (!editingTrade) return;
    setEditingTrade({ ...editingTrade, [field]: value });
  };

  const calculatePnL = () => {
    if (!editingTrade || !editingTrade.entryPrice || !editingTrade.exitPrice || !editingTrade.lotSize) return;
    
    const pipValue = 10;
    let pips = 0;
    
    if (editingTrade.type === 'buy') {
      pips = (editingTrade.exitPrice - editingTrade.entryPrice) * 10000;
    } else {
      pips = (editingTrade.entryPrice - editingTrade.exitPrice) * 10000;
    }
    
    const pnl = pips * pipValue * editingTrade.lotSize;
    updateEditField('result', Math.round(pnl * 100) / 100);
  };

  const exportToCSV = () => {
    const headers = ['Open Date', 'Close Date', 'Instrument', 'Type', 'Lot Size', 'Entry Price', 'Stop Loss', 'Take Profit', 'Exit Price', 'P&L', 'Status'];
    const csvData = filteredTrades.map(t => [
      t.openDate.toLocaleString(),
      t.closeDate ? t.closeDate.toLocaleString() : '',
      t.instrument,
      t.type,
      t.lotSize,
      t.entryPrice,
      t.stopLoss,
      t.takeProfit,
      t.exitPrice || '',
      t.result,
      t.status
    ]);
    
    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Trade log exported successfully!');
  };

  const stats = useMemo(() => {
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.result, 0);
    const closedTrades = filteredTrades.filter(t => t.status === 'closed');
    const winTrades = closedTrades.filter(t => t.result > 0);
    const winRate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 0;
    
    return {
      totalTrades: filteredTrades.length,
      openTrades: filteredTrades.filter(t => t.status === 'open').length,
      closedTrades: closedTrades.length,
      totalPnL,
      winRate
    };
  }, [filteredTrades]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl">Trade Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete history of all your trades
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Trades</p>
            <p className="text-lg sm:text-2xl text-[#1E90FF]">{stats.totalTrades}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Open</p>
            <p className="text-lg sm:text-2xl">{stats.openTrades}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Closed</p>
            <p className="text-lg sm:text-2xl">{stats.closedTrades}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Total P&L</p>
            <p className={`text-lg sm:text-2xl ${stats.totalPnL >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
              ${stats.totalPnL.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Win Rate</p>
            <p className="text-lg sm:text-2xl">{stats.winRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by instrument, notes, or trade ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterInstrument} onValueChange={setFilterInstrument}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Instruments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instruments</SelectItem>
                {uniqueInstruments.map(instrument => (
                  <SelectItem key={instrument} value={instrument}>{instrument}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trade Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Open Date</TableHead>
                  <TableHead className="w-[140px]">Close Date</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Lot Size</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">TP</TableHead>
                  <TableHead className="text-right">Exit</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      No trades found. Start by adding your first trade!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrades.map((trade) => (
                    <TableRow key={trade.id} className="hover:bg-muted/50">
                      <TableCell className="text-xs">
                        {trade.openDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <br />
                        <span className="text-muted-foreground">
                          {trade.openDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {trade.closeDate ? (
                          <>
                            {trade.closeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            <br />
                            <span className="text-muted-foreground">
                              {trade.closeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{trade.instrument}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{trade.lotSize.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{trade.entryPrice.toFixed(5)}</TableCell>
                      <TableCell className="text-right">{trade.stopLoss.toFixed(5)}</TableCell>
                      <TableCell className="text-right">{trade.takeProfit.toFixed(5)}</TableCell>
                      <TableCell className="text-right">
                        {trade.exitPrice ? trade.exitPrice.toFixed(5) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${trade.result >= 0 ? 'text-[#28A745]' : 'text-red-500'}`}>
                          {trade.result >= 0 ? '+' : ''}${trade.result.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={trade.status === 'open' ? 'default' : 'secondary'}
                          className={trade.status === 'open' ? 'bg-[#1E90FF]' : ''}
                        >
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(trade)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(trade.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
            <DialogDescription>
              Update trade details and save changes
            </DialogDescription>
          </DialogHeader>
          
          {editingTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-instrument">Instrument *</Label>
                  <InstrumentSelect
                    value={editingTrade.instrument}
                    onValueChange={(value) => updateEditField('instrument', value)}
                    placeholder="Select instrument..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <RadioGroup
                    value={editingTrade.type}
                    onValueChange={(value: 'buy' | 'sell') => updateEditField('type', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="buy" id="edit-buy" />
                      <Label htmlFor="edit-buy">Buy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sell" id="edit-sell" />
                      <Label htmlFor="edit-sell">Sell</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-openDate">Open Date & Time *</Label>
                  <Input
                    id="edit-openDate"
                    type="datetime-local"
                    value={editingTrade.openDate ? new Date(editingTrade.openDate.getTime() - editingTrade.openDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateEditField('openDate', new Date(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-closeDate">Close Date & Time</Label>
                  <Input
                    id="edit-closeDate"
                    type="datetime-local"
                    value={editingTrade.closeDate ? new Date(editingTrade.closeDate.getTime() - editingTrade.closeDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateEditField('closeDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-lotSize">Lot Size *</Label>
                  <Input
                    id="edit-lotSize"
                    type="number"
                    step="0.01"
                    value={editingTrade.lotSize || ''}
                    onChange={(e) => updateEditField('lotSize', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-entryPrice">Entry Price *</Label>
                  <Input
                    id="edit-entryPrice"
                    type="number"
                    step="0.00001"
                    value={editingTrade.entryPrice || ''}
                    onChange={(e) => updateEditField('entryPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-stopLoss">Stop Loss</Label>
                  <Input
                    id="edit-stopLoss"
                    type="number"
                    step="0.00001"
                    value={editingTrade.stopLoss || ''}
                    onChange={(e) => updateEditField('stopLoss', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-takeProfit">Take Profit</Label>
                  <Input
                    id="edit-takeProfit"
                    type="number"
                    step="0.00001"
                    value={editingTrade.takeProfit || ''}
                    onChange={(e) => updateEditField('takeProfit', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-exitPrice">Exit Price</Label>
                  <Input
                    id="edit-exitPrice"
                    type="number"
                    step="0.00001"
                    value={editingTrade.exitPrice || ''}
                    onChange={(e) => {
                      updateEditField('exitPrice', parseFloat(e.target.value) || 0);
                      setTimeout(calculatePnL, 100);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-result">P&L (USD)</Label>
                  <Input
                    id="edit-result"
                    type="number"
                    step="0.01"
                    value={editingTrade.result || ''}
                    onChange={(e) => updateEditField('result', parseFloat(e.target.value) || 0)}
                    className={editingTrade.result >= 0 ? 'text-[#28A745] font-semibold' : 'text-red-500 font-semibold'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingTrade.status} onValueChange={(value: 'open' | 'closed') => updateEditField('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Trading Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingTrade.notes}
                  onChange={(e) => updateEditField('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-emotion">Emotion During Trading</Label>
                <Select value={editingTrade.emotion} onValueChange={(value) => updateEditField('emotion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONS.map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#1E90FF] hover:bg-[#1E90FF]/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
