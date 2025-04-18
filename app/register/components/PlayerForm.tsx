"use client";

import React, { useEffect, useState } from "react";
import CopyToClipboard from "./shared/CopyToClipboard";
import { Partner, PlayerFormProps } from "./shared/types";
import "./PlayerForm.fonts.css";
import "./styles.css";
import "./PlayerForm.css";

const PlayerRegistrationForm: React.FC<PlayerFormProps> = ({
  onSubmit,
  onFetchData,
  loading,
  scrapedData,
}) => {
  const [formData, setFormData] = useState({
    transfermarktUrl: "",
    notes: "",
    youtubeUrl: "",
    partnerId: "",
  });

  const [partnerSearch, setPartnerSearch] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch partners from backend API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch("/api/cache/partners", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch partners");
        const data = await response.json();
        // Normalize to Partner[]
        const partners = (Array.isArray(data) ? data : []).map((p, idx) => ({
          id: p.id || p.name || idx.toString(),
          name: p.name,
          transfermarktUrl: p.transfermarktUrl || "",
          notes: p.notes || "",
        }));
        setPartners(partners);
        setFilteredPartners(partners);
      } catch {
        setPartners([]);
        setFilteredPartners([]);
      }
    };
    fetchPartners();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is modified
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePartnerSearch = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const search = e.target.value;
    setPartnerSearch(search);

    // Filter partners based on search text
    const filtered = partners.filter((partner) => {
      const partnerName = Array.isArray(partner.name)
        ? partner.name.join(" ")
        : partner.name;
      return (
        typeof partnerName === "string" &&
        partnerName
          .toLowerCase()
          .includes(typeof search === "string" ? search.toLowerCase() : "")
      );
    });
    setFilteredPartners(filtered);
    setShowPartnerDropdown(true);

    // If no match and input is not empty, show a 'create new' option
    if (search.trim() && filtered.length === 0) {
      setFilteredPartners([
        ...filtered,
        {
          id: "new",
          name: `Create new partner: "${search}"`,
          transfermarktUrl: "",
          notes: "",
        },
      ]);
    }
  };

  const selectPartner = async (partner: Partner) => {
    if (partner.id === "new") {
      // Register new partner
      const { registerPartner } = await import("../services/api");
      const newPartner = await registerPartner({
        name: partnerSearch,
        transfermarktUrl: "",
        notes: "",
      });
      if (newPartner) {
        setPartners((prev) => [...prev, newPartner]);
        setFilteredPartners([newPartner]);
        setFormData((prev) => ({ ...prev, partnerId: newPartner.id }));
        setPartnerSearch(newPartner.name);
      }
    } else {
      setFormData((prev) => ({ ...prev, partnerId: partner.id }));
      setPartnerSearch(partner.name);
    }
    setShowPartnerDropdown(false);

    // Clear validation error for partnerId
    if (validationErrors.partnerId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.partnerId;
        return newErrors;
      });
    }
  };

  const fetchPlayerData = async () => {
    // Refresh partners list after player data is fetched
    const refreshPartners = async () => {
      try {
        const response = await fetch("/api/cache/partners", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch partners");
        const data = await response.json();
        const partners = (Array.isArray(data) ? data : []).map((p, idx) => ({
          id: p.id || p.name || idx.toString(),
          name: p.name,
          transfermarktUrl: p.transfermarktUrl || "",
          notes: p.notes || "",
        }));
        setPartners(partners);
        setFilteredPartners(partners);
      } catch {
        setPartners([]);
        setFilteredPartners([]);
      }
    };

    if (!formData.transfermarktUrl) {
      setValidationErrors((prev) => ({
        ...prev,
        transfermarktUrl: "Transfermarkt URL is required to fetch player data",
      }));
      return;
    }

    setFetchingData(true);

    try {
      // Import dynamically to avoid SSR issues
      const { fetchPlayerDataFromTransfermarkt } = await import(
        "../services/api"
      );

      // Fetch player data from the Transfermarkt API
      const playerData = await fetchPlayerDataFromTransfermarkt(
        formData.transfermarktUrl
      );

      if (playerData) {
        // Refresh partners after player registration (in case a new partner was created)
        await refreshPartners();
        // If we successfully fetched player data, update the UI
        // A real implementation would pass this data back up to the parent component
        // For now, we'll just pass it via props
        if (onFetchData && typeof onFetchData === "function") {
          onFetchData(playerData);
        }
      } else {
        alert(
          "Could not fetch player data. Please check the URL and try again."
        );
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
      alert("Error fetching player data. Please try again.");
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: { [key: string]: string } = {};

    if (!formData.transfermarktUrl) {
      errors.transfermarktUrl = "Transfermarkt URL is required";
    }

    if (!formData.partnerId) {
      errors.partnerId = "Partner is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="player-form">
      <h2 className="form-title">Register New Player</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="transfermarktUrl" className="form-label">
            Transfermarkt URL
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="url"
              id="transfermarktUrl"
              name="transfermarktUrl"
              className="form-input"
              value={formData.transfermarktUrl}
              onChange={handleInputChange}
              placeholder="https://www.transfermarkt.com/player/profile/..."
              style={{ flexGrow: 1 }}
            />
            <button
              type="button"
              className="form-button secondary-button"
              onClick={fetchPlayerData}
              disabled={fetchingData}
            >
              {fetchingData ? "Loading..." : "Get Information"}
            </button>
          </div>
          {validationErrors.transfermarktUrl && (
            <div className="error-message">
              {validationErrors.transfermarktUrl}
            </div>
          )}
        </div>

        {fetchingData && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Fetching player data from Transfermarkt...</span>
          </div>
        )}

        {scrapedData && (
          <div className="scraped-data">
            <h3 className="scraped-data-title">Player Information</h3>
            <div className="scraped-data-grid">
              {scrapedData.imageUrl && (
                <div className="data-item">
                  <img
                    src={scrapedData.imageUrl}
                    alt={scrapedData.name}
                    className="player-image"
                  />
                </div>
              )}

              <div className="data-item">
                <div className="data-label">Name</div>
                <div className="data-value">{scrapedData.name}</div>
              </div>

              <div className="data-item">
                <div className="data-label">Age</div>
                <div className="data-value">{scrapedData.age}</div>
              </div>

              <div className="data-item">
                <div className="data-label">Position</div>
                <div className="data-value">{scrapedData.mainPosition || '-'}</div>
              </div>

              <div className="data-item">
                <div className="data-label">Other Positions</div>
                <div className="data-value">{Array.isArray(scrapedData.otherPosition) && scrapedData.otherPosition.length > 0 ? scrapedData.otherPosition.join(', ') : '-'}</div>
              </div>

              <div className="data-item">
                <div className="data-label">Nationality</div>
                <div className="data-value">{Array.isArray(scrapedData.citizenship) ? scrapedData.citizenship.join(', ') : scrapedData.citizenship || '-'}</div>
              </div>

              <div className="data-item">
                <div className="data-label">Height</div>
                <div className="data-value">{scrapedData.height}</div>
              </div>

              <div className="data-item">
                <div className="data-label">Club</div>
                <div className="data-value">{scrapedData.club}</div>
              </div>

              <div className="data-item">
                <div className="data-label">Contract Expires</div>
                <div className="data-value">{scrapedData.contractExpires}</div>
              </div>
            </div>
            <CopyToClipboard player={scrapedData} />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            className="form-input form-textarea"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add notes about the player..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="youtubeUrl" className="form-label">
            YouTube URL
          </label>
          <input
            type="url"
            id="youtubeUrl"
            name="youtubeUrl"
            className="form-input"
            value={formData.youtubeUrl}
            onChange={handleInputChange}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="partnerId" className="form-label">
            Partner
          </label>
          <div className="partner-select">
            <input
              type="text"
              id="partnerSearch"
              className="partner-input"
              value={partnerSearch}
              onChange={handlePartnerSearch}
              placeholder="Search for a partner..."
              onFocus={() => setShowPartnerDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowPartnerDropdown(false), 200)
              }
            />

            {showPartnerDropdown && filteredPartners.length > 0 && (
              <div className="partner-dropdown">
                {filteredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className={`partner-option ${
                      formData.partnerId === partner.id ? "selected" : ""
                    }`}
                    onClick={() => selectPartner(partner)}
                  >
                    {partner.name}
                  </div>
                ))}
              </div>
            )}

            {validationErrors.partnerId && (
              <div className="error-message">{validationErrors.partnerId}</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="form-button secondary-button">
            Cancel
          </button>
          <button
            type="submit"
            className="form-button primary-button"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Player"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerRegistrationForm;
