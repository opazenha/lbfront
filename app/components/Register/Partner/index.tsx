"use client";

import React, { useState } from "react";
import { PartnerFormProps } from "../shared/types";
import "./styles.css";
import "./fonts.css";

const PartnerRegistrationForm: React.FC<PartnerFormProps> = ({
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    transfermarktUrl: "",
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: { [key: string]: string } = {};

    if (!formData.transfermarktUrl) {
      errors.transfermarktUrl = "Transfermarkt URL is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="partner-form">
      <h2 className="form-title">Register New Partner</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="transfermarktUrl" className="form-label">
            Transfermarkt URL
          </label>
          <input
            type="url"
            id="transfermarktUrl"
            name="transfermarktUrl"
            className="form-input"
            value={formData.transfermarktUrl}
            onChange={handleInputChange}
            placeholder="https://www.transfermarkt.us/-/beraterfirma/berater/..."
          />
          {validationErrors.transfermarktUrl && (
            <div className="error-message">
              {validationErrors.transfermarktUrl}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Add the name of the partner..."
          />
        </div>

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
            placeholder="Add notes about the partner agency..."
          />
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
            {loading ? "Registering..." : "Register Partner"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartnerRegistrationForm;
