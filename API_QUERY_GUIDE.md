# API Query Guide - Quick Reference

## Simple & Secure Filtering

### Basic Syntax
```
?filter=field:value,field2:value2,nested.field:value3
```

## Examples

### Single Filter
```bash
GET /v1/api/users?filter=isVerified:true
GET /v1/api/users?filter=name:John Doe
```

### Multiple Filters
```bash
GET /v1/api/users?filter=isVerified:true,name:John
GET /v1/api/users?filter=isVerified:false,address.city:Manila
```

### Nested Fields (Dot Notation)
```bash
GET /v1/api/users?filter=address.city:Manila
GET /v1/api/users?filter=address.province:California,address.city:Los Angeles
```

### With Field Selection
```bash
GET /v1/api/users?filter=isVerified:true&select=name&select=email&select=id
```

### With Pagination
```bash
GET /v1/api/users?filter=address.city:Manila&page=1&limit=20
```

### With Sorting
```bash
GET /v1/api/users?filter=isVerified:true&sort={"name":"asc"}&page=1&limit=10
```

## All Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `filter` | String | Exact-match filters | `filter=isVerified:true,name:John` |
| `select` | Array | Fields to return | `select=name&select=email` |
| `sort` | JSON | Sort order | `sort={"name":"asc"}` |
| `page` | Number | Page number | `page=1` |
| `limit` | Number | Items per page | `limit=20` |
| `search` | String | Text search | `search=john` (search endpoint only) |

## Type Conversion

Values are automatically converted:
- `true` / `false` → Boolean
- `123` / `45.67` → Number
- Everything else → String

## Complete Examples

### Example 1: Filtered list with selected fields
```bash
curl "http://localhost:4400/v1/api/users?filter=isVerified:true,address.city:Manila&select=name&select=email&select=address&page=1&limit=10"
```

### Example 2: Sorted and paginated
```bash
curl "http://localhost:4400/v1/api/users?filter=isVerified:false&sort={\"createdAt\":\"desc\"}&page=1&limit=20"
```

### Example 3: Nested field filtering
```bash
curl "http://localhost:4400/v1/api/users?filter=address.province:NCR,address.city:Manila&select=name&select=address"
```

### Example 4: Search
```bash
curl "http://localhost:4400/v1/api/users/search?search=john"
```

## Tips

✅ **URL Encode:** Use `%20` for spaces (`John%20Doe`)
✅ **Exact Match:** Filters are exact matches only
✅ **Security:** No raw query exposure
✅ **Performance:** Use `select` to reduce payload size

## Need Advanced Queries?

For complex filtering (contains, greater than, OR logic), create dedicated endpoints:

- `/v1/api/users/active` - Active users only
- `/v1/api/users/recent?days=30` - Recent users
- `/v1/api/users/by-location/:city` - Users by city

This is more secure and performant than exposing raw queries!
