# AEEG Practice Buddy - Content Protection Plan

## Overview
This document outlines the multi-layered content protection strategy for the AEEG Practice Buddy platform. The goal is to prevent unauthorized downloading, printing, exporting, or copying of protected question content while maintaining a smooth user experience.

## Protection Layers

### Layer 1: Network & API Security

| Protection | Implementation |
|-----------|---------------|
| **HTTPS** | All traffic encrypted via TLS/SSL |
| **JWT Authentication** | Every API request requires valid token |
| **Short-lived Tokens** | 7-day access tokens, 30-day refresh tokens |
| **Rate Limiting** | 100 requests/15min general, 20/15min auth |
| **CORS** | Restricted to known frontend origins |
| **Helmet Headers** | Security headers on all responses |

### Layer 2: Answer Key Protection

| Scenario | Protection |
|----------|-----------|
| Question list API | `correctAnswer` field excluded for non-staff |
| Single question API | `correctAnswer` stripped for students |
| Client-side code | No answer keys embedded in JS bundles |
| Question URLs | Non-predictable UUID-based IDs |
| Paginated results | No sequential question ID exposure |

### Layer 3: Practice Session Security

| Scenario | Protection |
|----------|-----------|
| Answer key reveal | Only after a student submits an attempt |
| Strategy display | Only after 1st attempt (correct or incorrect) |
| Full explanation | Only after 2nd incorrect attempt |
| Bulk download | API limited to 50 questions per request |
| Answer validation | Server-side only (no client-side check) |

### Layer 4: Browser Protections (Web)

| Protection | Implementation |
|-----------|---------------|
| Right-click | Prevented via contextmenu event |
| Print (Ctrl+P) | Blocked via beforeinput event |
| Text selection | Disabled in protected areas via CSS |
| Copy/paste | Prevented via clipboard events |
| Drag and drop | Blocked in question panels |
| Browser cache | Short-lived cache headers |
| DevTools | Discouraged (watermark visible) |

### Layer 5: Android Protections

| Protection | Implementation |
|-----------|---------------|
| Screenshots | FLAG_SECURE where supported |
| App switcher | Content hidden from recent apps preview |
| Storage | Encrypted storage only (RNEncryptedStorage) |
| Root detection | Warning on compromised devices |
| Sharing | No share intents from protected content |
| Clipboard | Clipboard cleared on app background |

### Layer 6: iOS Protections

| Protection | Implementation |
|-----------|---------------|
| App switcher | Content hidden via iOS privacy settings |
| Screenshots | Not preventable, but tracked via analytics |
| Copy/paste | Restricted in protected WebView areas |
| File sharing | No document picker for question files |
| Clipboard | Cleared on app background |

### Layer 7: Windows Protections

| Protection | Implementation |
|-----------|---------------|
| Print | Blocked via Electron window handlers |
| Save as | Blocked via context menu disabling |
| DevTools | Disabled in production builds |
| Kiosk mode | Full-screen with restricted navigation |
| Cache | Cleared on app close |
| Local storage | Encrypted session data |

### Layer 8: User-Specific Watermarking

Every protected question display includes:
- Student name or username overlay
- Session ID reference
- Timestamp
- Opacity: 15% (visible but not distracting)

Watermark is rendered server-side as an SVG overlay applied to question display containers.

### Layer 9: Monitoring & Detection

| Detection | Implementation |
|-----------|---------------|
| **Rate limiting** | Prevents bulk scraping |
| **Suspicious patterns** | Rapid-fire question requests flagged |
| **Concurrent sessions** | Same question across devices detected |
| **Abnormal timing** | Questions answered too quickly flagged |
| **Access logs** | All API requests logged with user, IP, timestamp |
| **Admin alerts** | Suspicious activity triggers notification |

### Layer 10: Legal & Terms

- Terms of Use prohibit content reproduction
- Every session displays "© AEEG - Do Not Reproduce"
- Account termination for policy violations
- Administrative ability to suspend accounts

## Important Limitation
No technical protection can prevent a student from:
- Taking a photograph of the screen with another device
- Memorizing questions and reproducing them later
- Writing down answers manually

Therefore, the system combines technical restrictions with:
- User-specific watermarking
- Session logging and auditing
- Content rotation (questions cycled regularly)
- Access controls and seat limits
- Terms of use enforcement
- Administrative oversight

## Implementation Priority

1. **High Priority** (Phase 1):
   - JWT authentication on all endpoints
   - Answer key protection in API responses
   - Rate limiting
   - HTTPS enforcement

2. **Medium Priority** (Phase 2):
   - Browser right-click/print/copy prevention
   - Android FLAG_SECURE
   - Content watermarking
   - Session auditing

3. **Low Priority** (Phase 3):
   - Root/jailbreak detection
   - Device fingerprinting
   - AI-based anomaly detection
   - Dynamic watermark rotation