"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import PartnerTable from "./components/PartnerTable";
import { PartnerDataProvider, usePartnerData } from "./PartnerDataContext";

const PartnersPage: React.FC = () => {
  const { partners, loading } = usePartnerData();
  return (
    <MainLayout title="Partners">
      <PartnerTable partners={partners} loading={loading} />
    </MainLayout>
  );
};

const PartnersPageWithProvider = () => (
  <PartnerDataProvider>
    <PartnersPage />
  </PartnerDataProvider>
);

export default PartnersPageWithProvider;
