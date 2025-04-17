"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import PartnerTable from "../components/PartnerTable";
import { getPartners } from "../services/partner/api";
import { Partner } from "../services/partner/types";

const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPartners();
        setPartners(data);
      } catch (error) {
        console.error("Failed to load partners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <MainLayout title="Partners">
      <PartnerTable partners={partners} loading={loading} />
    </MainLayout>
  );
};

export default PartnersPage;
