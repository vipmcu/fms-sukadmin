export type { NewsArticleDto, NewsCategoryDto } from "./_internal/services";
export {
  createNewsArticleSchema,
  updateNewsArticleSchema,
  createNewsCategorySchema,
  updateNewsCategorySchema,
  type CreateNewsArticleInput,
  type UpdateNewsArticleInput,
  type CreateNewsCategoryInput,
  type UpdateNewsCategoryInput,
} from "./_internal/validations";
export { NEWS_P, NEWS_PERMISSIONS } from "./permissions";
export { MESSAGES as NEWS_MESSAGES } from "./messages";
