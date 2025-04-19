"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Partner } from "./services/types";
import { getPartners } from "./services/api";

interface PartnerDataContextValue {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const PartnerDataContext = createContext<PartnerDataContextValue | undefined>(undefined);

export const usePartnerData = () => {
  const ctx = useContext(PartnerDataContext);
  if (!ctx) throw new Error("usePartnerData must be used within a PartnerDataProvider");
  return ctx;
};

export const PartnerDataProvider = ({ children }: { children: ReactNode }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPartners();
      setPartners(data);
    } catch (err) {
      setError("Failed to fetch partners");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line
  }, []);

  return (
    <PartnerDataContext.Provider value={{ partners, loading, error, refresh: fetchPartners }}>
      {children}
    </PartnerDataContext.Provider>
  );
};
