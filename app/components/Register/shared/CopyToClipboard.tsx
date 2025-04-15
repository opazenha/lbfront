"use client";

import React from "react";
import { Player } from "./types";

interface CopyToClipboardProps {
  player: Player;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ player }) => {
  const copyToClipboard = () => {
    if (!player) return;

    const text = `
Name: ${player.name || "N/A"}
Transfermarkt Link: ${player.transfermarktUrl || "N/A"}
Age: ${player.age || "N/A"}
Position: ${player.position || "N/A"}
Height: ${player.height || "N/A"}
Citizenship: ${Array.isArray(player.citizenship) && player.citizenship.length > 0 ? player.citizenship.join(", ") : ""}
End of Contract: ${player.contractExpires || "N/A"}
Club: ${player.club || "N/A"}
    `.trim();

    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Player information copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy to clipboard. Please try again.");
      });
  };

  return (
    <button
      className="copy-button"
      onClick={copyToClipboard}
      disabled={!player}
    >
      Share
    </button>
  );
};

export default CopyToClipboard;
