# FIDELIS CONSULTING GROUP
## Database Schema v1.0

---

### 1. ENTITY RELATIONSHIP OVERVIEW

```
Schools ──1:N──> Users
Schools ──1:N──> Departments
Schools ──1:N──> Subscriptions
Users ──1:N──> WorkshopEnrollments
Users ──1:N──> CourseEnrollments
Users ──1:N──> Certificates
Users ──1:N──> AIUsage
Users ──1:N──> Submissions
Roles ──N:N──> Permissions
FeatureFlags ──N:N──> Entities (schools, plans, users)
Workshops ──1:N──> WorkshopMaterials
Courses ──1:N──> CourseModules
Resources ──N:N──> Tags
AuditLog ──*> Schools/Users
```

### 2. COMPLETE TABLE DEFINITIONS

```sql
-- ============================================
-- TENANCY & ORGANIZATION
-- ============================================

CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    country         VARCHAR(100),
    city            VARCHAR(100),
    curriculum      VARCHAR(50),       -- 'IGCSE', 'IB', 'American', 'British', 'Other'
    teacher_count   INTEGER DEFAULT 0,
    english_teacher_count INTEGER DEFAULT 0,
    contact_person  VARCHAR(255),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(50),
    pd_interests    TEXT[],            -- array of interest tags
    consultancy_interests TEXT[],
    ai_interests    TEXT[],
    status          VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'suspended', 'archived'
    timezone        VARCHAR(50) DEFAULT 'UTC',
    locale          VARCHAR(10) DEFAULT 'en',
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    name_ar         VARCHAR(255),        -- Arabic name
    subject         VARCHAR(100),        -- 'English', 'Math', 'Science', etc.
    head_user_id    UUID,                -- FK to users, set after creation
    teacher_count   INTEGER DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    email_verified  TIMESTAMPTZ,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    full_name_ar    VARCHAR(255),        -- Arabic name
    school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    subject         VARCHAR(100),
    curriculum      VARCHAR(50),
    grade_levels    VARCHAR(100)[],
    country         VARCHAR(100),
    years_experience INTEGER DEFAULT 0,
    interface_language VARCHAR(10) DEFAULT 'en',   -- 'en' or 'ar'
    output_language    VARCHAR(10) DEFAULT 'en',   -- 'en' or 'ar'
    avatar_url      VARCHAR(500),
    job_title       VARCHAR(255),
    phone           VARCHAR(50),
    is_active       BOOLEAN DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(500) UNIQUE NOT NULL,
    device_info     JSONB DEFAULT '{}',
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(500) UNIQUE NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROLES & PERMISSIONS
-- ============================================

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) UNIQUE NOT NULL,   -- 'admin', 'school_admin', 'hod', 'teacher', 'independent_teacher', 'workshop_participant'
    display_name    VARCHAR(100),
    display_name_ar VARCHAR(100),
    description     TEXT,
    is_system       BOOLEAN DEFAULT false,          -- system roles cannot be deleted
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(100) UNIQUE NOT NULL,   -- 'ai:lesson-planner', 'workshops:create', 'admin:users', etc.
    display_name    VARCHAR(255),
    display_name_ar VARCHAR(255),
    category        VARCHAR(50),                   -- 'ai', 'workshops', 'admin', 'subscription', 'future'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    school_id       UUID REFERENCES schools(id) ON DELETE CASCADE,  -- NULL = global
    assigned_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id, COALESCE(school_id, '00000000-0000-0000-0000-000000000000'))
);

-- ============================================
-- SUBSCRIPTIONS & FEATURE FLAGS
-- ============================================

CREATE TABLE subscription_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    name_ar         VARCHAR(100),
    code            VARCHAR(50) UNIQUE NOT NULL,   -- 'teacher_basic', 'teacher_pro', 'teacher_unlimited', 'school_starter', 'school_pro', 'school_enterprise', 'custom'
    type            VARCHAR(20) NOT NULL,          -- 'teacher' or 'school'
    description     TEXT,
    description_ar  TEXT,
    price_monthly   DECIMAL(10,2),
    price_yearly    DECIMAL(10,2),
    currency        VARCHAR(3) DEFAULT 'USD',
    max_teachers    INTEGER,                       -- NULL = unlimited
    is_active       BOOLEAN DEFAULT true,
    sort_order      INTEGER DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plan_features (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    value           JSONB DEFAULT 'true',          -- can be boolean, number (quota), or object
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    plan_id         UUID NOT NULL REFERENCES subscription_plans(id),
    status          VARCHAR(20) DEFAULT 'active',  -- 'active', 'trialing', 'past_due', 'cancelled', 'expired'
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id     VARCHAR(255),
    current_period_start   TIMESTAMPTZ,
    current_period_end     TIMESTAMPTZ,
    trial_ends_at          TIMESTAMPTZ,
    cancel_at_period_end   BOOLEAN DEFAULT false,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_flags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(100) UNIQUE NOT NULL,  -- 'module:student-portal', 'ai:lesson-planner', 'feature:bulk-grading'
    name            VARCHAR(255),
    name_ar         VARCHAR(255),
    description     TEXT,
    category        VARCHAR(50),                   -- 'module', 'ai_tool', 'dashboard', 'report', 'permission'
    is_global       BOOLEAN DEFAULT false,         -- global on/off regardless of plan
    default_value   JSONB DEFAULT 'false',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_flag_overrides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id         UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    entity_type     VARCHAR(20) NOT NULL,          -- 'school', 'plan', 'user'
    entity_id       UUID NOT NULL,
    value           JSONB NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI TOOLS & USAGE
-- ============================================

CREATE TABLE ai_tools (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(100) UNIQUE NOT NULL,  -- 'lesson-planner', 'quiz-builder', etc.
    name            VARCHAR(255) NOT NULL,
    name_ar         VARCHAR(255),
    description     TEXT,
    description_ar  TEXT,
    category        VARCHAR(50) NOT NULL,          -- 'planning', 'teaching', 'resource', 'assessment', 'feedback', 'communication', 'pd', 'leadership'
    icon            VARCHAR(50),                   -- lucide icon name
    route           VARCHAR(255),                  -- /app/tools/lesson-planner
    prompt_template TEXT,                          -- base prompt template
    default_model   VARCHAR(100),                  -- openrouter model
    fallback_model  VARCHAR(100),                  -- cheaper fallback
    cost_per_call   DECIMAL(10,6),                 -- estimated cost
    is_active       BOOLEAN DEFAULT true,
    sort_order      INTEGER DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_usage_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id       UUID REFERENCES schools(id),
    tool_id         UUID NOT NULL REFERENCES ai_tools(id),
    model_used      VARCHAR(100),
    input_tokens    INTEGER,
    output_tokens   INTEGER,
    cost            DECIMAL(10,6),
    latency_ms      INTEGER,
    success         BOOLEAN DEFAULT true,
    error_message   TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_credits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id       UUID REFERENCES schools(id),
    total_credits   INTEGER DEFAULT 0,
    used_credits    INTEGER DEFAULT 0,
    reset_period    VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly', 'never'
    reset_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFESSIONAL DEVELOPMENT
-- ============================================

CREATE TABLE workshops (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    title_ar        VARCHAR(255),
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    description_ar  TEXT,
    track           VARCHAR(50) NOT NULL,          -- 'english-teaching' or 'ai-for-educators'
    type            VARCHAR(50) DEFAULT 'workshop', -- 'workshop', 'course', 'webinar'
    duration_hours  DECIMAL(4,1),
    level           VARCHAR(20) DEFAULT 'all',     -- 'beginner', 'intermediate', 'advanced', 'all'
    price           DECIMAL(10,2),
    currency        VARCHAR(3) DEFAULT 'USD',
    max_participants INTEGER,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    is_published    BOOLEAN DEFAULT false,
    thumbnail_url   VARCHAR(500),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workshop_materials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id     UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,          -- 'slide', 'workbook', 'template', 'resource', 'video', 'assignment'
    title           VARCHAR(255),
    title_ar        VARCHAR(255),
    file_url        VARCHAR(500),
    file_type       VARCHAR(50),
    file_size       INTEGER,
    sort_order      INTEGER DEFAULT 0,
    is_downloadable BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workshop_enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workshop_id     UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'enrolled', -- 'enrolled', 'in-progress', 'completed', 'cancelled'
    progress        DECIMAL(5,2) DEFAULT 0,
    completed_at    TIMESTAMPTZ,
    certificate_id  UUID REFERENCES certificates(id),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    title_ar        VARCHAR(255),
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    description_ar  TEXT,
    track           VARCHAR(50),
    duration_hours  DECIMAL(4,1),
    level           VARCHAR(20),
    price           DECIMAL(10,2),
    is_published    BOOLEAN DEFAULT false,
    thumbnail_url   VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_modules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    title_ar        VARCHAR(255),
    content         TEXT,
    content_ar      TEXT,
    content_type    VARCHAR(50) DEFAULT 'text',    -- 'text', 'video', 'quiz', 'assignment'
    video_url       VARCHAR(500),
    duration_minutes INTEGER,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'enrolled',
    progress        DECIMAL(5,2) DEFAULT 0,
    completed_at    TIMESTAMPTZ,
    certificate_id  UUID REFERENCES certificates(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CERTIFICATES
-- ============================================

CREATE TABLE certificates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    title_ar        VARCHAR(255),
    type            VARCHAR(20) NOT NULL,          -- 'workshop', 'course'
    reference_id    UUID,                          -- workshop_id or course_id
    certificate_url VARCHAR(500),
    issued_at       TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}'
);

-- ============================================
-- RESOURCES
-- ============================================

CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    title_ar        VARCHAR(255),
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    description_ar  TEXT,
    content_type    VARCHAR(50) NOT NULL,          -- 'template', 'guide', 'download', 'video', 'article'
    file_url        VARCHAR(500),
    file_type       VARCHAR(50),
    file_size       INTEGER,
    is_free         BOOLEAN DEFAULT true,
    is_published    BOOLEAN DEFAULT false,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) UNIQUE NOT NULL,
    name_ar         VARCHAR(50)
);

CREATE TABLE resource_tags (
    resource_id     UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- ============================================
-- BLOG & SEO
-- ============================================

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    title_ar        VARCHAR(255),
    slug            VARCHAR(255) UNIQUE NOT NULL,
    excerpt         TEXT,
    excerpt_ar      TEXT,
    content         TEXT NOT NULL,
    content_ar      TEXT,
    author_id       UUID REFERENCES users(id),
    featured_image  VARCHAR(500),
    category        VARCHAR(50),
    tags            TEXT[],
    is_published    BOOLEAN DEFAULT false,
    published_at    TIMESTAMPTZ,
    seo_title       VARCHAR(60),
    seo_description VARCHAR(160),
    seo_og_image    VARCHAR(500),
    canonical_url   VARCHAR(500),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTACT & INQUIRIES
-- ============================================

CREATE TABLE contact_inquiries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    company         VARCHAR(255),
    subject         VARCHAR(255),
    message         TEXT NOT NULL,
    inquiry_type    VARCHAR(50),                   -- 'consultancy', 'pd', 'ai', 'general', 'partnership'
    status          VARCHAR(20) DEFAULT 'new',     -- 'new', 'read', 'replied', 'archived'
    assigned_to     UUID REFERENCES users(id),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    school_id       UUID REFERENCES schools(id),
    action          VARCHAR(100) NOT NULL,         -- 'user.created', 'subscription.changed', 'ai.used', etc.
    entity_type     VARCHAR(50),
    entity_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUTURE MODULES (Tables created but unused)
-- ============================================

-- These tables are fully designed but will ONLY be populated
-- when their corresponding feature flag is enabled.

CREATE TABLE student_portal_students ( /* future */ );
CREATE TABLE parent_portal_parents ( /* future */ );
CREATE TABLE timetables ( /* future */ );
CREATE TABLE attendance_records ( /* future */ );
CREATE TABLE ocr_submissions ( /* future */ );
CREATE TABLE grading_assignments ( /* future */ );
CREATE TABLE school_analytics ( /* future */ );
CREATE TABLE accreditation_evidence ( /* future */ );
CREATE TABLE hr_employees ( /* future */ );
CREATE TABLE recruitment_applications ( /* future */ );
CREATE TABLE lms_courses ( /* future */ );
CREATE TABLE finance_transactions ( /* future */ );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_ai_usage_user ON ai_usage_log(user_id, created_at);
CREATE INDEX idx_ai_usage_school ON ai_usage_log(school_id, created_at);
CREATE INDEX idx_ai_usage_tool ON ai_usage_log(tool_id, created_at);
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at);
CREATE INDEX idx_audit_log_school ON audit_log(school_id, created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(is_published, published_at);
CREATE INDEX idx_workshops_track ON workshops(track, is_published);
CREATE INDEX idx_enrollments_user ON workshop_enrollments(user_id);
CREATE INDEX idx_enrollments_workshop ON workshop_enrollments(workshop_id);
CREATE INDEX idx_subscriptions_school ON subscriptions(school_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_flag_overrides ON feature_flag_overrides(entity_type, entity_id);
CREATE INDEX idx_plan_features ON plan_features(plan_id);
CREATE INDEX idx_role_permissions ON role_permissions(role_id);
CREATE INDEX idx_user_roles ON user_roles(user_id);
```

### 3. SEED DATA

**System Roles:**
- `admin` — Full system access
- `school_admin` — School-level management
- `hod` — Department management + selected AI tools
- `teacher` — AI tools + workshops
- `independent_teacher` — AI tools only (no school affiliation)
- `workshop_participant` — Workshop access only

**Initial Feature Flags (all disabled by default):**
- `module:student-portal`
- `module:parent-portal`
- `module:timetables`
- `module:attendance`
- `module:ocr-handwriting`
- `module:bulk-grading`
- `module:school-analytics`
- `module:accreditation`
- `module:hr`
- `module:recruitment`
- `module:lms`
- `module:finance`
- `module:mobile-app`

**Initial AI Tool Feature Flags (enabled by default for appropriate plans):**
- `ai:lesson-planner` through `ai:dept-improvement-planner` — 22 tools total