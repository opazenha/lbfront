import { Partner } from "./types";
import { API_CONFIG } from "../../config/apiConfig";

/**
 * Fetches list of partners from the backend via Next.js API route
 */
export const getPartners = async (): Promise<Partner[]> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/partners`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch partners: status ${response.status}`);
  }

  return await response.json();
};
