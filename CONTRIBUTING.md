# Contributing to ScrapePilot.ai

Thank you for your interest in contributing to ScrapePilot.ai! This document provides guidelines and information about contributing to this project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `bun install`
3. Start databases: `bun run db:start`
4. Copy environment: `cp .env.example .env`
5. Start development: `bun run dev`

## Project Structure

- `apps/web` - Next.js frontend
- `apps/api` - Hono backend API
- `packages/shared` - Shared types and validators
- `packages/database` - MongoDB models
- `packages/tsconfig` - TypeScript configurations

## Code Style

- Use TypeScript for all code
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Run `bun run lint` before committing

## Commit Messages

We use conventional commits. Format: `type(scope): message`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

Examples:
```
feat(api): add webhook support for job completion
fix(scraper): handle timeout errors gracefully
docs(readme): update installation instructions
```

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `bun run test`
4. Run linting: `bun run lint`
5. Push and create a PR
6. Fill out the PR template
7. Wait for review

## Reporting Issues

- Use GitHub Issues
- Include reproduction steps
- Include environment details
- Include error messages/logs

## Questions?

Open a GitHub Discussion for questions about the project.
