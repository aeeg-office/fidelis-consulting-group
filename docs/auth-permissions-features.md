# FIDELIS CONSULTING GROUP
## Authentication, Permissions, Subscriptions & Feature Flags v1.0

---

### 1. AUTHENTICATION DESIGN

```
┌─────────────────────────────────────┐
│         AUTHENTICATION FLOW         │
├─────────────────────────────────────┤
│                                     │
│  REGISTER                           │
│  └─ School Admin Signup             │
│     └─ Pending Approval             │
│     └─ Approved → Full Access       │
│  └─ Teacher Signup                  │
│     └─ Link to School (optional)    │
│     └─ Email Verification           │
│     └─ Active immediately           │
│                                     │
│  LOGIN                              │
│  └─ Email + Password                │
│  └─ "Remember Me" (30-day session)  │
│  └─ Session token (JWT/opaque)      │
│                                     │
│  PASSWORD RESET                      │
│  └─ Request → Email link            │
│  └─ Token expires 1 hour            │
│  └─ Force re-login on all devices   │
│                                     │
│  EMAIL VERIFICATION                  │
│  └─ On registration                 │
│  └─ Resend cooldown: 60 seconds     │
│  └─ Required for AI tool access     │
│                                     │
│  FUTURE: 2FA                        │
│  └─ TOTP (Authenticator app)        │
│  └─ Recovery codes (10)             │
│  └─ Per-user enable/disable         │
│                                     │
└─────────────────────────────────────┘
```

**Auth Technology:** Auth.js (NextAuth) v5
- Credentials provider (email + password)
- Database sessions (not JWTs for platform — allows revocation)
- Session stored in `user_sessions` table
- CSRF protection via built-in NextAuth methods

### 2. PERMISSION MATRIX

| Permission Code | Admin | School Admin | HoD | Teacher | Ind. Teacher | Workshop Part. |
|----------------|-------|-------------|-----|---------|-------------|---------------|
| **AI TOOLS** | | | | | | |
| ai:lesson-planner | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:unit-planner | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:worksheet-builder | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:reading-passage | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:writing-prompts | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:quiz-builder | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:assessment-generator | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:rubric-builder | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:learning-objectives | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:success-criteria | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:homework-generator | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:differentiation | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:exit-tickets | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:parent-letter | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:professional-email | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:meeting-agenda | ✓ | ✓ | ✓ | – | – | – |
| ai:dept-report | ✓ | ✓ | ✓ | – | – | – |
| ai:dept-improvement | ✓ | ✓ | ✓ | – | – | – |
| ai:writing-feedback | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:grammar-analysis | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| ai:student-feedback | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| **WORKSHOPS** | | | | | | |
| workshops:view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| workshops:enroll | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| workshops:create | ✓ | – | – | – | – | – |
| workshops:edit | ✓ | – | – | – | – | – |
| workshops:delete | ✓ | – | – | – | – | – |
| **ADMIN** | | | | | | |
| admin:users | ✓ | ✓ | – | – | – | – |
| admin:schools | ✓ | – | – | – | – | – |
| admin:subscriptions | ✓ | ✓ | – | – | – | – |
| admin:content | ✓ | – | – | – | – | – |
| admin:features | ✓ | – | – | – | – | – |
| admin:audit | ✓ | – | – | – | – | – |
| admin:reports | ✓ | ✓ | ✓ | – | – | – |
| admin:ai-usage | ✓ | ✓ | ✓ | – | – | – |
| **FUTURE MODULES** | | | | | | |
| module:students | ✓ | FF | FF | – | – | – |
| module:parents | ✓ | FF | – | – | – | – |
| module:timetables | ✓ | FF | FF | FF | – | – |
| module:attendance | ✓ | FF | FF | FF | – | – |
| module:ocr-grading | ✓ | FF | FF | FF | – | – |
| module:analytics | ✓ | FF | FF | – | – | – |
| module:accreditation | ✓ | FF | – | – | – | – |
| module:hr | ✓ | – | – | – | – | – |
| module:recruitment | ✓ | FF | – | – | – | – |
| module:lms | ✓ | FF | FF | FF | – | – |
| module:finance | ✓ | – | – | – | – | – |

✓ = Always granted by role
FF = Controlled by feature flag (school-level override)
– = Not available

### 3. SUBSCRIPTION TIERS

**Teacher Plans (Individual):**

| Feature | Basic ($9/mo) | Professional ($19/mo) | Unlimited ($39/mo) |
|---------|--------------|---------------------|-------------------|
| AI Tools | 5 core tools | 15 tools | All 22 tools |
| Monthly AI Calls | 500 | 2,000 | Unlimited |
| Workshops | – | 1 free/mo | All included |
| Certificates | – | ✓ | ✓ |
| Resources | Free only | All downloads | All downloads |
| Email Support | – | ✓ | Priority |
| Language Support | 1 language | Both EN/AR | Both EN/AR |

**School Plans (Bulk):**

| Feature | Starter ($5/teacher/mo) | Professional ($12/teacher/mo) | Enterprise (Custom) |
|---------|------------------------|-----------------------------|-------------------|
| Min Teachers | 5 | 10 | 50+ |
| AI Tools | 10 tools | All 22 tools | All 22 + custom |
| Monthly AI Calls | 1,000/teacher | 5,000/teacher | Custom |
| Workshops | 50% discount | Free access | Free + custom |
| School Dashboard | ✓ | ✓ | ✓ |
| Admin Reports | Basic | Advanced | Full analytics |
| AI Usage Analytics | – | ✓ | ✓ + Export |
| API Access | – | – | ✓ |
| Dedicated Support | – | – | ✓ |
| SSO / SAML | – | – | ✓ |
| Custom Branding | – | – | ✓ |
| Priority Feature Access | – | – | ✓ |

### 4. FEATURE FLAG SYSTEM

```
           ┌──────────────────┐
           │ GLOBAL FEATURE   │
           │ FLAG (Admin)     │
           │ ON / OFF / BETA  │
           └────────┬─────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
   ┌─────▼─────┐        ┌─────▼─────┐
   │ PLAN-LEVEL │        │ SCHOOL-   │
   │ OVERRIDE   │        │ LEVEL     │
   │ (default)  │        │ OVERRIDE  │
   └─────┬─────┘        └─────┬─────┘
         │                     │
         └──────────┬──────────┘
                    │
              ┌─────▼─────┐
              │ USER-LEVEL │
              │ OVERRIDE   │
              │ (debug)    │
              └───────────┘

Resolution Order (first match wins):
  1. User-level override (admin debug tools)
  2. School-level override (school admin)
  3. Plan-level default (subscription plan features)
  4. Global feature flag default
```

**Flag Resolution Function:**

```typescript
async function resolveFeatureFlag(
  flagCode: string,       // e.g. 'module:student-portal'
  userId?: string,        // optional user context
  schoolId?: string,      // optional school context
  planId?: string         // optional plan context
): Promise<FlagValue> {
  // 1. Check user override
  if (userId) {
    const userOverride = await db.featureFlagOverride.findUnique({
      where: { flagId_entityType_entityId: {
        flagId: flagCode, entityType: 'user', entityId: userId
      }}
    });
    if (userOverride) return userOverride.value;
  }
  
  // 2. Check school override
  if (schoolId) {
    const schoolOverride = await db.featureFlagOverride.findUnique({
      where: { flagId_entityType_entityId: {
        flagId: flagCode, entityType: 'school', entityId: schoolId
      }}
    });
    if (schoolOverride) return schoolOverride.value;
  }
  
  // 3. Check plan default
  if (planId) {
    const planFeature = await db.planFeatures.findUnique({
      where: { planId_featureFlagId: { planId, featureFlagId: flagCode }}
    });
    if (planFeature) return planFeature.value;
  }
  
  // 4. Return global default
  const globalFlag = await db.featureFlag.findUnique({
    where: { code: flagCode }
  });
  return globalFlag?.defaultValue ?? false;
}
```

### 5. RBAC IMPLEMENTATION

```typescript
// Middleware pattern for API route protection

async function requirePermission(
  permissionCode: string,
  userId: string,
  schoolId?: string
): Promise<boolean> {
  const userRoles = await db.userRoles.findMany({
    where: { userId },
    include: { role: { include: { permissions: {
      include: { permission: true }
    }}}}
  });
  
  return userRoles.some(ur =>
    ur.role.permissions.some(rp =>
      rp.permission.code === permissionCode ||
      rp.permission.code === 'admin:*'
    )
  );
}

// Next.js middleware for route protection
// /app/* routes check authentication + basic role
// /app/admin/* routes check admin:* permission
// /app/tools/* check specific AI tool permission
```

### 6. NAVIGATION FILTERING

All navigation is dynamically filtered based on role + feature flags. The same dashboard component is used for all roles — it simply queries the user's permissions and renders available items.

```typescript
interface NavItem {
  label: string;
  label_ar: string;
  href: string;
  icon: string;
  permission?: string;      // Required permission
  featureFlag?: string;     // Required feature flag
  badge?: string;           // 'new', 'beta', 'soon'
}
```