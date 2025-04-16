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
export const transformPlayerProfileFromCache = (data: any): Player => {
  console.log("=== TRANSFORMING PLAYER DATA ===");
  console.log("Raw player data:", JSON.stringify(data, null, 2));

  // Handle different position formats from the API
  let positionMain = "Unknown";
  let positionOther = null;
  console.log("Main Position data:", data.position.main);
  console.log("Other Position data:", data.position.other);
  if (data.position) {
    if (typeof data.position === "string") {
      positionMain = data.position.main;
      console.log(`Position is string: ${positionMain}`);
    } else if (typeof data.position === "object") {
      // Handle position as an object with main property
      if (data.position.main) {
        positionMain = data.position.main;
        console.log(`Position from position.main: ${positionMain}`);
      } else {
        console.log("Position object exists but no main property found");
      }
    } else {
      console.log("Position data exists but couldn't extract main position");
    }
  } else {
    console.log("No position data found");
  }

  // Get the formatted market value string from API (e.g., "€450k", "€2.00m")
  const marketValueString = data.marketValue || "Unknown";
  console.log(`Market value string: ${marketValueString}`);

  // Parse the market value string into a number for sorting/filtering
  const marketValueNumber = parseMarketValue(marketValueString);
  console.log(`Parsed market value number: ${marketValueNumber}`);

  // Handle different age formats
  let age = 0;
  console.log("Age data:", data.age, typeof data.age);
  if (data.age) {
    age = typeof data.age === "string" ? parseInt(data.age, 10) : data.age;
    console.log(`Processed age: ${age}`);
  } else {
    console.log("No age data found");
  }

  // Handle different club formats
  let club = undefined;
  console.log("Club data:", data.club);
  if (data.club) {
    club = typeof data.club === "string" ? data.club : data.club.name;
    console.log(`Processed club: ${club}`);
  } else {
    console.log("No club data found");
  }

  // Handle different nationality formats
  let nationality = "Unknown";
  console.log("Nationality data:", data.nationality);
  console.log("Citizenship data:", data.citizenship);
  if (data.nationality) {
    if (typeof data.nationality === "string") {
      nationality = data.nationality;
      console.log(`Nationality from string: ${nationality}`);
    } else if (Array.isArray(data.nationality) && data.nationality.length > 0) {
      nationality = data.nationality[0];
      console.log(`Nationality from array[0]: ${nationality}`);
    } else if (
      data.citizenship &&
      Array.isArray(data.citizenship) &&
      data.citizenship.length > 0
    ) {
      nationality = data.citizenship[0];
      console.log(`Nationality from citizenship[0]: ${nationality}`);
    } else {
      console.log("Nationality data exists but couldn't extract nationality");
    }
  } else {
    console.log("No nationality data found");
  }

  const citizenship = Array.isArray(data.citizenship) ? data.citizenship : [];
  const player = {
    id: data.id?.toString() || "",
    name: data.name || "Unknown",
    fullName: data.fullName || undefined,
    description: data.description || undefined,
    age: age,
    position: positionMain,
    otherPosition: Array.isArray(data.position?.other) ? data.position.other : [],
    citizenship,
    nationality: citizenship[0] || "", // used for sorting
    club: typeof data.club === "object" ? data.club?.name : data.club,
    marketValue: marketValueString,
    marketValueNumber,
    imageUrl: data.imageUrl,
    isLbPlayer: data.isLbPlayer || false,
    transfermarktUrl: data.url || undefined,
    height: data.height || undefined,
    contractExpires:
      (typeof data.club === "object"
        ? data.club?.contractExpires
        : undefined) ||
      data.contractExpires ||
      undefined,
    dateOfBirth: data.dateOfBirth || undefined,
    placeOfBirth: data.placeOfBirth || undefined,
    foot: data.foot || undefined,
    shirtNumber: data.shirtNumber || undefined,
    agentName: data.agent?.name || undefined,
    agentUrl: data.agent?.url || undefined,
    socialMedia: data.socialMedia || undefined,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };

  console.log("Transformed player:", JSON.stringify(player, null, 2));
  return player;
};
