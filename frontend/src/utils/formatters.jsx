import React from 'react';
import { Car, Plane, Train, Bus, Bike, Zap, ShoppingBag, Trash2, Home, Activity } from 'lucide-react';

export const formatActivityType = (type) => {
  if (!type) return 'Unknown Activity';
  const parts = type.split('_');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }
  
  const mainType = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const subType = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  return `${mainType} (${subType})`;
};

export const getActivityIcon = (type, category) => {
  const normalizedType = (type || '').toLowerCase();
  const normalizedCategory = (category || '').toLowerCase();
  
  if (normalizedType.includes('car')) return <Car className="h-5 w-5" />;
  if (normalizedType.includes('flight') || normalizedType.includes('plane')) return <Plane className="h-5 w-5" />;
  if (normalizedType.includes('train')) return <Train className="h-5 w-5" />;
  if (normalizedType.includes('bus')) return <Bus className="h-5 w-5" />;
  if (normalizedType.includes('bike') || normalizedType.includes('bicycle')) return <Bike className="h-5 w-5" />;
  if (normalizedCategory.includes('energy') || normalizedType.includes('electricity')) return <Zap className="h-5 w-5" />;
  if (normalizedCategory.includes('shopping') || normalizedCategory.includes('food')) return <ShoppingBag className="h-5 w-5" />;
  if (normalizedCategory.includes('waste')) return <Trash2 className="h-5 w-5" />;
  if (normalizedCategory.includes('home')) return <Home className="h-5 w-5" />;
  
  return <Activity className="h-5 w-5" />;
};

// 10 curated cartoon avatar options that users can choose from
export const AVATAR_OPTIONS = [
  { id: 1, url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede', label: 'Explorer' },
  { id: 2, url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc,ffdfbf', label: 'Dreamer' },
  { id: 3, url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Zara&backgroundColor=c0aede,d1d4f9', label: 'Fun' },
  { id: 4, url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Axel&backgroundColor=b6e3f4,d1d4f9', label: 'Chill' },
  { id: 5, url: 'https://api.dicebear.com/9.x/micah/svg?seed=Nova&backgroundColor=b6e3f4', label: 'Creative' },
  { id: 6, url: 'https://api.dicebear.com/9.x/micah/svg?seed=Orion&backgroundColor=ffd5dc', label: 'Artistic' },
  { id: 7, url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sage&backgroundColor=c0aede', label: 'Thinker' },
  { id: 8, url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Blaze&backgroundColor=d1d4f9', label: 'Bold' },
  { id: 9, url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=River&backgroundColor=b6e3f4', label: 'Vibrant' },
  { id: 10, url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Storm&backgroundColor=ffd5dc', label: 'Dynamic' },
];

export const DEFAULT_AVATAR = AVATAR_OPTIONS[0].url;

// Returns the user's chosen/stored avatar, or the first default option
export const getAvatarUrl = (profilePictureUrl) => {
  if (profilePictureUrl && profilePictureUrl.trim() !== '') {
    return profilePictureUrl;
  }
  return DEFAULT_AVATAR;
};
