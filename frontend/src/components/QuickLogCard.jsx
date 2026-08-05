import React, { useState } from 'react';
import { PushPin, PushPinOutlined } from '@mui/icons-material';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Bolt from '@mui/icons-material/Bolt';
import Restaurant from '@mui/icons-material/Restaurant';
import LocalMall from '@mui/icons-material/LocalMall';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import Train from '@mui/icons-material/Train';
import Flight from '@mui/icons-material/Flight';
import EnergySavingsLeaf from '@mui/icons-material/EnergySavingsLeaf';
import KebabDining from '@mui/icons-material/KebabDining';
import SetMeal from '@mui/icons-material/SetMeal';
import PhoneIphone from '@mui/icons-material/PhoneIphone';
import Checkroom from '@mui/icons-material/Checkroom';
import Home from '@mui/icons-material/Home';
import EnergySavingsLeafOutlined from '@mui/icons-material/EnergySavingsLeafOutlined';

const IconResolver = ({ iconName, className }) => {
  const map = {
    'car': <DirectionsCar className={className} fontSize="inherit" />,
    'zap': <Bolt className={className} fontSize="inherit" />,
    'coffee': <Restaurant className={className} fontSize="inherit" />,
    'shopping-bag': <LocalMall className={className} fontSize="inherit" />,
    '🚗': <DirectionsCar className={className} fontSize="inherit" />,
    '🚌': <DirectionsBus className={className} fontSize="inherit" />,
    '🚆': <Train className={className} fontSize="inherit" />,
    '✈️': <Flight className={className} fontSize="inherit" />,
    '🥗': <EnergySavingsLeaf className={className} fontSize="inherit" />,
    '🌱': <EnergySavingsLeaf className={className} fontSize="inherit" />,
    '🍗': <KebabDining className={className} fontSize="inherit" />,
    '🐟': <SetMeal className={className} fontSize="inherit" />,
    '📱': <PhoneIphone className={className} fontSize="inherit" />,
    '👕': <Checkroom className={className} fontSize="inherit" />,
    '🏠': <Home className={className} fontSize="inherit" />,
    '📦': <LocalMall className={className} fontSize="inherit" />,
  };
  return map[iconName] || <EnergySavingsLeafOutlined className={className} fontSize="inherit" />;
};

const QuickLogCard = ({ log, onSelect, onTogglePin }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPinHovering, setIsPinHovering] = useState(false);

  const getSubLabel = () => {
    try {
      if (log.dynamicInputs) {
        const inputs = JSON.parse(log.dynamicInputs);
        return Object.values(inputs).join(' • ');
      }
    } catch (e) {
      // Ignored
    }
    return log.category;
  };

  return (
    <div
      onClick={() => onSelect(log)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative min-w-[200px] flex-shrink-0 cursor-pointer rounded-xl border p-4 shadow-sm transition-all duration-200 
        ${isHovering ? 'border-primary-500 bg-primary-50 shadow-md transform -translate-y-1' : 'border-slate-200 bg-white hover:border-primary-300'}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-colors duration-200
          ${isHovering ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'}`}>
          <IconResolver iconName={log.icon} />
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(log);
          }}
          onMouseEnter={() => setIsPinHovering(true)}
          onMouseLeave={() => setIsPinHovering(false)}
          className={`p-1 rounded-full transition-all duration-200 
            ${log.isPinned ? 'text-primary-600 opacity-100' : 'text-slate-400'} 
            ${isHovering && !log.isPinned ? 'opacity-100 hover:bg-slate-100' : (!log.isPinned ? 'opacity-0' : '')}
            ${isPinHovering && log.isPinned ? 'hover:bg-primary-50 text-red-500' : ''}
          `}
          title={log.isPinned ? "Unpin activity" : "Pin this activity"}
        >
          {log.isPinned ? (isPinHovering ? <PushPinOutlined fontSize="small" /> : <PushPin fontSize="small" />) : <PushPinOutlined fontSize="small" />}
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-slate-800 line-clamp-1">{log.name}</h4>
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{getSubLabel()}</p>
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        {log.usageCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium">
            Used {log.usageCount}x
          </span>
        )}
        {log.suggestedQuantity && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium">
            {log.suggestedQuantity} {log.preferredUnit}
          </span>
        )}
      </div>
    </div>
  );
};

export default QuickLogCard;
