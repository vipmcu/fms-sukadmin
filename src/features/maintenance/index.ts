export { MAINTENANCE_P, MAINTENANCE_PERMISSIONS } from "./permissions";
export { MESSAGES as MAINTENANCE_MESSAGES } from "./messages";
export type {
  ServiceCategoryDto,
  ServiceTicketDto,
  TicketCommentDto,
  TicketRatingDto,
  MaintenanceStatsDto,
} from "./_internal/services";
export type {
  CreateServiceTicketInput,
  AssignTicketInput,
  UpdateTicketProgressInput,
  ResolveTicketInput,
  RateTicketInput,
} from "./_internal/validations";
