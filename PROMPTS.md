# Prompts: Surface, Explore, Record
## Panduan Bina App Baru — Paste Berperingkat

**Cara guna:**
1. Gantikan `[APP NAME]` dengan nama app kau
2. Gantikan `[SHORT DESCRIPTION]` dengan penerangan ringkas (contoh: "app pengurusan tugas untuk pasukan kecil")
3. Paste prompt satu persatu mengikut turutan episod
4. Tunggu AI siapkan setiap bahagian sebelum teruskan ke prompt seterusnya

---

## EPISOD 01 — Business Decisions (Keputusan Peringkat Idea)

### Prompt 1.1 — Senarai keputusan business
```
I'm building an app named [APP NAME] that [SHORT DESCRIPTION]. Our goal in this session is to create a business level / idea document as a Business Requirements Document (BRD). To start with, show me a list of business level / idea level decisions that I should make before we build the BRD.
```

### Prompt 1.2 — Cipta fail keputusan
```
Create decision records in /docs/business/decisions for each of these decisions along with a decision index file. Each decision record should include exactly one question to be answered. If a decision topic includes multiple questions, then split that topic into multiple files with exactly one non-compound question per file. Later, we will go through each decision record one by one to make the decision.
```

### Prompt 1.3 — Tambah accessibility & localization
```
Add some decisions related to accessibility and localization.
```

### Prompt 1.4 — Susun semula urutan keputusan
```
Review the decision records in order to determine if they are in the correct order for us to address. If you rearrange them, change the number in the filename, and also update the index file.
```

### Prompt 1.5 — Buat keputusan satu persatu
```
Step through each decision record one by one. For each decision, tell me the options. For each option, include strengths/weaknesses/tradeoffs. After the options, tell me your recommendation with an explanation. Then tell me any assumptions that you used. Once I make a decision, record the decision in the decision records and index file, and ask me if I'm ready to proceed to the next decision record.
```

---

## EPISOD 02 — Business Requirements Document (BRD)

### Prompt 2.1 — Semak apa lagi perlu sebelum buat BRD
```
Review the business decision records in /docs/business/decisions/ I plan to create a Business Requirements Document. Besides the decision records, what additional information should I gather in order to create the BRD?
```

### Prompt 2.2 — Cipta user journeys
```
This app is for [PURPOSE — e.g., demonstration purposes / production use]. Based on that, create some general user journeys and use cases and put them in a markdown document in /docs/business.
```

### Prompt 2.3 — Cipta BRD
```
Please create the Business Requirements Document based on the decision records, the user journey document, and general information. Put the BRD in /docs/business/business-requirements-document.md
```

### Prompt 2.4 — Cipta business overview
```
Please create a business overview document that starts with the elevator pitch, then gives an overview of [APP NAME]. This document should be non-technical and more narrative form. Create this document in markdown format and put it in the /docs/business folder.
```

---

## EPISOD 03 — Product Decisions (Keputusan Peringkat Produk)

### Prompt 3.1 — Senarai keputusan produk
```
I've created /docs/business/business-overview.md and /docs/business/business-requirements-document.md based on /docs/business/decisions/ and /docs/business/user-journeys.md. I'm ready to create a product requirements document for [APP NAME]. What are some decisions that I need to make before we create the PRD?
```

### Prompt 3.2 — Kenal pasti mana PRD vs teknikal
```
Are all of these decisions PRD-related decisions, or should some of them be in more technical documents?
```

### Prompt 3.3 — Cipta fail keputusan produk
```
Create decision records for PRD-related decisions in /docs/product/decisions based on your list. Do not make the decisions yet. Instead create placeholder records. Also create an index file for the product decisions.
```

### Prompt 3.4 — Buat keputusan produk satu persatu
```
Step through each pending decision record one by one. For each decision, tell me the options. For each option, include strengths/weaknesses/tradeoffs. After the options, tell me your recommendation with an explanation. Then tell me any assumptions that you used. Once I make a decision, record the decision in the decision records and index file, and ask me if I'm ready to proceed to the next decision record.
```

---

## EPISOD 04 — Product Requirements Document (PRD)

### Prompt 4.1 — Semak apa lagi perlu sebelum buat PRD
```
Review the product decision records in /docs/product/decisions/ I plan to create a Product Requirements Document. Besides the decision records, what additional information should I gather in order to create the PRD?
```

### Prompt 4.2 — Kenal pasti scope dokumen
```
Should all of this information be included in a PRD, or should some of it be in design or technical documents?
```

### Prompt 4.3 — Cipta Information Architecture
```
Create a document for Information Architecture & Navigation for [APP NAME] and put it in a markdown document in /docs/product.
```

### Prompt 4.4 — Cipta PRD
```
Please create the Product Requirements Document based on the decision records and the Information Architecture & Navigation document, and general information. Focus on product level information in the PRD only. Put it in /docs/product/product-requirements-document.md
```

---

## EPISOD 05 — Design Decisions & Mockup

### Prompt 5.1 — Senarai keputusan design
```
I'm ready to begin the design phase for my [APP NAME] project. The goal is to eventually create a design requirements document and a mockup website in HTML/CSS/JavaScript of 3 or more design examples.

Review the business decisions in /docs/business/decisions/ and the BRD in /docs/business/business-requirements-document.md
Review the product decisions in /docs/product/decisions/ and the PRD in /docs/product/product-requirements-document.md

Show me a list of decisions that we should make before creating the design requirements document and the mockup website.
```

### Prompt 5.2 — Kenal pasti mana design vs teknikal
```
Are all of these design decisions, or are some of them technical or architectural decisions?
```

### Prompt 5.3 — Cipta fail keputusan design
```
Create decision records in /docs/design/decisions for each of these decisions and an index of the decision records. Leave the decisions as pending. We'll review them and make the decisions later.
```

### Prompt 5.4 — Buat keputusan design satu persatu
```
Step through each decision record one by one. For each decision, tell me the options. For each option, include strengths/weaknesses/tradeoffs. After the options, tell me your recommendation with an explanation. Then tell me any assumptions that you used. Once I make a decision, record the decision in the decision records and index file, and ask me if I'm ready to proceed to the next decision record.
```

### Prompt 5.5 — Cipta Tone & Voice Guide
```
Based on the decisions that we've made so far, please create a tone and voice guide for [APP NAME]. Add this document to /docs/design/
```

### Prompt 5.6 — Cipta Screen Inventory
```
Create a document that lists all of the pages, modals, and panels that we will need for [APP NAME] along with their data contracts. Add this document to /docs/design/
```

### Prompt 5.7 — Cipta mockup HTML
```
Based on the decisions that we've made, the business and product requirements documents, the tone-and-voice guide, and the list of pages and modals, create a mockup HTML/CSS/JavaScript that uses 3 different design options and 3 different color palettes for how [APP NAME] will look and feel.

Put a design option picker at the top, and give each design option a name. Also pick 3 different color palettes. Put a color palette picker at the top, and give each color palette a name.

Include at least 3 pages and 1 modal that are representative of the application. I want to be able to view each page and modal in each design option and each color palette.

Put the mockup website in /docs/design/
```

### Prompt 5.8 — Pilih design option & cipta DRD
```
I want to use the [DESIGN OPTION NAME] design option and the [COLOR PALETTE NAME] color palette. Create a design requirements document in /docs/design/ that incorporates the design decisions, tone and voice guide, design option and color palette.
```

---

## EPISOD 06 — Technical Decisions & TDD

### Prompt 6.1 — Senarai keputusan teknikal
```
I'm ready to begin the technical architecture phase for my [APP NAME] project. The goal is to eventually create architectural decision records (ADRs) and a technical design document.

Review the business decisions in /docs/business/decisions/ and the BRD in /docs/business/business-requirements-document.md
Review the product decisions in /docs/product/decisions/ and the PRD in /docs/product/product-requirements-document.md
Review the design decisions in /docs/design/decisions/ and the design requirements document /docs/design/design-requirements-document.md

Show me a list of architectural decisions for this application. First, list the architectural decisions that have already been made, then list architectural decisions that need to be made before proceeding.
```

### Prompt 6.2 — Cipta ADR files
```
Group the ADRs in the order that the decisions should be made. Then create architectural decision records (ADRs) in /docs/technical/decisions for each of these decisions and an index of the decision records. For the decisions that we have already made, mark the decision as DECIDED and include the decision. For ADRs that are undecided, leave the decisions as pending. We'll review them and make the decisions later.
```

### Prompt 6.3 — Buat keputusan teknikal satu persatu
```
Step through each pending ADR one by one. For each decision, tell me the options. For each option, include strengths/weaknesses/tradeoffs. After the options, tell me your recommendation with an explanation. Then tell me any assumptions that you used. Once I make a decision, record the decision in the decision records and index file, and ask me if I'm ready to proceed to the next decision record.
```

### Prompt 6.4 — Cipta Technical Design Document
```
Based on the decisions that we've made so far, please create a technical design document for [APP NAME] and put it in /docs/technical/
```

---

## EPISOD 07 — Implementation Plan

### Prompt 7.1 — Terokai pilihan cara build
```
I'm ready to start the planning phase for my [APP NAME] project. The goal is to eventually create an implementation plan that we will follow to build the application.

Review the design decisions in /docs/design/decisions/ and the design requirements document /docs/design/design-requirements-document.md
Review the ADRs in /docs/technical/decisions/ and the technical design document in /docs/technical/technical-design-document.md

What are some options for building [APP NAME]? Please tell me the strengths and weaknesses of each option.
```

### Prompt 7.2 — Tanya tentang UI awal (optional)
```
What if I want to see the UI as soon as possible, in case I decide to make design changes? Would there be implementation options that would allow for that? If so, add those to your options.
```

### Prompt 7.3 — Tanya tentang parallel build (optional)
```
I'm considering building [APP NAME] in parallel sessions, with either me running multiple sessions or a different developer running different sessions. Are there options you can add that would allow for parallel build tracks?
```

### Prompt 7.4 — Cipta implementation plan
```
I've decided to go with [CHOSEN OPTION — e.g., Backend-first / API-complete]. Create a detailed implementation plan based on this decision. Then compare the plan to the decision records and requirements/design documents to ensure that it follows the specifications. If not, update the implementation plan.

Put the implementation plan in /docs/planning/
Finally, create an implementation status file in /docs/planning that we can use to track our progress.
```

### Prompt 7.5 — Semak konsistensi dengan screen inventory
```
Review the implementation plan and confirm that it is consistent with /docs/design/screen-inventory.md. If you find any inconsistencies, fix the plan and the implementation status file.
```

### Prompt 7.6 — Semak konsistensi dengan ADR & TDD
```
Review the implementation plan and confirm that it follows the ADRs in /docs/technical/decisions and the technical design document in /docs/technical/technical-design-document.md. If you find any inconsistencies, fix the plan and the implementation status file.
```

---

## EPISOD 08 — Build Phase 1 (Foundation + Backend Core)

### Prompt 8.1 — Mula build Part A
```
I'm ready to start building [APP NAME] following the implementation plan in /docs/planning/implementation-plan.md. Follow the implementation plan to complete Part A Phase 0. When complete, update the implementation status file /docs/planning/implementation-status.md.
```

### Prompt 8.2 — Review Part A
```
Please review the work completed in the implementation plan Part A Phase 0 and compare it to the applicable ADRs, TDD, and PRD. List any discrepancies or inconsistencies that you find before continuing.
```

### Prompt 8.3 — Teruskan Part B
```
Continue building [APP NAME] by completing Part B Phase B1. When complete, update the implementation status file /docs/planning/implementation-status.md.
```

### Prompt 8.4 — Review Part B1
```
Please review the work completed in the implementation plan Part B Phase B1 and compare it to the applicable ADRs, TDD, and PRD. List any discrepancies or inconsistencies that you find before continuing.
```

### Prompt 8.5 — Siapkan baki Part B
```
Continue building [APP NAME] by completing the remainder of Part B. When complete, update the implementation status file /docs/planning/implementation-status.md.
```

### Prompt 8.6 — Review keseluruhan Part B
```
Please review the work completed in the implementation plan Part B and compare it to the applicable ADRs, TDD, and PRD. List any discrepancies or inconsistencies that you find before continuing.
```

---

## EPISOD 09 — Build Phase 2 (Backend Domain)

### Prompt 9.1 — Semak status & pilih cara teruskan
```
Read /docs/planning/implementation-plan.md and /docs/planning/implementation-status.md. What are some options for continuing to build [APP NAME]?
```

### Prompt 9.2 — Implement Part C (Backend Domain)
```
Enter plan mode and implement all of Part C from the implementation plan, confirming the build with the documentation specified in the implementation plan.
```

### Prompt 9.3 — Review Part C
```
Review the build from Part C of the implementation plan, and compare it to the product documentation, technical documentation, architectural decision records, and implementation plan, and list any inconsistencies and your recommendation for fixing each inconsistency.
```

---

## EPISOD 10 — Dependabot / Dependency Updates (semasa mid-build)

> Guna bila ada dependency updates masuk semasa kau sedang build.

### Prompt 10.1 — Surface keputusan tentang updates
```
Some dependency updates (e.g., Dependabot PRs) landed on the repo while I'm mid-build. Read /docs/planning/implementation-status.md so you know where we are in the build, then tell me what updates want to be merged, then surface the decisions I need to make about how to handle these updates during the build phase. List the decisions in the order they should be made.
```

### Prompt 10.2 — Buat keputusan satu persatu
```
Step through each decision you surfaced one by one. For each decision, tell me the options. For each option, include strengths/weaknesses/tradeoffs and call out any risks specific to being mid-build versus operate/maintain. Then tell me your recommendation and the assumptions behind it. Finally, tell me if this decision needs to be recorded and if so where, or if we just need to act on the decision now. Stop after each one until I make the decision.
```

### Prompt 10.3 — Semak dokumentasi selepas update
```
Now that we've made all the decisions and completed all the actions related to the dependency updates, has the documentation been updated accordingly?
```

### Prompt 10.4 — Semak konsistensi dengan ADR & TDD
```
Review the new ADRs and other documentation against the existing technical decisions in /docs/technical/decisions/ and the TDD. List any inconsistencies and your recommendation for fixing each.
```

---

## EPISOD 11 — Build Parallel (Parts D & E serentak)

> Guna bila nak run dua bahagian build dalam masa yang sama (dua sesi berbeza).

### Prompt 11.1 — Terokai pilihan parallel
```
What are some options for running Parts D and E of the implementation in parallel?
```

### Prompt 11.2 — Implement Part D dalam worktree baru
```
Enter plan mode and run implementation phase D1 in a new worktree. We will be working on Part E in another session.
```

### Prompt 11.3 — Implement Part E dalam worktree baru
```
Enter plan mode and run implementation phase E1 in a new worktree. We are working on Part D in another session.
```

### Prompt 11.4 — Merge Part D
```
Phase D1 is complete. Please merge this into main via a PR.
```

### Prompt 11.5 — Rebase Part E selepas D di-merge
```
Phase D1 was just merged to main. This was progress on a separate branch. Rebase E1 onto the new main and reconcile.
```

### Prompt 11.6 — Merge Part E
```
Open a PR against main for the Phase E1 work, then merge.
```

---

## EPISOD 12 — Build Frontend (Parts F & G)

### Prompt 12.1 — Implement fasa frontend satu persatu
> Ulang corak ini untuk setiap fasa: F1, F2, F3, F4, G1, G2, G3, G4, G5, G6, G7...

```
Enter plan mode and implement Phase [PHASE ID — e.g., F1]
```

### Prompt 12.2 — Review setiap fasa selepas siap
```
Review the code created for Phase [PHASE ID] and compare to the implementation plan, architectural decision records, and technical design document. Find any inconsistencies between the documentation and the code.
```

### Prompt 12.3 — Cipta readiness test plan (selepas G1 siap)
```
Please create a readiness test plan in /docs/testing named READINESS-TESTING.md that I can use to manually test features of the app using the UI as it's been built through Phase G1.
```

### Prompt 12.4 — Update readiness test plan (selepas fasa seterusnya)
```
In another session, I'm building Phase [PHASE ID]. Please update the readiness test plan in /docs/testing named READINESS-TESTING.md that I can use to manually test features of the app using the UI as it's been built through Phase [PHASE ID].
```

---

## EPISOD 13 — Part H: Frontend Cross-Cutting

### Prompt 13.1 — Implement H1: Real-Time Client Bridge
```
Enter plan mode and implement Phase H1 from the implementation plan.

Phase H1 goal: Connect the WebSocket client on login, dispatch inbound events into the TanStack Query cache, and implement reconnect with exponential backoff.

Key tasks:
- Connect to wss://{host}/ws after /auth/me resolves; carry CSRF token as query param
- Single realtimeDispatcher translating inbound event envelopes into cache updates:
  - task.updated → setQueryData + invalidate board queries
  - task.created → invalidate project tasks
  - comment.created → invalidate task comments
  - notification → prepend to notifications list + bump unread badge
  - activity → prepend to activity feed
- Reconnect with exponential backoff capped at 30s, jittered. On reconnect, invalidate all queries.
- Show a discreet "Reconnecting…" indicator; auto-clear on resume
- aria-live announcement for relevant cross-page real-time events

When complete, update /docs/planning/implementation-status.md
```

### Prompt 13.2 — Review H1
```
Review the code created for Phase H1 and compare to the implementation plan, ADRs, and TDD. Find any inconsistencies. Then do a two-browser-context manual test: confirm that when one user moves a task, the other user sees the move within 1 second without refreshing.
```

### Prompt 13.3 — Implement H2: Empty States and First-Run
```
Enter plan mode and implement Phase H2 from the implementation plan.

Phase H2 goal: Every empty state and first-run prompt described in the design requirements document is implemented.

Key tasks:
- Audit all screens; add or correct empty-state components for every screen that can have zero data
- First-run prompt for Owner: "Create your first project" shown on dashboard while workspace has zero projects
- First-run prompt for Owner: "Invite team members" shown in sidebar/settings until at least one invitation has been sent
- Welcome message for newly invited users until they have any assignment or activity
- All empty states must be role-aware (different copy/CTA for Owner vs Member vs Viewer)
- All copy must follow the tone and voice guide in /docs/design/tone-and-voice-guide.md

When complete, update /docs/planning/implementation-status.md
```

### Prompt 13.4 — Review H2
```
Review the code created for Phase H2 and compare to the implementation plan and design requirements document. Do a visual review of every screen's empty state and confirm it matches the DRD spec. Find any inconsistencies.
```

### Prompt 13.5 — Implement H3: Toasts, Errors, Confirmations
```
Enter plan mode and implement Phase H3 from the implementation plan.

Phase H3 goal: Global toast system and destructive confirmation pattern in place.

Key tasks:
- Global Zustand store for toasts; useToast hook
- Toast styling: bottom-right position, 5s auto-dismiss, success/error variants, fade-up animation, respects reduced-motion
- Standardize mutation error handling: consistent "Couldn't save your changes. Please try again." style copy
- Destructive confirmation modal pattern: used for Remove member, Delete account, Delete label
- Component tests for toast lifecycle (appear, auto-dismiss, manual dismiss) and confirmation modal (cancel, confirm flows)

When complete, update /docs/planning/implementation-status.md
```

### Prompt 13.6 — Review H3
```
Review the code created for Phase H3 and compare to the implementation plan and design requirements document. Find any inconsistencies.
```

### Prompt 13.7 — Implement H4: Accessibility Pass
```
Enter plan mode and implement Phase H4 from the implementation plan.

Phase H4 goal: WCAG 2.1 AA verified across the entire application.

Key tasks:
- Keyboard sweep: every interactive element is reachable via Tab; logical tab order throughout; focus visible using primary color and focus ring token
- ARIA attributes: role="dialog" + aria-modal on all modals; aria-expanded on dropdown triggers; aria-label on all icon-only buttons; aria-live="polite" on real-time announcement region
- Color-contrast verification: spot-check all text/background combinations against design tokens
- Reduced-motion: verify all animated interactions respect prefers-reduced-motion
- Manual screen-reader pass over the critical journeys (login, create task, comment, notification)
- Fix any violations found during the sweep

When complete, update /docs/planning/implementation-status.md
```

### Prompt 13.8 — Review H4
```
Review the work completed for Phase H4. Run axe-core checks on every page and report violations. Verify keyboard-only navigation completes the full happy-path journey. List any remaining accessibility gaps.
```

### Prompt 13.9 — Implement H5: Frontend Test Completion
```
Enter plan mode and implement Phase H5 from the implementation plan.

Phase H5 goal: Vitest coverage on hooks, primitives, and domain components reaches the floor target.

Key tasks:
- Component tests for every domain component used by the frontend screens (board, task panel, settings, notifications, search)
- Hook tests for permission derivations and Zod form schemas
- vitest-axe runs on every component test
- Add a coverage report; target ≥80% on components/ and features/ directories
- Confirm CI runtime for frontend job stays under 5 minutes

When complete, update /docs/planning/implementation-status.md
```

### Prompt 13.10 — Review H5
```
Review the code created for Phase H5 and compare to the implementation plan. Check coverage report and confirm it meets the target. List any test gaps that remain.
```

---

## EPISOD 14 — Part I: E2E, Infrastructure, Deployment, Production

### Prompt 14.1 — Implement I1: End-to-End Test Suite
```
Enter plan mode and implement Phase I1 from the implementation plan.

Phase I1 goal: Playwright E2E journeys pass against a full docker compose up stack.

Key tasks:
- Playwright config with axe checks via @axe-core/playwright on every visited page
- Journey 1: Sign-up → create workspace → create first project (Owner)
- Journey 2: Accept invitation (new user joins workspace)
- Journey 3: Create task → drag to In Progress → add comment with @mention → mark Done
- Journey 4: Two browser contexts — user A moves a task, user B sees the move without refresh (real-time test)
- Journey 5: @mention notification — user B's unread badge increments in real time
- Journey 6: Search, filter, empty states
- Add e2e job to CI pipeline

When complete, update /docs/planning/implementation-status.md
```

### Prompt 14.2 — Review I1
```
Review the code created for Phase I1. Run the full Playwright suite and report results. Confirm axe checks pass on every visited page. List any failing journeys or accessibility violations.
```

### Prompt 14.3 — Implement I2: Infrastructure (IaC)
```
Enter plan mode and implement Phase I2 from the implementation plan.

Phase I2 goal: All cloud infrastructure provisioned via Infrastructure as Code (CloudFormation / Terraform / your chosen IaC tool per your ADRs).

Key tasks based on your ADRs and TDD:
- Network stack: VPC, subnet, internet gateway, security group (ports 22/80/443 inbound)
- Compute stack: EC2 instance (or equivalent), Elastic IP, IAM instance profile, user-data bootstrapping Docker + logging agent
- Container registry: ECR / Docker Hub repos with lifecycle policy (keep last 10 tagged, expire untagged after 7 days)
- Storage stack: S3 bucket for DB backups (server-side encryption, 30-day lifecycle rule)
- Secrets/config stack: SSM Parameter Store / Secrets Manager placeholders under /[app-name]/prod/*
- Email stack: SES verified domain identity + DKIM records (or equivalent email provider)
- Monitoring stack: log groups, metric filters for 5xx/error/login-failure counts, alarms routed to SNS email topic
- DNS stack: hosted zone, A record pointing to Elastic IP, MX/TXT records for email
- IAM stack: OIDC provider for GitHub Actions; deploy role with narrow permissions
- Production docker-compose.prod.yml with nginx + api + web + db + certbot (Let's Encrypt)
- nginx.conf with TLS termination, security headers (CSP, HSTS, X-Frame-Options), routing rules
- Validate all IaC templates in CI (cfn-lint or terraform validate)

When complete, update /docs/planning/implementation-status.md
```

### Prompt 14.4 — Review I2
```
Review the infrastructure code created for Phase I2. Validate all IaC templates. Confirm the nginx config applies the correct security headers (CSP, HSTS, frame-ancestors). List any gaps compared to the TDD infrastructure spec.
```

### Prompt 14.5 — Implement I3: CD Pipeline
```
Enter plan mode and implement Phase I3 from the implementation plan.

Phase I3 goal: Pushing to main triggers a full automated deploy.

Key tasks:
- Author .github/workflows/deploy.yml (or equivalent CI/CD config):
  1. Assume deploy role via OIDC (no long-lived AWS keys)
  2. Build linux/arm64 images, tag with commit SHA, push to container registry
  3. Deploy IaC stacks (only changed stacks)
  4. Run DB migrations on the EC2 via SSM Run Command (alembic upgrade head)
  5. Roll service containers via SSM Run Command (docker compose pull && docker compose up -d --remove-orphans)
  6. Smoke check GET /health from the workflow; fail the deploy if it returns non-200
- Document rollback procedure in /docs/planning/ or /infra/RUNBOOK.md:
  - Image rollback: redeploy previous image tag
  - Schema rollback: roll forward with corrective migration (not alembic downgrade)
  - Infrastructure rollback: cancel in-progress stack update

When complete, update /docs/planning/implementation-status.md
```

### Prompt 14.6 — Review I3
```
Review the CD pipeline created for Phase I3. Verify the deploy workflow follows the sequence in the TDD. Confirm no long-lived credentials are stored anywhere. List any gaps.
```

### Prompt 14.7 — Implement I4: Production Cutover
```
Guide me through Phase I4 — the first production deployment and DNS cutover.

Steps to walk through:
1. Set all secrets in SSM Parameter Store / Secrets Manager for production (DB password, session secret, email credentials, etc.) — list all required values from the TDD
2. Run the deploy workflow and confirm it completes successfully
3. Verify Let's Encrypt certificate issuance and HTTPS reachability
4. Cut DNS A record to point to the production Elastic IP
5. Run the seed script in production (or confirm first real signup creates the workspace)
6. Manual smoke test checklist:
   - Sign up as a new user
   - Create a project
   - Create a task and move it through statuses
   - Invite a second user and verify the invitation email arrives
   - Accept the invitation as the second user
   - Confirm real-time updates work between the two users

Tell me what to check at each step before I proceed to the next.
```

### Prompt 14.8 — Review I4: Security headers check
```
The app is live. Please run the following production verification checks and report results:

1. Check HTTPS is working and the TLS certificate is valid
2. Check security headers are correct — look for: strict CSP (no unsafe-inline), HSTS, X-Frame-Options or frame-ancestors: none, X-Content-Type-Options, Referrer-Policy
3. Check that /api/v1/docs and /api/v1/openapi.json are not publicly accessible in production
4. Confirm the health endpoint GET /health returns 200
5. List any issues found and your recommendation for fixing each.
```

### Prompt 14.9 — Implement I5: Monitoring and Alarm Verification
```
Enter plan mode and implement Phase I5 from the implementation plan.

Phase I5 goal: Verify every CloudWatch alarm fires correctly and routes to the operator email.

Key tasks:
- Subscribe operator email to the alerts SNS topic
- Verify each alarm by synthesizing the condition:
  - Health check failure: temporarily stop the API container, confirm alarm fires
  - 5xx rate: trigger a handled 500 endpoint, confirm alarm fires
  - Error count: write an ERROR log line, confirm metric filter counts it
  - Memory usage: check current memory % in CloudWatch Agent metrics
  - Disk usage: check current disk % in CloudWatch Agent metrics
  - Login failure rate: make 50+ failed login attempts, confirm brute-force alarm fires
- Verify CloudWatch log groups receive logs from all containers (api, web, db)
- Confirm metric filter regex patterns match actual structured log line format
- Update runbook with alarm response procedures

When complete, update /docs/planning/implementation-status.md
```

### Prompt 14.10 — Final Acceptance: I6
```
We're ready for the final acceptance walkthrough — Phase I6.

Please guide me through a structured walkthrough of the live application covering:

1. Walk the PRD section by section and confirm every requirement is met
2. Walk the DRD page spec for every screen and confirm the design matches
3. Check every empty state renders correctly
4. Confirm all role-based access controls work (test as Owner, Admin, Member, Viewer)
5. Confirm all accessibility requirements pass (axe-core clean, keyboard nav works)
6. Confirm real-time updates work across two browser sessions

For each item, tell me what to check and what the expected result is. Flag any gap above "trivial" as a defect to fix before launch.

When complete:
- Update README.md with final run, deploy, and seed instructions
- Update /docs/planning/implementation-status.md to reflect 100% completion
- Write a brief release note summarizing what was built
```

---

## PROMPT UNIVERSAL — Boleh Guna Bila-Bila Masa

### Semak status build terkini
```
Read /docs/planning/implementation-plan.md and /docs/planning/implementation-status.md. Summarize where we are in the build and what comes next.
```

### Review konsistensi keseluruhan
```
Review all completed phases against the BRD in /docs/business/business-requirements-document.md, PRD in /docs/product/product-requirements-document.md, DRD in /docs/design/design-requirements-document.md, and TDD in /docs/technical/technical-design-document.md. List any inconsistencies and your recommendation for fixing each.
```

### Tanya tentang sesuatu keputusan
```
I need to make a decision about [TOPIC]. Surface the options for me. For each option, include strengths/weaknesses/tradeoffs. Then give me your recommendation and explain the assumptions behind it.
```

### Rekod keputusan baru
```
Record this decision as an ADR in /docs/technical/decisions/ (or /docs/business/decisions/ or /docs/product/decisions/ or /docs/design/decisions/ depending on the category). Update the relevant index file.
```

---

## Ringkasan Urutan Episode

| Episode | Perkara |
|---|---|
| 01 | Business decisions → ADR files |
| 02 | BRD + Business overview + User journeys |
| 03 | Product decisions → ADR files |
| 04 | PRD + Information Architecture |
| 05 | Design decisions → Mockup HTML → DRD |
| 06 | Technical ADRs → TDD |
| 07 | Implementation plan + Status tracker |
| 08 | Build Part A & B (foundation + backend core) |
| 09 | Build Part C (backend domain features) |
| 10 | Handle dependency updates mid-build |
| 11 | Build Parts D & E (real-time, async, hardening) — parallel option |
| 12 | Build Parts F & G (frontend foundation + screens) |
| 13 | Build Part H (frontend cross-cutting: real-time, empty states, toasts, accessibility, tests) |
| 14 | Build Part I (E2E tests, infrastructure, CD pipeline, production launch, monitoring, acceptance) |
