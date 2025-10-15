import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Calculator, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { InstrumentSelect } from './InstrumentSelect';

export function RiskCalculator() {
  const [riskCalcData, setRiskCalcData] = useState({
    accountBalance: 10000,
    riskPercentage: 2,
    entryPrice: 1.0850,
    stopLoss: 1.0800,
    instrument: 'EUR/USD'
  });

  const [positionSizeData, setPositionSizeData] = useState({
    accountBalance: 10000,
    riskAmount: 200,
    entryPrice: 1.0850,
    stopLoss: 1.0800,
    instrument: 'EUR/USD'
  });

  const [pipCalcData, setPipCalcData] = useState({
    lotSize: 1,
    pips: 50,
    instrument: 'EUR/USD'
  });

  const riskCalculation = useMemo(() => {
    const riskAmount = (riskCalcData.accountBalance * riskCalcData.riskPercentage) / 100;
    const pipDifference = Math.abs(riskCalcData.entryPrice - riskCalcData.stopLoss) * 10000;
    const pipValue = getPipValue(riskCalcData.instrument);
    const suggestedLotSize = pipDifference > 0 ? riskAmount / (pipDifference * pipValue) : 0;
    
    return {
      riskAmount,
      pipDifference,
      suggestedLotSize: Math.round(suggestedLotSize * 100) / 100,
      pipValue
    };
  }, [riskCalcData]);

  const positionSizeCalculation = useMemo(() => {
    const pipDifference = Math.abs(positionSizeData.entryPrice - positionSizeData.stopLoss) * 10000;
    const pipValue = getPipValue(positionSizeData.instrument);
    const suggestedLotSize = pipDifference > 0 ? positionSizeData.riskAmount / (pipDifference * pipValue) : 0;
    const riskPercentage = (positionSizeData.riskAmount / positionSizeData.accountBalance) * 100;
    
    return {
      pipDifference,
      suggestedLotSize: Math.round(suggestedLotSize * 100) / 100,
      riskPercentage: Math.round(riskPercentage * 100) / 100,
      pipValue
    };
  }, [positionSizeData]);

  const pipCalculation = useMemo(() => {
    const pipValue = getPipValue(pipCalcData.instrument);
    const profitLoss = pipCalcData.pips * pipValue * pipCalcData.lotSize;
    
    return {
      pipValue,
      profitLoss: Math.round(profitLoss * 100) / 100
    };
  }, [pipCalcData]);

  function getPipValue(instrument: string): number {
    // Simplified pip values for major pairs (assuming USD account)
    if (instrument.includes('JPY')) return 10; // For XXX/JPY pairs
    return 10; // For other major pairs
  }

  const riskLevels = [
    { percentage: 1, label: 'Conservative', color: 'bg-green-500' },
    { percentage: 2, label: 'Moderate', color: 'bg-blue-500' },
    { percentage: 3, label: 'Aggressive', color: 'bg-yellow-500' },
    { percentage: 5, label: 'High Risk', color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="w-5 h-5 md:w-6 md:h-6 text-[#1E90FF]" />
        <h1 className="text-xl md:text-2xl">Risk Management Calculator</h1>
      </div>

      <Tabs defaultValue="risk-calculator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk-calculator">Risk Calculator</TabsTrigger>
          <TabsTrigger value="position-size">Position Size</TabsTrigger>
          <TabsTrigger value="pip-calculator">Pip Calculator</TabsTrigger>
          <TabsTrigger value="risk-guide">Risk Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="risk-calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate lot size based on risk tolerance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountBalance">Account Balance (USD)</Label>
                  <Input
                    id="accountBalance"
                    type="number"
                    value={riskCalcData.accountBalance}
                    onChange={(e) => setRiskCalcData(prev => ({ 
                      ...prev, 
                      accountBalance: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskPercentage">Risk Percentage (%)</Label>
                  <Input
                    id="riskPercentage"
                    type="number"
                    step="0.1"
                    value={riskCalcData.riskPercentage}
                    onChange={(e) => setRiskCalcData(prev => ({ 
                      ...prev, 
                      riskPercentage: parseFloat(e.target.value) || 0 
                    }))}
                  />
                  <div className="flex gap-1 mt-2">
                    {riskLevels.map((level) => (
                      <Button
                        key={level.percentage}
                        variant="outline"
                        size="sm"
                        onClick={() => setRiskCalcData(prev => ({ 
                          ...prev, 
                          riskPercentage: level.percentage 
                        }))}
                        className={`text-xs ${
                          riskCalcData.riskPercentage === level.percentage ? 'ring-2 ring-[#1E90FF]' : ''
                        }`}
                      >
                        {level.percentage}%
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrument</Label>
                  <InstrumentSelect
                    value={riskCalcData.instrument}
                    onValueChange={(value) => 
                      setRiskCalcData(prev => ({ ...prev, instrument: value }))
                    }
                    placeholder="Select instrument"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.00001"
                      value={riskCalcData.entryPrice}
                      onChange={(e) => setRiskCalcData(prev => ({ 
                        ...prev, 
                        entryPrice: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.00001"
                      value={riskCalcData.stopLoss}
                      onChange={(e) => setRiskCalcData(prev => ({ 
                        ...prev, 
                        stopLoss: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Risk Amount</p>
                    <p className="text-lg text-[#1E90FF]">
                      ${riskCalculation.riskAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pip Difference</p>
                    <p className="text-lg text-[#28A745]">
                      {riskCalculation.pipDifference.toFixed(1)} pips
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 bg-[#1E90FF]/10 rounded-lg border-2 border-[#1E90FF]">
                  <p className="text-sm text-muted-foreground mb-1">Suggested Lot Size</p>
                  <p className="text-2xl text-[#1E90FF]">
                    {riskCalculation.suggestedLotSize.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Pip Value:</span>
                    <span>${riskCalculation.pipValue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Loss:</span>
                    <span className="text-red-500">
                      ${riskCalculation.riskAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-medium">Risk Warning:</p>
                      <p>Never risk more than you can afford to lose. Consider market volatility.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="position-size" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Size Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate lot size based on specific risk amount
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="psAccountBalance">Account Balance (USD)</Label>
                  <Input
                    id="psAccountBalance"
                    type="number"
                    value={positionSizeData.accountBalance}
                    onChange={(e) => setPositionSizeData(prev => ({ 
                      ...prev, 
                      accountBalance: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskAmount">Risk Amount (USD)</Label>
                  <Input
                    id="riskAmount"
                    type="number"
                    value={positionSizeData.riskAmount}
                    onChange={(e) => setPositionSizeData(prev => ({ 
                      ...prev, 
                      riskAmount: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psInstrument">Instrument</Label>
                  <InstrumentSelect
                    value={positionSizeData.instrument}
                    onValueChange={(value) => 
                      setPositionSizeData(prev => ({ ...prev, instrument: value }))
                    }
                    placeholder="Select instrument"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="psEntryPrice">Entry Price</Label>
                    <Input
                      id="psEntryPrice"
                      type="number"
                      step="0.00001"
                      value={positionSizeData.entryPrice}
                      onChange={(e) => setPositionSizeData(prev => ({ 
                        ...prev, 
                        entryPrice: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="psStopLoss">Stop Loss</Label>
                    <Input
                      id="psStopLoss"
                      type="number"
                      step="0.00001"
                      value={positionSizeData.stopLoss}
                      onChange={(e) => setPositionSizeData(prev => ({ 
                        ...prev, 
                        stopLoss: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Position Size Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-[#1E90FF]/10 rounded-lg border-2 border-[#1E90FF]">
                  <p className="text-sm text-muted-foreground mb-1">Recommended Lot Size</p>
                  <p className="text-2xl text-[#1E90FF]">
                    {positionSizeCalculation.suggestedLotSize.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Risk %</p>
                    <p className="text-lg text-[#1E90FF]">
                      {positionSizeCalculation.riskPercentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pip Distance</p>
                    <p className="text-lg text-[#28A745]">
                      {positionSizeCalculation.pipDifference.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pip-calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pip Value Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate profit/loss value based on pips
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pcInstrument">Instrument</Label>
                  <InstrumentSelect
                    value={pipCalcData.instrument}
                    onValueChange={(value) => 
                      setPipCalcData(prev => ({ ...prev, instrument: value }))
                    }
                    placeholder="Select instrument"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lotSize">Lot Size</Label>
                  <Input
                    id="lotSize"
                    type="number"
                    step="0.01"
                    value={pipCalcData.lotSize}
                    onChange={(e) => setPipCalcData(prev => ({ 
                      ...prev, 
                      lotSize: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pips">Number of Pips</Label>
                  <Input
                    id="pips"
                    type="number"
                    value={pipCalcData.pips}
                    onChange={(e) => setPipCalcData(prev => ({ 
                      ...prev, 
                      pips: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pip Calculation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-[#1E90FF]/10 rounded-lg border-2 border-[#1E90FF]">
                  <p className="text-sm text-muted-foreground mb-1">Profit/Loss</p>
                  <p className={`text-2xl ${
                    pipCalculation.profitLoss >= 0 ? 'text-[#28A745]' : 'text-red-500'
                  }`}>
                    {pipCalculation.profitLoss >= 0 ? '+' : ''}${pipCalculation.profitLoss.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Pip Value:</span>
                    <span>${pipCalculation.pipValue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Per Pip P&L:</span>
                    <span>${(pipCalculation.pipValue * pipCalcData.lotSize).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-guide" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Management Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {riskLevels.map((level) => (
                    <div key={level.percentage} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                      <div>
                        <p className="font-medium">{level.label}</p>
                        <p className="text-sm text-muted-foreground">{level.percentage}% per trade</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Management Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-2">1% Rule</h4>
                    <p className="text-muted-foreground">
                      Never risk more than 1% of your account on a single trade for conservative approach.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-medium mb-2">2% Rule</h4>
                    <p className="text-muted-foreground">
                      Most professional traders risk 2% maximum per trade for balanced growth.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <h4 className="font-medium mb-2">Position Sizing</h4>
                    <p className="text-muted-foreground">
                      Always calculate position size based on your stop loss distance, not arbitrary amounts.
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <h4 className="font-medium mb-2">Never Risk More Than 5%</h4>
                    <p className="text-muted-foreground">
                      Risking more than 5% per trade can quickly deplete your account even with good win rate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
