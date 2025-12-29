# Contributing to Torrent Streamer

Thanks for taking the time to contribute.

## How Can I Contribute?

### Reporting Bugs

Before filing a bug, please check existing issues in case it’s already reported.

**When creating a bug report, please include:**
- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots or logs if applicable
- Your environment details (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:
- A clear and descriptive title
- A detailed description of the proposed functionality
- Explain why this enhancement would be useful
- Any relevant examples or mockups

### Pull Requests

1. **Fork** the repository
2. **Create** a new branch from `main`: `git checkout -b feature/your-feature-name`
3. **Make** your changes
4. **Run** the app locally to verify your change
5. **Commit** your changes with clear messages
6. **Push** to your fork: `git push origin feature/your-feature-name`
7. **Open** a pull request

#### Pull Request Guidelines

- Keep changes focused and atomic
- Add/update docs when behavior changes
- Follow the existing code style
- Include a clear description of what the PR does

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/torrent-streamer.git
cd torrent-streamer

# Install dependencies
npm install

# Start development server (same as start, but with NODE_ENV=development)
npm run dev
```

## Code Style

- Use ES6+ features and modules
- Keep changes small and readable
- Avoid introducing new runtime dependencies unless necessary

There’s no automated test suite currently; please include reproduction steps in the PR and do a quick manual check.

## Commit Message Guidelines

Use clear and meaningful commit messages:

```
feat: add support for multiple video formats
fix: resolve memory leak in stream handling
docs: update API documentation
refactor: improve error handling in torrent module
```

## License

By contributing to Torrent Streamer, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for any questions or reach out to the maintainers.

Thank you for your contribution.
