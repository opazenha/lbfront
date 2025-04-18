import { Player, PlayerFilters } from './types';

export const applyFilters = (players: Player[], filters: PlayerFilters): Player[] => {
  let filtered = [...players];

  // Apply name filter
  if (filters.name) {
    const searchName = filters.name.toLowerCase();
    filtered = filtered.filter((player) =>
      player.name.toLowerCase().includes(searchName)
    );
  }

  // Apply position filter
  if (filters.position) {
    filtered = filtered.filter(
      (player) => player.position === filters.position
    );
  }

  // Apply nationality filter
  if (filters.nationality) {
    const searchNationality = filters.nationality.toLowerCase();
    filtered = filtered.filter((player) =>
      player.nationality.toLowerCase().includes(searchNationality)
    );
  }

  // Apply club filter
  if (filters.club) {
    const searchClub = filters.club.toLowerCase();
    filtered = filtered.filter((player) =>
      player.club?.toLowerCase().includes(searchClub)
    );
  }

  // Apply LB player filter
  if (filters.isLbPlayer === "true") {
    filtered = filtered.filter((player) => player.isLbPlayer === true);
  }

  // Apply age filters
  const minAge = filters.minAge ? parseInt(filters.minAge, 10) : undefined;
  const maxAge = filters.maxAge ? parseInt(filters.maxAge, 10) : undefined;

  if (minAge !== undefined || maxAge !== undefined) {
    filtered = filtered.filter((player) => {
      const age = typeof player.age === 'string' ? parseInt(player.age, 10) : player.age;
      if (typeof age !== 'number' || isNaN(age)) return false;
      const meetsMin = minAge === undefined || isNaN(minAge) || age >= minAge;
      const meetsMax = maxAge === undefined || isNaN(maxAge) || age <= maxAge;
      return meetsMin && meetsMax;
    });
  }

  // Apply market value filter
  const minValue = filters.minValue ? parseFloat(filters.minValue) : undefined;
  const maxValue = filters.maxValue ? parseFloat(filters.maxValue) : undefined;

  if (minValue !== undefined || maxValue !== undefined) {
    filtered = filtered.filter((player) => {
      const value = player.marketValueNumber;
      if (value === undefined || value === null) return false;
      const meetsMin = minValue === undefined || isNaN(minValue) || value >= minValue;
      const meetsMax = maxValue === undefined || isNaN(maxValue) || value <= maxValue;
      return meetsMin && meetsMax;
    });
  }

  return filtered;
};
