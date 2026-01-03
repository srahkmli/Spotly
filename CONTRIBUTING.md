# Contributing to Spotly

First off, thank you for considering contributing to Spotly! It's people like you that make Spotly such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Be open to different perspectives

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if applicable**
- **Include your environment** (OS, Go version, Node.js version, PostgreSQL version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

#### Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update the documentation (PROJECT_STRUCTURE.md, QUICKSTART.md) if needed
3. The PR will be merged once it receives approval from maintainers

## Development Setup

1. Fork and clone the repository
   ```bash
   git clone https://github.com/srahkmli/Spotly.git
   cd Spotly
   ```

2. Set up the backend:
   ```bash
   cd backend
   cp ../.env.example .env
   # Edit .env with your database credentials
   go mod tidy
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   npm install
   ```

4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Coding Standards

### Go (Backend)

- Follow [Effective Go](https://golang.org/doc/effective_go.html) guidelines
- Use `gofmt` to format your code
- Add comments for exported functions and types
- Keep functions focused and small
- Handle errors explicitly

### TypeScript/React (Frontend)

- Follow [React best practices](https://react.dev/learn)
- Use TypeScript types strictly
- Use functional components and hooks
- Follow the existing code style
- Use Tailwind CSS for styling

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add user priority sorting to parking assignment

- Sort users by priority (higher first) before queue order
- Maintain queue order for users with same priority
- Update parking service algorithm

Fixes #123
```

## Project Structure

- `backend/` - Go backend application
- `frontend/` - Next.js frontend application
- `docs/` - Additional documentation (if needed)

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed architecture.

## Testing

When adding new features:

- Add unit tests for business logic (backend)
- Test API endpoints manually or with automated tests
- Test frontend components in the browser
- Ensure edge cases are handled

## Documentation

- Update README.md if you change setup or installation steps
- Update API documentation if you change endpoints
- Add comments to complex code
- Update QUICKSTART.md if usage changes

## Questions?

Feel free to [open an issue](https://github.com/srahkmli/Spotly/issues) for any questions about contributing.

Thank you for contributing to Spotly! 🎉
