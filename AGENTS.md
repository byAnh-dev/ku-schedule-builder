# Agent Instructions

## Working Style
- Plan before coding.
- Do not invent product behavior.
- Use the frontend and docs/product-context.md as the source of truth.
- Ask questions only if they are truly blocking

## Scope Rules
- MVP does not include auth.
- MVP currently uses localStorage for persistence.
- Do not move schedule/conflict logic to the backend unless explicitly asked.
- Preserve existing frontend adapter contract where possible.

## Backend Rules
- Prefer a minimal backend first.
- Start by replacing the mock adapter with real API-compatible endpoints/services.
- Keep endpoint and DTO naming aligned with current frontend data model.
- Do not add new production dependencies without approval.
- Validate inputs explicitly.
- Keep day parsing and time rules consistent with frontend assumptions.

## Frontend-First Rule
Before proposing backend work, inspect:
- docs/product-context.md
- app/
- components/
- store/
- lib/data/
- lib/schedule/

## Implementation Rules
- Work in narrow slices.
- Before editing, list files to change and assumptions.
- After editing, summarize what changed, how it was verified, and remaining risks.

## Priority Order
1. understand frontend contract
2. confirm backend scope
3. define data/API contract
4. implement smallest useful backend slice
5. test compatibility with frontend