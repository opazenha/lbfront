import { Player } from '../../services/player/types';

export type SortField = 'name' | 'age' | 'position' | 'nationality' | 'club' | 'marketValue';
export type SortDirection = 'asc' | 'desc';

export interface PlayerTableProps {
  players: Player[];
  loading: boolean;
}
