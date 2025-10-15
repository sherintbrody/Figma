import React from 'react';
import { 
  BarChart3, 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Calculator, 
  Settings as SettingsIcon,
  Home,
  Menu,
  X,
  Calendar,
  List
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MobileNav({ activeTab, setActiveTab, isOpen, setIsOpen }: MobileNavProps) {
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const getTabLabel = (tabId: string) => {
    const item = menuItems.find(item => item.id === tabId);
    return item?.label || 'Dashboard';
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#1E90FF' }} />
            <span className="font-semibold">Forex Journal</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {getTabLabel(activeTab)}
            </span>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: '#1E90FF' }} />
                    Forex Journal
                  </SheetTitle>
                  <SheetDescription>
                    Professional Trading Tracker - Navigate through your trading dashboard
                  </SheetDescription>
                </SheetHeader>
                <nav className="space-y-2 mt-6">
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
                        onClick={() => handleTabChange(item.id)}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 safe-area-inset-bottom">
        <div className="grid grid-cols-4 gap-1 p-2 pb-safe">
          {[menuItems[0], menuItems[1], menuItems[2], menuItems[3]].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`flex flex-col gap-1 h-auto py-2 px-1 min-h-[60px] ${
                  isActive 
                    ? 'text-[#1E90FF] bg-[#1E90FF]/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs leading-tight">{item.label.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}