import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { InstrumentSelect } from './InstrumentSelect';
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
  type: 'buy' | 'sell';
  exitPrice?: number;
  status: 'open' | 'closed';
  openDate: Date;
  closeDate?: Date;
  timestamp: Date;
}

interface AddTradeProps {
  onAddTrade?: (trade: Trade) => void;
}

const EMOTIONS = [
  'Calm', 'Confident', 'Fearful', 'Greedy', 'Frustrated', 'Euphoric', 
  'Hesitant', 'Focused', 'Stressed', 'Optimistic', 'Pessimistic', 'Neutral'
];

export function AddTrade({ onAddTrade }: AddTradeProps) {
  const [formData, setFormData] = useState<Trade>({
    id: '',
    instrument: '',
    lotSize: 0,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    result: 0,
    notes: '',
    emotion: '',
    mindsetBefore: '',
    mindsetAfter: '',
    type: 'buy',
    status: 'closed',
    openDate: new Date(),
    closeDate: new Date(),
    timestamp: new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instrument || !formData.lotSize || !formData.entryPrice) {
      toast.error('Please complete Instrument, Entry Price, and Lot Size');
      return;
    }

    if (formData.lotSize <= 0 || formData.entryPrice <= 0) {
      toast.error('Lot Size and Entry Price must be greater than 0');
      return;
    }

    // Create trade with unique ID and timestamp
    const newTrade: Trade = {
      ...formData,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    // Save to localStorage
    const existingTrades = JSON.parse(localStorage.getItem('trades') || '[]');
    existingTrades.push(newTrade);
    localStorage.setItem('trades', JSON.stringify(existingTrades));

    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event('tradesUpdated'));

    // Call parent callback if provided
    if (onAddTrade) {
      onAddTrade(newTrade);
    }

    toast.success('Trade added successfully!');
    
    // Reset form
    setFormData({
      id: '',
      instrument: '',
      lotSize: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      result: 0,
      notes: '',
      emotion: '',
      mindsetBefore: '',
      mindsetAfter: '',
      type: 'buy',
      status: 'closed',
      openDate: new Date(),
      closeDate: new Date(),
      timestamp: new Date()
    });
  };

  const updateField = (field: keyof Trade, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePnL = () => {
    if (!formData.entryPrice || !formData.exitPrice || !formData.lotSize) return;
    
    const pipValue = 10; // Simplified pip value for major pairs
    let pips = 0;
    
    if (formData.type === 'buy') {
      pips = (formData.exitPrice - formData.entryPrice) * 10000;
    } else {
      pips = (formData.entryPrice - formData.exitPrice) * 10000;
    }
    
    const pnl = pips * pipValue * formData.lotSize;
    updateField('result', Math.round(pnl * 100) / 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl">Add New Trade</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Trade Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instrument">Instrument *</Label>
                <InstrumentSelect
                  value={formData.instrument}
                  onValueChange={(value) => updateField('instrument', value)}
                  placeholder="Select instrument..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openDate">Open Date & Time *</Label>
                  <Input
                    id="openDate"
                    type="datetime-local"
                    value={formData.openDate ? new Date(formData.openDate.getTime() - formData.openDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateField('openDate', new Date(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeDate">Close Date & Time</Label>
                  <Input
                    id="closeDate"
                    type="datetime-local"
                    value={formData.closeDate ? new Date(formData.closeDate.getTime() - formData.closeDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateField('closeDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order Type</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value: 'buy' | 'sell') => updateField('type', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buy" id="buy" />
                    <Label htmlFor="buy">Buy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="sell" />
                    <Label htmlFor="sell">Sell</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lotSize">Lot Size *</Label>
                  <Input
                    id="lotSize"
                    type="number"
                    step="0.01"
                    value={formData.lotSize || ''}
                    onChange={(e) => updateField('lotSize', parseFloat(e.target.value) || 0)}
                    placeholder="0.10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryPrice">Entry Price *</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.00001"
                    value={formData.entryPrice || ''}
                    onChange={(e) => updateField('entryPrice', parseFloat(e.target.value) || 0)}
                    placeholder="1.08500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.00001"
                    value={formData.stopLoss || ''}
                    onChange={(e) => updateField('stopLoss', parseFloat(e.target.value) || 0)}
                    placeholder="1.08000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="takeProfit">Take Profit</Label>
                  <Input
                    id="takeProfit"
                    type="number"
                    step="0.00001"
                    value={formData.takeProfit || ''}
                    onChange={(e) => updateField('takeProfit', parseFloat(e.target.value) || 0)}
                    placeholder="1.09500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exitPrice">Exit Price</Label>
                  <Input
                    id="exitPrice"
                    type="number"
                    step="0.00001"
                    value={formData.exitPrice || ''}
                    onChange={(e) => {
                      updateField('exitPrice', parseFloat(e.target.value) || 0);
                      setTimeout(calculatePnL, 100);
                    }}
                    placeholder="1.09200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result">P&L (USD)</Label>
                  <Input
                    id="result"
                    type="number"
                    step="0.01"
                    value={formData.result || ''}
                    onChange={(e) => updateField('result', parseFloat(e.target.value) || 0)}
                    placeholder="250.00"
                    className={formData.result > 0 ? 'text-green-600 font-semibold' : formData.result < 0 ? 'text-red-600 font-semibold' : ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Trading Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Entry reason, market conditions, setup used..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Psychology Management */}
          <Card>
            <CardHeader>
              <CardTitle>Psychology Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emotion">Emotion During Trading</Label>
                <Select value={formData.emotion} onValueChange={(value) => updateField('emotion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dominant emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONS.map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mindsetBefore">Mindset Before Trade</Label>
                <Textarea
                  id="mindsetBefore"
                  value={formData.mindsetBefore}
                  onChange={(e) => updateField('mindsetBefore', e.target.value)}
                  placeholder="How you feel and think before entering the trade..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mindsetAfter">Mindset After Trade</Label>
                <Textarea
                  id="mindsetAfter"
                  value={formData.mindsetAfter}
                  onChange={(e) => updateField('mindsetAfter', e.target.value)}
                  placeholder="Reflection after trade completion, lessons learned..."
                  rows={3}
                />
              </div>

              <div className="bg-[#1E90FF]/10 p-4 rounded-lg">
                <h4 className="text-sm mb-2">Trading Psychology Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Stay calm and objective in every decision</li>
                  <li>• Don't trade when emotionally unstable</li>
                  <li>• Always follow your trading plan</li>
                  <li>• Learn from every trade, both profit and loss</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => {
            setFormData({
              id: '',
              instrument: '',
              lotSize: 0,
              entryPrice: 0,
              stopLoss: 0,
              takeProfit: 0,
              result: 0,
              notes: '',
              emotion: '',
              mindsetBefore: '',
              mindsetAfter: '',
              type: 'buy',
              status: 'closed',
              openDate: new Date(),
              closeDate: new Date(),
              timestamp: new Date()
            });
          }}>
            Reset Form
          </Button>
          <Button 
            type="submit" 
            className="bg-[#1E90FF] hover:bg-[#1E90FF]/90"
          >
            Save Trade
          </Button>
        </div>
      </form>
    </div>
  );
}
