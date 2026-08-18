import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { HomeIcon, HeartIcon, ChatBubbleIcon, UserCircleIcon, APP_COLORS } from '../constants';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <ReactRouterDOM.NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center flex-1 p-2 transition-colors duration-150 ease-in-out
         ${isActive ? 'text-calm-blue-primary' : 'text-gray-500 hover:text-calm-blue-primary/80'}`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </ReactRouterDOM.NavLink>
  );
};

const BottomNavbar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-top z-40 flex border-t border-gray-200">
      <NavItem to="/" icon={<HomeIcon className="w-6 h-6" />} label="Find" />
      <NavItem to="/health" icon={<HeartIcon className="w-6 h-6" />} label="Health" />
      <NavItem to="/chat" icon={<ChatBubbleIcon className="w-6 h-6" />} label="Chat" />
      <NavItem to="/profile" icon={<UserCircleIcon className="w-6 h-6" />} label="Profile" />
    </nav>
  );
};

export default BottomNavbar;