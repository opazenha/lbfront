export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  nationality: string;
  club?: string;
  marketValue: string;
  marketValueNumber?: number;
  imageUrl?: string;
  isLbPlayer?: boolean;
}

export interface PlayerFilters {
  name?: string;
  position?: string;
  nationality?: string;
  club?: string;
  minAge?: string;
  maxAge?: string;
  minValue?: string;
  maxValue?: string;
  isLbPlayer?: string;
}
