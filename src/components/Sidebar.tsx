import React from 'react';
import { 
  BarChart3, 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Calculator, 
  Settings as SettingsIcon,
  Home,
  Calendar,
  List
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile?: boolean;
}

export function Sidebar({ activeTab, setActiveTab, isMobile = false }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-trade', label: 'Add Trade', icon: Plus },
    { id: 'trade-log', label: 'Trade Log', icon: List },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'pnl-calendar', label: 'P&L Calendar', icon: Calendar },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'risk-calculator', label: 'Risk Calculator', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-card border-r border-border p-4 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6" style={{ color: '#1E90FF' }} />
          <h1 className="text-xl font-semibold">Forex Journal</h1>
        </div>
        <p className="text-sm text-muted-foreground">Professional Trading Tracker</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-2 ${
                activeTab === item.id 
                  ? 'bg-[#1E90FF] text-white hover:bg-[#1E90FF]/90' 
                  : 'hover:bg-accent'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}