// Vehicles are stored on the server and edited by the owner in the admin page.

export const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric'] as const;
export type FuelType = (typeof fuelTypes)[number];

export interface VehicleRecord {
  id: string;
  name: string;
  seats: number;
  fuel: FuelType;
  available: number;
  bestFor: string;
  features: string[];
  photos: string[];
}

export type VehicleDetails = Omit<VehicleRecord, 'id'>;
