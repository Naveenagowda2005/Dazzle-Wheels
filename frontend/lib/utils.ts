import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return 'N/A';
  }
  
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function calculateDuration(pickupTime: string, dropTime: string): { hours: number; days: number } {
  try {
    const pickup = new Date(pickupTime);
    const drop = new Date(dropTime);
    
    // Check if dates are valid
    if (isNaN(pickup.getTime()) || isNaN(drop.getTime())) {
      return { hours: 0, days: 0 };
    }
    
    const diffMs = drop.getTime() - pickup.getTime();
    
    // Ensure positive duration
    if (diffMs <= 0) {
      return { hours: 0, days: 0 };
    }
    
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.ceil(hours / 24);
    
    return { hours, days };
  } catch (error) {
    console.error('Error calculating duration:', error);
    return { hours: 0, days: 0 };
  }
}

export function calculatePrice(
  pricePerHour: number,
  pricePerDay: number,
  pickupTime: string,
  dropTime: string
): number {
  try {
    const { hours, days } = calculateDuration(pickupTime, dropTime);
    
    // If duration calculation failed, return 0
    if (hours === 0 && days === 0) {
      return 0;
    }
    
    if (hours <= 24) {
      return hours * pricePerHour;
    } else {
      return days * pricePerDay;
    }
  } catch (error) {
    console.error('Error calculating price:', error);
    return 0;
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}