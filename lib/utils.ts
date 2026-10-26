// Utility functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function discountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatWhatsAppPhone(phone: string): string {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.length === 10) {
    return '91' + digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return '91' + digits.slice(1);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length >= 10) {
    return '91' + digits.slice(-10);
  }
  return digits;
}

export function getWhatsAppLink(phone: string, text: string): string {
  const formatted = formatWhatsAppPhone(phone);
  return `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(text)}`;
}
