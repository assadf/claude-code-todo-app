# End-to-End Tests for TODO List Creation

This directory contains comprehensive E2E tests for the TODO list creation feature using Playwright.

## Test Structure

### Core Test Files

- **`todo-list-creation.spec.ts`** - Main test suite covering complete user workflows
- **`todo-list-creation-uix.spec.ts`** - UI/UX focused tests (responsive design, accessibility, animations)
- **`todo-list-creation-database.spec.ts`** - Database integration tests with proper data persistence verification
- **`todo-list-creation-fixtures.spec.ts`** - Examples using custom test fixtures

### Page Objects

- **`page-objects/DashboardPage.ts`** - Dashboard page interactions
- **`page-objects/CreateTodoListModal.ts`** - Modal component interactions
- **`page-objects/AuthPage.ts`** - Authentication page interactions

### Utilities

- **`utils/auth.ts`** - Authentication utilities for testing with/without login
- **`utils/database.ts`** - Database setup, cleanup, and verification utilities
- **`utils/test-helpers.ts`** - Common test helpers and utilities

### Fixtures

- **`fixtures/test-fixtures.ts`** - Custom Playwright fixtures for reusable test setup

## Test Coverage

### 1. Authentication Tests

- ✅ Redirect unauthenticated users to signin
- ✅ Allow authenticated users to access dashboard
- ✅ Handle authentication errors gracefully

### 2. Modal Interaction Tests

- ✅ Open modal on button click
- ✅ Close modal via close button, cancel button, backdrop click, or ESC key
- ✅ Proper focus management and accessibility

### 3. Form Validation Tests

- ✅ Empty name validation
- ✅ Name too short validation (< 2 characters)
- ✅ Name too long validation (> 100 characters)
- ✅ Description too long validation (> 500 characters)
- ✅ Accept valid inputs

### 4. API Integration Tests

- ✅ Send correct API requests
- ✅ Handle API errors gracefully
- ✅ Handle server validation errors
- ✅ Handle authentication failures

### 5. Loading States Tests

- ✅ Show loading spinner during submission
- ✅ Disable buttons during loading
- ✅ Display loading text

### 6. Form Reset Tests

- ✅ Reset form after successful submission
- ✅ Preserve form data after failed submission

### 7. UI/UX Tests

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility (ARIA attributes, focus management, keyboard navigation)
- ✅ Animations and transitions
- ✅ Visual feedback states
- ✅ Layout stability

### 8. Database Integration Tests

- ✅ Data persistence verification
- ✅ User association validation
- ✅ Timestamp verification
- ✅ Special character and Unicode handling
- ✅ Data isolation and validation
- ✅ Transaction integrity

## Running the Tests

### Prerequisites

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

3. Make sure your application is built:
   ```bash
   npm run build
   ```

### Running All E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui
```

### Running Specific Test Files

```bash
# Run main workflow tests
npx playwright test e2e/todo-list-creation.spec.ts

# Run UI/UX tests
npx playwright test e2e/todo-list-creation-uix.spec.ts

# Run database integration tests
npx playwright test e2e/todo-list-creation-database.spec.ts

# Run fixture example tests
npx playwright test e2e/todo-list-creation-fixtures.spec.ts
```

### Running Tests on Specific Browsers

```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Running Tests in Debug Mode

```bash
# Debug mode with browser visible
npx playwright test --debug

# Run with headed browser
npx playwright test --headed

# Run in slow motion
npx playwright test --headed --slowMo=1000
```

## Environment Setup

### Authentication Handling

The tests use a mock authentication system that bypasses Google OAuth for testing purposes. This is implemented in `utils/auth.ts` and provides:

- Mock session creation
- Test user generation
- Authentication state management
- API endpoint mocking

### Database Testing

The tests include mock database utilities that simulate real database operations without requiring a live database connection. This is implemented in `utils/database.ts` and provides:

- Test data creation
- Data verification
- Cleanup utilities
- Transaction simulation

### Real Database Testing (Optional)

For integration with a real test database:

1. Set up a test MongoDB instance
2. Create a `.env.test` file with test database credentials
3. Modify the database utilities to connect to the real database
4. Ensure proper cleanup between tests

## Configuration

The tests use the Playwright configuration in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeout**: Tests timeout after 30 seconds
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## Test Data

### Valid Test Data

- List names: 2-100 characters
- Descriptions: 0-500 characters (optional)
- Special characters and Unicode are supported

### Invalid Test Data

- Empty names
- Names < 2 characters
- Names > 100 characters
- Descriptions > 500 characters

### Test User Data

Default test users are generated with:

- Unique IDs
- Test email addresses
- Mock profile images
- Predictable names for assertion

## Debugging Tests

### Common Issues

1. **Test timeouts**: Increase timeout in test or check network conditions
2. **Element not found**: Verify data-testid attributes are present
3. **Authentication failures**: Check mock auth setup
4. **Modal not opening**: Verify click handlers and CSS classes

### Debugging Tools

1. **Playwright Inspector**: Use `--debug` flag
2. **Screenshots**: Automatically taken on failure
3. **Videos**: Recorded on failure
4. **Console logs**: Captured and can be asserted
5. **Network logs**: Available in trace viewer

### Best Practices

1. Use `data-testid` attributes for reliable element selection
2. Wait for elements to be stable before interacting
3. Use page object models for maintainability
4. Clean up test data between tests
5. Mock external dependencies
6. Test error conditions as well as happy paths
7. Verify both UI state and data changes

## Contributing

When adding new tests:

1. Follow the existing page object model pattern
2. Add data-testid attributes to new UI elements
3. Include both positive and negative test cases
4. Update this README with new test coverage
5. Ensure tests can run independently and in parallel
6. Mock external dependencies appropriately

## CI/CD Integration

These tests are configured to run in CI/CD pipelines:

- Tests run in headless mode on CI
- Screenshots and videos are captured on failure
- Test results are available in HTML report format
- Tests are retried automatically on CI failure
