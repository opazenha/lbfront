import { Player } from "./types";

// Helper function to parse market value strings (e.g., "€450k", "€2.00m") into numbers
export const parseMarketValue = (
  valueString: string | null | undefined
): number | undefined => {
  if (!valueString) return undefined;

  // Remove the euro symbol and any whitespace
  const cleanValue = valueString.replace("€", "").trim();

  // Extract the numeric part and the multiplier (k or m)
  const match = cleanValue.match(/^(\d+(?:\.\d+)?)(k|m)?$/i);
  if (!match) return undefined;

  const [, numStr, multiplier] = match;
  const numericValue = parseFloat(numStr);

  // Apply multiplier if present
  if (multiplier?.toLowerCase() === "k") {
    return numericValue * 1000;
  } else if (multiplier?.toLowerCase() === "m") {
    return numericValue * 1000000;
  }

  return numericValue;
};

// Transform player profile data from the cache endpoint to our internal Player interface
export const transformPlayerProfileFromCache = (data: unknown): Player => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data: not an object');
  }
  const obj = data as Record<string, any>;

  // Handle different position formats from the API
  let positionMain = "Unknown";
  // Removed unused variable positionOther
  if (obj.position) {
    if (typeof obj.position === "string") {
      positionMain = obj.position;
    } else if (typeof obj.position === "object" && obj.position.main) {
      positionMain = obj.position.main;
    } else {
    }
  } else {
  }

  // Get the formatted market value string from API (e.g., "€450k", "€2.00m")
  const marketValueString = obj.marketValue || "Unknown";

  // Parse the market value string into a number for sorting/filtering
  const marketValueNumber = parseMarketValue(marketValueString);

  // Handle different age formats
  let age = 0;
  if (obj.age) {
    age = typeof obj.age === "string" ? parseInt(obj.age, 10) : obj.age;
  } else {
  }

  // Handle different club formats
  let club = undefined;
  if (obj.club) {
    club = typeof obj.club === "string" ? obj.club : obj.club.name;
  } else {
  }

  // Handle different nationality formats
  let nationality = "Unknown";
  if (obj.nationality) {
    if (typeof obj.nationality === "string") {
      nationality = obj.nationality;
    } else if (Array.isArray(obj.nationality) && obj.nationality.length > 0) {
      nationality = obj.nationality[0];
    } else if (
      obj.citizenship &&
      Array.isArray(obj.citizenship) &&
      obj.citizenship.length > 0
    ) {
      nationality = obj.citizenship[0];
    } else {
    }
  } else {
  }

  const citizenship = Array.isArray(obj.citizenship) ? obj.citizenship : [];
  const mainPosition = obj.position?.main || (typeof obj.position === 'string' ? obj.position : undefined) || '';
  const otherPosition = Array.isArray(obj.position?.other) ? obj.position.other : [];
  const player = {
    id: obj.id?.toString() || "",
    name: obj.name || "Unknown",
    fullName: obj.fullName || undefined,
    description: obj.description || undefined,
    age: age,
    position: positionMain,
    mainPosition, // <-- add for frontend
    otherPosition, // <-- add for frontend
    citizenship, // <-- add for frontend
    nationality: citizenship[0] || "", // used for sorting
    club: typeof obj.club === "object" ? obj.club?.name : obj.club,
    marketValue: marketValueString,
    marketValueNumber,
    imageUrl: obj.imageUrl,
    isLbPlayer: obj.isLbPlayer || false,
    transfermarktUrl: obj.url || undefined,
    height: obj.height || undefined,
    contractExpires:
      (typeof obj.club === "object"
        ? obj.club?.contractExpires
        : undefined) ||
      obj.contractExpires ||
      undefined,
    dateOfBirth: obj.dateOfBirth || undefined,
    placeOfBirth: obj.placeOfBirth || undefined,
    foot: obj.foot || undefined,
    shirtNumber: obj.shirtNumber || undefined,
    agentName: obj.agent?.name || undefined,
    agentUrl: obj.agent?.url || undefined,
    socialMedia: obj.socialMedia || undefined,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : undefined,
  };

  console.log("Transformed player:", JSON.stringify(player, null, 2));
  return player;
};
