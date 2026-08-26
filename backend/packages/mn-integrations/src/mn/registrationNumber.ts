// util/index.ts

/**
 * Parses the older 10-character Mongolian registration number to extract
 * date of birth, age, and gender.
 *
 * Format: 2 letters + 6 digits (YYMMDD) + 1 digit (gender) + 1 digit (checksum)
 * Special rule: For births in 2000 and later, month = month + 20 [citation:3][citation:4]
 *
 * Examples:
 * - "УГ82011204" -> Born in 1982, January 12 (month 01)
 * - "УГ20072104" -> Born in 2020, July 21 (month 07, encoded as 27)
 *
 * @param registrationNumber The 10-character Mongolian registration number
 * @returns Object with birthDate, age, gender, or null if invalid
 */
export function parseMongolianRegistrationNumber(registrationNumber: string): {
  birthDate: Date;
  age: number;
  gender: "male" | "female";
  birthYear: number;
  birthMonth: number;
  birthDay: number;
} | null {
  // Basic validation
  if (registrationNumber?.length !== 10) {
    console.error("Invalid registration number: Must be 10 characters long.");
    return null;
  }

  // Extract components
  const _letters = registrationNumber.substring(0, 2); // Province/district code
  const datePart = registrationNumber.substring(2, 8); // 6 digits: YY MM? DD
  const genderDigit = registrationNumber.charAt(8); // Gender code
  // const checksum = registrationNumber.charAt(9);       // Checksum (validation not implemented)

  // Validate format
  if (!/^[А-ЯҮӨ]{2}\d{8}$/.test(registrationNumber)) {
    console.error("Invalid registration number: Must be 2 letters followed by 8 digits.");
    return null;
  }

  if (!/^\d{6}$/.test(datePart)) {
    console.error("Invalid registration number: Date part must be 6 digits.");
    return null;
  }

  // --- Parse the components ---
  const twoDigitYear = parseInt(datePart.substring(0, 2), 10);
  const rawMonth = parseInt(datePart.substring(2, 4), 10);
  const day = parseInt(datePart.substring(4, 6), 10);

  // Determine the actual year and month based on the raw month value
  let actualYear: number;
  let actualMonth: number;

  // Current date for century calculation
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100; // 2000 for 2025
  const currentTwoDigitYear = currentYear % 100; // 25 for 2025

  // Step 1: Determine the full year
  if (twoDigitYear <= currentTwoDigitYear) {
    actualYear = currentCentury + twoDigitYear; // 2000 + 20 = 2020
  } else {
    actualYear = currentCentury - 100 + twoDigitYear; // (2000 - 100) + 85 = 1985
  }

  // Step 2: Determine the actual month based on the raw value
  if (rawMonth > 20) {
    // Born in 2000 or later: month = rawMonth - 20 [citation:3][citation:4]
    actualMonth = rawMonth - 20;
    // Validate that this is consistent with the year
    if (actualYear < 2000) {
      console.warn(
        `Warning: Month encoding suggests year >=2000 but computed year is ${actualYear}. Check registration number.`,
      );
    }
  } else {
    // Born before 2000: month = rawMonth
    actualMonth = rawMonth;
    // Validate that this is consistent with the year
    if (actualYear >= 2000 && rawMonth <= 12) {
      // This is a valid case - someone born in 2000 with month 01-12
      // (they didn't use the +20 encoding? Possibly early 2000?)
      console.warn(
        `Note: Person born in ${actualYear} with standard month encoding (${rawMonth}).`,
      );
    }
  }

  // Validate month and day
  if (actualMonth < 1 || actualMonth > 12) {
    console.error(`Invalid month: ${actualMonth} (raw: ${rawMonth})`);
    return null;
  }

  if (day < 1 || day > 31) {
    console.error(`Invalid day: ${day}`);
    return null;
  }

  // Create birth date (month is 0-indexed in JS Date)
  const birthDate = new Date(actualYear, actualMonth - 1, day);

  // Validate the constructed date
  if (Number.isNaN(birthDate.getTime())) {
    console.error("Invalid registration number: Could not construct a valid date.");
    return null;
  }

  // --- Calculate Gender ---
  const genderNumber = parseInt(genderDigit, 10);
  if (Number.isNaN(genderNumber)) {
    console.error("Invalid gender digit");
    return null;
  }
  const gender = genderNumber % 2 === 1 ? "male" : "female"; // Odd = male, Even = female [citation:3]

  // --- Calculate Age ---
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return {
    birthDate,
    age,
    gender,
    birthYear: actualYear,
    birthMonth: actualMonth,
    birthDay: day,
  };
}

// Test function to verify the parsing
export function testRegistrationNumberParser() {
  const testCases = [
    { reg: "УГ82011204", expected: { year: 1982, month: 1, day: 12, gender: "female" } },
    { reg: "УБ85123105", expected: { year: 1985, month: 12, day: 31, gender: "male" } },
    { reg: "УГ20072104", expected: { year: 2020, month: 7, day: 21, gender: "female" } },
    { reg: "УД21111508", expected: { year: 2021, month: 11, day: 15, gender: "male" } },
    { reg: "УЕ24022906", expected: { year: 2024, month: 2, day: 29, gender: "female" } }, // Leap year
  ];

  testCases.forEach(({ reg, expected }) => {
    const result = parseMongolianRegistrationNumber(reg);
    console.log(`\nTesting: ${reg}`);
    if (result) {
      console.log(`  Birth: ${result.birthYear}-${result.birthMonth}-${result.birthDay}`);
      console.log(`  Gender: ${result.gender}`);
      console.log(`  Age: ${result.age}`);
      console.log(
        `  Matches expected: ${
          result.birthYear === expected.year &&
          result.birthMonth === expected.month &&
          result.birthDay === expected.day &&
          result.gender === expected.gender
        }`,
      );
    } else {
      console.log("  Failed to parse");
    }
  });
}
