# Global Query Processor Utility

A comprehensive utility for handling pagination, search, date filtering, and sorting in Next.js API routes.

## Location
- **Utility File**: `utils/queryProcessor.ts`
- **Example Implementation**: `app/api/admin/plans/list-v2/route.ts`

## Features

### 1. Pagination
- **Parameters**: `page`, `limit`
- **Default**: page=1, limit=10
- **Maximum**: limit=100 (to prevent performance issues)
- **Example**: `?page=2&limit=20`

### 2. Search Functionality
Supports two search modes:

#### Key-Value Search
- **Format**: `key=value`
- **Example**: `?search=planName=festivalC023`
- **Supported**: Any field defined in `searchableFields` array

#### General Search
- **Format**: Any string without `=`
- **Example**: `?search=festival`
- **Behavior**: Searches across all fields in `searchableFields` array

### 3. Date Filtering
- **Parameter**: `date`
- **Supported Formats**: 
  - `DD-MM-YYYY` (e.g., `08-03-2025`)
  - `YYYY-MM-DD` (e.g., `2025-03-08`)
- **Example**: `?date=08-03-2025`
- **Behavior**: Filters records for the exact date (00:00:00 to 23:59:59)

### 4. Time-Based Sorting
- **Parameter**: `sort`
- **Supported Values**:
  - `lastweek` / `last1week`
  - `thismonth`
  - `lastmonth` / `last1month`
  - `last3months`
  - `last6months`
  - `lastyear` / `last1year` / `lastoneyear`
  - `last2years` / `last2year`
  - `last5years` / `last5year`
- **Example**: `?sort=lastweek`

## Usage

### Basic Implementation

```typescript
import { processQueryParameters, executePaginatedQuery } from "@/utils/queryProcessor";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Define searchable fields for your model
    const searchableFields = ["name", "status", "description"];

    // Process query parameters
    const processedQuery = processQueryParameters(
      req, 
      searchableFields, 
      "createdAt" // Date field for sorting
    );

    // Execute paginated query
    const result = await executePaginatedQuery(
      YourModel,
      processedQuery,
      "-password -__v", // Fields to exclude
      { createdAt: -1 } // Sort options
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: result.filters,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Advanced Usage (Manual Query Building)

```typescript
import { processQueryParameters } from "@/utils/queryProcessor";

export async function GET(req: NextRequest) {
  const searchableFields = ["name", "email", "status"];
  const processedQuery = processQueryParameters(req, searchableFields);

  // Add custom filters to the mongo query
  processedQuery.mongoQuery.isActive = true;
  processedQuery.mongoQuery.type = "premium";

  // Execute custom query
  const data = await YourModel.find(processedQuery.mongoQuery)
    .skip(processedQuery.pagination.skip)
    .limit(processedQuery.pagination.limit)
    .sort({ createdAt: -1 });

  const total = await YourModel.countDocuments(processedQuery.mongoQuery);

  return NextResponse.json({
    success: true,
    data,
    pagination: generatePaginationMeta(total, processedQuery.pagination.page, processedQuery.pagination.limit),
    filters: processedQuery.filters,
  });
}
```

## API Examples

### Combined Parameters
```
GET /api/admin/plans/list-v2?page=1&limit=5&search=status=active&sort=lastmonth&date=08-03-2025
```

### Search Examples
```
# Key-value search
GET /api/admin/plans/list-v2?search=planName=festivalC023
GET /api/admin/plans/list-v2?search=status=active
GET /api/admin/plans/list-v2?search=plan_price=100

# General search
GET /api/admin/plans/list-v2?search=festival
```

### Date Filter Examples
```
GET /api/admin/plans/list-v2?date=08-03-2025
GET /api/admin/plans/list-v2?date=2025-03-08
```

### Sort Examples
```
GET /api/admin/plans/list-v2?sort=lastweek
GET /api/admin/plans/list-v2?sort=lastmonth
GET /api/admin/plans/list-v2?sort=last2years
```

## Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "search": "planName=festivalC023",
    "dateFilter": "08-03-2025",
    "sort": "lastweek",
    "page": 1,
    "limit": 10
  },
  "message": "Found 150 plans"
}
```

## Migration from Existing APIs

To migrate existing APIs to use this utility:

1. **Replace manual parameter parsing** with `processQueryParameters()`
2. **Replace manual query building** with the returned `mongoQuery`
3. **Use `executePaginatedQuery()`** for simple cases
4. **Keep custom logic** and merge with `processedQuery.mongoQuery` for complex cases

### Before (Old Way)
```typescript
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "10");
const skip = (page - 1) * limit;
const search = searchParams.get("search");
// ... manual query building
```

### After (New Way)
```typescript
const processedQuery = processQueryParameters(req, searchableFields);
const result = await executePaginatedQuery(Model, processedQuery);
```

## Benefits

1. **Consistency**: All APIs use the same parameter format
2. **Maintainability**: Single source of truth for query logic
3. **Performance**: Built-in limits and optimizations
4. **Flexibility**: Supports both simple and complex use cases
5. **Type Safety**: Full TypeScript support with interfaces
6. **Error Handling**: Robust error handling for invalid inputs