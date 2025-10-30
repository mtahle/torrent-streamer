# Contributing to Torrent Streamer

First off, thank you for considering contributing to Torrent Streamer! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that the problem has already been reported.

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
4. **Test** your changes thoroughly
5. **Commit** your changes with clear, descriptive messages
6. **Push** to your fork: `git push origin feature/your-feature-name`
7. **Submit** a pull request

#### Pull Request Guidelines

- Keep changes focused and atomic
- Include tests for new functionality
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass
- Include a clear description of what the PR does

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/torrent-streamer.git
cd torrent-streamer

# Install dependencies
npm install

# Start development server
npm run dev
```

## Code Style

- Use ES6+ features and modules
- Follow the existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting changes, ensure:
- The application starts without errors
- All API endpoints work correctly
- The web interface functions properly
- Torrent streaming works as expected

```bash
# Test the application
npm start

# Test API endpoints
curl http://localhost:8881/healthz
```

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

Thank you for your contribution! 🚀