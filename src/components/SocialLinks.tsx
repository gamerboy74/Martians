import React from "react";
import { Youtube, Twitter } from "lucide-react";
import { FaDiscord, FaWhatsapp } from "react-icons/fa";

const SocialLinks: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <a
        href="https://x.com/MartiansGGC"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Twitter size={20} />
      </a>
      <a
        href="https://www.youtube.com/@Martiansgaminguild"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Youtube size={20} />
      </a>
      <a
        href="https://chat.whatsapp.com/FR4YzZMFQorHKgqHcduHFs"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
      >
        <FaWhatsapp size={20} />
      </a>
      <a
        href="https://discord.gg/CAUzxzfXMx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
      >
        <FaDiscord size={20} />
      </a>
    </div>
  );
};

export default SocialLinks;
