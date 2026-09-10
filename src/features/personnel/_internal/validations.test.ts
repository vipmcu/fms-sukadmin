import { describe, it, expect } from "vitest";
import { createPersonnelSchema, createDepartmentSchema } from "./validations";

describe("Personnel Validations", () => {
  it("validates valid personnel input", () => {
    const input = {
      departmentId: "22222222-2222-4222-8222-222222222222",
      type: "ACADEMIC",
      academicPosition: "ASSOC_PROF",
      prefixTh: "รศ.ดร.",
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      email: "somchai@university.ac.th",
      expertise: ["AI", "Cloud"],
      order: 1,
      isActive: true,
    };
    const parsed = createPersonnelSchema.parse(input);
    expect(parsed.firstNameTh).toBe("สมชาย");
    expect(parsed.academicPosition).toBe("ASSOC_PROF");
    expect(parsed.expertise).toEqual(["AI", "Cloud"]);
  });

  it("rejects invalid email", () => {
    const input = {
      departmentId: "b0000000-0000-0000-0000-000000000001",
      prefixTh: "ดร.",
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      email: "invalid-email",
    };
    expect(() => createPersonnelSchema.parse(input)).toThrow();
  });

  it("validates valid department input", () => {
    const input = {
      code: "DEPT-CS",
      nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Department of Computer Science",
      order: 1,
    };
    const parsed = createDepartmentSchema.parse(input);
    expect(parsed.code).toBe("DEPT-CS");
  });
});
