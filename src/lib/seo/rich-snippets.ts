/**
 * Advanced structured data for rich snippets and enhanced search results
 */

// import { SEOConfig } from './types'


/**
 * Generate How-To structured data
 */
export function generateHowToStructuredData(
  howTo: {
    name: string
    description: string
    image?: string
    totalTime?: string
    estimatedCost?: string
    supply?: string[]
    tool?: string[]
    steps: Array<{
      name: string
      text: string
      image?: string
      url?: string
    }>
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    image: howTo.image,
    totalTime: howTo.totalTime,
    estimatedCost: howTo.estimatedCost,
    supply: howTo.supply?.map(item => ({
      '@type': 'HowToSupply',
      name: item,
    })),
    tool: howTo.tool?.map(item => ({
      '@type': 'HowToTool',
      name: item,
    })),
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  }
}

/**
 * Generate Recipe structured data
 */
export function generateRecipeStructuredData(
  recipe: {
    name: string
    description: string
    image: string
    author: string
    datePublished: string
    dateModified?: string
    prepTime?: string
    cookTime?: string
    totalTime?: string
    recipeYield?: string
    recipeCategory?: string
    recipeCuisine?: string
    nutrition?: {
      calories?: string
      fatContent?: string
      saturatedFatContent?: string
      cholesterolContent?: string
      sodiumContent?: string
      carbohydrateContent?: string
      fiberContent?: string
      sugarContent?: string
      proteinContent?: string
    }
    ingredients: string[]
    instructions: Array<{
      name: string
      text: string
    }>
    aggregateRating?: {
      ratingValue: number
      reviewCount: number
    }
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    author: {
      '@type': 'Person',
      name: recipe.author,
    },
    datePublished: recipe.datePublished,
    dateModified: recipe.dateModified || recipe.datePublished,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.recipeYield,
    recipeCategory: recipe.recipeCategory,
    recipeCuisine: recipe.recipeCuisine,
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      ...recipe.nutrition,
    } : undefined,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map(instruction => ({
      '@type': 'HowToStep',
      name: instruction.name,
      text: instruction.text,
    })),
    aggregateRating: recipe.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: recipe.aggregateRating.ratingValue,
      reviewCount: recipe.aggregateRating.reviewCount,
    } : undefined,
  }
}

/**
 * Generate Event structured data
 */
export function generateEventStructuredData(
  event: {
    name: string
    description: string
    startDate: string
    endDate?: string
    location: {
      name: string
      address: string
      city: string
      state: string
      postalCode: string
      country: string
      latitude?: number
      longitude?: number
    }
    organizer: {
      name: string
      url?: string
      email?: string
      phone?: string
    }
    image?: string
    url?: string
    price?: {
      currency: string
      value: number
    }
    availability?: 'InStock' | 'SoldOut' | 'PreOrder'
    eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed'
    eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode'
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressLocality: event.location.city,
        addressRegion: event.location.state,
        postalCode: event.location.postalCode,
        addressCountry: event.location.country,
      },
      geo: event.location.latitude && event.location.longitude ? {
        '@type': 'GeoCoordinates',
        latitude: event.location.latitude,
        longitude: event.location.longitude,
      } : undefined,
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer.name,
      url: event.organizer.url,
      email: event.organizer.email,
      telephone: event.organizer.phone,
    },
    image: event.image,
    url: event.url,
    offers: event.price ? {
      '@type': 'Offer',
      price: event.price.value,
      priceCurrency: event.price.currency,
      availability: `https://schema.org/${event.availability || 'InStock'}`,
    } : undefined,
    eventStatus: `https://schema.org/${event.eventStatus || 'EventScheduled'}`,
    eventAttendanceMode: `https://schema.org/${event.eventAttendanceMode || 'OfflineEventAttendanceMode'}`,
  }
}

/**
 * Generate Product structured data
 */
export function generateProductStructuredData(
  product: {
    name: string
    description: string
    image: string[]
    brand: string
    sku?: string
    gtin?: string
    mpn?: string
    price: {
      currency: string
      value: number
    }
    availability: 'InStock' | 'OutOfStock' | 'PreOrder'
    condition: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
    category: string
    aggregateRating?: {
      ratingValue: number
      reviewCount: number
      bestRating?: number
      worstRating?: number
    }
    review?: Array<{
      author: string
      datePublished: string
      reviewBody: string
      reviewRating: {
        ratingValue: number
        bestRating?: number
        worstRating?: number
      }
    }>
    offers?: Array<{
      price: number
      priceCurrency: string
      availability: string
      seller: {
        name: string
        url?: string
      }
    }>
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product.sku,
    gtin: product.gtin,
    mpn: product.mpn,
    offers: {
      '@type': 'Offer',
      price: product.price.value,
      priceCurrency: product.price.currency,
      availability: `https://schema.org/${product.availability}`,
      itemCondition: `https://schema.org/${product.condition}`,
      seller: {
        '@type': 'Organization',
        name: 'Extra Realty',
      },
    },
    category: product.category,
    aggregateRating: product.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
      bestRating: product.aggregateRating.bestRating || 5,
      worstRating: product.aggregateRating.worstRating || 1,
    } : undefined,
    review: product.review?.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.datePublished,
      reviewBody: review.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.reviewRating.ratingValue,
        bestRating: review.reviewRating.bestRating || 5,
        worstRating: review.reviewRating.worstRating || 1,
      },
    })),
  }
}

/**
 * Generate Software Application structured data
 */
export function generateSoftwareApplicationStructuredData(
  app: {
    name: string
    description: string
    applicationCategory: string
    operatingSystem: string[]
    url: string
    screenshot?: string[]
    aggregateRating?: {
      ratingValue: number
      reviewCount: number
    }
    offers?: {
      price: number
      priceCurrency: string
    }
    author: {
      name: string
      url?: string
    }
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.description,
    applicationCategory: app.applicationCategory,
    operatingSystem: app.operatingSystem,
    url: app.url,
    screenshot: app.screenshot,
    aggregateRating: app.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: app.aggregateRating.ratingValue,
      reviewCount: app.aggregateRating.reviewCount,
    } : undefined,
    offers: app.offers ? {
      '@type': 'Offer',
      price: app.offers.price,
      priceCurrency: app.offers.priceCurrency,
    } : undefined,
    author: {
      '@type': 'Organization',
      name: app.author.name,
      url: app.author.url,
    },
  }
}

/**
 * Generate Video structured data
 */
export function generateVideoStructuredData(
  video: {
    name: string
    description: string
    thumbnailUrl: string
    uploadDate: string
    duration: string
    contentUrl: string
    embedUrl?: string
    publisher: {
      name: string
      logo: string
    }
    actor?: {
      name: string
    }
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
    publisher: {
      '@type': 'Organization',
      name: video.publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: video.publisher.logo,
      },
    },
    actor: video.actor ? {
      '@type': 'Person',
      name: video.actor.name,
    } : undefined,
  }
}

/**
 * Generate Course structured data
 */
export function generateCourseStructuredData(
  course: {
    name: string
    description: string
    provider: {
      name: string
      url: string
    }
    courseCode?: string
    educationalLevel?: string
    teaches?: string[]
    inLanguage?: string
    isAccessibleForFree?: boolean
    offers?: {
      price: number
      priceCurrency: string
    }
    aggregateRating?: {
      ratingValue: number
      reviewCount: number
    }
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider.name,
      url: course.provider.url,
    },
    courseCode: course.courseCode,
    educationalLevel: course.educationalLevel,
    teaches: course.teaches,
    inLanguage: course.inLanguage,
    isAccessibleForFree: course.isAccessibleForFree,
    offers: course.offers ? {
      '@type': 'Offer',
      price: course.offers.price,
      priceCurrency: course.offers.priceCurrency,
    } : undefined,
    aggregateRating: course.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: course.aggregateRating.ratingValue,
      reviewCount: course.aggregateRating.reviewCount,
    } : undefined,
  }
}

/**
 * Generate Job Posting structured data
 */
export function generateJobPostingStructuredData(
  job: {
    title: string
    description: string
    datePosted: string
    validThrough?: string
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER'
    hiringOrganization: {
      name: string
      url: string
      logo?: string
    }
    jobLocation: {
      name: string
      address: {
        streetAddress: string
        addressLocality: string
        addressRegion: string
        postalCode: string
        addressCountry: string
      }
    }
    baseSalary?: {
      currency: string
      value: {
        minValue: number
        maxValue: number
      }
      unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
    }
    qualifications?: string[]
    responsibilities?: string[]
    benefits?: string[]
    workHours?: string
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: `https://schema.org/${job.employmentType}`,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.hiringOrganization.name,
      url: job.hiringOrganization.url,
      logo: job.hiringOrganization.logo,
    },
    jobLocation: {
      '@type': 'Place',
      name: job.jobLocation.name,
      address: {
        '@type': 'PostalAddress',
        ...job.jobLocation.address,
      },
    },
    baseSalary: job.baseSalary ? {
      '@type': 'MonetaryAmount',
      currency: job.baseSalary.currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.baseSalary.value.minValue,
        maxValue: job.baseSalary.value.maxValue,
        unitText: `https://schema.org/${job.baseSalary.unitText}`,
      },
    } : undefined,
    qualifications: job.qualifications,
    responsibilities: job.responsibilities,
    benefits: job.benefits,
    workHours: job.workHours,
  }
}

/**
 * Generate Review structured data
 */
export function generateReviewStructuredData(
  review: {
    itemReviewed: {
      name: string
      type: 'Product' | 'Service' | 'Organization' | 'Place'
    }
    reviewRating: {
      ratingValue: number
      bestRating?: number
      worstRating?: number
    }
    author: {
      name: string
      url?: string
    }
    reviewBody: string
    datePublished: string
    publisher?: {
      name: string
      logo?: string
    }
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': review.itemReviewed.type,
      name: review.itemReviewed.name,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating.ratingValue,
      bestRating: review.reviewRating.bestRating || 5,
      worstRating: review.reviewRating.worstRating || 1,
    },
    author: {
      '@type': 'Person',
      name: review.author.name,
      url: review.author.url,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    publisher: review.publisher ? {
      '@type': 'Organization',
      name: review.publisher.name,
      logo: review.publisher.logo,
    } : undefined,
  }
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbListStructuredData(
  breadcrumbs: Array<{
    name: string
    url: string
  }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

/**
 * Generate WebPage structured data
 */
export function generateWebPageStructuredData(
  page: {
    name: string
    description: string
    url: string
    isPartOf: {
      name: string
      url: string
    }
    breadcrumb?: Array<{
      name: string
      url: string
    }>
    mainEntity?: unknown
    datePublished?: string
    dateModified?: string
    author?: {
      name: string
      url?: string
    }
    publisher?: {
      name: string
      logo?: string
    }
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: {
      '@type': 'WebSite',
      name: page.isPartOf.name,
      url: page.isPartOf.url,
    },
    breadcrumb: page.breadcrumb ? generateBreadcrumbListStructuredData(page.breadcrumb) : undefined,
    mainEntity: page.mainEntity,
    datePublished: page.datePublished,
    dateModified: page.dateModified,
    author: page.author ? {
      '@type': 'Person',
      name: page.author.name,
      url: page.author.url,
    } : undefined,
    publisher: page.publisher ? {
      '@type': 'Organization',
      name: page.publisher.name,
      logo: page.publisher.logo,
    } : undefined,
  }
}
