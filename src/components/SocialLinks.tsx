import React from 'react';
import { Youtube, Twitter, MessageCircle } from 'lucide-react';

const SocialLinks: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <Twitter size={20} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <Youtube size={20} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <MessageCircle size={20} />
      </a>
    </div>
  );
};

export default SocialLinks;