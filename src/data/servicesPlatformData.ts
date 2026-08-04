// Forwarding module to maintain full backwards compatibility while enforcing
// @/services/catalog.ts as the ONE centralized production source of truth.

export {
  OFFICIAL_SHAFSKY_CATEGORIES as SERVICE_CATEGORIES,
  OFFICIAL_SHAFSKY_SERVICES as PLATFORM_SERVICES,
  fetchServiceCatalog,
  useServiceCatalog,
  type ServiceCategoryId,
  type CategoryCatalogItem as ServiceCategoryDef,
  type ServiceCatalogItem as PlatformService,
} from "@/services/catalog";
