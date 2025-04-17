"use client";

import React, { useState } from 'react';
import PlayerRegistrationForm from './Player';
import PartnerRegistrationForm from './Partner';
import { RegistrationMode, PlayerFormData, PartnerFormData, Player } from './shared/types';
import { registerPlayer, registerPartner } from '../../services/register/api';
import './styles.css';

const Register: React.FC = () => {
  const [mode, setMode] = useState<RegistrationMode>('player');
  const [loading, setLoading] = useState(false);
  const [scrapedPlayerData, setScrapedPlayerData] = useState<Player | null>(null);
  
  // Handler for when player data is fetched from Transfermarkt
  const handlePlayerDataFetched = (playerData: Player) => {
    setScrapedPlayerData(playerData);
  };
  
  const handleModeChange = (newMode: RegistrationMode) => {
    setMode(newMode);
  };
  
  const handlePlayerSubmit = async (data: PlayerFormData) => {
    setLoading(true);
    
    try {
      console.log('Submitting player data:', data);
      
      // Call the actual API function
      const result = await registerPlayer(data);
      
      if (result) {
        // Reset form or navigate to another page
        alert('Player registered successfully!');
      } else {
        throw new Error('Failed to register player');
      }
    } catch (error) {
      console.error('Error registering player:', error);
      alert('Failed to register player. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePartnerSubmit = async (data: PartnerFormData) => {
    setLoading(true);
    
    try {
      console.log('Submitting partner data:', data);
      
      // Call the actual API function
      const result = await registerPartner(data);
      
      if (result) {
        // Reset form or navigate to another page
        alert('Partner registered successfully!');
      } else {
        throw new Error('Failed to register partner');
      }
    } catch (error) {
      console.error('Error registering partner:', error);
      alert('Failed to register partner. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      <div className="register-tabs">
        <button
          className={`tab-button ${mode === 'player' ? 'active' : ''}`}
          onClick={() => handleModeChange('player')}
        >
          Player Registration
        </button>
        <button
          className={`tab-button ${mode === 'partner' ? 'active' : ''}`}
          onClick={() => handleModeChange('partner')}
        >
          Partner Registration
        </button>
      </div>
      
      <div className="register-content">
        {mode === 'player' ? (
          <PlayerRegistrationForm
            onSubmit={handlePlayerSubmit}
            onFetchData={handlePlayerDataFetched}
            loading={loading}
            scrapedData={scrapedPlayerData}
          />
        ) : (
          <PartnerRegistrationForm
            onSubmit={handlePartnerSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Register;
