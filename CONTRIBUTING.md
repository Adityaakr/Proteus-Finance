# Contributing to Proteus Finance

Thank you for your interest in contributing to Proteus Finance! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Proteus-Finance.git
   cd Proteus-Finance
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Running the App

**Web:**
```bash
npm run web
```

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### Code Style

- Use **TypeScript** for all new files
- Follow **React Native** best practices
- Use **functional components** with hooks
- Keep components **small and focused**
- Add **comments** for complex logic
- Use **meaningful variable names**

### Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Full screen views
├── services/       # Business logic and API calls
├── theme/          # Design system (colors, spacing, etc.)
└── config/         # Configuration files
```

## 🧪 Testing

Before submitting a PR:

1. **Test on multiple platforms** (Web, iOS, Android)
2. **Check for TypeScript errors**: `npx tsc --noEmit`
3. **Verify wallet functionality** works correctly
4. **Test smart contract interactions** on testnet

## 📝 Commit Guidelines

Use clear, descriptive commit messages:

```
feat: Add liquidity pool withdrawal feature
fix: Resolve wallet connection issue on iOS
docs: Update README with deployment instructions
style: Format credit screen components
refactor: Simplify agent service logic
test: Add unit tests for credit scoring
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code restructuring (no behavior changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔍 Pull Request Process

1. **Update documentation** if needed
2. **Add screenshots** for UI changes
3. **Describe your changes** clearly in the PR description
4. **Link related issues** if applicable
5. **Request review** from maintainers
6. **Address feedback** promptly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Web
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Smart contracts tested on testnet

## Screenshots
(if applicable)

## Related Issues
Closes #123
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description** of the issue
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Platform** (Web/iOS/Android)
6. **Screenshots** or error logs
7. **Environment** (OS, Node version, etc.)

## 💡 Feature Requests

We welcome feature suggestions! Please:

1. **Check existing issues** first
2. **Describe the feature** clearly
3. **Explain the use case**
4. **Provide examples** if possible

## 🔐 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. **Email** the maintainers directly
3. **Provide details** about the vulnerability
4. **Wait for confirmation** before disclosing

## 📚 Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Privy Documentation](https://docs.privy.io/)
- [BNB Chain Documentation](https://docs.bnbchain.org/)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards others

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make Proteus Finance better for everyone. We appreciate your time and effort!

---

**Questions?** Feel free to open an issue or reach out to the maintainers.
