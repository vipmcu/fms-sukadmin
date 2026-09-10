export type { DepartmentDto, PersonnelProfileDto } from "./_internal/services";
export {
  personnelTypeEnum,
  academicPositionEnum,
  createDepartmentSchema,
  updateDepartmentSchema,
  createPersonnelSchema,
  updatePersonnelSchema,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  type CreatePersonnelInput,
  type UpdatePersonnelInput,
} from "./_internal/validations";
export { PERSONNEL_P, PERSONNEL_PERMISSIONS } from "./permissions";
export { MESSAGES as PERSONNEL_MESSAGES } from "./messages";
