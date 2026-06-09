```markdown
# grade-transcript Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the development patterns and conventions used in the `grade-transcript` TypeScript repository. You'll learn how to structure files, write and organize code, follow commit message conventions, and implement and test features in a consistent manner.

## Coding Conventions

### File Naming
- Use **PascalCase** for all file names.
  - Example: `GradeCalculator.ts`, `TranscriptParser.ts`

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { GradeCalculator as Calculator } from './GradeCalculator';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    export function calculateGPA(grades: number[]): number { ... }
    ```

### Commit Messages
- Use **Conventional Commits** with the `feat` prefix for new features.
  - Example: `feat: add GPA calculation for transcript summary`

## Workflows

### Feature Development
**Trigger:** When adding a new feature  
**Command:** `/feature-development`

1. Create a new TypeScript file using PascalCase.
2. Implement the feature using named exports.
3. Import dependencies using alias imports if needed.
4. Write corresponding tests in a `.test.ts` file.
5. Commit changes using the `feat:` prefix and a descriptive message.

### Testing
**Trigger:** When validating code changes  
**Command:** `/run-tests`

1. Locate or create a test file matching `*.test.ts`.
2. Write tests for all new or changed functionality.
3. Run the test suite using your preferred TypeScript test runner.
4. Ensure all tests pass before committing.

## Testing Patterns

- Test files are named with the pattern `*.test.ts`.
- Each test file should cover one module or feature.
- The testing framework is not specified; use your team's preferred runner.
- Example test file:
  ```typescript
  import { calculateGPA } from './GradeCalculator';

  test('calculates GPA correctly', () => {
    expect(calculateGPA([4, 3, 3, 4])).toBe(3.5);
  });
  ```

## Commands
| Command             | Purpose                                      |
|---------------------|----------------------------------------------|
| /feature-development| Start a new feature using project conventions|
| /run-tests          | Run all test files matching `*.test.ts`      |
```
