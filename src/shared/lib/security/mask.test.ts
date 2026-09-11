import { describe, it, expect } from "vitest";
import { maskName, maskPhone, maskEmail, maskNationalId } from "./mask";

describe("PDPA Masking Utilities", () => {
  describe("maskName", () => {
    it("masks Thai full name properly", () => {
      expect(maskName("สมชาย ใจดี")).toBe("ส***ย ใ***ดี");
    });

    it("masks English full name properly", () => {
      expect(maskName("John Doe")).toBe("J***n D***e");
    });

    it("handles short names", () => {
      expect(maskName("ณัฐ")).toBe("ณั*");
      expect(maskName("เอ")).toBe("เ*");
    });

    it("handles empty or invalid inputs", () => {
      expect(maskName("")).toBe("—");
      expect(maskName(null)).toBe("—");
      expect(maskName(undefined)).toBe("—");
    });
  });

  describe("maskPhone", () => {
    it("masks 10-digit mobile number", () => {
      expect(maskPhone("0812345678")).toBe("081-***-5678");
      expect(maskPhone("081-234-5678")).toBe("081-***-5678");
    });

    it("masks 9-digit landline number", () => {
      expect(maskPhone("021234567")).toBe("02-***-4567");
    });

    it("handles invalid or short phone numbers", () => {
      expect(maskPhone("12345")).toBe("—");
      expect(maskPhone(null)).toBe("—");
    });
  });

  describe("maskEmail", () => {
    it("masks typical email address", () => {
      expect(maskEmail("somchai.j@gmail.com")).toBe("s***j@gmail.com");
      expect(maskEmail("admin@university.ac.th")).toBe("a***n@university.ac.th");
    });

    it("masks short local part", () => {
      expect(maskEmail("ab@example.com")).toBe("a*@example.com");
    });

    it("handles invalid or empty emails", () => {
      expect(maskEmail("invalid-email")).toBe("—");
      expect(maskEmail("")).toBe("—");
      expect(maskEmail(null)).toBe("—");
    });
  });

  describe("maskNationalId", () => {
    it("masks 13-digit national ID", () => {
      expect(maskNationalId("1234567890123")).toBe("1-****-*****-12-3");
      expect(maskNationalId("1-2345-67890-12-3")).toBe("1-****-*****-12-3");
    });

    it("handles invalid length", () => {
      expect(maskNationalId("12345")).toBe("—");
      expect(maskNationalId(null)).toBe("—");
    });
  });
});
