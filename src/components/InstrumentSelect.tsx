import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface InstrumentSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const INSTRUMENTS = ['NAS100', 'US30', 'GOLD', 'EUR/USD', 'GBP/USD', 'BTC/USD'];

export function InstrumentSelect({ 
  value, 
  onValueChange, 
  placeholder = "Select instrument...",
  disabled = false 
}: InstrumentSelectProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  if (showCustom) {
    return (
      <div className="flex gap-2">
        <Input
          placeholder="Enter instrument..."
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onValueChange(customValue.toUpperCase());
              setShowCustom(false);
              setCustomValue('');
            }
          }}
        />
        <Button onClick={() => {
          onValueChange(customValue.toUpperCase());
          setShowCustom(false);
          setCustomValue('');
        }} size="sm" type="button">
          Add
        </Button>
        <Button onClick={() => setShowCustom(false)} variant="outline" size="sm" type="button">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === 'CUSTOM') {
            setShowCustom(true);
          } else {
            onValueChange(e.target.value);
          }
        }}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="">{placeholder}</option>
        {INSTRUMENTS.map(inst => (
          <option key={inst} value={inst}>{inst}</option>
        ))}
        <option value="CUSTOM">Custom...</option>
      </select>
    </div>
  );
}