"use client";

import React from "react";
import { Player } from "./types";

interface CopyToClipboardProps {
  player: Player;
  className?: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ player, className }) => {
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

    const fallbackCopy = (str: string) => {
      const textarea = document.createElement('textarea');
      textarea.value = str;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('Player information copied to clipboard!');
      } catch (err) {
        console.error('Fallback: unable to copy', err);
        alert('Failed to copy to clipboard. Please try again.');
      }
      document.body.removeChild(textarea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert('Player information copied to clipboard!'))
        .catch(err => {
          console.error('Clipboard API failed, falling back', err);
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  return (
    <button
      className={"copy-button" + (typeof className === 'string' ? ` ${className}` : "")}
      onClick={copyToClipboard}
      disabled={!player}
    >
      Share
    </button>
  );
};

export default CopyToClipboard;
