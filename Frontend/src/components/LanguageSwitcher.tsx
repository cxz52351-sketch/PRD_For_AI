import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/lib/useLanguage';
import { Language, LANGUAGE_NAMES } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'outline',
  size = 'sm',
  className = '',
  showIcon = true,
  showText = true,
}) => {
  const { language, setLanguage, t } = useTranslation();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const getCurrentLanguageDisplay = () => {
    if (!showText) return null;
    return LANGUAGE_NAMES[language];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${className} gap-2`}
          aria-label={t.common.language}
        >
          {showIcon && <Globe className="h-4 w-4" />}
          {showText && getCurrentLanguageDisplay()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(LANGUAGE_NAMES).map(([langCode, langName]) => (
          <DropdownMenuItem
            key={langCode}
            onClick={() => handleLanguageChange(langCode as Language)}
            className="cursor-pointer flex items-center justify-between"
          >
            <span>{langName}</span>
            {language === langCode && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
