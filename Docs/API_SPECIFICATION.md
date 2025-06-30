# Business Profile System - API Specification

## Overview

The Business Profile System API provides comprehensive RESTful endpoints for managing business profiles, team members, documents, and related functionality. All APIs use JSON for data exchange and follow REST conventions.

## Base Configuration

### Base URLs
```
Development: http://localhost:54321/functions/v1/
Production: https://[project-id].supabase.co/functions/v1/
```

### Authentication
All API requests require authentication using Supabase JWT tokens:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Response Format
```typescript
interface ErrorResponse {
  error: string
  message: string
  details?: any
  code?: string
  timestamp: string
}
```

### Standard HTTP Status Codes
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate)
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

## Business Profile Management

### List Business Profiles

```http
GET /business-profiles
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `search` (string) - Search term for name/description
- `industry` (string) - Filter by industry
- `status` (string) - Filter by status

**Response:**
```typescript
interface BusinessProfileListResponse {
  profiles: BusinessProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  filters: {
    applied: Record<string, any>
    available: {
      industries: string[]
      statuses: string[]
    }
  }
}

interface BusinessProfile {
  id: string
  user_id: string
  legal_name: string
  display_name: string
  business_type: string
  industry?: string
  description?: string
  status: 'active' | 'inactive' | 'suspended'
  verification_status: 'pending' | 'verified' | 'rejected'
  profile_completion_percentage: number
  created_at: string
  updated_at: string
}
```

### Get Business Profile

```http
GET /business-profiles/{id}
```

**Response:**
```typescript
interface BusinessProfileDetailResponse {
  profile: BusinessProfileDetail
  permissions: UserPermissions
  team_summary: {
    total_members: number
    active_members: number
    pending_invitations: number
  }
  completion_status: {
    percentage: number
    missing_sections: string[]
    next_steps: string[]
  }
}

interface BusinessProfileDetail extends BusinessProfile {
  doing_business_as?: string
  business_registration_number?: string
  tax_identification_number?: string
  incorporation_state?: string
  incorporation_date?: string
  business_category?: string
  website_url?: string
}

interface UserPermissions {
  can_view: boolean
  can_edit: boolean
  can_delete: boolean
  can_manage_team: boolean
  can_manage_documents: boolean
  can_manage_banking: boolean
  role: string
}
```

### Create Business Profile

```http
POST /business-profiles
```

**Request Body:**
```typescript
interface CreateBusinessProfileRequest {
  legal_name: string
  display_name: string
  business_type: 'LLC' | 'Corporation' | 'Partnership' | 'Sole Proprietorship' | 'Other'
  industry: string
  description?: string
  doing_business_as?: string
  website_url?: string
  business_category?: string
}
```

**Response:**
```typescript
interface CreateBusinessProfileResponse {
  profile: BusinessProfile
  next_steps: string[]
  setup_progress: {
    current_step: string
    total_steps: number
    completed_steps: number
  }
}
```

### Update Business Profile

```http
PUT /business-profiles/{id}
```

**Request Body:**
```typescript
interface UpdateBusinessProfileRequest {
  legal_name?: string
  display_name?: string
  description?: string
  industry?: string
  business_category?: string
  website_url?: string
  doing_business_as?: string
  business_registration_number?: string
  tax_identification_number?: string
  incorporation_state?: string
  incorporation_date?: string
}
```

### Delete Business Profile

```http
DELETE /business-profiles/{id}
```

**Query Parameters:**
- `confirm` (boolean, required) - Confirmation flag
- `transfer_to` (string, optional) - User ID to transfer ownership

## Contact Management

### List Business Contacts

```http
GET /business-profiles/{id}/contacts
```

**Response:**
```typescript
interface BusinessContactsResponse {
  contacts: BusinessContact[]
  primary_contact: BusinessContact | null
}

interface BusinessContact {
  id: string
  business_id: string
  contact_type: 'primary' | 'billing' | 'legal' | 'technical' | 'shipping'
  street_address_1?: string
  street_address_2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country: string
  phone_number?: string
  fax_number?: string
  email_address?: string
  contact_person_name?: string
  contact_person_title?: string
  contact_person_phone?: string
  contact_person_email?: string
  is_primary: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}
```

### Create Business Contact

```http
POST /business-profiles/{id}/contacts
```

**Request Body:**
```typescript
interface CreateContactRequest {
  contact_type: 'primary' | 'billing' | 'legal' | 'technical' | 'shipping'
  street_address_1: string
  street_address_2?: string
  city: string
  state_province: string
  postal_code: string
  country: string
  phone_number?: string
  fax_number?: string
  email_address?: string
  contact_person_name?: string
  contact_person_title?: string
  contact_person_phone?: string
  contact_person_email?: string
  is_primary?: boolean
  is_public?: boolean
}
```

### Update Business Contact

```http
PUT /business-profiles/{business_id}/contacts/{contact_id}
```

### Delete Business Contact

```http
DELETE /business-profiles/{business_id}/contacts/{contact_id}
```

## Team Management

### List Team Members

```http
GET /business-profiles/{id}/team
```

**Query Parameters:**
- `include_pending` (boolean, default: true) - Include pending invitations
- `role` (string) - Filter by role

**Response:**
```typescript
interface TeamMembersResponse {
  members: TeamMember[]
  invitations: TeamInvitation[]
  role_permissions: Record<string, Permission[]>
}

interface TeamMember {
  id: string
  business_id: string
  user_id?: string
  email: string
  first_name?: string
  last_name?: string
  job_title?: string
  department?: string
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'contractor'
  permissions: Record<string, boolean>
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  invited_at: string
  joined_at?: string
  last_active_at?: string
}

interface TeamInvitation {
  id: string
  email: string
  role: string
  invited_by: string
  invited_at: string
  expires_at: string
  status: 'pending' | 'accepted' | 'expired'
}
```

### Invite Team Member

```http
POST /business-profiles/{id}/team/invite
```

**Request Body:**
```typescript
interface InviteTeamMemberRequest {
  email: string
  role: 'admin' | 'manager' | 'employee' | 'contractor'
  first_name?: string
  last_name?: string
  job_title?: string
  department?: string
  permissions?: Record<string, boolean>
  send_email?: boolean
  custom_message?: string
}
```

**Response:**
```typescript
interface InviteTeamMemberResponse {
  invitation: TeamInvitation
  invitation_url: string
  email_sent: boolean
}
```

### Update Team Member

```http
PUT /business-profiles/{business_id}/team/{member_id}
```

**Request Body:**
```typescript
interface UpdateTeamMemberRequest {
  first_name?: string
  last_name?: string
  job_title?: string
  department?: string
  role?: 'admin' | 'manager' | 'employee' | 'contractor'
  permissions?: Record<string, boolean>
  status?: 'active' | 'inactive' | 'suspended'
}
```

### Remove Team Member

```http
DELETE /business-profiles/{business_id}/team/{member_id}
```

### Accept Team Invitation

```http
POST /team/invitations/{token}/accept
```

**Request Body:**
```typescript
interface AcceptInvitationRequest {
  first_name?: string
  last_name?: string
  password?: string // If user doesn't exist
}
```

## Document Management

### List Business Documents

```http
GET /business-profiles/{id}/documents
```

**Query Parameters:**
- `type` (string) - Filter by document type
- `status` (string) - Filter by status
- `search` (string) - Search in document names
- `tags` (string[]) - Filter by tags
- `expiring_soon` (boolean) - Documents expiring within 30 days

**Response:**
```typescript
interface DocumentsResponse {
  documents: BusinessDocument[]
  categories: DocumentCategory[]
  storage_usage: {
    used_bytes: number
    total_bytes: number
    percentage: number
  }
}

interface BusinessDocument {
  id: string
  business_id: string
  uploaded_by: string
  document_type: string
  document_name: string
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  verification_status: 'unverified' | 'verified' | 'rejected'
  expires_at?: string
  metadata: Record<string, any>
  tags: string[]
  created_at: string
  updated_at: string
  download_url?: string // Temporary signed URL
}

interface DocumentCategory {
  type: string
  name: string
  description: string
  required: boolean
  multiple_allowed: boolean
  supported_formats: string[]
}
```

### Upload Document

```http
POST /business-profiles/{id}/documents/upload
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (File) - Document file
- `document_type` (string) - Type of document
- `document_name` (string) - Display name
- `expires_at` (string, optional) - ISO date string
- `tags` (string[], optional) - Document tags
- `metadata` (object, optional) - Additional metadata

**Response:**
```typescript
interface UploadDocumentResponse {
  document: BusinessDocument
  processing_status: {
    status: 'queued' | 'processing' | 'completed' | 'failed'
    estimated_completion?: string
  }
}
```

### Get Document

```http
GET /business-profiles/{business_id}/documents/{document_id}
```

### Download Document

```http
GET /business-profiles/{business_id}/documents/{document_id}/download
```

**Query Parameters:**
- `version` (integer, optional) - Specific version number

**Response:** Signed URL redirect or direct file stream

### Update Document

```http
PUT /business-profiles/{business_id}/documents/{document_id}
```

**Request Body:**
```typescript
interface UpdateDocumentRequest {
  document_name?: string
  document_type?: string
  expires_at?: string
  tags?: string[]
  metadata?: Record<string, any>
  status?: 'pending' | 'approved' | 'rejected'
}
```

### Delete Document

```http
DELETE /business-profiles/{business_id}/documents/{document_id}
```

**Query Parameters:**
- `keep_versions` (boolean, default: false) - Keep version history

### Get Document Versions

```http
GET /business-profiles/{business_id}/documents/{document_id}/versions
```

## Banking Management

### List Banking Accounts

```http
GET /business-profiles/{id}/banking
```

**Response:**
```typescript
interface BankingAccountsResponse {
  accounts: BankingAccount[]
  payment_processors: PaymentProcessor[]
  verification_status: {
    has_verified_account: boolean
    pending_verifications: number
  }
}

interface BankingAccount {
  id: string
  business_id: string
  bank_name: string
  account_type: 'checking' | 'savings' | 'business'
  account_number_masked: string // Last 4 digits only
  routing_number: string
  account_holder_name: string
  is_primary: boolean
  is_verified: boolean
  verification_date?: string
  verification_method?: string
  created_at: string
  updated_at: string
}

interface PaymentProcessor {
  id: string
  business_id: string
  payment_processor: 'stripe' | 'paypal' | 'square' | 'other'
  processor_account_id: string
  is_verified: boolean
  capabilities: string[]
  created_at: string
}
```

### Add Banking Account

```http
POST /business-profiles/{id}/banking
```

**Request Body:**
```typescript
interface AddBankingAccountRequest {
  bank_name: string
  account_type: 'checking' | 'savings' | 'business'
  account_number: string
  routing_number: string
  account_holder_name: string
  is_primary?: boolean
}
```

### Verify Banking Account

```http
POST /business-profiles/{business_id}/banking/{account_id}/verify
```

**Request Body:**
```typescript
interface VerifyBankingAccountRequest {
  verification_method: 'micro_deposits' | 'instant' | 'manual'
  verification_data?: {
    amount1?: number
    amount2?: number
    confirmation_code?: string
  }
}
```

### Add Payment Processor

```http
POST /business-profiles/{id}/payment-processors
```

**Request Body:**
```typescript
interface AddPaymentProcessorRequest {
  payment_processor: 'stripe' | 'paypal' | 'square'
  credentials: {
    api_key?: string
    secret_key?: string
    webhook_secret?: string
    merchant_id?: string
  }
}
```

## Operating Hours Management

### Get Operating Hours

```http
GET /business-profiles/{id}/hours
```

**Response:**
```typescript
interface OperatingHoursResponse {
  hours: OperatingHour[]
  timezone: string
  special_hours: SpecialHour[]
}

interface OperatingHour {
  id: string
  business_id: string
  day_of_week: number // 0 = Sunday
  is_open: boolean
  open_time?: string // HH:MM format
  close_time?: string // HH:MM format
  is_24_hours: boolean
  is_by_appointment: boolean
  break_start_time?: string
  break_end_time?: string
}

interface SpecialHour {
  date: string
  is_open: boolean
  open_time?: string
  close_time?: string
  note?: string
}
```

### Update Operating Hours

```http
PUT /business-profiles/{id}/hours
```

**Request Body:**
```typescript
interface UpdateOperatingHoursRequest {
  hours: {
    day_of_week: number
    is_open: boolean
    open_time?: string
    close_time?: string
    is_24_hours?: boolean
    is_by_appointment?: boolean
    break_start_time?: string
    break_end_time?: string
  }[]
  timezone?: string
}
```

## Service Areas Management

### Get Service Areas

```http
GET /business-profiles/{id}/service-areas
```

**Response:**
```typescript
interface ServiceAreasResponse {
  service_areas: ServiceArea[]
  coverage_summary: {
    total_areas: number
    coverage_types: string[]
    estimated_population: number
  }
}

interface ServiceArea {
  id: string
  business_id: string
  area_type: 'city' | 'state' | 'country' | 'postal_code' | 'radius'
  area_value: string
  radius_miles?: number
  service_description?: string
  additional_fees: number
  travel_time_estimate?: string
  created_at: string
}
```

### Add Service Area

```http
POST /business-profiles/{id}/service-areas
```

**Request Body:**
```typescript
interface AddServiceAreaRequest {
  area_type: 'city' | 'state' | 'country' | 'postal_code' | 'radius'
  area_value: string
  radius_miles?: number
  service_description?: string
  additional_fees?: number
  travel_time_estimate?: string
}
```

## Audit and Analytics

### Get Audit Logs

```http
GET /business-profiles/{id}/audit-logs
```

**Query Parameters:**
- `action` (string) - Filter by action type
- `table` (string) - Filter by table name
- `user_id` (string) - Filter by user
- `from_date` (string) - Start date (ISO format)
- `to_date` (string) - End date (ISO format)
- `limit` (integer, default: 50) - Items per page

**Response:**
```typescript
interface AuditLogsResponse {
  logs: AuditLog[]
  summary: {
    total_actions: number
    unique_users: number
    most_active_user: string
    most_common_action: string
  }
}

interface AuditLog {
  id: string
  business_id: string
  user_id?: string
  user_email?: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  changed_fields?: string[]
  ip_address?: string
  user_agent?: string
  created_at: string
}
```

### Get Business Analytics

```http
GET /business-profiles/{id}/analytics
```

**Query Parameters:**
- `period` (string) - '7d', '30d', '90d', '1y'
- `metrics` (string[]) - Specific metrics to include

**Response:**
```typescript
interface BusinessAnalyticsResponse {
  profile_metrics: {
    completion_trend: DataPoint[]
    team_growth: DataPoint[]
    document_uploads: DataPoint[]
  }
  activity_metrics: {
    user_activity: DataPoint[]
    feature_usage: Record<string, number>
    popular_actions: Array<{action: string, count: number}>
  }
  business_insights: {
    recommendations: string[]
    completion_suggestions: string[]
    security_alerts: string[]
  }
}

interface DataPoint {
  date: string
  value: number
}
```

## Edge Functions

### Business Profile Validation

```http
POST /validate-business-profile
```

**Request Body:**
```typescript
interface BusinessValidationRequest {
  business_id: string
  validation_type: 'legal' | 'financial' | 'operational' | 'complete'
  include_recommendations?: boolean
}
```

**Response:**
```typescript
interface BusinessValidationResponse {
  is_valid: boolean
  validation_score: number // 0-100
  issues: ValidationIssue[]
  recommendations: string[]
  next_steps: string[]
}

interface ValidationIssue {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  field?: string
  suggestion?: string
}
```

### Document Processing

```http
POST /process-business-document
```

**Request Body:**
```typescript
interface DocumentProcessingRequest {
  document_id: string
  processing_type: 'ocr' | 'validation' | 'extraction' | 'classification'
  options?: {
    extract_fields?: string[]
    validate_against?: string
    auto_categorize?: boolean
  }
}
```

**Response:**
```typescript
interface DocumentProcessingResponse {
  processing_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress_percentage: number
  estimated_completion?: string
  results?: {
    extracted_text?: string
    extracted_data?: Record<string, any>
    validation_results?: ValidationResult[]
    suggested_category?: string
    confidence_score?: number
  }
}
```

### Banking Verification

```http
POST /verify-banking-info
```

**Request Body:**
```typescript
interface BankingVerificationRequest {
  business_id: string
  bank_account_id: string
  verification_method: 'micro_deposits' | 'instant' | 'plaid'
  verification_data?: Record<string, any>
}
```

**Response:**
```typescript
interface BankingVerificationResponse {
  verification_id: string
  status: 'pending' | 'verified' | 'failed' | 'requires_action'
  next_steps?: string[]
  verification_code?: string
  estimated_completion?: string
  error_details?: {
    code: string
    message: string
    retry_allowed: boolean
  }
}
```

## Webhooks

### Webhook Events

The system can send webhooks for the following events:

- `business_profile.created`
- `business_profile.updated`
- `business_profile.deleted`
- `team_member.invited`
- `team_member.joined`
- `team_member.removed`
- `document.uploaded`
- `document.verified`
- `banking.verified`
- `profile.completed`

### Webhook Payload Format

```typescript
interface WebhookPayload {
  event: string
  timestamp: string
  business_id: string
  user_id?: string
  data: Record<string, any>
  previous_data?: Record<string, any> // For update events
}
```

### Webhook Configuration

```http
POST /webhooks
PUT /webhooks/{id}
DELETE /webhooks/{id}
GET /webhooks
```

## Rate Limiting

- **Authenticated requests:** 1000 requests per hour per user
- **Document uploads:** 100 uploads per hour per business
- **Banking operations:** 10 requests per hour per business
- **Webhook deliveries:** 500 per hour per endpoint

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Create business profile
const { data: profile, error } = await supabase.functions.invoke(
  'business-profiles',
  {
    method: 'POST',
    body: {
      legal_name: 'Acme Corporation',
      display_name: 'Acme Corp',
      business_type: 'Corporation',
      industry: 'Technology'
    }
  }
)

// Upload document
const formData = new FormData()
formData.append('file', file)
formData.append('document_type', 'business_license')
formData.append('document_name', 'Business License')

const { data: document } = await supabase.functions.invoke(
  `business-profiles/${businessId}/documents/upload`,
  {
    method: 'POST',
    body: formData
  }
)
```

---

This API specification provides comprehensive coverage of all business profile system endpoints with detailed request/response schemas and usage examples.