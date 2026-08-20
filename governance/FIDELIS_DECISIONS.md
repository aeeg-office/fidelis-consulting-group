# Fidelis Consulting Group — Architecture & Project Decisions

## Decision Log

### ADR-001: M2 as Canonical Project Authority
- **Date:** 2026-08-20
- **Status:** ACCEPTED
- **Context:** All prior Fidelis Consulting Group work was fragmented across Telegram, machine-specific sessions, and undocumented. No single source of truth existed for project state, defects, or architecture decisions.
- **Decision:** The Fidelis Consulting Group bot on M2 (AsusSilver) is the canonical persistent project context for all fidelisconsultingroup.com work. No task from any origin executes before synchronizing with M2.
- **Rationale:** Single source of truth prevents fragmented project history, duplicate repairs, conflicting edits, and stale architecture assumptions across 6 fleet machines + Telegram.
- **Consequences:** All originating machines/Telegram must route through M2 before execution. M2 assumes orchestration, architecture, integration, and deployment authority.

### ADR-002: All Tasks Route Through M2 Before Execution
- **Date:** 2026-08-20
- **Status:** ACCEPTED
- **Context:** Prior to this governance, Telegram-initiated or fleet-machine-initiated work could execute without canonical context, creating disconnected project history and potential conflicts.
- **Decision:** Every FCG task from any origin (M1, M3-M6, Telegram, A2A) must synchronize with M2 canonical context before execution. M2 returns a scoped execution task.
- **Rationale:** Prevents isolated or conflicting changes. Ensures every worker has current production state, defect ledger, and workstream locks.
- **Consequences:** Additional latency for cross-machine task initiation. Requires A2A synchronization between M2 and fleet nodes.

### ADR-003: Persistent State Files as Durable Recovery
- **Date:** 2026-08-20
- **Status:** ACCEPTED
- **Context:** Hermes context compression and machine restarts can lose conversational project context. Prior state only existed in chat history.
- **Decision:** 8 canonical state files (`FIDELIS_CONSULTING_PROJECT_STATE.md`, `FIDELIS_ACTIVE_WORKSTREAMS.md`, `FIDELIS_DEFECT_LEDGER.md`, `FIDELIS_TEST_STATE.md`, `FIDELIS_DEPLOYMENT_STATE.md`, `FIDELIS_DECISIONS.md`, `FIDELIS_CHANGELOG.md`, `FIDELIS_FLEET_STATUS.md`) are the durable recovery layer.
- **Rationale:** Survives context compression, restarts, machine handoffs. Can be loaded from disk to restore full project awareness.
- **Consequences:** Files must be maintained as authoritative. Bot must reload state after context compression/restart before accepting work.

### ADR-004: Defect Closure Requires Canonical Verification
- **Date:** 2026-08-20
- **Status:** ACCEPTED
- **Context:** Prior defects could be claimed "fixed" by one machine while another machine or production showed they remained broken.
- **Decision:** Only canonical verification (browser-level where user-facing, recorded in defect ledger with evidence) closes a defect. Machine claims of "fixed" do not close it. Telegram claims of "still broken" reopen it when reproduced.
- **Rationale:** Prevents premature closure, fragmented defect awareness, and reopened regressions.
- **Consequences:** Every user-facing repair requires browser-level verification. Defect ledger is authoritative — not machine-local assumptions.

### ADR-005: Mock Payment Provider Until Real Provider Selected
- **Date:** 2026-08-12
- **Status:** ACCEPTED
- **Context:** No payment provider was selected at the time of commercial platform development. Full entitlement lifecycle needed testing.
- **Decision:** Implement a pluggable `PaymentProvider` interface with a deterministic `MockProvider`. Config option `PAYMENT_PROVIDER` (default "mock"). Real adapter can be added later without touching entitlement logic.
- **Rationale:** Enables full entitlement lifecycle testing (active/trial/expired/past_due/canceled/unpaid) without a live provider. Production-safe with mock-only webhook.
- **Consequences:** Production currently runs on mock. Real provider integration must add server-side signature verification.

### ADR-006: Arabic/RTL Deferred
- **Date:** 2026-08-12
- **Status:** DEFERRED
- **Context:** Full Arabic/RTL support across all authenticated workspace flows is a cross-cutting concern touching next-intl on the app shell and all page components.
- **Decision:** Deferred to a dedicated phase after core commercial, security, and deployment readiness is complete.
- **Rationale:** Scope is large and touches nearly every UI component. Core functionality (workspaces, commercial, security) was higher priority.
- **Consequences:** Arabic/RTL remains incomplete. Owner has been informed of deferral. Must be scheduled as a future workstream.

### ADR-007: Cross-Project Isolation
- **Date:** 2026-08-20
- **Status:** ACCEPTED
- **Context:** FCG work may overlap with AEEG, Practice Buddy, Fidelis Auto, AI Trading, and AdSense domains. Contamination between projects would cause confusion.
- **Decision:** Each project remains a separate canonical bot/project with its own state files. If a task spans projects, M2 creates an explicit cross-project task and synchronizes only necessary shared information.
- **Rationale:** Prevents FCG work from affecting unrelated platforms and vice versa.
- **Consequences:** Cross-domain questions are routed to the appropriate specialist bot. State files remain project-specific.

---

## Decision Index

| ID | Title | Date | Status |
|----|-------|------|--------|
| ADR-001 | M2 as Canonical Project Authority | 2026-08-20 | ACCEPTED |
| ADR-002 | All Tasks Route Through M2 Before Execution | 2026-08-20 | ACCEPTED |
| ADR-003 | Persistent State Files as Durable Recovery | 2026-08-20 | ACCEPTED |
| ADR-004 | Defect Closure Requires Canonical Verification | 2026-08-20 | ACCEPTED |
| ADR-005 | Mock Payment Provider Until Real Provider Selected | 2026-08-12 | ACCEPTED |
| ADR-006 | Arabic/RTL Deferred | 2026-08-12 | DEFERRED |
| ADR-007 | Cross-Project Isolation | 2026-08-20 | ACCEPTED |

---

## Notes
- All architecture decisions are durable records — they exist in this file, not only in chat history.
- A new owner instruction that changes a previous decision must: record the decision, update acceptance criteria, update project state, and preserve the historical decision.
- Decisions are not silently overwritten.