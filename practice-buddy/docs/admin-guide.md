# AEEG Practice Buddy - Administrator Guide

## Getting Started as Administrator

### 1. First Login
1. Navigate to your AEEG website at `/practice-buddy`
2. Sign in with your administrator credentials
3. Click the **Admin** tab in the navigation bar

### 2. Dashboard Overview
The admin dashboard provides:
- **Total Users** - Active accounts on the platform
- **Published Questions** - Approved questions available for practice
- **Practice Sessions** - Total sessions completed
- **Active Today** - Users practicing right now

### 3. Managing Content

#### Viewing Questions
- Navigate to the **Questions** tab
- Use filters to find questions by category, difficulty, or status
- Click a question to view its full details

#### Adding Questions
Click the "**+ Add Question**" button to create a new question:
1. Select the exam, subject, domain, category, and subcategory
2. Enter the question stem (HTML supported)
3. Add answer options (for multiple choice)
4. Set the correct answer
5. Add strategy text (displayed after 1st attempt)
6. Add hints, explanations, and rationales
7. Set difficulty level
8. Set calculator permissions
9. Add optional passages, figures, or tables
10. Save as draft for review

#### Question Workflow
```
Draft → Editorial Review → Technical Review → Accessibility Review → Approved → Published
```

Each new question goes through an editorial workflow:
1. **Draft** - Initial creation by curriculum editor
2. **Editorial Review** - Content accuracy review
3. **Technical Review** - Math notation, formatting check
4. **Accessibility Review** - Alt text, keyboard navigation
5. **Approved** - Ready for scheduling
6. **Published** - Available to students

### 4. Managing Content Hierarchy

The platform supports adding new:
- **Exams** (ACT, EST, IELTS, TOEFL, etc.)
- **Subjects** (Reading, Writing, Math, Science)
- **Domains** (Algebra, Geometry, Craft & Structure)
- **Categories** (Linear Equations, Words in Context)
- **Subcategories** (Textual Evidence, Quadratic Functions)

Use the **Exams** tab to create and manage the hierarchy.

### 5. User Management

From the **Users** tab:
- View all users with their roles
- Search by username, email, or display name
- Edit user details and roles
- Activate or suspend accounts
- Reset passwords

**Roles:**
| Role | Permissions |
|------|------------|
| Student | Practice, view own progress |
| Teacher | Classes, assignments, student management |
| Curriculum Editor | Question creation and editing |
| Content Reviewer | Question review and approval |
| Administrator | Full content and user management |
| Super Administrator | All including audit logs |

### 6. Access Codes

Access codes control premium feature access:
- **Generate** codes from the **Codes** tab
- Set code type (single-use, multi-use, trial, premium)
- Set expiration dates and usage limits
- View redemption history
- Revoke codes when needed

### 7. Question Flags

Students can report issues with questions:
- Navigate to the **Flags** tab
- Review reported issues
- **Resolve** (fix the issue) or **Dismiss** (no action needed)
- Track flag resolution history

### 8. Subscription Plans

Manage subscription tiers from the API (admin dashboard in development):
- Create plans with configurable features
- Set student limits
- Assign seats to users
- Track seat usage

**Available Plans:**
| Plan | Max Students | Price |
|------|-------------|-------|
| Student Basic | 1 | Free |
| Student Premium | 1 | $14.99/mo |
| Teacher Starter | 10 | $29.99/mo |
| Teacher Standard | 25 | $49.99/mo |
| Teacher Pro | 50 | $99.99/mo |
| Parent Plan | 1 | $9.99/mo |
| Parent Family | 3 | $19.99/mo |
| School License | 200 | $999/yr |

### 9. Reporting and Analytics

- **Admin Analytics**: Platform-wide usage statistics
- **Teacher Reports**: Class and student performance
- **Student Reports**: Individual progress and mastery

### 10. Content Protection Guidelines

- Questions are delivered with **no answer keys** to students
- Strategies and explanations require an answered attempt
- All API requests require authentication
- Rate limiting prevents scraping
- Audit logging tracks all admin actions
- Future enhancements will add watermarking

### 11. Adding New Content Without Code Changes

**You do NOT need to:**
- Edit any application code
- Publish a new app version
- Rebuild the website
- Access the database directly

**You DO need to:**
1. Use the admin dashboard's question editor
2. Set the publication status to "Active"
3. Questions are automatically available across all platforms

### 12. Troubleshooting

**Question not appearing for students?**
- Check publication status is "Active"
- Verify the question has a valid category
- Check if filters are hiding it

**Student can't log in?**
- Verify account is active
- Reset password from user management
- Check account lockout status

**Analytics not updating?**
- Results update after each completed session
- Mastery requires multiple attempts per skill
- Allow 24 hours for historical reports