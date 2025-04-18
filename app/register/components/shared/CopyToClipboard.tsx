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
Name: ${player.name || "-"}
Transfermarkt Link: ${player.transfermarktUrl || "-"}
Age: ${player.age || "-"}
Main Position: ${player.mainPosition || "-"}
Other Positions: ${Array.isArray(player.otherPosition) && player.otherPosition.length > 0 ? player.otherPosition.join(", ") : "-"}
Height: ${player.height || "-"}
Citizenship: ${Array.isArray(player.citizenship) && player.citizenship.length > 0 ? player.citizenship.join(", ") : "-"}
End of Contract: ${player.contractExpires || "-"}
Club: ${player.club || "-"}
YouTube: ${player.youtubeUrl || "-"}
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
