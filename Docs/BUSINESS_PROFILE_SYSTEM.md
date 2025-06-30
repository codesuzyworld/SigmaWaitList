# Business Profile System - Technical Specification

## Executive Summary

The Business Profile System is a comprehensive module within the Sigma AI Business Partner Platform that enables businesses to manage their complete operational profile, including legal information, contact details, banking credentials, team management, and document storage. This system serves as the foundation for all business automation features.

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)                  │
├─────────────────────────────────────────────────────────────────┤
│  Business Profile Components  │  Document Management  │  Team   │
│  - Basic Info Forms           │  - File Upload        │  Mgmt   │
│  - Contact Details           │  - Document Viewer     │  - Roles│
│  - Banking Setup             │  - Version Control     │  - Perms│
│  - Operating Hours           │  - Digital Signatures  │         │
├─────────────────────────────────────────────────────────────────┤
│                     API Layer (Edge Functions)                  │
├─────────────────────────────────────────────────────────────────┤
│  Business CRUD API   │  Document Processing  │  Authentication  │
│  Team Management API │  File Validation      │  Authorization   │
│  Banking Integration │  Backup & Recovery    │  Audit Logging   │
├─────────────────────────────────────────────────────────────────┤
│                    Database Layer (Supabase)                    │
├─────────────────────────────────────────────────────────────────┤
│  business_profiles  │  business_documents  │  team_members     │
│  business_contacts  │  document_versions   │  access_controls  │
│  banking_accounts   │  storage_buckets     │  audit_logs       │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema Design

### Core Tables

#### 1. business_profiles
```sql
CREATE TABLE business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Legal Information
  legal_name text NOT NULL,
  doing_business_as text,
  business_registration_number text,
  tax_identification_number text,
  business_type text, -- LLC, Corp, Partnership, Sole Proprietorship
  incorporation_state text,
  incorporation_date date,
  
  -- Basic Information
  display_name text NOT NULL,
  description text,
  industry text,
  business_category text,
  website_url text,
  
  -- Status and Settings
  status text DEFAULT 'active', -- active, inactive, suspended
  verification_status text DEFAULT 'pending', -- pending, verified, rejected
  profile_completion_percentage integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_business_type CHECK (business_type IN ('LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'Other')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended')),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected'))
);
```

#### 2. business_contacts
```sql
CREATE TABLE business_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Contact Information
  contact_type text NOT NULL, -- primary, billing, legal, technical
  
  -- Address
  street_address_1 text,
  street_address_2 text,
  city text,
  state_province text,
  postal_code text,
  country text DEFAULT 'US',
  
  -- Communication
  phone_number text,
  fax_number text,
  email_address text,
  
  -- Contact Person
  contact_person_name text,
  contact_person_title text,
  contact_person_phone text,
  contact_person_email text,
  
  -- Settings
  is_primary boolean DEFAULT false,
  is_public boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_contact_type CHECK (contact_type IN ('primary', 'billing', 'legal', 'technical', 'shipping'))
);
```

#### 3. business_banking
```sql
CREATE TABLE business_banking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Bank Information
  bank_name text NOT NULL,
  account_type text NOT NULL, -- checking, savings, business
  account_number_encrypted text, -- Encrypted
  routing_number text,
  account_holder_name text,
  
  -- Payment Processing
  payment_processor text, -- stripe, paypal, square
  processor_account_id text,
  processor_credentials_encrypted jsonb, -- Encrypted
  
  -- Status
  is_primary boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  verification_date timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_account_type CHECK (account_type IN ('checking', 'savings', 'business')),
  CONSTRAINT valid_payment_processor CHECK (payment_processor IN ('stripe', 'paypal', 'square', 'other'))
);
```

#### 4. business_operating_hours
```sql
CREATE TABLE business_operating_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Schedule
  day_of_week integer NOT NULL, -- 0 = Sunday, 6 = Saturday
  is_open boolean DEFAULT true,
  open_time time,
  close_time time,
  
  -- Special Hours
  is_24_hours boolean DEFAULT false,
  is_by_appointment boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
  UNIQUE(business_id, day_of_week)
);
```

#### 5. business_service_areas
```sql
CREATE TABLE business_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Geographic Information
  area_type text NOT NULL, -- city, state, country, postal_code, radius
  area_value text NOT NULL, -- specific value (e.g., "New York", "NY", "10001")
  radius_miles integer, -- for radius-based service areas
  
  -- Service Details
  service_description text,
  additional_fees numeric(10,2) DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_area_type CHECK (area_type IN ('city', 'state', 'country', 'postal_code', 'radius'))
);
```

#### 6. team_members
```sql
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Member Information
  email text NOT NULL,
  first_name text,
  last_name text,
  job_title text,
  department text,
  
  -- Access Control
  role text NOT NULL, -- owner, admin, manager, employee, contractor
  permissions jsonb DEFAULT '{}',
  
  -- Status
  status text DEFAULT 'pending', -- pending, active, inactive, suspended
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  last_active_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'manager', 'employee', 'contractor')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive', 'suspended'))
);
```

#### 7. business_documents
```sql
CREATE TABLE business_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Document Information
  document_type text NOT NULL,
  document_name text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  
  -- Storage
  storage_path text NOT NULL,
  storage_bucket text DEFAULT 'business-documents',
  
  -- Document Status
  status text DEFAULT 'pending', -- pending, approved, rejected, expired
  verification_status text DEFAULT 'unverified',
  
  -- Expiration
  expires_at timestamptz,
  reminder_sent_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  tags text[],
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('unverified', 'verified', 'rejected'))
);
```

#### 8. document_versions
```sql
CREATE TABLE document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES business_documents(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Version Information
  version_number integer NOT NULL DEFAULT 1,
  version_notes text,
  
  -- File Information
  file_name text NOT NULL,
  file_size bigint,
  storage_path text NOT NULL,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(document_id, version_number)
);
```

### Indexes and Performance

```sql
-- Business Profiles
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON business_profiles(status);
CREATE INDEX idx_business_profiles_verification_status ON business_profiles(verification_status);
CREATE INDEX idx_business_profiles_industry ON business_profiles(industry);

-- Business Contacts
CREATE INDEX idx_business_contacts_business_id ON business_contacts(business_id);
CREATE INDEX idx_business_contacts_type ON business_contacts(contact_type);
CREATE INDEX idx_business_contacts_primary ON business_contacts(business_id, is_primary);

-- Team Members
CREATE INDEX idx_team_members_business_id ON team_members(business_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);

-- Documents
CREATE INDEX idx_business_documents_business_id ON business_documents(business_id);
CREATE INDEX idx_business_documents_type ON business_documents(document_type);
CREATE INDEX idx_business_documents_status ON business_documents(status);
CREATE INDEX idx_business_documents_expires ON business_documents(expires_at);
```

## API Design

### Authentication & Authorization

#### Authentication Flow
1. User authenticates via Supabase Auth
2. JWT token contains user ID and role
3. Business access verified through team membership
4. Document access controlled by business membership and role

#### Permission Levels
- **Owner**: Full access to all business data and settings
- **Admin**: Full access except ownership transfer and deletion
- **Manager**: Read/write access to business data, limited team management
- **Employee**: Read access to business data, limited write access
- **Contractor**: Limited read access to specific documents/areas

### REST API Endpoints

#### Business Profile Management

```typescript
// GET /api/business-profiles
// List all business profiles for authenticated user
interface BusinessProfileListResponse {
  profiles: BusinessProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// GET /api/business-profiles/:id
// Get specific business profile
interface BusinessProfileResponse {
  profile: BusinessProfile
  permissions: UserPermissions
}

// POST /api/business-profiles
// Create new business profile
interface CreateBusinessProfileRequest {
  legal_name: string
  display_name: string
  business_type: string
  industry: string
  description?: string
}

// PUT /api/business-profiles/:id
// Update business profile
interface UpdateBusinessProfileRequest {
  legal_name?: string
  display_name?: string
  description?: string
  // ... other updatable fields
}
```

#### Contact Management

```typescript
// GET /api/business-profiles/:id/contacts
interface BusinessContactsResponse {
  contacts: BusinessContact[]
}

// POST /api/business-profiles/:id/contacts
interface CreateContactRequest {
  contact_type: 'primary' | 'billing' | 'legal' | 'technical' | 'shipping'
  street_address_1: string
  city: string
  state_province: string
  postal_code: string
  country: string
  phone_number?: string
  email_address?: string
}
```

#### Team Management

```typescript
// GET /api/business-profiles/:id/team
interface TeamMembersResponse {
  members: TeamMember[]
  invitations: TeamInvitation[]
}

// POST /api/business-profiles/:id/team/invite
interface InviteTeamMemberRequest {
  email: string
  role: 'admin' | 'manager' | 'employee' | 'contractor'
  permissions: Record<string, boolean>
  first_name?: string
  last_name?: string
  job_title?: string
}
```

#### Document Management

```typescript
// GET /api/business-profiles/:id/documents
interface DocumentsResponse {
  documents: BusinessDocument[]
  categories: DocumentCategory[]
}

// POST /api/business-profiles/:id/documents/upload
interface UploadDocumentRequest {
  document_type: string
  document_name: string
  file: File
  expires_at?: string
  tags?: string[]
}

// GET /api/business-profiles/:id/documents/:docId/download
// Returns signed URL for document download
```

### Edge Functions

#### 1. Business Profile Validation (`validate-business-profile`)
```typescript
export interface BusinessValidationRequest {
  business_id: string
  validation_type: 'legal' | 'financial' | 'operational' | 'complete'
}

export interface BusinessValidationResponse {
  is_valid: boolean
  validation_score: number
  issues: ValidationIssue[]
  recommendations: string[]
}
```

#### 2. Document Processing (`process-business-document`)
```typescript
export interface DocumentProcessingRequest {
  document_id: string
  processing_type: 'ocr' | 'validation' | 'extraction' | 'classification'
}

export interface DocumentProcessingResponse {
  processing_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  extracted_data?: Record<string, any>
  validation_results?: ValidationResult[]
}
```

#### 3. Banking Integration (`verify-banking-info`)
```typescript
export interface BankingVerificationRequest {
  business_id: string
  bank_account_id: string
  verification_method: 'micro_deposits' | 'instant' | 'manual'
}

export interface BankingVerificationResponse {
  verification_id: string
  status: 'pending' | 'verified' | 'failed'
  next_steps?: string[]
}
```

## Storage Architecture

### Supabase Storage Buckets

#### 1. business-documents
```typescript
// Bucket configuration
{
  id: 'business-documents',
  name: 'Business Documents',
  public: false,
  file_size_limit: 50 * 1024 * 1024, // 50MB
  allowed_mime_types: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

// File path structure
/business-documents/
  /{business_id}/
    /legal/
      /articles_of_incorporation.pdf
      /operating_agreement.pdf
    /financial/
      /bank_statements/
      /tax_returns/
    /licenses/
      /business_license.pdf
      /professional_licenses/
    /insurance/
      /general_liability.pdf
      /workers_comp.pdf
```

#### 2. business-avatars
```typescript
// Bucket configuration
{
  id: 'business-avatars',
  name: 'Business Profile Images',
  public: true,
  file_size_limit: 5 * 1024 * 1024, // 5MB
  allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
}

// File path structure
/business-avatars/
  /{business_id}/
    /logo.png
    /banner.jpg
    /gallery/
      /image_1.jpg
      /image_2.jpg
```

### File Access Policies

```sql
-- Business Documents Access Policy
CREATE POLICY "Users can access business documents if they are team members"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'business-documents' AND
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN business_profiles bp ON tm.business_id = bp.id
      WHERE bp.id::text = (storage.foldername(name))[1]
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- Business Avatars Access Policy  
CREATE POLICY "Users can manage business avatars if they are team members"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'business-avatars' AND
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN business_profiles bp ON tm.business_id = bp.id
      WHERE bp.id::text = (storage.foldername(name))[1]
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('owner', 'admin', 'manager')
    )
  );
```

## Security Implementation

### Row Level Security (RLS) Policies

```sql
-- Business Profiles RLS
CREATE POLICY "Users can manage business profiles if they are team members"
  ON business_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.business_id = business_profiles.id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- Team Members RLS
CREATE POLICY "Users can view team members of their businesses"
  ON team_members FOR SELECT
  USING (
    business_id IN (
      SELECT tm.business_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage team members"
  ON team_members FOR ALL
  USING (
    business_id IN (
      SELECT tm.business_id FROM team_members tm
      WHERE tm.user_id = auth.uid() 
      AND tm.status = 'active'
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Documents RLS
CREATE POLICY "Users can access documents of their businesses"
  ON business_documents FOR SELECT
  USING (
    business_id IN (
      SELECT tm.business_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );
```

### Data Encryption

#### Sensitive Data Fields
- Bank account numbers
- Payment processor credentials
- Tax identification numbers
- Social security numbers

#### Encryption Implementation
```typescript
// Encryption utility
import { createCipher, createDecipher } from 'crypto'

export class DataEncryption {
  private static readonly ALGORITHM = 'aes-256-cbc'
  private static readonly KEY = process.env.ENCRYPTION_KEY!

  static encrypt(text: string): string {
    const cipher = createCipher(this.ALGORITHM, this.KEY)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  static decrypt(encryptedText: string): string {
    const decipher = createDecipher(this.ALGORITHM, this.KEY)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
}
```

## Frontend Components Architecture

### Component Hierarchy

```
BusinessProfileSystem/
├── BusinessProfileDashboard/
│   ├── ProfileSummaryCard
│   ├── QuickActions
│   └── CompletionProgress
├── BusinessProfileForm/
│   ├── BasicInformation
│   ├── LegalInformation
│   ├── ContactInformation
│   └── OperatingHours
├── TeamManagement/
│   ├── TeamMembersList
│   ├── InviteTeamMember
│   ├── RolePermissions
│   └── AccessControls
├── DocumentManagement/
│   ├── DocumentUpload
│   ├── DocumentViewer
│   ├── DocumentCategories
│   └── ExpirationTracker
├── BankingSetup/
│   ├── BankAccountForm
│   ├── PaymentProcessorSetup
│   └── VerificationStatus
└── ServiceAreas/
    ├── GeographicCoverage
    ├── ServiceDescriptions
    └── PricingTiers
```

### State Management

```typescript
// Business Profile Context
interface BusinessProfileContextType {
  // Current business profile
  currentBusiness: BusinessProfile | null
  
  // Loading states
  loading: boolean
  saving: boolean
  
  // Data
  teamMembers: TeamMember[]
  documents: BusinessDocument[]
  contacts: BusinessContact[]
  
  // Actions
  updateBusinessProfile: (updates: Partial<BusinessProfile>) => Promise<void>
  inviteTeamMember: (invitation: TeamInvitation) => Promise<void>
  uploadDocument: (file: File, metadata: DocumentMetadata) => Promise<void>
  
  // Error handling
  errors: Record<string, string>
  clearError: (field: string) => void
}
```

### Form Validation

```typescript
// Validation schemas using Zod
const BusinessProfileSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required'),
  display_name: z.string().min(1, 'Display name is required'),
  business_type: z.enum(['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship']),
  tax_identification_number: z.string().regex(/^\d{2}-\d{7}$/, 'Invalid EIN format'),
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().max(1000, 'Description too long'),
})

const ContactSchema = z.object({
  contact_type: z.enum(['primary', 'billing', 'legal', 'technical', 'shipping']),
  street_address_1: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state_province: z.string().min(2, 'State/Province is required'),
  postal_code: z.string().min(5, 'Valid postal code required'),
  phone_number: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
})
```

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing with @testing-library/react-hooks
- Utility function testing with Jest
- Validation schema testing

### Integration Testing
- API endpoint testing
- Database operation testing
- File upload/download testing
- Authentication flow testing

### End-to-End Testing
- Complete business profile creation flow
- Team member invitation and management
- Document upload and management
- Multi-user collaboration scenarios

### Security Testing
- SQL injection prevention
- XSS protection
- File upload security
- Access control validation
- Data encryption verification

## Performance Considerations

### Database Optimization
- Proper indexing strategy
- Query optimization
- Connection pooling
- Pagination for large datasets

### Frontend Optimization
- Code splitting by feature
- Lazy loading of components
- Image optimization
- Caching strategies

### File Storage Optimization
- CDN integration
- File compression
- Progressive loading
- Thumbnail generation

## Deployment Architecture

### Environment Configuration
```typescript
// Environment variables
interface EnvironmentConfig {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ENCRYPTION_KEY: string
  STORAGE_BUCKET: string
  WEBHOOK_SECRET: string
}
```

### CI/CD Pipeline
1. Code commit triggers build
2. Run automated tests
3. Security scanning
4. Database migration checks
5. Deploy to staging
6. Integration testing
7. Deploy to production
8. Health checks

## Monitoring and Analytics

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring
- User behavior analytics
- API usage statistics

### Business Metrics
- Profile completion rates
- Document upload success rates
- Team collaboration metrics
- User engagement tracking

## Future Enhancements

### Phase 2 Features
- Advanced document OCR and data extraction
- Automated compliance checking
- Integration with government databases
- Advanced reporting and analytics

### Phase 3 Features
- Mobile application
- API marketplace
- Third-party integrations
- Machine learning insights

## Implementation Timeline

### Sprint 1 (2 weeks): Foundation
- Database schema implementation
- Basic authentication and authorization
- Core business profile CRUD operations

### Sprint 2 (2 weeks): Contact & Team Management
- Contact management system
- Team member invitation system
- Role-based access controls

### Sprint 3 (2 weeks): Document Management
- File upload infrastructure
- Document categorization
- Basic document viewer

### Sprint 4 (2 weeks): Banking & Operations
- Banking information management
- Operating hours configuration
- Service areas setup

### Sprint 5 (2 weeks): Polish & Testing
- UI/UX improvements
- Comprehensive testing
- Performance optimization
- Documentation completion

---

This technical specification provides the foundation for implementing a comprehensive business profile system that scales with user needs while maintaining security and performance standards.