import React from 'react';

interface CardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  isLoading?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'bg-blue-100 text-blue-700',
  isLoading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          {icon && <div className={`p-3 rounded-full ${color}`}>{icon}</div>}
        </div>
        
        {isLoading ? (
          <div className="mt-4 h-9 flex items-center">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;