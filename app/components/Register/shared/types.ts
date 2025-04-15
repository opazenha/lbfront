// Shared types for registration forms

export interface Partner {
  id: string;
  name: string;
  transfermarktUrl?: string;
  notes?: string;
}

export interface Player {
  id: string;
  name: string;
  transfermarktUrl: string;
  notes?: string;
  youtubeUrl?: string;
  partnerId?: string;
  age?: number;
  position?: string;
  height?: string;
  citizenship?: string[];
  contractExpires?: string;
  club?: string;
  imageUrl?: string;
}

// Form data interfaces
export interface PlayerFormData {
  transfermarktUrl: string;
  notes: string;
  youtubeUrl: string;
  partnerId: string;
}

export interface PartnerFormData {
  name: string;
  transfermarktUrl: string;
  notes: string;
}

// Form props interfaces
export interface PlayerFormProps {
  onSubmit: (data: PlayerFormData) => void;
  onFetchData?: (data: Player) => void;
  loading: boolean;
  scrapedData?: Player | null;
}

export interface PartnerFormProps {
  onSubmit: (data: PartnerFormData) => void;
  loading: boolean;
}

// Registration mode
export type RegistrationMode = "player" | "partner";
