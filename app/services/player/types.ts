export interface Player {
  id: string;
  name: string;
  fullName?: string;
  description?: string;
  age: number | string;
  position: string;
  nationality: string | string[]; // Sometimes array from API
  club?: string;
  marketValue: string;
  marketValueNumber?: number;
  imageUrl?: string;
  isLbPlayer?: boolean;
  transfermarktUrl?: string;
  height?: string;
  contractExpires?: string;
  dateOfBirth?: string;
  placeOfBirth?: { city?: string; country?: string };
  foot?: string;
  shirtNumber?: string;
  agentName?: string;
  agentUrl?: string;
  socialMedia?: string[];
  createdAt?: string;
  updatedAt?: string;
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
