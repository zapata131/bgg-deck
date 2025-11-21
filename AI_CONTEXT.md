# AI Context

This project follows the "Vibe Coding" philosophy.

**Primary Source of Truth**: [docs/DESIGN.md](docs/DESIGN.md)

## Stack Summary
- **Framework**: Next.js (App Router) + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Data**: BGG XML API2 + HTML scrape
- **PDF**: Puppeteer (v1)

## Instructions for AI
1. Always read `docs/DESIGN.md` before starting a task.
2. If you need to change the stack or conventions, update `docs/DESIGN.md`.
3. Use `npm` for package management.
4. Update `docs/WORK_LOG.md` with a summary of changes after completing significant tasks or milestones.
5. **Continuous Context**: Update this file (`AI_CONTEXT.md`) with new learnings, architectural decisions, or "gotchas" discovered during development.

## Key Learnings & Decisions
- **BGG API**:
    - Requires a custom `User-Agent` header to avoid 401 Unauthorized errors.
    - Use `Authorization: Bearer <token>` header for requests (token in `.env.local`).
    - XML Parsing: The `name` field in `thing` items can be an array or object; schemas must handle both.
