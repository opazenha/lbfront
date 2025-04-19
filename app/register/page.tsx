"use client";

import React from 'react';
import Register from './components';
import MainLayout from '../components/MainLayout';
import { PartnerDataProvider } from "../partners/PartnerDataContext";
import './components/styles.css';
import './components/PlayerForm.css';
import './components/PlayerForm.fonts.css';
import './components/PartnerForm.css';
import './components/PartnerForm.fonts.css';

export default function RegisterPage() {
  return (
    <MainLayout title="Register">
      <PartnerDataProvider>
        <div className="register-page">
          <Register />
        </div>
      </PartnerDataProvider>
    </MainLayout>
  );
}
