export interface PlayerFilterProps {
  onSubmit: (filters: Record<string, string>) => void;
  loading: boolean;
  availablePositions?: string[];
}

export interface FilterState {
  name: string;
  position: string;
  nationality: string;
  club: string;
  minAge: string;
  maxAge: string;
  minValue: string;
  maxValue: string;
  isLbPlayer: boolean;
}
