# Filtering and Selection Guide

This guide shows how to filter, select, and query data using the API.

## 1. Field Selection (`select`)

Select specific fields to return in the response:

```bash
# Select only name and email
GET /v1/api/users?select=name&select=email&select=id

# Response:
{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

**Note:** `select` and `include` cannot be used together (Prisma limitation)

## 2. Simple Filtering (`filter`)

Simple key:value filters for exact matches. Use comma to separate multiple filters:

```bash
# Filter by verified status
GET /v1/api/users?filter=isVerified:true

# Filter by name
GET /v1/api/users?filter=name:John Doe

# Multiple filters (comma-separated)
GET /v1/api/users?filter=isVerified:true,name:John

# Nested field filtering (dot notation)
GET /v1/api/users?filter=address.city:Manila
GET /v1/api/users?filter=address.city:Manila,address.province:Metro Manila

# Mixed filters
GET /v1/api/users?filter=isVerified:false,address.city:New York
```

**Format:** `filter=field:value,field2:value2,nested.field:value3`

**Type Conversion:**
- `true`/`false` → Boolean
- Numbers → Number
- Everything else → String

## 3. Sorting (`sort`)

```bash
# Sort by creation date (ascending)
GET /v1/api/users?sort={"createdAt":"asc"}

# Sort by name (descending)
GET /v1/api/users?sort={"name":"desc"}

# Multiple sort fields
GET /v1/api/users?sort={"isVerified":"desc","createdAt":"asc"}
```

## 4. Pagination

```bash
# Page 1, 10 items per page
GET /v1/api/users?page=1&limit=10

# Page 2, 20 items per page
GET /v1/api/users?page=2&limit=20
```

## 5. Combined Queries

Combine multiple features:

```bash
# Verified users from New York, show only name and email
GET /v1/api/users?filter=isVerified:true,address.city:New York&select=name&select=email&page=1&limit=10

# Unverified users, sorted by creation date
GET /v1/api/users?filter=isVerified:false&sort={"createdAt":"desc"}&page=1&limit=20
```

## 6. Search Endpoint

For text search across multiple fields:

```bash
# Search users by name or email
GET /v1/api/users/search?search=john
```

## Examples in Practice

### Find verified users in Manila
```bash
curl "http://localhost:4400/v1/api/users?filter=isVerified:true,address.city:Manila&page=1&limit=10"
```

### Get unverified users with specific selections
```bash
curl "http://localhost:4400/v1/api/users?filter=isVerified:false&select=name&select=email&select=createdAt"
```

### Filter by nested address fields
```bash
curl "http://localhost:4400/v1/api/users?filter=address.province:California,address.city:Los Angeles"
```

### Search for users
```bash
curl "http://localhost:4400/v1/api/users/search?search=john"
```

## Current User Schema Fields

- `id` - User ID
- `name` - Full name
- `email` - Email address
- `address.city` - City
- `address.province` - Province/State
- `address.street` - Street address
- `isVerified` - Verification status
- `createdAt` - Creation date
- `updatedAt` - Last update date

## Security & Best Practices

✅ **Secure:** Only exact-match filtering exposed
✅ **Simple:** Easy-to-use syntax
✅ **Fast:** Optimized queries

For advanced queries (contains, greater than, OR logic), use the search endpoint or request dedicated endpoints.
