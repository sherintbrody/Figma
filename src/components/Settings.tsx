import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Globe, 
  Database, 
  Bell, 
  Shield,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const [settings, setSettings] = useState({
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    language: 'en',
    darkMode: false,
    notifications: true,
    autoBackup: true,
    riskWarnings: true,
    defaultRisk: 2,
    accountBalance: 10000
  });

  const [exportFormat, setExportFormat] = useState('csv');

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Settings updated');
  };

  const exportData = () => {
    toast.success(`Exporting data as ${exportFormat.toUpperCase()}...`);
    // Implementation would go here
  };

  const importData = () => {
    toast.success('Import functionality would open file dialog');
    // Implementation would go here
  };

  const resetSettings = () => {
    setSettings({
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      language: 'en',
      darkMode: false,
      notifications: true,
      autoBackup: true,
      riskWarnings: true,
      defaultRisk: 2,
      accountBalance: 10000
    });
    toast.success('Settings reset to default');
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all trading data? This action cannot be undone.')) {
      toast.success('All data cleared');
      // Implementation would go here
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl">Settings</h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency</Label>
                  <Select 
                    value={settings.currency} 
                    onValueChange={(value) => updateSetting('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                        System Default ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                      </SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="America/Chicago">America/Chicago (CST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountBalance">Default Account Balance</Label>
                  <Input
                    id="accountBalance"
                    type="number"
                    value={settings.accountBalance}
                    onChange={(e) => updateSetting('accountBalance', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive trading alerts and reminders</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultRisk">Default Risk Percentage (%)</Label>
                <Input
                  id="defaultRisk"
                  type="number"
                  step="0.1"
                  value={settings.defaultRisk}
                  onChange={(e) => updateSetting('defaultRisk', parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  This will be pre-filled in risk calculator
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Risk Warnings</Label>
                    <p className="text-sm text-muted-foreground">Show warnings for high-risk trades</p>
                  </div>
                  <Switch
                    checked={settings.riskWarnings}
                    onCheckedChange={(checked) => updateSetting('riskWarnings', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-[#1E90FF]">
                <h4 className="text-sm font-medium mb-2">Trading Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be consistent with risk management</li>
                  <li>• Always record emotions and mindset</li>
                  <li>• Review performance regularly</li>
                  <li>• Use stop loss on every trade</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Download your trading data
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="excel">Excel File</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={exportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>Export includes:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>All trade records</li>
                    <li>Psychology notes</li>
                    <li>Performance statistics</li>
                    <li>Risk calculations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Import trading data from file
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={importData} variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>Supported formats:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>CSV files</li>
                    <li>Excel files (.xlsx)</li>
                    <li>JSON data</li>
                    <li>MetaTrader 4/5 reports</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    <strong>Note:</strong> Importing will merge data with existing records. 
                    Make sure to backup current data first.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={resetSettings} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Settings
                </Button>
                <Button onClick={clearAllData} variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Data storage information:</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <Badge variant="secondary">Trades</Badge>
                    <p>Stored locally in browser</p>
                  </div>
                  <div>
                    <Badge variant="secondary">Settings</Badge>
                    <p>Saved in local storage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-[#28A745]">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#28A745] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Data Privacy</h4>
                      <p className="text-sm text-muted-foreground">
                        All your trading data is stored locally on your device. 
                        We do not collect or transmit any personal trading information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-[#1E90FF]">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-[#1E90FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Local Storage</h4>
                      <p className="text-sm text-muted-foreground">
                        Your data is stored in your browser's local storage. 
                        Make regular backups to prevent data loss.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Disclaimer</h4>
                      <p className="text-sm text-muted-foreground">
                        This trading journal is for educational purposes. 
                        Past performance does not guarantee future results. 
                        Trade at your own risk.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="text-sm font-medium mb-3">Security Best Practices:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Regular backup your trading data</li>
                  <li>• Don't share your trading statistics publicly</li>
                  <li>• Use secure networks when accessing the app</li>
                  <li>• Clear browser data when using shared devices</li>
                  <li>• Keep your trading plan confidential</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
