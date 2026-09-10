export type { AcademicProgramDto, CurriculumCourseDto } from "./_internal/services";
export {
  degreeLevelEnum,
  createProgramSchema,
  updateProgramSchema,
  createCourseSchema,
  updateCourseSchema,
  type CreateProgramInput,
  type UpdateProgramInput,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "./_internal/validations";
export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
export { MESSAGES as CURRICULUM_MESSAGES } from "./messages";
