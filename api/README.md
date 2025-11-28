# Business Config API

## Endpoint

`GET /api/business/:id/config`

## Description

Serves static JSON configuration files for each business.

## Usage

### Request
```
GET /api/business/{businessId}/config
```

### Response

**Success (200)**
```json
{
  "id": "template-medspa",
  "name": "The Skin Agency",
  "tagline": "Luxury Aesthetics & Advanced Skin Care",
  "services": [...],
  "locations": [...],
  "hours": {...},
  "faqs": [...],
  "booking": {...},
  "aiPersonality": {...}
}
```

**Not Found (404)**
```json
{
  "error": "Business config not found for ID: {businessId}"
}
```

## Adding New Business Configs

1. Create a new JSON file in `api/business/` directory
2. Name it `{businessId}.json`
3. Use the same structure as `template-medspa.json`
4. The API will automatically serve it at `/api/business/{businessId}/config`

## Example

To add a business with ID `my-business-123`:

1. Create `api/business/my-business-123.json`
2. Add your business configuration
3. Access it at: `GET /api/business/my-business-123/config`

## Testing

```bash
# Test with existing business
curl http://localhost:3000/api/business/template-medspa/config

# Test with non-existent business (should return 404)
curl http://localhost:3000/api/business/nonexistent/config
```

