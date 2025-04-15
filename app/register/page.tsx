"use client";

import React from 'react';
import Register from '../components/Register';
import MainLayout from '../components/MainLayout';

export default function RegisterPage() {
  return (
    <MainLayout title="Register">
      <div className="register-page">
        <h1 className="page-title">Register</h1>
        <Register />
      </div>
    </MainLayout>
  );
}
