"use client";

import React, { FormEvent, useState } from "react";
import { PlayerFilterProps, FilterState } from "./types";
import "./styles.css";

const PlayerFilter = ({ onSubmit, loading, availablePositions = [] }: PlayerFilterProps) => {
  const [filters, setFilters] = useState<FilterState>({
    name: '',
    position: '',
    nationality: '',
    club: '',
    minAge: '',
    maxAge: '',
    minValue: '',
    maxValue: '',
    isLbPlayer: false
  });

  const handleInputChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create filters object from state
    const submittedFilters: Record<string, string> = {};
    
    if (filters.name) submittedFilters.name = filters.name;
    if (filters.position) submittedFilters.position = filters.position;
    if (filters.nationality) submittedFilters.nationality = filters.nationality;
    if (filters.club) submittedFilters.club = filters.club;
    if (filters.minAge) submittedFilters.minAge = filters.minAge;
    if (filters.maxAge) submittedFilters.maxAge = filters.maxAge;
    if (filters.minValue) submittedFilters.minValue = filters.minValue;
    if (filters.maxValue) submittedFilters.maxValue = filters.maxValue;
    if (filters.isLbPlayer) submittedFilters.isLbPlayer = 'true';
    
    console.log('Submitting filters:', submittedFilters);
    onSubmit(submittedFilters);
  };

  const handleReset = () => {
    setFilters({
      name: '',
      position: '',
      nationality: '',
      club: '',
      minAge: '',
      maxAge: '',
      minValue: '',
      maxValue: '',
      isLbPlayer: false
    });
  };

  return (
    <div className="filter-container">
      <h2>Player Filter</h2>

      <form onSubmit={handleFormSubmit}>
        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="name">Player Name</label>
            <input
              type="text"
              id="name"
              value={filters.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Search by name (partial matches)"
            />
          </div>

          <div className="filter-group">
            <label>Age Range</label>
            <div className="input-flex">
              <input
                type="number"
                id="minAge"
                value={filters.minAge}
                onChange={(e) => handleInputChange('minAge', e.target.value)}
                placeholder="Min age"
                min="15"
                max="45"
              />
              <input
                type="number"
                id="maxAge"
                value={filters.maxAge}
                onChange={(e) => handleInputChange('maxAge', e.target.value)}
                placeholder="Max age"
                min="15"
                max="45"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="position">Position</label>
            <select 
              id="position" 
              value={filters.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            >
              <option value="">All Positions</option>
              {availablePositions.map((position) => (
                <option 
                  key={position} 
                  value={position}
                >
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="club">Current Club</label>
            <input
              type="text"
              id="club"
              value={filters.club}
              onChange={(e) => handleInputChange('club', e.target.value)}
              placeholder="Enter club name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="nationality">Nationality</label>
            <input
              type="text"
              id="nationality"
              value={filters.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Enter nationality"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="marketValue">Market Value</label>
            <div className="input-flex">
              <input
                type="number"
                id="minValue"
                value={filters.minValue}
                onChange={(e) => handleInputChange('minValue', e.target.value)}
                placeholder="Min value (€)"
                min="0"
              />
              <input
                type="number"
                id="maxValue"
                value={filters.maxValue}
                onChange={(e) => handleInputChange('maxValue', e.target.value)}
                placeholder="Max value (€)"
                min="0"
              />
            </div>
          </div>
          
          <div className="filter-group filter-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.isLbPlayer}
                onChange={(e) => handleInputChange('isLbPlayer', e.target.checked)}
              />
              <span>LB Players only</span>
            </label>
          </div>
        </div>

        <div className="filter-actions filter-actions-grid">
          <button 
            type="button" 
            className="reset-btn"
            onClick={handleReset}
          >
            Reset Filters
          </button>
          <button 
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerFilter;
