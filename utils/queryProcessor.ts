import { NextRequest } from "next/server";

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface DateFilterOptions {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchOptions {
  field?: string;
  value?: string;
  isKeyValue: boolean;
  originalQuery?: string;
}

export interface SortOptions {
  dateRange?: DateFilterOptions;
  sortType?: string;
}

export interface ProcessedQuery {
  pagination: PaginationOptions;
  mongoQuery: any;
  searchOptions: SearchOptions | null;
  sortOptions: SortOptions | null;
  dateFilter: DateFilterOptions | null;
  filters: {
    search: string | null;
    dateFilter: string | null;
    sort: string | null;
    page: number;
    limit: number;
  };
}

/**
 * Global query processor for handling pagination, search, date filtering, and sorting
 * Supports the following query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search query (supports key=value format or general search)
 * - date: Specific date filter (format: DD-MM-YYYY or YYYY-MM-DD)
 * - sort: Time-based sorting (lastweek, lastmonth, lastyear, last2year, etc.)
 */
export function processQueryParameters(
  req: NextRequest,
  searchableFields: string[] = [],
  dateField: string = "createdAt"
): ProcessedQuery {
  const { searchParams } = new URL(req.url);

  // Process pagination
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10"))); // Max 100 items per page
  const skip = (page - 1) * limit;

  const pagination: PaginationOptions = { page, limit, skip };

  // Initialize mongo query
  let mongoQuery: any = {};

  // Process search parameter
  const search = searchParams.get("search");
  let searchOptions: SearchOptions | null = null;

  if (search) {
    searchOptions = processSearchQuery(search, searchableFields, mongoQuery);
  }

  // Process date filter
  const dateFilter = searchParams.get("date");
  let dateFilterOptions: DateFilterOptions | null = null;

  if (dateFilter) {
    dateFilterOptions = processDateFilter(dateFilter, dateField, mongoQuery);
  }

  // Process sort parameter
  const sort = searchParams.get("sort");
  let sortOptions: SortOptions | null = null;

  if (sort) {
    sortOptions = processSortFilter(sort, dateField, mongoQuery);
  }

  return {
    pagination,
    mongoQuery,
    searchOptions,
    sortOptions,
    dateFilter: dateFilterOptions,
    filters: {
      search: search || null,
      dateFilter: dateFilter || null,
      sort: sort || null,
      page,
      limit,
    },
  };
}

/**
 * Process search query - supports both key=value and general search
 */
function processSearchQuery(
  search: string,
  searchableFields: string[],
  mongoQuery: any
): SearchOptions {
  // Check if search is in key=value format
  if (search.includes("=")) {
    const [key, value] = search.split("=").map(s => s.trim());
    
    if (key && value) {
      // Handle specific field search
      if (searchableFields.includes(key)) {
        // For string fields, use regex for partial matching
        if (typeof value === "string" && isNaN(Number(value))) {
          mongoQuery[key] = { $regex: value, $options: "i" };
        } else {
          // For numeric fields, try exact match
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            mongoQuery[key] = numValue;
          } else {
            mongoQuery[key] = { $regex: value, $options: "i" };
          }
        }
      }
      
      return {
        field: key,
        value: value,
        isKeyValue: true,
        originalQuery: search,
      };
    }
  }

  // General search across multiple fields
  if (searchableFields.length > 0) {
    mongoQuery.$or = searchableFields.map(field => ({
      [field]: { $regex: search, $options: "i" }
    }));
  }

  return {
    isKeyValue: false,
    originalQuery: search,
  };
}

/**
 * Process date filter - supports DD-MM-YYYY and YYYY-MM-DD formats
 */
function processDateFilter(
  dateFilter: string,
  dateField: string,
  mongoQuery: any
): DateFilterOptions {
  try {
    let filterDate: Date;

    // Handle DD-MM-YYYY format
    if (dateFilter.includes("-") && dateFilter.split("-")[0].length <= 2) {
      const [day, month, year] = dateFilter.split("-");
      filterDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Handle YYYY-MM-DD format or other standard formats
      filterDate = new Date(dateFilter);
    }

    if (!isNaN(filterDate.getTime())) {
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);

      mongoQuery[dateField] = {
        $gte: startOfDay,
        $lte: endOfDay,
      };

      return {
        startDate: startOfDay,
        endDate: endOfDay,
      };
    }
  } catch (error) {
    console.error("Invalid date filter:", error);
  }

  return {};
}

/**
 * Process sort filter - supports various time-based filters
 */
function processSortFilter(
  sort: string,
  dateField: string,
  mongoQuery: any
): SortOptions {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  const sortLower = sort.toLowerCase().replace(/\s+/g, "");

  switch (sortLower) {
    case "lastweek":
    case "last1week":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "thismonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case "lastmonth":
    case "last1month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case "last3months":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      break;

    case "last6months":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      break;

    case "lastyear":
    case "last1year":
    case "lastoneyear":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;

    case "last2years":
    case "last2year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      break;

    case "last5years":
    case "last5year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 5);
      break;

    default:
      console.warn(`Unknown sort filter: ${sort}`);
      return { sortType: sort };
  }

  // Apply date range to mongo query
  if (startDate) {
    if (endDate) {
      // Specific range (like last month)
      mongoQuery[dateField] = { $gte: startDate, $lte: endDate };
    } else {
      // From start date to now
      if (mongoQuery[dateField]) {
        mongoQuery[dateField].$gte = startDate;
      } else {
        mongoQuery[dateField] = { $gte: startDate };
      }
    }
  }

  return {
    dateRange: { startDate: startDate || undefined, endDate: endDate || undefined },
    sortType: sort,
  };
}

/**
 * Generate pagination metadata for API responses
 */
export function generatePaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

/**
 * Helper function to execute paginated query with the processed parameters
 */
export async function executePaginatedQuery<T>(
  model: any,
  processedQuery: ProcessedQuery,
  selectFields?: string,
  sortOptions: any = { createdAt: -1 }
): Promise<{
  data: T[];
  pagination: ReturnType<typeof generatePaginationMeta>;
  filters: ProcessedQuery['filters'];
}> {
  const { pagination, mongoQuery, filters } = processedQuery;

  // Execute the main query
  let query = model.find(mongoQuery);
  
  if (selectFields) {
    query = query.select(selectFields);
  }

  const data = await query
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sortOptions);

  // Get total count
  const total = await model.countDocuments(mongoQuery);

  // Generate pagination metadata
  const paginationMeta = generatePaginationMeta(total, pagination.page, pagination.limit);

  return {
    data,
    pagination: paginationMeta,
    filters,
  };
}