import { describe, it, expect } from "vitest";
import { createProgramSchema, createCourseSchema } from "./validations";

describe("Curriculum Validations", () => {
  it("validates valid academic program input", () => {
    const input = {
      code: "CS-BSC",
      level: "BACHELOR",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต",
      nameEn: "Bachelor of Science",
      degreeTh: "วท.บ.",
      degreeEn: "B.S.",
      totalCredits: 128,
      durationYears: 4,
      tuitionFeePerTerm: 25000,
      careerOpportunities: ["Developer", "DevOps"],
      isAcceptingApplications: true,
      isActive: true,
      order: 1,
    };
    const parsed = createProgramSchema.parse(input);
    expect(parsed.code).toBe("CS-BSC");
    expect(parsed.level).toBe("BACHELOR");
    expect(parsed.totalCredits).toBe(128);
  });

  it("validates course input", () => {
    const input = {
      programId: "33333333-3333-4333-8333-333333333333",
      code: "CS101",
      nameTh: "การเขียนโปรแกรมคอมพิวเตอร์",
      nameEn: "Computer Programming",
      credits: 3,
      year: 1,
      semester: 1,
    };
    const parsed = createCourseSchema.parse(input);
    expect(parsed.code).toBe("CS101");
    expect(parsed.credits).toBe(3);
  });
});
