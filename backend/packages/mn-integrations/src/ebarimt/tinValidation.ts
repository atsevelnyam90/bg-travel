import {
  EbarimtLookupClient,
  type EbarimtTaxpayerRecord,
  type EbarimtTinLookupType,
} from "./lookup";

export type EbarimtTinValidationContext = "MERCHANT" | "BUYER";
export type EbarimtTinValidationStatus = "MATCH" | "MISMATCH" | "NOT_FOUND" | "SKIPPED";

export interface EbarimtTinValidationInput {
  tin?: string | null;
  registrationNumber?: string | null;
  name?: string | null;
  lookupType?: EbarimtTinLookupType;
  context?: EbarimtTinValidationContext;
}

export interface EbarimtTinValidationResult {
  configured: boolean;
  valid: boolean;
  status: EbarimtTinValidationStatus;
  record: EbarimtTaxpayerRecord | null;
  message: string;
  warnings: string[];
}

export class EbarimtTinValidationService {
  constructor(private readonly lookupClient = new EbarimtLookupClient()) {}

  async validate(input: EbarimtTinValidationInput): Promise<EbarimtTinValidationResult> {
    const tin = normalizeDigits(input.tin || "");
    const registrationNumber = normalizeRegistration(input.registrationNumber || "");
    const name = normalizeText(input.name || "");

    if (!tin && !registrationNumber) {
      return {
        configured: this.lookupClient.isConfigured(),
        valid: false,
        status: "NOT_FOUND",
        record: null,
        message: "TIN or registration number is required for EBarimt validation.",
        warnings: [],
      };
    }

    if (!this.lookupClient.isConfigured()) {
      return {
        configured: false,
        valid: true,
        status: "SKIPPED",
        record: null,
        message: "EBarimt taxpayer lookup is not configured; validation was skipped.",
        warnings: [
          "Configure EBARIMT_LOOKUP_API_BASE_URL and lookup paths before contract testing.",
        ],
      };
    }

    const records: EbarimtTaxpayerRecord[] = [];
    const warnings: string[] = [];
    let registrationNumberLookupChecked = false;
    let registrationNumberLookupRecord: EbarimtTaxpayerRecord | null = null;

    if (tin) {
      const registrationLookup = await this.lookupClient.lookupRegistration(tin);
      if (registrationLookup.record) records.push(registrationLookup.record);
      if (registrationLookup.skipped && registrationLookup.message)
        warnings.push(registrationLookup.message);
    }

    if (registrationNumber) {
      const tinLookup = await this.lookupClient.lookupTin(
        registrationNumber,
        input.lookupType || "REGISTRATION_NUMBER",
      );
      if (!tinLookup.skipped) {
        registrationNumberLookupChecked = true;
        registrationNumberLookupRecord = tinLookup.record || null;
      }
      if (tinLookup.record) records.push(tinLookup.record);
      if (tinLookup.skipped && tinLookup.message) warnings.push(tinLookup.message);
    }

    if (tin && records.every((record) => !record.found)) {
      const tinLookup = await this.lookupClient.lookupTin(tin, "TIN");
      if (tinLookup.record) records.push(tinLookup.record);
      if (tinLookup.skipped && tinLookup.message) warnings.push(tinLookup.message);
    }

    const record = pickBestRecord(records, tin, registrationNumber);
    if (!record?.found) {
      return {
        configured: true,
        valid: false,
        status: "NOT_FOUND",
        record: record || null,
        message: "EBarimt taxpayer lookup did not find a matching taxpayer.",
        warnings,
      };
    }

    if (tin && registrationNumber && registrationNumberLookupChecked) {
      const lookedUpTin = normalizeDigits(registrationNumberLookupRecord?.tin || "");
      if (!registrationNumberLookupRecord?.found || !lookedUpTin || lookedUpTin !== tin) {
        return {
          configured: true,
          valid: false,
          status: "MISMATCH",
          record,
          message: "Registration number does not map to the provided EBarimt TIN.",
          warnings,
        };
      }
    }

    const concreteTinRecords = records.filter((item) => item.found && item.tin);
    const concreteRegistrationRecords = records.filter(
      (item) => item.found && item.registrationNumber,
    );
    const tinMatches =
      !tin ||
      concreteTinRecords.length === 0 ||
      concreteTinRecords.some((item) => normalizeDigits(item.tin || "") === tin);
    const registrationMatches =
      !registrationNumber ||
      concreteRegistrationRecords.length === 0 ||
      concreteRegistrationRecords.some(
        (item) => normalizeRegistration(item.registrationNumber || "") === registrationNumber,
      );

    if (!tinMatches || !registrationMatches) {
      return {
        configured: true,
        valid: false,
        status: "MISMATCH",
        record,
        message: buildMismatchMessage(tinMatches, registrationMatches),
        warnings,
      };
    }

    if (name && record.name && !namesLookCompatible(name, record.name)) {
      warnings.push(`Provided name "${name}" differs from EBarimt name "${record.name}".`);
    }

    return {
      configured: true,
      valid: true,
      status: "MATCH",
      record,
      message: "EBarimt taxpayer validation matched.",
      warnings,
    };
  }
}

export async function validateBusinessEbarimtTin(input: {
  taxNumber?: string | null;
  registrationNumber?: string | null;
  businessName?: string | null;
}): Promise<EbarimtTinValidationResult> {
  const result = await new EbarimtTinValidationService().validate({
    tin: input.taxNumber,
    registrationNumber: input.registrationNumber,
    name: input.businessName,
    context: "MERCHANT",
  });

  if (result.configured && !result.valid) {
    throw new Error(`EBarimt taxpayer validation failed: ${result.message}`);
  }

  return result;
}

function pickBestRecord(records: EbarimtTaxpayerRecord[], tin: string, registrationNumber: string) {
  return (
    records.find((record) => {
      if (!record.found) return false;
      const tinMatches = !tin || !record.tin || normalizeDigits(record.tin) === tin;
      const registrationMatches =
        !registrationNumber ||
        !record.registrationNumber ||
        normalizeRegistration(record.registrationNumber) === registrationNumber;
      return tinMatches && registrationMatches;
    }) ||
    records.find((record) => record.found) ||
    records[0] ||
    null
  );
}

function buildMismatchMessage(tinMatches: boolean, registrationMatches: boolean) {
  if (!tinMatches && !registrationMatches) {
    return "TIN and registration number do not match the EBarimt taxpayer record.";
  }
  if (!tinMatches) return "TIN does not match the EBarimt taxpayer record.";
  return "Registration number does not match the EBarimt taxpayer record.";
}

function namesLookCompatible(left: string, right: string) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  return a === b || a.includes(b) || b.includes(a);
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeRegistration(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function normalizeText(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}
