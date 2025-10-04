'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, BookOpen } from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    key: 'dashboard'
  },
  {
    name: 'Leaderboard', 
    href: '/leaderboard',
    icon: Trophy,
    key: 'leaderboard'
  },
  {
    name: 'Rules',
    href: '/rules', 
    icon: BookOpen,
    key: 'rules'
  }
];

export function Navigation({ activeTab }) {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key || pathname === item.href;
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 mb-1 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`} 
                />
                <span 
                  className={`text-xs font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}