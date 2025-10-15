import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { cn } from './ui/utils';

interface InstrumentFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  availableInstruments: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function InstrumentFilter({ 
  value, 
  onValueChange, 
  availableInstruments,
  placeholder = "Filter by instrument...",
  disabled = false 
}: InstrumentFilterProps) {
  const [open, setOpen] = useState(false);

  // Create options with "All Instruments" at the top
  const options = [
    { value: 'all', label: 'All Instruments' },
    ...availableInstruments.map(instrument => ({ value: instrument, label: instrument }))
  ];

  const selectedOption = options.find(option => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-40 justify-between"
          disabled={disabled}
          size="sm"
          type="button"
        >
          <Filter className="mr-1 h-3 w-3 shrink-0 opacity-50" />
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] sm:w-[250px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Search instrument..." 
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[150px] sm:max-h-[200px] overflow-y-auto">
            <CommandEmpty>No instrument found.</CommandEmpty>
            
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "all" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
