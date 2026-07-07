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

export const getAvatarUrl = (username, gender) => {
  const safeUsername = username || 'User';
  const normalizedGender = gender?.toUpperCase();
  
  if (normalizedGender === 'MALE') {
    return `https://api.dicebear.com/9.x/micah/svg?seed=${safeUsername}&backgroundColor=b6e3f4`;
  } else if (normalizedGender === 'FEMALE') {
    return `https://api.dicebear.com/9.x/lorelei/svg?seed=${safeUsername}&backgroundColor=ffd5dc`;
  } else {
    // Better default for humans before they choose a gender
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${safeUsername}&backgroundColor=e2e8f0`;
  }
};
