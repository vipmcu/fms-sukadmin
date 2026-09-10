import { describe, it, expect } from "vitest";
import { validateThaiNationalId, submitStudentApplicationSchema } from "./validations";

describe("Admissions Validations", () => {
  it("validates valid Thai National ID checksum", () => {
    // 1100400123456:
    // (1*13 + 1*12 + 0*11 + 0*10 + 4*9 + 0*8 + 0*7 + 1*6 + 2*5 + 3*4 + 4*3 + 5*2) = 13+12+36+6+10+12+12+10 = 111 % 11 = 1 => 11-1 = 10 % 10 = 0
    // Test known sample algorithm
    expect(validateThaiNationalId("1234567890121")).toBe(true);
    expect(validateThaiNationalId("1234567890120")).toBe(false);
  });

  it("validates application submission input", () => {
    const input = {
      roundId: "11111111-1111-4111-8111-111111111111",
      programId: "22222222-2222-4222-8222-222222222222",
      nationalId: "1234567890121",
      applicantNameTh: "สมศักดิ์ ขยันเรียน",
      email: "somsak@example.com",
      phone: "089-123-4567",
      gpax: 3.75,
    };
    const parsed = submitStudentApplicationSchema.parse(input);
    expect(parsed.applicantNameTh).toBe("สมศักดิ์ ขยันเรียน");
    expect(parsed.gpax).toBe(3.75);
  });
});
