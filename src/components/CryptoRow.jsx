// src/components/CryptoRow.jsx
import React, { memo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite, selectFavorites } from '../features/crypto/cryptoSlice';
import SparklineChart from './SparklineChart';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2
  }).format(price);
};

const formatLargeNumber = (num) => {
  if (num >= 1000000000000) {
    return `$${(num / 1000000000000).toFixed(2)}T`;
  }
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

const formatSupply = (supply, symbol) => {
  if (!supply) return 'N/A';
  
  if (supply >= 1000000000) {
    return `${(supply / 1000000000).toFixed(2)}B ${symbol}`;
  }
  if (supply >= 1000000) {
    return `${(supply / 1000000).toFixed(2)}M ${symbol}`;
  }
  if (supply >= 1000) {
    return `${(supply / 1000).toFixed(2)}K ${symbol}`;
  }
  return `${supply.toFixed(2)} ${symbol}`;
};

const CryptoRow = memo(({ asset }) => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const isFavorite = favorites.includes(asset.id);
  const [isHovered, setIsHovered] = useState(false);
  
  const renderPercentChange = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    const arrow = isPositive ? '▲' : '▼';
    const bgColorClass = isPositive ? 'bg-green-50' : 'bg-red-50';
    
    return (
      <span className={`${colorClass} font-medium px-2 py-1 rounded-md ${bgColorClass} inline-flex items-center`}>
        {arrow} <span className="ml-1">{Math.abs(value).toFixed(2)}%</span>
      </span>
    );
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(asset.id));
  };

  return (
    <tr 
      className={`
        border-b border-gray-100 transition-all duration-200 
        ${isHovered ? 'bg-gray-50 shadow-sm' : ''}
        ${isFavorite ? 'bg-yellow-50' : 'bg-white'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="px-2 py-4 text-center">
        <button 
          onClick={handleToggleFavorite}
          className="transition-transform duration-200 hover:scale-110 focus:outline-none"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 hover:text-yellow-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
      </td>
      <td className="px-2 py-4 whitespace-nowrap text-sm">
        <span className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center font-mono">
          {asset.rank}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full p-1 shadow-sm">
            <img className="h-8 w-8 object-contain" src={asset.logo} alt={asset.name} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{asset.name}</div>
            <div className="text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 inline-block">{asset.symbol}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap font-mono text-right">
        <div className="text-sm font-semibold text-gray-900">{formatPrice(asset.price)}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        {renderPercentChange(asset.percentChange1h)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        {renderPercentChange(asset.percentChange24h)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        {renderPercentChange(asset.percentChange7d)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="font-mono font-medium text-gray-900">{formatLargeNumber(asset.marketCap)}</div>
        <div className="text-xs text-gray-500">Market Cap</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="font-mono font-medium text-gray-900">{formatLargeNumber(asset.volume24h)}</div>
        <div className="text-xs text-gray-500">{formatSupply(asset.volume24h / asset.price, asset.symbol)}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <div className="relative w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div 
            className="bg-blue-600 h-1.5 rounded-full" 
            style={{ 
              width: `${asset.maxSupply ? (asset.circulatingSupply / asset.maxSupply) * 100 : 100}%` 
            }}
          ></div>
        </div>
        <div className="font-mono text-xs text-gray-900">{formatSupply(asset.circulatingSupply, asset.symbol)}</div>
        {asset.maxSupply && (
          <div className="text-xs text-gray-500">
            of {formatSupply(asset.maxSupply, asset.symbol)}
          </div>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="w-32 h-12 rounded-md overflow-hidden bg-gray-50">
          <SparklineChart data={asset.sparklineData} priceChange={asset.percentChange7d} />
        </div>
      </td>
    </tr>
  );
});

export default CryptoRow;