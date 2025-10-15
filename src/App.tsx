import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AddTrade } from './components/AddTrade';
import { TradeLog } from './components/TradeLog';
import { Statistics } from './components/Statistics';
import { PnLCalendar } from './components/PnLCalendar';
import { Journal } from './components/Journal';
import { Settings } from './components/Settings';
import { RiskCalculator } from './components/RiskCalculator';
import { MobileNav } from './components/MobileNav';
import { Toaster } from 'sonner';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load trades from localStorage
  useEffect(() => {
    try {
      const storedTrades = localStorage.getItem('trades');
      if (storedTrades) {
        const parsed = JSON.parse(storedTrades);
        const tradesWithDates = parsed.map((t: any) => ({
          ...t,
          openDate: new Date(t.openDate),
          closeDate: t.closeDate ? new Date(t.closeDate) : undefined,
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
        }));
        setTrades(tradesWithDates);
      } else {
        // Load sample data only if no trades exist
        loadSampleData();
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      localStorage.removeItem('trades'); // Clear corrupted data
      loadSampleData();
    }
  }, []);

  const loadSampleData = () => {
    const sampleTrades: Trade[] = [
      {
        id: '1',
        instrument: 'NAS100',
        lotSize: 0.5,
        entryPrice: 15850,
        stopLoss: 15800,
        takeProfit: 15950,
        result: 250,
        notes: 'Strong bullish momentum on tech stocks',
        emotion: 'Confident',
        mindsetBefore: 'Prepared and focused',
        mindsetAfter: 'Satisfied with execution',
        timestamp: new Date(2024, 9, 15),
        type: 'buy',
        exitPrice: 15920,
        status: 'closed',
        openDate: new Date(2024, 9, 15, 9, 30),
        closeDate: new Date(2024, 9, 15, 15, 45)
      },
      {
        id: '2',
        instrument: 'GOLD',
        lotSize: 0.3,
        entryPrice: 1950.50,
        stopLoss: 1945.00,
        takeProfit: 1965.00,
        result: -150,
        notes: 'Failed breakout, quick reversal on dollar strength',
        emotion: 'Disappointed',
        mindsetBefore: 'Optimistic about breakout',
        mindsetAfter: 'Need better confirmation signals',
        timestamp: new Date(2024, 9, 12),
        type: 'buy',
        exitPrice: 1948.20,
        status: 'closed',
        openDate: new Date(2024, 9, 12, 10, 15),
        closeDate: new Date(2024, 9, 12, 14, 30)
      },
      {
        id: '3',
        instrument: 'US30',
        lotSize: 0.8,
        entryPrice: 34980,
        stopLoss: 35030,
        takeProfit: 34850,
        result: 520,
        notes: 'Perfect rejection from resistance level',
        emotion: 'Calm',
        mindsetBefore: 'Patient for setup',
        mindsetAfter: 'Great patience paid off',
        timestamp: new Date(2024, 9, 10),
        type: 'sell',
        exitPrice: 34815,
        status: 'closed',
        openDate: new Date(2024, 9, 10, 8, 0),
        closeDate: new Date(2024, 9, 10, 16, 20)
      },
      {
        id: '4',
        instrument: 'EUR/USD',
        lotSize: 1.0,
        entryPrice: 1.0850,
        stopLoss: 1.0800,
        takeProfit: 1.0920,
        result: 350,
        notes: 'ECB rate decision favorable for EUR',
        emotion: 'Focused',
        mindsetBefore: 'Well prepared for news',
        mindsetAfter: 'Good risk management',
        timestamp: new Date(2024, 9, 8),
        type: 'buy',
        exitPrice: 1.0915,
        status: 'closed',
        openDate: new Date(2024, 9, 8, 7, 30),
        closeDate: new Date(2024, 9, 8, 13, 15)
      }
    ];
    setTrades(sampleTrades);
    localStorage.setItem('trades', JSON.stringify(sampleTrades));
  };

  // Listen for trade updates
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedTrades = localStorage.getItem('trades');
        if (storedTrades) {
          const parsed = JSON.parse(storedTrades);
          const tradesWithDates = parsed.map((t: any) => ({
            ...t,
            openDate: new Date(t.openDate),
            closeDate: t.closeDate ? new Date(t.closeDate) : undefined,
            timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
          }));
          setTrades(tradesWithDates);
        }
      } catch (error) {
        console.error('Error loading trades:', error);
      }
    };

    window.addEventListener('tradesUpdated', handleStorageChange);
    return () => window.removeEventListener('tradesUpdated', handleStorageChange);
  }, []);

  const addTrade = (trade: Omit<Trade, 'id' | 'timestamp'>) => {
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    const updatedTrades = [newTrade, ...trades];
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));
    window.dispatchEvent(new Event('tradesUpdated'));
  };

  const updateTrade = (updatedTrade: Trade) => {
    const updatedTrades = trades.map(t => t.id === updatedTrade.id ? updatedTrade : t);
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));
    window.dispatchEvent(new Event('tradesUpdated'));
  };

  const deleteTrade = (tradeId: string) => {
    const updatedTrades = trades.filter(t => t.id !== tradeId);
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));
    window.dispatchEvent(new Event('tradesUpdated'));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard trades={trades} />;
      case 'add-trade':
        return <AddTrade onAddTrade={addTrade} />;
      case 'trade-log':
        return <TradeLog trades={trades} onUpdateTrade={updateTrade} onDeleteTrade={deleteTrade} />;
      case 'statistics':
        return <Statistics trades={trades} />;
      case 'pnl-calendar':
        return <PnLCalendar trades={trades} />;
      case 'journal':
        return <Journal trades={trades} />;
      case 'risk-calculator':
        return <RiskCalculator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard trades={trades} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMobile={false}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <MobileNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
        />
        <main className="pb-20 px-4 py-4 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
