// The packages are stored on the server and edited by the owner at /admin.
// Prices are on-ground estimates in rupees per person and exclude the cost of getting there.

export interface TwoDayTrip {
  id: string;
  destination: string;
  state: string;
  vibe: string;
  connection: string;
  days: number;
  priceFrom: number;
  priceTo: number;
  image: string;
  imageAlt: string;
}

export type TripDetails = Omit<TwoDayTrip, 'id'>;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatPriceRange(from: number, to: number) {
  return `${inr.format(from)} – ${inr.format(to)}`;
}

export function formatDays(days: number) {
  return days === 1 ? '1 day' : `${days} days`;
}
