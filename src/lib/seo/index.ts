// Export all SEO types
export * from './types'

// Export metadata generation functions
export {
  generateMetadata,
  generatePropertyMetadata,
  generateArticleMetadata,
  generatePublicListingMetadata,
  generateHomeMetadata,
  generateCanonicalUrl,
  generateKeywords,
} from './metadata'

// Export structured data functions
export {
  generatePropertyStructuredData,
  generateOrganizationStructuredData,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateLocalBusinessStructuredData,
  generateWebsiteStructuredData,
} from './structured-data'

// Export configuration functions
export {
  getSEOConfig,
  getOrganizationData,
  validateSEOConfig,
  generateRobotsTxt,
  DEFAULT_SEO_CONFIG,
} from './config'

// Export URL optimization functions
export {
  generateSlug,
  generatePropertyUrl,
  generatePublicListingUrl,
  generateBlogUrl,
  generateLocationPropertyUrl,
  generatePropertyTypeUrl,
  generateBHKPropertyUrl,
  extractLocationFromUrl,
  extractPropertyTypeFromUrl,
  generateCanonicalUrl as generateCanonicalUrlFromPath,
  generateAlternateUrls,
  validateUrlStructure,
  urlFriendlyText,
  generatePropertySearchUrl,
} from './url-utils'

// Export image SEO functions
export {
  generatePropertyImageAltText,
  generateBlogImageAltText,
  generatePublicListingImageAltText,
  generateCompanyImageAltText,
  optimizeImageUrl,
  generateImageSrcSet,
  generateImageSizes,
  generateOGImageUrl,
  generateTwitterImageUrl,
  validateImageSEO,
  generateImageStructuredData,
} from './image-seo'

// Export internal linking functions
export {
  getRelatedProperties,
  getRelatedBlogPosts,
  getRelatedPublicListings,
  generateContextualLinks,
  generateBreadcrumbs,
  generateRelatedContentSuggestions,
  generateInternalLinkSuggestions,
} from './internal-linking'

// Export performance optimization functions
export {
  CORE_WEB_VITALS_THRESHOLDS,
  generatePerformanceRecommendations,
  generateResourceHints,
  generateCriticalCSS,
  generateServiceWorker,
  generatePerformanceBudget,
  generateWebVitalsScript,
} from './performance'

// Export analytics functions
export {
  generateGA4Config,
  generateGSCVerification,
  generateGTMConfig,
  trackSEOEvent,
  trackPagePerformance,
  trackSearchEngineVisibility,
  trackKeywordRankings,
  trackBacklinkAcquisition,
  trackContentPerformance,
  generateSEODashboardData,
  generateSEOReport,
  trackSEOGoal,
} from './analytics'

// Export rich snippets functions
export {
  generateFAQStructuredData,
  generateHowToStructuredData,
  generateRecipeStructuredData,
  generateEventStructuredData,
  generateProductStructuredData,
  generateSoftwareApplicationStructuredData,
  generateVideoStructuredData,
  generateCourseStructuredData,
  generateJobPostingStructuredData,
  generateReviewStructuredData,
  generateBreadcrumbListStructuredData,
  generateWebPageStructuredData,
} from './rich-snippets'

// Export SEO management functions
export {
  performSEOAudit,
  analyzeContentSEO,
  generateSEORecommendations,
  generateKeywordSuggestions,
  generateSEOChecklist,
} from './seo-management'

// Export monitoring functions
export {
  storeSEOMonitoringData,
  getSEOMonitoringData,
  generateSEOReport as generateSEOReportFromMonitoring,
  setupSEOAlerts,
  checkSEOAlerts,
} from './monitoring'
