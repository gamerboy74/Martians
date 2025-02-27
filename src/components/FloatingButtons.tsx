import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

const FloatingButtons: React.FC = () => {
  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
      <button className="w-12 h-12 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg flex items-center justify-center">
        <Heart size={20} className="text-white" />
      </button>
      <button className="w-12 h-12 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg flex items-center justify-center">
        <ShoppingCart size={20} className="text-white" />
      </button>
    </div>
  );
};

export default FloatingButtons;