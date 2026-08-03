import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Input, Menu } from 'antd';
import { GlobalOutlined, SearchOutlined } from '@ant-design/icons';

const LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'te', nativeName: 'తెలుగు' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'ta', nativeName: 'தமிழ்' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', nativeName: 'മലയാളം' },
  { code: 'mr', nativeName: 'मराठी' },
  { code: 'gu', nativeName: 'ગુજરાતી' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', nativeName: 'বাংলা' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'ur', nativeName: 'اردو' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'zh-CN', nativeName: '简体中文' },
  { code: 'zh-TW', nativeName: '繁體中文' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'ko', nativeName: '한국어' },
  { code: 'th', nativeName: 'ไทย' },
  { code: 'vi', nativeName: 'Tiếng Việt' },
  { code: 'id', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', nativeName: 'Bahasa Melayu' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'es', nativeName: 'Español' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'ru', nativeName: 'Русский' },
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'pl', nativeName: 'Polski' },
  { code: 'uk', nativeName: 'Українська' },
  { code: 'sv', nativeName: 'Svenska' },
  { code: 'no', nativeName: 'Norsk' },
  { code: 'fi', nativeName: 'Suomi' },
  { code: 'da', nativeName: 'Dansk' },
  { code: 'el', nativeName: 'Ελληνικά' },
  { code: 'ro', nativeName: 'Română' },
  { code: 'hu', nativeName: 'Magyar' },
  { code: 'cs', nativeName: 'Čeština' },
  { code: 'sk', nativeName: 'Slovenčina' },
  { code: 'bg', nativeName: 'Български' },
  { code: 'he', nativeName: 'עברית' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    setOpen(false);
    // API call to update backend preferred language can be added here
  };

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    {
      key: 'search',
      label: (
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Search language..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      type: 'divider',
    },
    ...filteredLanguages.map(lang => ({
      key: lang.code,
      label: lang.nativeName,
      onClick: () => changeLanguage(lang.code),
    }))
  ];

  return (
    <Dropdown 
      menu={{ items: menuItems, style: { maxHeight: '300px', overflowY: 'auto' } }} 
      trigger={['click']}
      open={open}
      onOpenChange={(flag) => setOpen(flag)}
    >
      <Button type="text" icon={<GlobalOutlined />}>
        {LANGUAGES.find(l => l.code === i18n.language)?.nativeName || 'Language'}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
