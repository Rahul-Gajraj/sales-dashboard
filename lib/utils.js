import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency in Indian Rupees with proper digit grouping
export function formatCurrency(amount, showDecimals = false) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  
  return formatter.format(amount);
}

// Format date and time in IST
export function formatDateTime(dateString, options = {}) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    const defaultOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-IN', finalOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

// Format date only in IST
export function formatDate(dateString) {
  return formatDateTime(dateString, {
    hour: undefined,
    minute: undefined,
    hour12: undefined,
  });
}

// Check if current time is within this week (Monday to Sunday)
export function isThisWeek(dateString) {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Convert to IST
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    const istNow = new Date(now.getTime() + istOffset);
    
    // Get start of week (Monday)
    const startOfWeek = new Date(istNow);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return istDate >= startOfWeek && istDate <= endOfWeek;
  } catch (error) {
    console.error('Error checking week:', error);
    return false;
  }
}

// Get current cycle ID based on date
export function getCurrentCycleId() {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${year}Q${quarter}`;
}

// Format points with commas
export function formatPoints(points) {
  if (points === undefined || points === null || isNaN(points)) {
    return '0';
  }
  return Number(points).toLocaleString('en-IN');
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate initials from name
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Check if user is offline
export function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}