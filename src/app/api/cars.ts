import { apiFetch } from './client';

export type Car = {
  id: number;
  brand: string;
  model: string;
  type: string;
  pricePerDay: number;
  status: string;
  imageUrl?: string | null;
  description?: string | null;
  reviewCount?: number;
  averageRating?: number | null;
  bookingCount?: number;
};

export type CarsListResult = {
  cars: Car[];
  popularCars: Car[];
};

export async function fetchCars(): Promise<CarsListResult> {
  const data = await apiFetch<{ cars: Car[]; popularCars?: Car[] }>('/cars');
  const cars = data.cars ?? [];
  const popularCars =
    data.popularCars && data.popularCars.length > 0
      ? data.popularCars
      : undefined;

  return { cars, popularCars: popularCars ?? [] };
}

export async function fetchCar(id: number | string): Promise<Car> {
  const data = await apiFetch<{ car: Car }>(`/cars/${id}`);
  if (!data.car) {
    throw new Error('Vehicle not found');
  }
  return data.car;
}
