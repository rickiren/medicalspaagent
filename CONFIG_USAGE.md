# Business Config Usage

The AI widget is now fully configurable using a JSON config object.

## Quick Start

### Option 1: Use Local Config File
The widget will automatically load `/businessConfig.json` if no other config is provided.

### Option 2: Pass Config via Props
```tsx
import VoiceWidget from './components/VoiceWidget';
import businessConfig from './businessConfig.json';

<VoiceWidget config={businessConfig} />
```

### Option 3: Load from Backend
```tsx
<VoiceWidget 
  businessId="template-medspa"
  configUrl="https://yourbackend.com/business/{businessId}/config"
/>
```

### Option 4: Use Data Attribute
```html
<div data-business-id="template-medspa">
  <!-- Widget will read this attribute -->
</div>
```

## Config Structure

See `businessConfig.json` for the full structure. Key fields:
- `id`: Unique business identifier
- `name`: Business name
- `services`: Array of available services with pricing
- `locations`: Business locations
- `hours`: Operating hours
- `booking`: Booking configuration (mock/calendly/custom)
- `aiPersonality`: AI tone and identity

## How It Works

1. **Config Loading**: Widget loads config on mount (from props, backend, or local file)
2. **System Prompt Generation**: `generateSystemPrompt()` creates a dynamic prompt from config
3. **Tool Configuration**: Booking function is generated with available services from config
4. **Booking Handler**: `handleBookingRequest()` processes bookings based on `booking.type`

## Scaling

To create 1000+ widgets:
1. Store configs in your Supabase `businesses` table
2. Each widget instance passes a `businessId`
3. Widget fetches config from your backend
4. Each widget behaves uniquely based on its config

No code changes needed - just different configs!

