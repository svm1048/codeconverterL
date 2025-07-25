import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select language"
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-card border-border">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};