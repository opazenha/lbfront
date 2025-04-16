export interface Player {
  id: string;
  name: string;
  fullName?: string;
  description?: string;
  age: number | string;
  position: string;
  otherPosition?: string[];
  citizenship: string[];
  nationality?: string; // Used for sorting only, set to citizenship[0]
  club?: string;
  marketValue: string;
  marketValueNumber?: number;
  imageUrl?: string;
  isLbPlayer?: boolean;
  transfermarktUrl?: string;
  notes?: string;
  youtubeUrl?: string;
  partnerId?: string;
  height?: string;
  contractExpires?: string;
  dateOfBirth?: string;
  placeOfBirth?: {
    city: string;
    country: string;
  };
  foot?: string;
  shirtNumber?: string;
  agentName?: string;
  agentUrl?: string;
  socialMedia?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type SortField =
  | "name"
  | "age"
  | "position"
  | "nationality" // Used for sorting by primary citizenship
  | "club"
  | "marketValue";
export type SortDirection = "asc" | "desc";

export interface PlayerTableProps {
  players: Player[];
  loading: boolean;
}
