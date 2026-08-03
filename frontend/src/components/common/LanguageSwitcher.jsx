import React, { useState, useEffect, useRef } from 'react';

const languages = [
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸' },
  { code: 'be', name: 'Belarusian', flag: '🇧🇾' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
  { code: 'ceb', name: 'Cebuano', flag: '🇵🇭' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'co', name: 'Corsican', flag: '🇫🇷' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'eo', name: 'Esperanto', flag: '🌍' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'fy', name: 'Frisian', flag: '🇳🇱' },
  { code: 'gl', name: 'Galician', flag: '🇪🇸' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'ht', name: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'haw', name: 'Hawaiian', flag: '🇺🇸' },
  { code: 'iw', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hmn', name: 'Hmong', flag: '🌏' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'jw', name: 'Javanese', flag: '🇮🇩' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ku', name: 'Kurdish', flag: '🇹🇷' },
  { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦' },
  { code: 'la', name: 'Latin', flag: '🏛️' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lb', name: 'Luxembourgish', flag: '🇱🇺' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
  { code: 'mi', name: 'Maori', flag: '🇳🇿' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
  { code: 'my', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'or', name: 'Odia', flag: '🇮🇳' },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sm', name: 'Samoan', flag: '🇼🇸' },
  { code: 'gd', name: 'Scots Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'st', name: 'Sesotho', flag: '🇿🇦' },
  { code: 'sn', name: 'Shona', flag: '🇿🇼' },
  { code: 'sd', name: 'Sindhi', flag: '🇵🇰' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'su', name: 'Sundanese', flag: '🇮🇩' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'tg', name: 'Tajik', flag: '🇹🇯' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'tt', name: 'Tatar', flag: '🇷🇺' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'tk', name: 'Turkmen', flag: '🇹🇲' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'ug', name: 'Uyghur', flag: '🇨🇳' },
  { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'yi', name: 'Yiddish', flag: '✡️' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'ace', name: 'Achinese', flag: '🌐' },
  { code: 'ach', name: 'Acoli', flag: '🌐' },
  { code: 'aa', name: 'Afar', flag: '🌐' },
  { code: 'alz', name: 'Alur', flag: '🌐' },
  { code: 'asa', name: 'Asu', flag: '🌐' },
  { code: 'as', name: 'Assamese', flag: '🌐' },
  { code: 'awa', name: 'Awadhi', flag: '🌐' },
  { code: 'ay', name: 'Aymara', flag: '🌐' },
  { code: 'bal', name: 'Baluchi', flag: '🌐' },
  { code: 'bamb', name: 'Bambara', flag: '🌐' },
  { code: 'ba', name: 'Bashkir', flag: '🌐' },
  { code: 'bbc', name: 'Batak Toba', flag: '🌐' },
  { code: 'bem', name: 'Bemba', flag: '🌐' },
  { code: 'bez', name: 'Bena', flag: '🌐' },
  { code: 'bho', name: 'Bhojpuri', flag: '🌐' },
  { code: 'bik', name: 'Bikol', flag: '🌐' },
  { code: 'br', name: 'Breton', flag: '🌐' },
  { code: 'bua', name: 'Buriat', flag: '🌐' },
  { code: 'yue', name: 'Cantonese', flag: '🌐' },
  { code: 'ch', name: 'Chamorro', flag: '🌐' },
  { code: 'ce', name: 'Chechen', flag: '🌐' },
  { code: 'cgg', name: 'Chiga', flag: '🌐' },
  { code: 'cv', name: 'Chuvash', flag: '🌐' },
  { code: 'crh', name: 'Crimean Tatar', flag: '🌐' },
  { code: 'prs', name: 'Dari', flag: '🌐' },
  { code: 'din', name: 'Dinka', flag: '🌐' },
  { code: 'doi', name: 'Dogri', flag: '🌐' },
  { code: 'dyu', name: 'Dyula', flag: '🌐' },
  { code: 'dz', name: 'Dzongkha', flag: '🌐' },
  { code: 'efi', name: 'Efik', flag: '🌐' },
  { code: 'fo', name: 'Faroese', flag: '🌐' },
  { code: 'fj', name: 'Fijian', flag: '🌐' },
  { code: 'fon', name: 'Fon', flag: '🌐' },
  { code: 'fur', name: 'Friulian', flag: '🌐' },
  { code: 'ff', name: 'Fulani', flag: '🌐' },
  { code: 'gaa', name: 'Ga', flag: '🌐' },
  { code: 'glg', name: 'Galician', flag: '🌐' },
  { code: 'gug', name: 'Guarani', flag: '🌐' },
  { code: 'hak', name: 'Hakka', flag: '🌐' },
  { code: 'hni', name: 'Hani', flag: '🌐' },
  { code: 'iba', name: 'Iban', flag: '🌐' },
  { code: 'ilo', name: 'Ilocano', flag: '🌐' },
  { code: 'jam', name: 'Jamaican Patois', flag: '🌐' },
  { code: 'kac', name: 'Jingpo', flag: '🌐' },
  { code: 'kl', name: 'Kalaallisut', flag: '🌐' },
  { code: 'kr', name: 'Kanuri', flag: '🌐' },
  { code: 'pam', name: 'Kapampangan', flag: '🌐' },
  { code: 'ks', name: 'Kashmiri', flag: '🌐' },
  { code: 'kha', name: 'Khasi', flag: '🌐' },
  { code: 'kmb', name: 'Kimbundu', flag: '🌐' },
  { code: 'kg', name: 'Kongo', flag: '🌐' },
  { code: 'kok', name: 'Konkani', flag: '🌐' },
  { code: 'kri', name: 'Krio', flag: '🌐' },
  { code: 'kum', name: 'Kumyk', flag: '🌐' },
  { code: 'ltg', name: 'Latgalian', flag: '🌐' },
  { code: 'lij', name: 'Ligurian', flag: '🌐' },
  { code: 'li', name: 'Limburgish', flag: '🌐' },
  { code: 'lmo', name: 'Lombard', flag: '🌐' },
  { code: 'lg', name: 'Luganda', flag: '🌐' },
  { code: 'luo', name: 'Luo', flag: '🌐' },
  { code: 'mak', name: 'Makasar', flag: '🌐' },
  { code: 'mdf', name: 'Moksha', flag: '🌐' },
  { code: 'gv', name: 'Manx', flag: '🌐' },
  { code: 'mh', name: 'Marshallese', flag: '🌐' },
  { code: 'mwr', name: 'Marwari', flag: '🌐' },
  { code: 'mfe', name: 'Mauritian Creole', flag: '🌐' },
  { code: 'min', name: 'Minangkabau', flag: '🌐' },
  { code: 'lus', name: 'Mizo', flag: '🌐' },
  { code: 'nd', name: 'North Ndebele', flag: '🌐' },
  { code: 'nr', name: 'South Ndebele', flag: '🌐' },
  { code: 'new', name: 'Newari', flag: '🌐' },
  { code: 'nqo', name: "N'Ko", flag: '🌐' },
  { code: 'nus', name: 'Nuer', flag: '🌐' },
  { code: 'oc', name: 'Occitan', flag: '🌐' },
  { code: 'om', name: 'Oromo', flag: '🌐' },
  { code: 'os', name: 'Ossetian', flag: '🌐' },
  { code: 'pag', name: 'Pangasinan', flag: '🌐' },
  { code: 'pap', name: 'Papiamento', flag: '🌐' },
  { code: 'qu', name: 'Quechua', flag: '🌐' },
  { code: 'rom', name: 'Romani', flag: '🌐' },
  { code: 'rn', name: 'Rundi', flag: '🌐' },
  { code: 'se', name: 'Northern Sami', flag: '🌐' },
  { code: 'sg', name: 'Sango', flag: '🌐' },
  { code: 'sa', name: 'Sanskrit', flag: '🌐' },
  { code: 'sat', name: 'Santali', flag: '🌐' },
  { code: 'sc', name: 'Sardinian', flag: '🌐' },
  { code: 'sco', name: 'Scots', flag: '🌐' },
  { code: 'nso', name: 'Northern Sotho', flag: '🌐' },
  { code: 'shn', name: 'Shan', flag: '🌐' },
  { code: 'scn', name: 'Sicilian', flag: '🌐' },
  { code: 'szl', name: 'Silesian', flag: '🌐' },
  { code: 'sus', name: 'Susu', flag: '🌐' },
  { code: 'ss', name: 'Swati', flag: '🌐' },
  { code: 'ty', name: 'Tahitian', flag: '🌐' },
  { code: 'zgh', name: 'Standard Moroccan Tamazight', flag: '🌐' },
  { code: 'tet', name: 'Tetum', flag: '🌐' },
  { code: 'bo', name: 'Tibetan', flag: '🌐' },
  { code: 'tiv', name: 'Tiv', flag: '🌐' },
  { code: 'tpi', name: 'Tok Pisin', flag: '🌐' },
  { code: 'to', name: 'Tongan', flag: '🌐' },
  { code: 'ts', name: 'Tsonga', flag: '🌐' },
  { code: 'tn', name: 'Tswana', flag: '🌐' },
  { code: 'tcy', name: 'Tulu', flag: '🌐' },
  { code: 'tum', name: 'Tumbuka', flag: '🌐' },
  { code: 'tyv', name: 'Tuvan', flag: '🌐' },
  { code: 'udm', name: 'Udmurt', flag: '🌐' },
  { code: 've', name: 'Venda', flag: '🌐' },
  { code: 'vec', name: 'Venetian', flag: '🌐' },
  { code: 'war', name: 'Waray', flag: '🌐' },
  { code: 'wo', name: 'Wolof', flag: '🌐' },
  { code: 'sah', name: 'Yakut', flag: '🌐' },
  { code: 'yua', name: 'Yucatec Maya', flag: '🌐' },
  { code: 'zap', name: 'Zapotec', flag: '🌐' },
  { code: 'bjn', name: 'Banjar', flag: '🌐' },
  { code: 'bug', name: 'Buginese', flag: '🌐' },
  { code: 'chr', name: 'Cherokee', flag: '🌐' },
  { code: 'cho', name: 'Choctaw', flag: '🌐' },
  { code: 'chk', name: 'Chuukese', flag: '🌐' },
  { code: 'cvn', name: 'Chuvash', flag: '🌐' },
  { code: 'dv', name: 'Divehi', flag: '🌐' },
  { code: 'gom', name: 'Goan Konkani', flag: '🌐' },
  { code: 'gn', name: 'Guarani', flag: '🌐' },
  { code: 'mai', name: 'Maithili', flag: '🌐' },
  { code: 'mni', name: 'Meiteilon (Manipuri)', flag: '🌐' },
  { code: 'ti', name: 'Tigrinya', flag: '🌐' }
];

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Determine initial language from cookie if exists
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    if (langCode === 'en') {
      // Restore to English (Clear the translation)
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      window.location.reload();
    } else {
      // Trigger Google Translate native dropdown
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      } else {
        // Fallback: set cookie and reload if the widget hasn't fully loaded
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
        document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/;`;
        window.location.reload();
      }
    }
  };

  const selectedLang = languages.find((lang) => lang.code === currentLang) || languages.find(l => l.code === 'en');

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); setSearchTerm(''); }}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        aria-label="Select Language"
      >
        <span className="text-base">{selectedLang?.flag}</span>
        <span className="hidden sm:inline-block">{selectedLang?.name}</span>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {filteredLanguages.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No languages found</div>
            ) : (
              filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  currentLang === lang.code 
                    ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {currentLang === lang.code && (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )))}
          </div>
          
          {/* Option to clear translations */}
          {currentLang !== 'en' && (
            <div className="px-3 py-2 border-t border-slate-100">
              <button
                onClick={() => changeLanguage('en')}
                className="w-full text-center py-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
              >
                Show Original (English)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
