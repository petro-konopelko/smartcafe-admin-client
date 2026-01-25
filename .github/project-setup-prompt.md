# SmartCafe Admin Client - AI Agent Project Setup Prompt

> **For AI Agents**: You are an expert in TypeScript, Angular 20+, Nx, and scalable web application development. This prompt contains all requirements to build the SmartCafe Admin Client application. Before starting, read `instructions.md` for mandatory coding standards and best practices.

---

## Project Overview

Build a **SmartCafe Admin Client** - an Nx-powered Angular application for staff to manage cafes and their digital menus. This is the administrative interface, separate from the customer-facing public client. The application is responsive and connects to an existing .NET 10 REST API backend.

### Technology Stack

- **Monorepo**: Nx Workspace (latest stable)
- **Framework**: Angular 20+ (latest stable)
- **UI Library**: Angular Material (Material Design 3)
- **State Management**: NgRx Signals
- **Forms**: Reactive Forms with validation
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Build Tool**: Nx with esbuild
- **Internationalization**: @angular/localize (English, Ukrainian)
- **Code Quality**: ESLint, Prettier, Husky
- **Component Development**: Storybook (mandatory for shared UI components)
- **HTTP Client**: Angular HttpClient with interceptors
- **Hosting**: Azure Static Web Apps

### Naming Conventions

- **Component Prefix**: `sc-` (SmartCafe) for all components (e.g., `sc-cafe-card`, `sc-menu-list`)
- **Directive/Pipe Prefix**: `sc` (e.g., `scAutoFocus`, `scSafeHtml`)
- This distinguishes SmartCafe components from third-party libraries and avoids generic `app-` prefix

---

## Nx Workspace Architecture

### Why Nx for Admin Client?

1. **Future Growth**: Inventory management, staff portal, reporting apps
2. **Code Sharing**: Shared UI components, data access, models
3. **Enforced Boundaries**: Clean architecture with dependency rules
4. **Performance**: Intelligent build caching, affected commands
5. **Scalability**: Easy to add new admin features as separate apps
6. **Team Productivity**: Generators, dependency graph, migration tools

### Workspace Structure

```
smartcafe-admin-client/
├── apps/
│   ├── admin/                        # Main application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   ├── assets/
│   │   │   ├── environments/
│   │   │   └── main.ts
│   │   ├── project.json
│   │   └── tsconfig.app.json
│   └── admin-e2e/                    # E2E tests
│       └── src/
├── libs/
│   ├── feature-cafes/                # Cafe feature library
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── cafe-grid/
│   │   │   │   ├── cafe-form/
│   │   │   │   └── cafe.routes.ts
│   │   │   └── index.ts
│   │   └── project.json
│   ├── feature-menus/                # Menu feature library
│   ├── data-access-cafes/            # Cafe API & store
│   ├── data-access-menus/            # Menu API & store
│   ├── shared/
│   │   ├── ui/                       # Core UI components
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── loading-spinner/
│   │   │   │   │   ├── error-message/
│   │   │   │   │   └── confirmation-dialog/
│   │   │   │   └── index.ts
│   │   │   └── project.json
│   │   ├── data-access/              # Core services (theme, notification)
│   │   ├── models/                   # Shared TypeScript models
│   │   ├── utils/                    # Utility functions
│   │   └── environments/             # Environment configs
│   └── testing/
│       └── test-helpers/             # Test utilities, mocks
├── nx.json
├── package.json
├── tsconfig.base.json
└── README.md
```

---

## Project Initialization

**Note:** Run these commands from the root directory of your project (where you want the workspace initialized). The commands will initialize in the current directory, not create a new folder.

### Step 1: Create Angular Application

```powershell
# Create new Angular app named 'admin' in current directory (initializes in root, no new folder)
npx @angular/cli@latest new admin `
  --style=scss `
  --routing=true `
  --ssr=false `
  --standalone=true `
  --package-manager=npm `
  --skip-git=true `
  --prefix=sc `
  --ai-config=copilot

# Note: --skip-git=true prevents initializing a new Git repo (use when working in existing repo)
# Note: This creates the basic Angular app with Vite bundler (default in Angular 18+)
```

### Step 2: Initialize Nx Workspace

```powershell
# Add Nx to existing Angular project
npx nx@latest init

# This will:
# - Add Nx to package.json
# - Create nx.json configuration
# - Enable Nx caching and task orchestration
# - Keep your existing Angular setup
```

### Step 3: Add Angular Material

```powershell
# Add Material to the app
ng add @angular/material `
  --theme=custom `
  --typography=true `
  --animations=enabled
```

### Step 4: Install Additional Dependencies

```powershell
# State management
npm install @ngrx/signals

# E2E testing
npm install -D @playwright/test

# Storybook
npx storybook@latest init --type angular
```

### Step 5: Configure Storybook for Shared Components

**All shared UI components MUST have Storybook stories for documentation and visual testing.**

**Update `.storybook/main.ts`:**

```typescript
import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../libs/shared/ui/src/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/angular',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
};

export default config;
```

**Create story for shared component:**

```typescript
// libs/shared/ui/src/lib/loading-spinner/loading-spinner.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { LoadingSpinnerComponent } from './loading-spinner.component';

const meta: Meta<LoadingSpinnerComponent> = {
  title: 'Shared/UI/LoadingSpinner',
  component: LoadingSpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the spinner'
    }
  }
};

export default meta;
type Story = StoryObj<LoadingSpinnerComponent>;

export const Small: Story = {
  args: {
    size: 'small'
  }
};

export const Medium: Story = {
  args: {
    size: 'medium'
  }
};

export const Large: Story = {
  args: {
    size: 'large'
  }
};
```

**Run Storybook:**

```powershell
npm run storybook
```

### Step 6: Configure Nx for Monorepo

```powershell
# Convert to Nx monorepo structure
npx nx g @nx/angular:convert-to-monorepo

# This will:
# - Move app to apps/admin/
# - Set up libs/ directory
# - Configure path aliases in tsconfig.base.json
# - Update nx.json for monorepo mode
```

### Step 7: Generate Library Structure

```powershell
# Feature libraries
nx g @nx/angular:library feature-cafes --directory=libs/feature-cafes --tags=type:feature,scope:cafes
nx g @nx/angular:library feature-menus --directory=libs/feature-menus --tags=type:feature,scope:menus

# Data access libraries
nx g @nx/angular:library data-access-cafes --directory=libs/data-access-cafes --tags=type:data-access,scope:cafes
nx g @nx/angular:library data-access-menus --directory=libs/data-access-menus --tags=type:data-access,scope:menus

# Shared UI library
nx g @nx/angular:library ui --directory=libs/shared/ui --tags=type:ui,scope:shared

# Shared models library
nx g @nx/angular:library models --directory=libs/shared/models --tags=type:models,scope:shared

# Shared data access library
nx g @nx/angular:library data-access --directory=libs/shared/data-access --tags=type:data-access,scope:shared

# Testing helpers
nx g @nx/angular:library test-helpers --directory=libs/testing/test-helpers --tags=type:testing,scope:shared
```

### Step 8: Configure Package.json Scripts

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "nx serve admin",
    "build": "nx build admin",
    "test": "nx test admin",
    "lint": "nx lint admin",
    "lint:pr": "nx affected:lint --base=origin/main",
    "lint:ci": "nx run-many --target=lint --all",
    "test:pr": "nx affected:test --base=origin/main --coverage",
    "test:ci": "nx run-many --target=test --all --coverage",
    "build:pr": "nx affected:build --base=origin/main --configuration=production",
    "build:ci": "nx run-many --target=build --all --configuration=production",
    "e2e": "nx e2e admin-e2e",
    "graph": "nx graph",
    "format": "nx format:write",
    "format:check": "nx format:check",
    "storybook": "nx storybook shared-ui",
    "build-storybook": "nx build-storybook shared-ui"
  }
}
```

**Explanation:**
- `start`, `build`, `test`, `lint` - Standard development commands
- `lint:pr`, `test:pr`, `build:pr` - Run only on **affected projects** (for Pull Requests)
- `lint:ci`, `test:ci`, `build:ci` - Run on **all projects** (for CI on main branch)
- `e2e` - Run end-to-end tests
- `graph` - View dependency graph
- `format:write` - Format all files with Prettier
- `format:check` - Check formatting without changing files
- `storybook` - Run Storybook development server
- `build-storybook` - Build static Storybook

### Step 9: Configure Nx MCP Server (Optional but Recommended)

**Nx provides a Model Context Protocol (MCP) server that enhances AI assistant capabilities.**

#### What Nx MCP Enables:

- ✅ **Workspace Structure Understanding** - AI gets deep architectural awareness of your monorepo, project relationships, and dependencies
- ✅ **Real-time Terminal Integration** - AI can read terminal output, running processes, and error messages without copy-pasting
- ✅ **CI Pipeline Context** - Access to build failures, test results, and deployment status from CI/CD
- ✅ **Enhanced Code Generation** - AI-powered generator suggestions and custom scaffolding with intelligent defaults
- ✅ **Cross-project Impact Analysis** - Understanding the implications of changes across your entire monorepo
- ✅ **Autonomous Error Debugging** - AI independently accesses context to help fix development issues

#### Automatic Setup (Recommended):

```powershell
# Automatically configure Nx MCP for your AI assistant
npx nx configure-ai-agents
```

This command will:
1. Prompt you to select which AI agents/assistants to configure (Claude, GitHub Copilot, etc.)
2. Set up the Nx MCP server configuration
3. Generate AI agent configuration files (`AGENTS.md`, `CLAUDE.md`)

#### Manual Setup:

**For MCP-compatible clients (Claude Desktop, VS Code with MCP):**

Create or update `mcp.json`:

```json
{
  "servers": {
    "nx-mcp": {
      "command": "npx",
      "args": ["nx-mcp@latest"]
    }
  }
}
```

**For Claude Code CLI:**

```powershell
claude mcp add nx-mcp npx nx-mcp@latest
```

**For VS Code with GitHub Copilot:**

VS Code automatically detects Nx workspaces when using GitHub Copilot with MCP support enabled.

#### Learn More:

- [Nx AI Setup Documentation](https://nx.dev/docs/getting-started/ai-setup)
- [Nx MCP Server Reference](https://nx.dev/docs/reference/nx-mcp)
- [Why Nx and AI Work Together](https://nx.dev/blog/nx-and-ai-why-they-work-together)

### Step 10: Configure Internationalization (i18n) with ngx-translate

**Install ngx-translate for runtime language switching:**

```powershell
# Install ngx-translate core and HTTP loader
npm install @ngx-translate/core @ngx-translate/http-loader
```

**Create translation JSON files:**

Create `apps/admin/public/i18n/en-US.json`:

```json
{
  "app": {
    "title": "SmartCafe Admin",
    "welcome": "Welcome to SmartCafe"
  },
  "cafes": {
    "title": "Cafes",
    "description": "Manage your cafe locations",
    "createButton": "Create Cafe",
    "deleteButton": "Delete",
    "count": {
      "zero": "No cafes",
      "one": "One cafe",
      "other": "{{count}} cafes"
    }
  },
  "form": {
    "name": "Name",
    "namePlaceholder": "Enter cafe name",
    "contactInfo": "Contact Information",
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "validation": {
    "required": "This field is required",
    "maxLength": "Maximum {{max}} characters allowed"
  }
}
```

Create `apps/admin/public/i18n/uk-UA.json`:

```json
{
  "app": {
    "title": "SmartCafe Адмін",
    "welcome": "Ласкаво просимо до SmartCafe"
  },
  "cafes": {
    "title": "Кав'ярні",
    "description": "Керуйте локаціями ваших кав'ярень",
    "createButton": "Створити кав'ярню",
    "deleteButton": "Видалити",
    "count": {
      "zero": "Немає кав'ярень",
      "one": "Одна кав'ярня",
      "few": "{{count}} кав'ярні",
      "other": "{{count}} кав'ярень"
    }
  },
  "form": {
    "name": "Назва",
    "namePlaceholder": "Введіть назву кав'ярні",
    "contactInfo": "Контактна інформація",
    "submit": "Надіслати",
    "cancel": "Скасувати"
  },
  "validation": {
    "required": "Це поле обов'язкове",
    "maxLength": "Максимум {{max}} символів"
  }
}
```

**Create Locale Service for centralized locale management:**

```typescript
// libs/shared/utils/src/lib/services/locale.service.ts

import { Injectable, signal, effect, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const SUPPORTED_LOCALES = {
  EN_US: 'en-US',
  UK_UA: 'uk-UA'
} as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[keyof typeof SUPPORTED_LOCALES];

export const DEFAULT_LOCALE: SupportedLocale = SUPPORTED_LOCALES.EN_US;

export const LOCALE_CURRENCY_MAP: Record<SupportedLocale, string> = {
  [SUPPORTED_LOCALES.EN_US]: 'USD',
  [SUPPORTED_LOCALES.UK_UA]: 'UAH'
};

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private readonly STORAGE_KEY = 'smartcafe-locale';
  private readonly DEFAULT_LOCALE = DEFAULT_LOCALE;
  
  // Signal for reactive locale changes
  currentLocale = signal<SupportedLocale>(this.getStoredLocale());

  // Computed signal for currency based on locale
  currentCurrency = computed(() => LOCALE_CURRENCY_MAP[this.currentLocale()]);

  constructor(private translate: TranslateService) {
    // Configure supported languages
    this.translate.addLangs(Object.values(SUPPORTED_LOCALES));
    this.translate.setDefaultLang(DEFAULT_LOCALE);
    
    // Set initial locale
    const locale = this.getStoredLocale();
    this.translate.use(locale);
    
    // Persist locale changes to localStorage
    effect(() => {
      const locale = this.currentLocale();
      localStorage.setItem(this.STORAGE_KEY, locale);
      this.translate.use(locale);
    });
  }

  setLocale(locale: SupportedLocale): void {
    this.currentLocale.set(locale);
  }

  private getStoredLocale(): SupportedLocale {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const isValid = Object.values(SUPPORTED_LOCALES).includes(stored as SupportedLocale);
    return isValid ? (stored as SupportedLocale) : this.DEFAULT_LOCALE;
  }

  // Get Angular locale ID for pipes
  getAngularLocale(): string {
    return this.currentLocale();
  }
}
```

**Configure app.config.ts:**

```typescript
// apps/admin/src/app/app.config.ts

import { ApplicationConfig, provideExperimentalZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { appRoutes } from './app.routes';

// Translation loader factory
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), // Zoneless change detection
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([/* your interceptors */])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en-US',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

**Create Local Date Pipe with Intl API:**

```typescript
// libs/shared/utils/src/lib/pipes/local-date.pipe.ts

import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../services/locale.service';

@Pipe({
  name: 'scLocalDate',
  standalone: true,
  pure: false // Re-evaluate when locale changes
})
export class ScLocalDatePipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(
    value: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string {
    const locale = this.localeService.currentLocale();
    const date = value instanceof Date ? value : new Date(value);
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  }
}
```

**Create Local Currency Pipe with Intl API:**

```typescript
// libs/shared/utils/src/lib/pipes/local-currency.pipe.ts

import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../services/locale.service';

@Pipe({
  name: 'scLocalCurrency',
  standalone: true,
  pure: false
})
export class ScLocalCurrencyPipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(
    value: number | string,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ): string {
    const locale = this.localeService.currentLocale();
    // Use locale-based currency if not specified
    const currencyCode = currency ?? this.localeService.currentCurrency();
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      ...options
    }).format(amount);
  }
}
```

**Create Local Number Pipe with Intl API:**

```typescript
// libs/shared/utils/src/lib/pipes/local-number.pipe.ts

import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../services/locale.service';

@Pipe({
  name: 'scLocalNumber',
  standalone: true,
  pure: false
})
export class ScLocalNumberPipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(
    value: number | string,
    options?: Intl.NumberFormatOptions
  ): string {
    const locale = this.localeService.currentLocale();
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat(locale, options).format(num);
  }
}
```

**Language Selector Component:**

```typescript
// libs/shared/ui/src/lib/language-selector/language-selector.component.ts

import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { LocaleService, SupportedLocale } from '@smartcafe/admin/shared/utils';

@Component({
  selector: 'sc-language-selector',
  standalone: true,
  imports: [MatSelectModule],
  template: `
    <mat-select 
      [value]="localeService.currentLocale()" 
      (selectionChange)="onLanguageChange($event.value)"
      aria-label="Select language">
      <mat-option value="en-US">English (US)</mat-option>
      <mat-option value="uk-UA">Українська</mat-option>
    </mat-select>
  `,
  styles: [`
    mat-select {
      min-width: 120px;
    }
  `]
})
export class LanguageSelectorComponent {
  localeService = inject(LocaleService);

  onLanguageChange(locale: SupportedLocale): void {
    this.localeService.setLocale(locale);
  }
}
```

**Usage in Templates:**

```html
<!-- Simple translation -->
<h1>{{ 'app.title' | translate }}</h1>

<!-- With parameters -->
<p>{{ 'cafes.count.other' | translate: {count: 5} }}</p>

<!-- Placeholder -->
<input [placeholder]="'form.namePlaceholder' | translate" />

<!-- Formatted dates -->
<p>{{ createdAt | scLocalDate }}</p>
<p>{{ updatedAt | scLocalDate:{ dateStyle: 'short' } }}</p>
<p>{{ now | scLocalDate:{ timeStyle: 'medium' } }}</p>

<!-- Formatted currency -->
<p>{{ price | scLocalCurrency:'UAH' }}</p>
<p>{{ price | scLocalCurrency:'UAH':{ minimumFractionDigits: 2 } }}</p>

<!-- Formatted numbers -->
<p>{{ quantity | scLocalNumber }}</p>
<p>{{ percentage | scLocalNumber:{ style: 'percent' } }}</p>
```

**Usage in Components:**

```typescript
import { Component, inject } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LocaleService } from '@smartcafe/admin/shared/utils';
import { 
  ScLocalDatePipe, 
  ScLocalCurrencyPipe,
  ScLocalNumberPipe 
} from '@smartcafe/admin/shared/utils';

@Component({
  selector: 'sc-cafe-details',
  standalone: true,
  imports: [
    TranslateModule,
    ScLocalDatePipe,
    ScLocalCurrencyPipe,
    ScLocalNumberPipe
  ],
  template: `
    <h2>{{ 'cafes.title' | translate }}</h2>
    <p>{{ 'cafes.description' | translate }}</p>
    <p>Created: {{ cafe.createdAt | scLocalDate }}</p>
    <p>Revenue: {{ cafe.revenue | scLocalCurrency }}</p>
  `
})
export class ScCafeDetailsComponent {
  private translate = inject(TranslateService);
  private localeService = inject(LocaleService);

  showMessage(): void {
    // Programmatic translation
    const message = this.translate.instant('cafes.count.other', { count: 10 });
    console.log(message);
    
    // Get current locale
    const currentLocale = this.localeService.currentLocale();
    console.log('Current locale:', currentLocale);
  }
}
```

**Add to Toolbar:**

```typescript
// apps/admin/src/app/shell/toolbar/toolbar.component.ts

import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '@smartcafe/admin/shared/ui';

@Component({
  selector: 'sc-toolbar',
  standalone: true,
  imports: [MatToolbarModule, TranslateModule, LanguageSelectorComponent],
  template: `
    <mat-toolbar color="primary">
      <span>{{ 'app.title' | translate }}</span>
      <span class="spacer"></span>
      <sc-language-selector />
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class ToolbarComponent {}
```

### Step 11: Configure Prettier & Husky

**Install Prettier and Husky for code quality:**

```powershell
# Install Prettier
npm install -D prettier

# Install Husky and lint-staged
npm install -D husky lint-staged

# Initialize Husky
npx husky init
```

**Create `.prettierrc` in project root:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "auto",
  "htmlWhitespaceSensitivity": "css",
  "bracketSpacing": true
}
```

**Create `.prettierignore`:**

```
# Dependencies
node_modules
dist
.nx
coverage

# Build outputs
*.tsbuildinfo
.angular

# IDE
.vscode
.idea
```

**Configure Husky pre-commit hook:**

```powershell
# Create pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
```

**Add `lint-staged` configuration to `package.json`:**

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.html": ["prettier --write"],
    "*.scss": ["prettier --write"],
    "*.json": ["prettier --write"]
  }
}
```

**Configure proxy for local development:**

Create `proxy.conf.json` in project root:

```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Update `project.json` for admin app to use proxy:**

```json
{
  "targets": {
    "serve": {
      "executor": "@angular-devkit/build-angular:dev-server",
      "options": {
        "proxyConfig": "proxy.conf.json"
      }
    }
  }
}
```

### Step 12: Register HTTP Interceptors

**Configure interceptors in `apps/admin/src/app/app.config.ts`:**

```typescript
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

// Import interceptors
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), // Zoneless for better performance
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([
        errorInterceptor,
        loadingInterceptor,
        retryInterceptor
      ])
    )
  ]
};
```

**Note:** Interceptors are applied in the order they are listed. The retry interceptor runs first, then loading, then error handling.

---

## Zoneless Application Best Practices

**This application uses experimental zoneless change detection for better performance and smaller bundle size.**

### Why Zoneless?

✅ **~30-40KB smaller bundle** (no Zone.js library)  
✅ **Better runtime performance** (no monkey-patching of browser APIs)  
✅ **More predictable behavior** (explicit change detection)  
✅ **Better tree-shaking** (unused code is removed)  
✅ **Modern reactive patterns** (aligns with signals and future Angular direction)  
✅ **Easier debugging** (know exactly when UI updates happen)

### Required Coding Patterns

#### 1. **Use Signals for All Component State (Mandatory)**

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'sc-cafe-card',
  changeDetection: ChangeDetectionStrategy.OnPush, // Required!
  template: `
    <h3>{{ name() }}</h3>
    <p>Items: {{ itemCount() }}</p>
    <p>Status: {{ displayStatus() }}</p>
    <button (click)="increment()">Add Item</button>
  `
})
export class CafeCardComponent {
  // ✅ Use signals for all state
  name = signal('My Cafe');
  itemCount = signal(0);
  
  // ✅ Use computed for derived state
  displayStatus = computed(() => 
    this.itemCount() > 0 ? 'Active' : 'Empty'
  );
  
  // ✅ Event handlers automatically trigger change detection
  increment() {
    this.itemCount.update(n => n + 1); // UI updates automatically
  }
}
```

#### 2. **OnPush Change Detection Strategy (Mandatory)**

**All components MUST use OnPush:**

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sc-menu-list',
  changeDetection: ChangeDetectionStrategy.OnPush, // ⚠️ Required for zoneless!
  // ...
})
export class MenuListComponent { }
```

#### 3. **Use Signal Inputs (Angular 17.1+)**

```typescript
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'sc-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h4>{{ item().name }}</h4>
      <p>{{ formattedPrice() }}</p>
    </div>
  `
})
export class MenuItemComponent {
  // ✅ Signal input (automatically reactive)
  item = input.required<MenuItem>();
  
  // ✅ Computed from input
  formattedPrice = computed(() => 
    `$${this.item().price.toFixed(2)}`
  );
}
```

#### 4. **Handle Async Operations with Signals**

**Option 1: Use NgRx Signal Store (Recommended)**

```typescript
import { Component, inject } from '@angular/core';

@Component({
  selector: 'sc-cafe-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cafeStore.loading()) {
      <mat-spinner></mat-spinner>
    }
    
    @if (cafeStore.cafes(); as cafeList) {
      @for (cafe of cafeList; track cafe.id) {
        <sc-cafe-card [cafe]="cafe" />
      }
    }
  `
})
export class CafeListComponent {
  // ✅ Recommended: Use NgRx Signal Store
  // All async logic stays in the store, component stays synchronous
  cafeStore = inject(CafeStore);
  
  ngOnInit() {
    this.cafeStore.loadCafes(); // No async/await needed in component!
  }
}
```

**Option 2: Convert Observable to Signal (for simple cases)**

```typescript
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'sc-menu-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (menus(); as menuList) {
      @for (menu of menuList; track menu.id) {
        <sc-menu-card [menu]="menu" />
      }
    }
  `
})
export class MenuListComponent {
  private menuService = inject(MenuApiService);
  
  // ✅ Convert Observable to Signal (for read-only data)
  menus = toSignal(this.menuService.getMenus(this.cafeId), { initialValue: [] });
}
```

**Option 3: Manual Signal Management (avoid if using store)**

```typescript
// ⚠️ Only use this pattern if NOT using NgRx Signal Store
// If you have a store, put this logic there instead!
export class DataComponent {
  loading = signal(false);
  data = signal<Cafe[]>([]);
  
  async loadData() {
    this.loading.set(true);
    try {
      const result = await this.service.getData();
      this.data.set(result); // ✅ Signal update triggers UI
    } finally {
      this.loading.set(false);
    }
  }
}
```

#### 5. **Use Async Pipe for Observables (Alternative Pattern)**

```typescript
@Component({
  selector: 'sc-menu-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (menus$ | async; as menus) {
      @for (menu of menus; track menu.id) {
        <sc-menu-card [menu]="menu" />
      }
    }
  `
})
export class MenuGridComponent {
  // ✅ Async pipe automatically handles change detection
  menus$ = inject(MenuApiService).getMenus(this.cafeId);
}
```

#### 6. **NgRx Signal Store Pattern**

```typescript
// libs/data-access-cafes/src/lib/store/cafe.store.ts

import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';

type CafeState = {
  cafes: Cafe[];
  loading: boolean;
  error: string | null;
};

export const CafeStore = signalStore(
  { providedIn: 'root' },
  withState<CafeState>({
    cafes: [],
    loading: false,
    error: null
  }),
  withMethods((store, cafeApi = inject(CafeApiService)) => ({
    async loadCafes() {
      patchState(store, { loading: true, error: null });
      try {
        const cafes = await cafeApi.getCafes();
        patchState(store, { cafes, loading: false });
      } catch (error) {
        patchState(store, { 
          error: error.message, 
          loading: false 
        });
      }
    },
    
    async addCafe(cafe: CreateCafeRequest) {
      const newCafe = await cafeApi.createCafe(cafe);
      patchState(store, (state) => ({
        cafes: [...state.cafes, newCafe]
      }));
    }
  }))
);
```

**Usage in component:**

```typescript
@Component({
  selector: 'sc-cafe-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cafeStore.loading()) {
      <mat-spinner></mat-spinner>
    }
    
    @for (cafe of cafeStore.cafes(); track cafe.id) {
      <sc-cafe-card [cafe]="cafe" />
    }
  `
})
export class CafeManagementComponent {
  cafeStore = inject(CafeStore);
  
  ngOnInit() {
    // ✅ No async needed in component - store handles async operations
    // Just call the store method, it updates signals automatically
    this.cafeStore.loadCafes();
  }
}
```

**Important:** When using NgRx Signal Store, **keep all async operations in the store**. Components should just call store methods synchronously. The store updates signals, which automatically trigger UI updates.

#### 7. **RxJS Integration with Signals**

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'sc-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input [value]="searchTerm()" (input)="onSearch($event)" />
    
    @for (result of results(); track result.id) {
      <div>{{ result.name }}</div>
    }
  `
})
export class SearchComponent {
  private searchService = inject(SearchService);
  
  // ✅ Signal for search term
  searchTerm = signal('');
  
  // ✅ Convert signal to observable for RxJS operators
  private searchTerm$ = toObservable(this.searchTerm);
  
  // ✅ Convert observable result back to signal
  results = toSignal(
    this.searchTerm$.pipe(
      debounceTime(300),
      switchMap(term => this.searchService.search(term))
    ),
    { initialValue: [] }
  );
  
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value); // ✅ Triggers RxJS pipeline
  }
}
```

### What Works Automatically vs. What Requires Manual Handling

#### ✅ **Automatic Change Detection:**

```typescript
// 1. Signals
count = signal(0);
increment() {
  this.count.update(n => n + 1); // ✅ UI updates automatically
}

// 2. Event handlers
template: `<button (click)="onClick()">Click</button>`
onClick() {
  this.data = 'new value'; // ✅ UI updates automatically
}

// 3. Async pipe
data$ = this.http.get('/api/data');
template: `{{ data$ | async }}` // ✅ UI updates automatically
```

#### ⚠️ **Manual Change Detection Required:**

```typescript
import { ChangeDetectorRef, inject } from '@angular/core';

// ❌ DON'T: These won't trigger UI updates in zoneless mode
setTimeout(() => {
  this.data = 'new value'; // Won't update UI!
}, 1000);

this.http.get('/api').subscribe(data => {
  this.data = data; // Won't update UI!
});

thirdPartyLib.onComplete(() => {
  this.done = true; // Won't update UI!
});

// ✅ DO: Use signals instead
data = signal('initial');

setTimeout(() => {
  this.data.set('new value'); // ✅ Updates UI
}, 1000);

this.http.get('/api').subscribe(data => {
  this.data.set(data); // ✅ Updates UI
});

// ✅ OR: Manual change detection (last resort)
private cdr = inject(ChangeDetectorRef);

setTimeout(() => {
  this.data = 'new value';
  this.cdr.markForCheck(); // ✅ Manually trigger update
}, 1000);
```

### Migration Checklist

**For each component:**

- [ ] Add `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] Convert all class properties to signals: `value = signal(initial)`
- [ ] Convert `@Input()` to `input()` or `input.required()`
- [ ] Use `computed()` for derived state
- [ ] Replace `@Output()` with `output<T>()`
- [ ] Wrap async operations with signal updates
- [ ] Use `toSignal()` for observables or async pipe
- [ ] Remove any `setTimeout`, `setInterval` without signal updates
- [ ] Test that UI updates correctly on all state changes

### Common Patterns

#### **Form Handling with Signals:**

```typescript
@Component({
  selector: 'sc-cafe-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" />
      @if (cafeStore.loading()) {
        <mat-spinner></mat-spinner>
      }
      <button [disabled]="cafeStore.loading()">Submit</button>
    </form>
  `
})
export class CafeFormComponent {
  private fb = inject(FormBuilder);
  cafeStore = inject(CafeStore);
  
  form = this.fb.group({
    name: ['', Validators.required]
  });
  
  onSubmit() {
    if (this.form.invalid) return;
    
    // ✅ Call store method synchronously - store handles async
    this.cafeStore.createCafe(this.form.value);
    this.form.reset();
  }
}
```

#### **Loading States:**

```typescript
@Component({
  selector: 'sc-data-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dataStore.loading()) {
      <mat-spinner></mat-spinner>
    } @else if (dataStore.error()) {
      <sc-error-message [message]="dataStore.error()" />
    } @else {
      <sc-data-grid [items]="dataStore.items()" />
    }
  `
})
export class DataViewComponent {
  dataStore = inject(DataStore);
  
  ngOnInit() {
    // ✅ Component stays synchronous - store handles async
    this.dataStore.loadData();
  }
}
```

**Store implementation:**

```typescript
export const DataStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as Item[],
    loading: false,
    error: null as string | null
  }),
  withMethods((store, service = inject(DataService)) => ({
    async loadData() {
      patchState(store, { loading: true, error: null });
      try {
        const items = await firstValueFrom(service.getData());
        patchState(store, { items, loading: false });
      } catch (e) {
        patchState(store, { error: e.message, loading: false });
      }
    }
  }))
);
```
```

### Performance Benefits

**Bundle Size Reduction:**
- Zone.js library: ~34KB (gzipped)
- No monkey-patching overhead
- Better tree-shaking of unused Angular features

**Runtime Performance:**
- No change detection on every async operation
- Explicit, predictable UI updates
- Fewer unnecessary change detection cycles
- Better scalability for large applications

### Testing with Zoneless

```typescript
import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('CafeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection() // ✅ Use in tests
      ]
    });
  });
  
  it('should update on signal change', () => {
    const fixture = TestBed.createComponent(CafeComponent);
    const component = fixture.componentInstance;
    
    component.name.set('New Name');
    fixture.detectChanges(); // Manual detection still works
    
    expect(fixture.nativeElement.textContent).toContain('New Name');
  });
});
```

---

## Nx Best Practices

### 1. Library Organization by Type

```typescript
// Feature libraries: Smart components, routing, orchestration
libs/feature-cafes/
libs/feature-menus/

// Data access libraries: API services, state management
libs/data-access-cafes/
libs/data-access-menus/

// UI libraries: Presentational components
libs/shared/ui/

// Utility libraries: Pure functions, helpers
libs/shared/utils/
libs/shared/models/
```

**When to Create a New Library:**

| Scenario | Library Type | Example |
|----------|--------------|----------|
| New feature domain | Feature library | `libs/feature-reports/` for reporting feature |
| New API endpoint group | Data access library | `libs/data-access-orders/` for order API |
| Component used 3+ times | Move to shared UI | Extract to `libs/shared/ui/` |
| Utility functions shared | Shared utils | `libs/shared/utils/` for helpers |
| DTOs/interfaces shared | Shared models | `libs/shared/models/` for types |
| Testing helpers | Testing library | `libs/testing/test-helpers/` |

**Decision Flow:**

```
Is it a complete feature with pages/routing?
  → Yes: Create feature library (libs/feature-{name}/)
  → No: Continue

Is it API/state management for a domain?
  → Yes: Create data-access library (libs/data-access-{name}/)
  → No: Continue

Is it a UI component used 3+ times?
  → Yes: Add to libs/shared/ui/
  → No: Keep in feature library

Is it a utility function/model?
  → Yes: Add to libs/shared/utils/ or libs/shared/models/
  → No: Keep in feature library
```

**When to Create a New Library:**

| Scenario | Library Type | Example |
|----------|--------------|----------|
| New feature domain | Feature library | `libs/feature-reports/` for reporting feature |
| New API endpoint group | Data access library | `libs/data-access-orders/` for order API |
| Component used 3+ times | Move to shared UI | Extract to `libs/shared/ui/` |
| Utility functions shared | Shared utils | `libs/shared/utils/` for helpers |
| DTOs/interfaces shared | Shared models | `libs/shared/models/` for types |
| Testing helpers | Testing library | `libs/testing/test-helpers/` |

**Decision Flow:**

```
Is it a complete feature with pages/routing?
  → Yes: Create feature library (libs/feature-{name}/)
  → No: Continue

Is it API/state management for a domain?
  → Yes: Create data-access library (libs/data-access-{name}/)
  → No: Continue

Is it a UI component used 3+ times?
  → Yes: Add to libs/shared/ui/
  → No: Keep in feature library

Is it a utility function/model?
  → Yes: Add to libs/shared/utils/ or libs/shared/models/
  → No: Keep in feature library
```

### 2. Shared Component Rule (Rule of Three)

**When to create a shared component:**
- ✅ **If a component is used 3+ times across different features, move it to `libs/shared/ui/`**
- ✅ This ensures maintainability and consistency
- ✅ Updates to shared components automatically propagate to all usage locations
- ✅ Single source of truth prevents diverging implementations
- ✅ Examples: loading spinner, error message, confirmation dialog, empty state, data table, form fields

**Component placement:**
- **Feature-specific components** (used 1-2 times): Keep in feature library (e.g., `libs/feature-cafes/`)
- **Reusable components** (used 3+ times): Move to `libs/shared/ui/`
- **Cross-cutting components** (used in multiple features): Always in `libs/shared/ui/`

**Refactoring workflow:**
1. Component appears in 3rd location → Extract to `libs/shared/ui/`
2. Update all usage locations to import from `@smartcafe/admin/shared/ui`
3. Add component to Storybook for documentation
4. Write comprehensive tests for shared component

### 3. Dependency Constraints (nx.json)

```json
{
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["!{projectRoot}/**/*.spec.ts"]
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "test": {
      "cache": true
    }
  },
  "generators": {
    "@nx/angular:application": {
      "style": "scss",
      "linter": "eslint",
      "unitTestRunner": "vitest",
      "e2eTestRunner": "playwright"
    },
    "@nx/angular:library": {
      "linter": "eslint",
      "unitTestRunner": "vitest"
    },
    "@nx/angular:component": {
      "style": "scss",
      "changeDetection": "OnPush"
    }
  },
  "plugins": [
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    }
  ]
}
```

### 3. Tagging Strategy (.eslintrc.json)

```json
{
  "overrides": [
    {
      "files": ["*.ts"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "type:feature",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:ui",
                  "type:utils",
                  "type:models"
                ]
              },
              {
                "sourceTag": "type:data-access",
                "onlyDependOnLibsWithTags": [
                  "type:models",
                  "type:utils"
                ]
              },
              {
                "sourceTag": "type:ui",
                "onlyDependOnLibsWithTags": [
                  "type:models",
                  "type:utils"
                ]
              },
              {
                "sourceTag": "scope:admin",
                "onlyDependOnLibsWithTags": [
                  "scope:admin",
                  "scope:shared"
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### 4. Path Aliases (tsconfig.base.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@smartcafe/admin/feature-cafes": ["libs/feature-cafes/src/index.ts"],
      "@smartcafe/admin/feature-menus": ["libs/feature-menus/src/index.ts"],
      "@smartcafe/admin/data-access-cafes": ["libs/data-access-cafes/src/index.ts"],
      "@smartcafe/admin/data-access-menus": ["libs/data-access-menus/src/index.ts"],
      "@smartcafe/admin/shared/ui": ["libs/shared/ui/src/index.ts"],
      "@smartcafe/admin/shared/models": ["libs/shared/models/src/index.ts"],
      "@smartcafe/admin/shared/data-access": ["libs/shared/data-access/src/index.ts"],
      "@smartcafe/admin/shared/utils": ["libs/shared/utils/src/index.ts"],
      "@smartcafe/admin/testing/test-helpers": ["libs/testing/test-helpers/src/index.ts"]
    }
  }
}
```

### 5. Nx Commands

```powershell
# Serve the app
nx serve admin

# Build for production
nx build admin --configuration=production

# Run tests for affected projects
nx affected:test

# Lint affected projects
nx affected:lint

# Run tests for specific library
nx test feature-cafes

# Generate component in library
nx g @nx/angular:component cafe-card --project=feature-cafes --export

# Generate service in data-access library
nx g @nx/angular:service cafe-api --project=data-access-cafes

# View dependency graph
nx graph

# Run target for all projects
nx run-many --target=test --all

# Clear cache
nx reset
```

### 6. Using Angular MCP Server (VS Code)

The Angular MCP server works seamlessly with Nx:
- Generate components, services, guards in specific libraries
- Run Nx commands through MCP
- Access Angular documentation
- See: https://angular.dev/ai/mcp#vs-code

### 7. File Organization Rules

**One Entity Per File (Mandatory):**

✅ **One file per:**
- Class (components, services, directives, pipes)
- Interface
- Enum

**Examples:**
```typescript
// ✅ CORRECT: cafe.component.ts
export class CafeComponent { }

// ✅ CORRECT: cafe-dto.interface.ts
export interface CafeDto { }

// ✅ CORRECT: menu-state.enum.ts
export enum MenuState { }

// ❌ WRONG: cafe.ts (multiple classes)
export class CafeComponent { }
export class CafeService { }  // Move to cafe.service.ts
```

✅ **Multiple items allowed per file:**
- Constants (e.g., `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`)
- Type aliases (e.g., `type UserId = string`)
- Helper types (e.g., `type Optional<T> = T | null`)

**Examples:**
```typescript
// ✅ CORRECT: constants.ts
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const SUPPORTED_FORMATS = ['jpg', 'png', 'webp'];
export const DEFAULT_TIMEOUT = 3000;

// ✅ CORRECT: types.ts
export type UserId = string;
export type CafeId = string;
export type Result<T> = { success: true; data: T } | { success: false; error: string };
```

**Why this rule?**
- Easier to find and navigate code
- Clearer module dependencies
- Better tree-shaking (unused classes are removed)
- Consistent codebase structure
- Simpler refactoring and maintenance

---

## Application Architecture

### Nx Library Organization

#### Apps Layer
```
apps/admin/               # Main application shell
└── src/
    ├── app/
    │   ├── app.component.ts
    │   ├── app.config.ts     # Providers, interceptors
    │   ├── app.routes.ts     # Lazy load feature libraries
    │   └── layout/           # App shell components
    ├── assets/
    ├── environments/
    └── main.ts
```

#### Feature Libraries (Smart Components + Routing)

**1. Cafes Feature** (`libs/feature-cafes`)
```typescript
// Lazy loaded route
export const CAFES_ROUTES: Route[] = [
  {
    path: '',
    component: CafeGridPageComponent
  },
  {
    path: 'create',
    component: CafeCreatePageComponent
  }
];

// Barrel export
export * from './lib/cafe-grid-page/cafe-grid-page.component';
export * from './lib/cafe-create-page/cafe-create-page.component';
export * from './lib/store/cafe.store';
```

**Contents**:
- `CafeGridPageComponent` - Main page with virtual scrolling
- `CafeCreatePageComponent` - Cafe creation form
- `CafeEditPageComponent` - Cafe editing (future)
- `CafeStore` - NgRx Signal Store for cafe feature state

**Features**:
- Virtual scrolling for large cafe lists
- Create/edit cafe with validation
- Soft delete with confirmation
- Search/filter cafes
- Navigate to cafe's menus
- Feature-level state management with CafeStore

**2. Menus Feature** (`libs/feature-menus`)
```typescript
// Lazy loaded route
export const MENUS_ROUTES: Route[] = [
  {
    path: '',
    component: MenuGridPageComponent
  },
  {
    path: 'create',
    component: MenuCreatePageComponent
  },
  {
    path: ':menuId/edit',
    component: MenuEditPageComponent
  },
  {
    path: ':menuId/preview',
    component: MenuPreviewPageComponent
  }
];

// Barrel export
export * from './lib/menu-grid-page/menu-grid-page.component';
export * from './lib/menu-create-page/menu-create-page.component';
export * from './lib/store/menu.store';
```

**Contents**:
- `MenuGridPageComponent` - Grid with state badges
- `MenuCreatePageComponent` - Multi-step menu creation
- `MenuEditPageComponent` - Edit with drag & drop
- `MenuPreviewPageComponent` - Customer-facing preview
- `MenuStore` - NgRx Signal Store for menu feature state

**Features**:
- Create menu with nested sections/items
- Drag & drop reordering (sections and items)
- Image upload for menu items
- Publish/Activate workflows
- Clone menu functionality
- State-based filtering (New/Published/Active)
- Feature-level state management with MenuStore

#### Data Access Libraries (API + State)

**1. Cafe Data Access** (`libs/data-access-cafes`)
```typescript
// Barrel export
export * from './lib/services/cafe-api.service';
export * from './lib/services/cafe-form.service';

// Usage in feature library
import { CafeApiService, CafeFormService } from '@smartcafe/admin/data-access-cafes';
```

**Contents**:
- `CafeApiService` - HTTP calls to cafe endpoints
- `CafeFormService` - Form operations with validation
- Cafe-specific models (if not in shared/models)

**2. Menu Data Access** (`libs/data-access-menus`)
```typescript
export * from './lib/services/menu-api.service';
export * from './lib/services/image-api.service';
export * from './lib/services/menu-form.service';
```

**Contents**:
- `MenuApiService` - HTTP calls to menu endpoints
- `ImageApiService` - Image upload service
- `MenuFormService` - Form operations with validation

#### UI Libraries (Presentational Components)

**1. Shared UI** (`libs/shared/ui`)
```typescript
// Core reusable components
export * from './lib/loading-spinner/loading-spinner.component';
export * from './lib/error-message/error-message.component';
export * from './lib/confirmation-dialog/confirmation-dialog.component';
export * from './lib/empty-state/empty-state.component';
```

#### Shared Libraries

**1. Models** (`libs/shared/models`)
```typescript
// All TypeScript models/DTOs
export * from './lib/cafe.models';
export * from './lib/menu.models';
export * from './lib/order.models'; // Future
export * from './lib/enums';
```

**2. Shared Data Access** (`libs/shared/data-access`)
```typescript
// Core services used across features
export * from './lib/theme.service';
export * from './lib/notification.service';
export * from './lib/error-handler.service';
export * from './lib/loading.service';
export * from './lib/i18n.service';
```

**3. Utils** (`libs/shared/utils`)
```typescript
// Pure utility functions
export * from './lib/date-utils';
export * from './lib/validation-utils';
export * from './lib/image-compression';
```

#### Testing Libraries

**Test Helpers** (`libs/testing/test-helpers`)
```typescript
// Shared test utilities
export * from './lib/mocks/cafe.mocks';
export * from './lib/mocks/menu.mocks';
export * from './lib/test-utils';
```

---

## Nx Generators & Workflows

### Generate Components

```powershell
# Generate component in feature library
nx g @nx/angular:component cafe-card `
  --project=feature-cafes `
  --export `
  --changeDetection=OnPush

# Generate presentational component in UI library
nx g @nx/angular:component loading-spinner `
  --project=shared-ui `
  --export `
  --changeDetection=OnPush

# Generate page component
nx g @nx/angular:component cafe-grid-page `
  --project=feature-cafes `
  --flat `
  --export
```

### Generate Services

```powershell
# Generate service in data-access library
nx g @nx/angular:service cafe-api `
  --project=data-access-cafes

# Generate shared service
nx g @nx/angular:service theme `
  --project=shared-data-access
```

### Generate Stores

```powershell
# Create store file manually in data-access library
# libs/data-access-cafes/src/lib/store/cafe.store.ts
```

### Generate Guards

```powershell
# Generate guard
nx g @nx/angular:guard unsaved-changes `
  --project=shared-data-access `
  --functional
```

### Run Development Server

```powershell
# Serve with hot reload
nx serve admin

# Serve with specific configuration
nx serve admin --configuration=development
```

### Build & Test

```powershell
# Build app for production
nx build admin --configuration=production

# Test specific library
nx test feature-cafes

# Test all affected by changes
nx affected:test

# Test with coverage
nx test admin --coverage

# E2E tests
nx e2e admin-e2e
```

### Code Quality

```powershell
# Lint specific library
nx lint feature-cafes

# Lint all affected
nx affected:lint

# Format code
nx format:write

# Check formatting
nx format:check
```

### Dependency Graph

```powershell
# View interactive dependency graph
nx graph

# Show affected projects
nx affected:graph

# List dependencies
nx list
```

---

## Main Application Routes (apps/admin/app.routes.ts)

```typescript
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/cafes',
    pathMatch: 'full'
  },
  {
    path: 'cafes',
    loadChildren: () =>
      import('@smartcafe/admin/feature-cafes').then((m) => m.CAFES_ROUTES)
  },
  {
    path: 'cafes/:cafeId/menus',
    loadChildren: () =>
      import('@smartcafe/admin/feature-menus').then((m) => m.MENUS_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/cafes'
  }
];
```
- `MenuCreatePage` - Create menu with sections/items
- `MenuEditPage` - Edit existing menu (drag & drop)
- `MenuPreviewPage` - Customer-facing menu view
- `MenuCard` - Menu summary card with actions
- `MenuForm` - Multi-step form (name → sections → items)
- `SectionForm` - Section with availability hours
- `MenuItemForm` - Item with price, ingredients, image
- `SectionDragDrop` - Drag & drop for sections
- `MenuItemDragDrop` - Drag & drop for items within section
- `MenuStateBadge` - Visual state indicator (New/Published/Active)

**Features**:
- Create menu with nested sections and items
- Drag & drop reordering (sections and items)
- Image upload for menu items (with client-side compression)
- Publish menu (New → Published)
- Activate menu (Published → Active, deactivates others)
- Clone menu with new name
- Delete menu (only if state is New)
- Update menu (changes go live if Active)
- Get active menu (customer-facing)
- Filter by menu state
- Virtual scrolling for large menus

---

## API Integration

### Base URL Configuration

**Environment Files**:

```typescript
// src/environments/environment.ts (development)
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api'
};

// src/environments/environment.staging.ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://smartcafe-api-staging.azurewebsites.net/api'
};

// src/environments/environment.production.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://smartcafe-api.azurewebsites.net/api'
};
```

**Proxy Configuration** (for local development):

```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### API Endpoints Reference

#### Cafe Endpoints

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|--------------|----------|-------------|
| GET | `/cafes` | - | `CafeDto[]` | List all cafes |
| POST | `/cafes` | `CreateCafeRequest` | `CreateCafeResponse` | Create cafe |
| GET | `/cafes/{cafeId}` | - | `CafeDto` | Get cafe by ID |
| DELETE | `/cafes/{cafeId}` | - | 204 No Content | Soft delete cafe |

#### Menu Endpoints

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|--------------|----------|-------------|
| GET | `/cafes/{cafeId}/menus` | - | `ListMenusResponse` | List menus for cafe |
| POST | `/cafes/{cafeId}/menus` | `CreateMenuRequest` | `CreateMenuResponse` | Create menu |
| GET | `/cafes/{cafeId}/menus/{menuId}` | - | `MenuDto` | Get menu by ID |
| PUT | `/cafes/{cafeId}/menus/{menuId}` | `UpdateMenuRequest` | 204 No Content | Update menu |
| DELETE | `/cafes/{cafeId}/menus/{menuId}` | - | 204 No Content | Delete menu |
| GET | `/cafes/{cafeId}/menus/active` | - | `MenuDto` | Get active menu |
| POST | `/cafes/{cafeId}/menus/{menuId}/clone` | `CloneMenuRequest` | `CreateMenuResponse` | Clone menu |
| POST | `/cafes/{cafeId}/menus/{menuId}/publish` | - | `PublishMenuResponse` | Publish menu |
| POST | `/cafes/{cafeId}/menus/{menuId}/activate` | - | `ActivateMenuResponse` | Activate menu |

#### Image Endpoint

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|--------------|----------|-------------|
| POST | `/images/upload` | `FormData` (multipart) | `UploadImageResponse` | Upload menu item image |

### TypeScript Models (DTOs)

```typescript
// src/app/shared/models/api.models.ts

// =====================
// Enums
// =====================

export enum MenuState {
  New = 0,
  Published = 1,
  Active = 2,
  Deleted = 3
}

export enum PriceUnit {
  PerItem = 0,
  Per100Grams = 1
}

// =====================
// Cafe Models
// =====================

export interface CafeDto {
  id: string; // GUID
  name: string;
  contactInfo: string | null;
  createdAt: string; // ISO 8601 DateTime
  updatedAt: string | null; // ISO 8601 DateTime
}

export interface CreateCafeRequest {
  name: string;
  contactInfo?: string | null;
}

export interface CreateCafeResponse {
  cafeId: string; // GUID
}

// =====================
// Menu Models
// =====================

export interface MenuDto {
  id: string; // GUID
  name: string;
  state: MenuState;
  sections: SectionDto[];
  createdAt: string; // ISO 8601 DateTime
  updatedAt: string; // ISO 8601 DateTime
}

export interface SectionDto {
  id: string | null; // GUID (null for new sections)
  name: string;
  availableFrom: string | null; // TimeSpan (HH:mm:ss)
  availableTo: string | null; // TimeSpan (HH:mm:ss)
  items: MenuItemDto[];
}

export interface MenuItemDto {
  id: string | null; // GUID (null for new items)
  name: string;
  description: string | null;
  price: PriceDto;
  image: MenuItemImageDto | null;
  ingredients: IngredientDto[];
}

export interface PriceDto {
  amount: number; // decimal
  unit: PriceUnit;
  discount: number; // decimal (0-100)
}

export interface MenuItemImageDto {
  originalImageUrl: string;
  thumbnailImageUrl: string;
}

export interface IngredientDto {
  name: string;
  isExcludable: boolean;
}

export interface CreateMenuRequest {
  name: string;
  sections: SectionDto[];
}

export interface UpdateMenuRequest {
  name: string;
  sections: SectionDto[];
}

export interface CreateMenuResponse {
  menuId: string; // GUID
}

export interface CloneMenuRequest {
  newName: string;
}

export interface PublishMenuResponse {
  menuId: string; // GUID
  state: MenuState; // Should be Published
}

export interface ActivateMenuResponse {
  menuId: string; // GUID
  previousActiveMenuId: string | null; // GUID of deactivated menu
}

export interface ListMenusResponse {
  menus: MenuSummaryDto[];
}

export interface MenuSummaryDto {
  id: string; // GUID
  name: string;
  state: MenuState;
  itemCount: number;
  createdAt: string; // ISO 8601 DateTime
  updatedAt: string; // ISO 8601 DateTime
}

export interface UploadImageResponse {
  originalImageUrl: string;
  thumbnailImageUrl: string;
}
```

### API Services Implementation

```typescript
// src/app/features/cafes/services/cafe-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  CafeDto, 
  CreateCafeRequest, 
  CreateCafeResponse
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CafeApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/cafes`;

  getCafes(): Observable<CafeDto[]> {
    return this.http.get<CafeDto[]>(this.baseUrl);
  }

  getCafe(cafeId: string): Observable<CafeDto> {
    return this.http.get<CafeDto>(`${this.baseUrl}/${cafeId}`);
  }

  createCafe(request: CreateCafeRequest): Observable<CreateCafeResponse> {
    return this.http.post<CreateCafeResponse>(this.baseUrl, request);
  }

  deleteCafe(cafeId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cafeId}`);
  }
}
```

```typescript
// src/app/features/menus/services/menu-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  MenuDto,
  CreateMenuRequest,
  UpdateMenuRequest,
  CreateMenuResponse,
  CloneMenuRequest,
  PublishMenuResponse,
  ActivateMenuResponse,
  ListMenusResponse
} from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getMenus(cafeId: string): Observable<ListMenusResponse> {
    return this.http.get<ListMenusResponse>(`${this.baseUrl}/cafes/${cafeId}/menus`);
  }

  getMenu(cafeId: string, menuId: string): Observable<MenuDto> {
    return this.http.get<MenuDto>(`${this.baseUrl}/cafes/${cafeId}/menus/${menuId}`);
  }

  getActiveMenu(cafeId: string): Observable<MenuDto> {
    return this.http.get<MenuDto>(`${this.baseUrl}/cafes/${cafeId}/menus/active`);
  }

  createMenu(cafeId: string, request: CreateMenuRequest): Observable<CreateMenuResponse> {
    return this.http.post<CreateMenuResponse>(`${this.baseUrl}/cafes/${cafeId}/menus`, request);
  }

  updateMenu(cafeId: string, menuId: string, request: UpdateMenuRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/cafes/${cafeId}/menus/${menuId}`, request);
  }

  deleteMenu(cafeId: string, menuId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cafes/${cafeId}/menus/${menuId}`);
  }

  cloneMenu(cafeId: string, menuId: string, request: CloneMenuRequest): Observable<CreateMenuResponse> {
    return this.http.post<CreateMenuResponse>(
      `${this.baseUrl}/cafes/${cafeId}/menus/${menuId}/clone`, 
      request
    );
  }

  publishMenu(cafeId: string, menuId: string): Observable<PublishMenuResponse> {
    return this.http.post<PublishMenuResponse>(
      `${this.baseUrl}/cafes/${cafeId}/menus/${menuId}/publish`, 
      null
    );
  }

  activateMenu(cafeId: string, menuId: string): Observable<ActivateMenuResponse> {
    return this.http.post<ActivateMenuResponse>(
      `${this.baseUrl}/cafes/${cafeId}/menus/${menuId}/activate`, 
      null
    );
  }
}
```

```typescript
// src/app/features/menus/services/image-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UploadImageResponse } from '../../../shared/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ImageApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/images`;

  uploadImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<UploadImageResponse>(`${this.baseUrl}/upload`, formData);
  }
}
```

---

## Complete Implementation Examples

### 1. Component Using Signal Store

```typescript
// libs/feature-cafes/src/lib/cafe-grid/cafe-grid.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CafeStore } from '@smartcafe/admin/feature-cafes';
import { CafeCardComponent } from '../cafe-card/cafe-card.component';

@Component({
  selector: 'sc-cafe-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    CafeCardComponent
  ],
  template: `
    <div class="cafe-grid-container">
      <div class="header">
        <h1>Cafes</h1>
        <button mat-raised-button color="primary" routerLink="/cafes/create">
          <mat-icon>add</mat-icon>
          Create Cafe
        </button>
      </div>

      @if (cafeStore.loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      }

      @if (cafeStore.hasError()) {
        <div class="error-message">
          {{ cafeStore.error() }}
        </div>
      }

      @if (!cafeStore.loading() && cafeStore.cafeCount() === 0) {
        <div class="empty-state">
          <mat-icon>local_cafe</mat-icon>
          <p>No cafes found. Create your first cafe to get started!</p>
        </div>
      }

      @if (cafeStore.cafeCount() > 0) {
        <div class="grid">
          @for (cafe of cafeStore.cafes(); track cafe.id) {
            <sc-cafe-card
              [cafe]="cafe"
              (delete)="onDelete($event)"
              (navigate)="onNavigate($event)" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .cafe-grid-container {
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }
  `]
})
export class CafeGridComponent implements OnInit {
  cafeStore = inject(CafeStore);

  ngOnInit() {
    this.cafeStore.loadCafes();
  }

  async onDelete(cafeId: string) {
    if (confirm('Are you sure you want to delete this cafe?')) {
      await this.cafeStore.deleteCafe(cafeId);
    }
  }

  onNavigate(cafeId: string) {
    // Navigate to cafe menus
  }
}
```

### 2. Reactive Form with Validation

```typescript
// libs/feature-cafes/src/lib/cafe-form/cafe-form.component.ts

import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CafeStore } from '@smartcafe/admin/feature-cafes';
import { ValidationRules } from '@smartcafe/admin/shared/utils';

@Component({
  selector: 'sc-cafe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Create Cafe</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="cafeForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cafe Name</mat-label>
            <input matInput formControlName="name" required />
            @if (cafeForm.get('name')?.hasError('required') && cafeForm.get('name')?.touched) {
              <mat-error>{{ ValidationRules.Cafe.name.messages.required }}</mat-error>
            }
            @if (cafeForm.get('name')?.hasError('maxlength')) {
              <mat-error>{{ ValidationRules.Cafe.name.messages.maxLength }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contact Info</mat-label>
            <textarea matInput formControlName="contactInfo" rows="3"></textarea>
            @if (cafeForm.get('contactInfo')?.hasError('maxlength')) {
              <mat-error>{{ ValidationRules.Cafe.contactInfo.messages.maxLength }}</mat-error>
            }
          </mat-form-field>

          <div class="actions">
            <button mat-button type="button" (click)="onCancel()">Cancel</button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="cafeForm.invalid || submitting()">
              {{ submitting() ? 'Creating...' : 'Create Cafe' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class CafeFormComponent {
  private fb = inject(FormBuilder);
  cafeStore = inject(CafeStore);

  cancelled = output<void>();
  created = output<string>();

  cafeForm = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(ValidationRules.Cafe.name.maxLength)
    ]],
    contactInfo: ['', [
      Validators.maxLength(ValidationRules.Cafe.contactInfo.maxLength)
    ]]
  });

  onSubmit() {
    if (this.cafeForm.invalid) return;

    // ✅ Component stays synchronous - store handles async
    const { name, contactInfo } = this.cafeForm.value;
    this.cafeStore.createCafe(name!, contactInfo || undefined);
    this.cafeForm.reset();
    this.created.emit();
  }

  onCancel() {
    this.cafeForm.reset();
    this.cancelled.emit();
  }
}
```

### 3. Virtual Scrolling for Large Lists

```typescript
// libs/feature-cafes/src/lib/cafe-virtual-list/cafe-virtual-list.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CafeStore } from '@smartcafe/admin/feature-cafes';
import { CafeCardComponent } from '../cafe-card/cafe-card.component';

@Component({
  selector: 'sc-cafe-virtual-list',
  standalone: true,
  imports: [CommonModule, ScrollingModule, CafeCardComponent],
  template: `
    <cdk-virtual-scroll-viewport itemSize="200" class="viewport">
      @for (cafe of cafeStore.cafes(); track cafe.id) {
        <div class="cafe-item">
          <sc-cafe-card [cafe]="cafe" />
        </div>
      }
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .viewport {
      height: calc(100vh - 200px);
      width: 100%;
    }
    .cafe-item {
      height: 200px;
      padding: 12px;
      box-sizing: border-box;
    }
  `]
})
export class CafeVirtualListComponent implements OnInit {
  cafeStore = inject(CafeStore);

  ngOnInit() {
    this.cafeStore.loadCafes();
  }
}
```

### 4. Responsive Design with BreakpointObserver

```typescript
// libs/feature-menus/src/lib/menu-grid/menu-grid.component.ts

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatGridListModule } from '@angular/material/grid-list';
import { MenuStore } from '@smartcafe/admin/data-access-menus';

@Component({
  selector: 'sc-menu-grid',
  standalone: true,
  imports: [CommonModule, MatGridListModule],
  template: `
    <mat-grid-list [cols]="columns()" rowHeight="300px" gutterSize="16px">
      @for (menu of menuStore.menus(); track menu.id) {
        <mat-grid-tile>
          <sc-menu-card [menu]="menu" />
        </mat-grid-tile>
      }
    </mat-grid-list>
  `
})
export class MenuGridComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private menuStore = inject(MenuStore);
  private destroy$ = new Subject<void>();

  columns = signal(4);

  ngOnInit() {
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.columns.set(1);
        } else if (result.breakpoints[Breakpoints.Small]) {
          this.columns.set(2);
        } else if (result.breakpoints[Breakpoints.Medium]) {
          this.columns.set(3);
        } else {
          this.columns.set(4);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 5. Image Upload with Compression

```typescript
// libs/feature-menus/src/lib/image-upload/image-upload.component.ts

import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import { ImageApiService } from '@smartcafe/admin/data-access-menus';
import { ImageCompressionService } from '@smartcafe/admin/shared/utils';

@Component({
  selector: 'sc-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="upload-container">
      <input
        #fileInput
        type="file"
        accept="image/*"
        (change)="onFileSelected($event)"
        hidden />

      @if (!imageUrl()) {
        <button
          mat-raised-button
          color="primary"
          (click)="fileInput.click()"
          [disabled]="uploading()">
          <mat-icon>cloud_upload</mat-icon>
          {{ uploading() ? 'Uploading...' : 'Upload Image' }}
        </button>
      }

      @if (uploading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (imageUrl()) {
        <div class="image-preview">
          <img [src]="imageUrl()" alt="Uploaded image" />
          <button mat-icon-button (click)="removeImage()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    .upload-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .image-preview {
      position: relative;
      max-width: 300px;
    }
    .image-preview img {
      width: 100%;
      border-radius: 8px;
    }
    .image-preview button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
    }
    .error {
      color: #f44336;
      font-size: 14px;
    }
  `]
})
export class ImageUploadComponent {
  private imageApi = inject(ImageApiService);
  private compression = inject(ImageCompressionService);

  uploading = signal(false);
  imageUrl = signal<string | null>(null);
  error = signal<string | null>(null);
  uploaded = output<{ originalUrl: string; thumbnailUrl: string }>();

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image size must be less than 5MB');
      return;
    }

    this.uploading.set(true);
    this.error.set(null);

    try {
      // Compress image before upload
      const compressed = await this.compression.compressImage(file, 1920, 0.8);

      // Upload to server
      const response = await firstValueFrom(this.imageApi.uploadImage(compressed));

      this.imageUrl.set(response.originalImageUrl);
      this.uploaded.emit({
        originalUrl: response.originalImageUrl,
        thumbnailUrl: response.thumbnailImageUrl
      });
    } catch (error) {
      this.error.set('Upload failed. Please try again.');
      console.error('Upload failed:', error);
    } finally {
      this.uploading.set(false);
    }
  }

  removeImage() {
    this.imageUrl.set(null);
    this.error.set(null);
  }
}
```

### 6. Drag and Drop for Menu Builder

```typescript
// libs/feature-menus/src/lib/menu-builder/menu-builder.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule
} from '@angular/cdk/drag-drop';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'sc-menu-builder',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  template: `
    <form [formGroup]="menuForm">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Menu Name</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>

      <div class="sections-header">
        <h3>Sections</h3>
        <button mat-raised-button type="button" (click)="addSection()">
          <mat-icon>add</mat-icon>
          Add Section
        </button>
      </div>

      <div
        cdkDropList
        (cdkDropListDropped)="dropSection($event)"
        class="sections-list">
        @for (section of sectionsArray.controls; track section; let i = $index) {
          <mat-card cdkDrag class="section-card">
            <div class="drag-handle" cdkDragHandle>
              <mat-icon>drag_indicator</mat-icon>
            </div>

            <div [formGroupName]="i" class="section-content">
              <mat-form-field appearance="outline">
                <mat-label>Section Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>

              <button
                mat-icon-button
                color="warn"
                type="button"
                (click)="removeSection(i)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card>
        }
      </div>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    .sections-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 24px 0 16px;
    }
    .sections-list {
      min-height: 100px;
    }
    .section-card {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      cursor: move;
    }
    .drag-handle {
      display: flex;
      align-items: center;
      color: #666;
    }
    .section-content {
      flex: 1;
      display: flex;
      gap: 12px;
      align-items: center;
    }
  `]
})
export class MenuBuilderComponent {
  private fb = inject(FormBuilder);

  menuForm = this.fb.group({
    name: ['', Validators.required],
    sections: this.fb.array([])
  });

  get sectionsArray() {
    return this.menuForm.get('sections') as FormArray;
  }

  addSection() {
    const sectionGroup = this.fb.group({
      name: ['', Validators.required],
      items: this.fb.array([])
    });
    this.sectionsArray.push(sectionGroup);
  }

  removeSection(index: number) {
    this.sectionsArray.removeAt(index);
  }

  dropSection(event: CdkDragDrop<any>) {
    moveItemInArray(
      this.sectionsArray.controls,
      event.previousIndex,
      event.currentIndex
    );
    this.sectionsArray.updateValueAndValidity();
  }
}
```

### 7. Shared Notification Service

```typescript
// libs/shared/data-access/src/lib/notification.service.ts

import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  };

  showSuccess(message: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string, duration = 5000) {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['error-snackbar']
    });
  }

  showWarning(message: string, duration = 4000) {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['warning-snackbar']
    });
  }

  showInfo(message: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['info-snackbar']
    });
  }
}
```

**Add styles to `styles.scss`:**

```scss
.success-snackbar {
  background-color: #4caf50 !important;
  color: white !important;
}

.error-snackbar {
  background-color: #f44336 !important;
  color: white !important;
}

.warning-snackbar {
  background-color: #ff9800 !important;
  color: white !important;
}

.info-snackbar {
  background-color: #2196f3 !important;
  color: white !important;
}
```

---

## Form Services & Validation Error Handling

### Architecture Overview

The application uses a clean separation between state management and form operations:

```
Component (UI)
    ↓ (read state)
Store (pure state queries & updates) ← uses → API Service (shared HTTP layer)
    ↓ (form operations)                          ↑
Form Service (write + validation) ─────────────────┘
    ↓ (applies errors)
Form Group (reactive forms)
```

**Key Principles:**
- **API Service**: Shared HTTP layer used by both stores and form services (no duplication)
- **Store**: Pure state management - handles queries, state updates, and data loading
- **Form Service**: Handles form-specific operations (create/update) with validation error mapping
- **Form Error Mapper**: Utility service to map backend validation errors to Angular form controls

### API Service Layer

API services contain all HTTP logic and are reused by both stores and form services.

```typescript
// libs/data-access-cafes/src/lib/cafe-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CafeDto, CreateCafeRequest, UpdateCafeRequest } from '@smartcafe/shared/models';
import { environment } from '@smartcafe/shared/environments';

@Injectable({ providedIn: 'root' })
export class CafeApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/cafes`;

  getCafes(): Observable<CafeDto[]> {
    return this.http.get<CafeDto[]>(this.apiUrl);
  }

  getCafe(cafeId: string): Observable<CafeDto> {
    return this.http.get<CafeDto>(`${this.apiUrl}/${cafeId}`);
  }

  createCafe(request: CreateCafeRequest): Observable<CafeDto> {
    return this.http.post<CafeDto>(this.apiUrl, request);
  }

  updateCafe(cafeId: string, request: UpdateCafeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${cafeId}`, request);
  }

  deleteCafe(cafeId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cafeId}`);
  }
}
```

### Form Error Mapper Service

Utility service to map backend validation errors to Angular form controls.

```typescript
// libs/shared/utils/src/lib/form-error-mapper.service.ts

import { Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

export interface ValidationError {
  message: string;
  code?: string;
  field?: string;  // Backend field name (PascalCase)
}

@Injectable({ providedIn: 'root' })
export class FormErrorMapperService {
  
  /**
   * Maps backend validation errors to Angular form controls
   * Converts PascalCase backend field names to camelCase frontend names
   */
  applyToForm(form: FormGroup, errors: ValidationError[]): void {
    // Clear previous errors
    this.clearFormErrors(form);

    // Group errors by field
    const errorsByField = this.groupErrorsByField(errors);

    // Apply errors to form controls
    for (const [backendField, fieldErrors] of Object.entries(errorsByField)) {
      const formField = this.toFormFieldName(backendField);
      const control = this.getControl(form, formField);

      if (control) {
        // Set backend errors on the control
        const errorMessages = fieldErrors.map(e => e.message);
        control.setErrors({ 
          backend: errorMessages.length === 1 ? errorMessages[0] : errorMessages 
        });
        control.markAsTouched();
      }
    }

    // Handle general errors (no field specified)
    const generalErrors = errors.filter(e => !e.field);
    if (generalErrors.length > 0) {
      form.setErrors({ 
        backend: generalErrors.map(e => e.message) 
      });
    }
  }

  /**
   * Converts backend PascalCase field names to frontend camelCase
   * Also converts array notation [0] to dot notation .0
   * Examples: 
   *   "Name" -> "name"
   *   "ContactInfo" -> "contactInfo"
   *   "Sections[0].Name" -> "sections.0.name"
   */
  private toFormFieldName(backendField: string): string {
    if (!backendField) return '';
    
    // Convert array notation [0] to dot notation .0
    const withDotNotation = backendField.replace(/\[(\d+)\]/g, '.$1');
    
    // Convert first character to lowercase (PascalCase to camelCase)
    return withDotNotation.charAt(0).toLowerCase() + withDotNotation.slice(1);
  }

  /**
   * Groups validation errors by field name
   */
  private groupErrorsByField(errors: ValidationError[]): Record<string, ValidationError[]> {
    return errors.reduce((acc, error) => {
      if (error.field) {
        if (!acc[error.field]) {
          acc[error.field] = [];
        }
        acc[error.field].push(error);
      }
      return acc;
    }, {} as Record<string, ValidationError[]>);
  }

  /**
   * Gets form control by path (supports nested forms)
   * Examples: "name", "sections.0.name", "items.2.price"
   */
  private getControl(form: FormGroup, path: string) {
    const parts = path.split('.');
    let control: any = form;

    for (const part of parts) {
      if (!control) return null;

      if (control instanceof FormGroup) {
        control = control.get(part);
      } else if (control instanceof FormArray) {
        const index = parseInt(part, 10);
        control = control.at(index);
      } else {
        return null;
      }
    }

    return control;
  }

  /**
   * Clears all backend validation errors from form
   */
  private clearFormErrors(form: FormGroup): void {
    // Clear form-level errors
    const formErrors = form.errors;
    if (formErrors?.['backend']) {
      delete formErrors['backend'];
      form.setErrors(Object.keys(formErrors).length > 0 ? formErrors : null);
    }

    // Clear control-level errors recursively
    Object.values(form.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.clearFormErrors(control as FormGroup);
      } else if (control.errors?.['backend']) {
        const controlErrors = { ...control.errors };
        delete controlErrors['backend'];
        control.setErrors(Object.keys(controlErrors).length > 0 ? controlErrors : null);
      }
    });
  }
}
```

### Form Service Pattern

Form services handle create/update operations with automatic validation error mapping.

```typescript
// libs/data-access-cafes/src/lib/cafe-form.service.ts

import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CafeApiService } from './cafe-api.service';
import { CafeStore } from '@smartcafe/admin/feature-cafes';
import { FormErrorMapperService, ValidationError } from '@smartcafe/shared/utils';
import { NotificationService } from '@smartcafe/shared/data-access';

interface FormResult<T = void> {
  success: boolean;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class CafeFormService {
  private readonly apiService = inject(CafeApiService);
  private readonly store = inject(CafeStore);
  private readonly errorMapper = inject(FormErrorMapperService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  /**
   * Creates a new cafe from form data
   * Automatically handles validation errors and applies them to the form
   */
  async createCafe(form: FormGroup): Promise<FormResult> {
    if (form.invalid) {
      form.markAllAsTouched();
      return { success: false };
    }

    try {
      const response = await firstValueFrom(
        this.apiService.createCafe(form.value)
      );
      
      this.notifications.showSuccess('Cafe created successfully');
      
      // Reload store state after successful creation
      await this.store.loadCafes();
      
      // Navigate to cafe detail page
      await this.router.navigate(['/cafes', response.id]);
      
      return { success: true, data: response };
    } catch (error: any) {
      return this.handleError(error, form);
    }
  }

  /**
   * Updates an existing cafe from form data
   */
  async updateCafe(cafeId: string, form: FormGroup): Promise<FormResult> {
    if (form.invalid) {
      form.markAllAsTouched();
      return { success: false };
    }

    try {
      await firstValueFrom(
        this.apiService.updateCafe(cafeId, form.value)
      );
      
      this.notifications.showSuccess('Cafe updated successfully');
      
      // Reload store state
      await this.store.loadCafes();
      
      return { success: true };
    } catch (error: any) {
      return this.handleError(error, form);
    }
  }

  /**
   * Handles errors from API calls
   * Maps validation errors to form controls, lets interceptor handle other errors
   */
  private handleError(error: any, form: FormGroup): FormResult {
    // Backend validation errors (400) - handle here
    // Type 1 = Validation error
    if (error.status === 400 && error.error?.type === 1) {
      const validationErrors = error.error.details as ValidationError[];
      this.errorMapper.applyToForm(form, validationErrors);
      // Don't show notification - errors are visible on form fields
      return { success: false };
    }

    // All other errors (404, 409, 500) are handled by error interceptor
    // Just return failure and let the interceptor show the notification
    return { success: false };
  }
}
```

### Menu Form Service Example

```typescript
// libs/data-access-menus/src/lib/menu-form.service.ts

import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MenuApiService } from './menu-api.service';
import { MenuStore } from '@smartcafe/admin/feature-menus';
import { FormErrorMapperService } from '@smartcafe/shared/utils';
import { NotificationService } from '@smartcafe/shared/data-access';

@Injectable({ providedIn: 'root' })
export class MenuFormService {
  private readonly apiService = inject(MenuApiService);
  private readonly store = inject(MenuStore);
  private readonly errorMapper = inject(FormErrorMapperService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  async createMenu(cafeId: string, form: FormGroup) {
    if (form.invalid) {
      form.markAllAsTouched();
      return { success: false };
    }

    try {
      const response = await firstValueFrom(
        this.apiService.createMenu(cafeId, form.value)
      );
      
      this.notifications.showSuccess('Menu created successfully');
      await this.store.loadMenus(cafeId);
      await this.router.navigate(['/cafes', cafeId, 'menus', response.id]);
      
      return { success: true, data: response };
    } catch (error: any) {
      // Handle validation errors (400) - map to form controls
      // Type 1 = Validation error
      if (error.status === 400 && error.error?.type === 1) {
        this.errorMapper.applyToForm(form, error.error.details);
        return { success: false };
      }
      
      // All other errors (404, 409, 500) handled by error interceptor
      return { success: false };
    }
  }

  async updateMenu(cafeId: string, menuId: string, form: FormGroup) {
    if (form.invalid) {
      form.markAllAsTouched();
      return { success: false };
    }

    try {
      await firstValueFrom(
        this.apiService.updateMenu(cafeId, menuId, form.value)
      );
      
      this.notifications.showSuccess('Menu updated successfully');
      await this.store.loadMenus(cafeId);
      
      return { success: true };
    } catch (error: any) {
      // Handle validation errors (400) - map to form controls
      // Type 1 = Validation error
      if (error.status === 400 && error.error?.type === 1) {
        this.errorMapper.applyToForm(form, error.error.details);
        return { success: false };
      }
      
      // All other errors (404, 409, 500) handled by error interceptor
      return { success: false };
    }
  }
}
```

### Component Usage Example

```typescript
// libs/feature-cafes/src/lib/cafe-form/cafe-form.component.ts

import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CafeFormService } from '@smartcafe/admin/data-access-cafes';

@Component({
  selector: 'sc-cafe-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-field">
        <label for="name">Name *</label>
        <input id="name" formControlName="name" />
        @if (form.get('name')?.touched && form.get('name')?.errors) {
          <div class="error">
            @if (form.get('name')?.errors?.['required']) {
              Name is required
            }
            @if (form.get('name')?.errors?.['backend']) {
              {{ form.get('name')?.errors?.['backend'] }}
            }
          </div>
        }
      </div>

      <div class="form-field">
        <label for="contactInfo">Contact Info</label>
        <input id="contactInfo" formControlName="contactInfo" />
        @if (form.get('contactInfo')?.touched && form.get('contactInfo')?.errors?.['backend']) {
          <div class="error">
            {{ form.get('contactInfo')?.errors?.['backend'] }}
          </div>
        }
      </div>

      <button type="submit" [disabled]="submitting()">
        {{ cafeId() ? 'Update' : 'Create' }}
      </button>
    </form>
  `
})
export class CafeFormComponent {
  private fb = inject(FormBuilder);
  private cafeFormService = inject(CafeFormService);

  cafeId = input<string | null>(null);
  submitting = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    contactInfo: ['']
  });

  async onSubmit() {
    this.submitting.set(true);

    const cafeId = this.cafeId();
    const result = cafeId
      ? await this.cafeFormService.updateCafe(cafeId, this.form)
      : await this.cafeFormService.createCafe(this.form);

    this.submitting.set(false);

    // Form errors are already applied by the service
    // Navigation happens automatically on success
  }
}
```

### Backend Error Format

The backend returns validation errors in this format:

```json
{
  "error": {
    "type": 1,
    "details": [
      {
        "message": "Name is required",
        "code": "NotEmptyValidator",
        "field": "Name"
      },
      {
        "message": "Section name is required",
        "code": "NotEmptyValidator",
        "field": "Sections[0].Name"
      }
    ]
  }
}
```

**Error Type Enum:**
- `0` = NotFound
- `1` = Validation
- `2` = Conflict
```

### Field Name Mapping

Backend uses **PascalCase** with array notation `[index]`, frontend uses **camelCase** with dot notation:

| Backend Field | Frontend Field | Example Error |
|---------------|----------------|---------------|
| `Name` | `name` | Name is required |
| `ContactInfo` | `contactInfo` | Invalid format |
| `Sections[0].Name` | `sections.0.name` | Section name required |
| `Sections[0].Items[2].Price` | `sections.0.items.2.price` | Price must be positive |

**Note:** The `FormErrorMapperService` automatically converts array notation `[0]` to dot notation `.0` for form path access.

### Summary: When to Use Form Services vs Stores

**Use Form Services when:**
- Creating new entities from forms (createCafe, createMenu)
- Updating existing entities from forms (updateCafe, updateMenu)
- Need to map backend validation errors to form controls
- Want automatic success/error notifications
- Need post-save navigation (redirect to detail page)

**Use Stores when:**
- Loading data for display (loadCafes, loadMenus, loadActiveMenu)
- Non-form operations (deleteCafe, publishMenu, activateMenu, cloneMenu)
- Managing UI state (selectedCafe, loading, error states)
- Providing computed values (filtered lists, counts, flags)

**Data Flow Example:**
```
1. Component renders form with initial data from Store.loadCafe()
2. User fills form and submits
3. FormService.createCafe(form) → validates → calls API → handles errors
4. On success: FormService → Store.loadCafes() → navigation
5. On validation error: FormService → FormErrorMapper → form controls
```

---

## HTTP Interceptors

### Error Interceptor

**Important:** This interceptor skips notifications for 400 validation errors, as they are handled by form services.

```typescript
// src/app/core/interceptors/error.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip notifications for 400 validation errors
      // These are handled by form services with inline error messages
      // Type 1 = Validation error
      if (error.status === 400 && error.error?.type === 1) {
        return throwError(() => error);
      }

      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error (ProblemDetails)
        if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  );
```

### Loading Interceptor

```typescript
// src/app/core/interceptors/loading.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
```

### Retry Interceptor

```typescript
// src/app/core/interceptors/retry.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Retry only on network errors or 5xx errors
        if (error.status >= 500 || error.status === 0) {
          // Exponential backoff: 1s, 2s, 4s
          return timer(Math.pow(2, retryCount - 1) * 1000);
        }
        throw error;
      }
    })
  );
};
```

---

## NgRx Signal Stores

**Important:** Stores handle **state queries and updates only**. For form-based create/update operations with validation error handling, use **Form Services** (see Form Services section above).

**Store Responsibilities:**
- Load and cache data (read operations)
- Manage UI state (loading, error, selections)
- Provide computed values (filtered lists, counts)
- Execute non-form operations (delete, publish, activate, clone)

**Form Service Responsibilities:**
- Handle create/update operations from forms
- Map backend validation errors to form controls
- Show success/error notifications
- Refresh store state after successful operations

### Cafe Store

**Note:** This store handles data loading and non-form operations. For create/update from forms, use `CafeFormService`.

```typescript
// libs/feature-cafes/src/lib/store/cafe.store.ts

import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CafeApiService } from './cafe-api.service';
import { NotificationService } from '@smartcafe/shared/data-access';
import { CafeDto } from '@smartcafe/shared/models';

interface CafeState {
  cafes: CafeDto[];
  selectedCafe: CafeDto | null;
  loading: boolean;
  error: string | null;
}

export const CafeStore = signalStore(
  { providedIn: 'root' },
  withState<CafeState>({
    cafes: [],
    selectedCafe: null,
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    activeCafes: computed(() => store.cafes()),
    cafeCount: computed(() => store.cafes().length),
    hasError: computed(() => store.error() !== null)
  })),
  withMethods((store, apiService = inject(CafeApiService), notifications = inject(NotificationService)) => ({
    /**
     * Loads all cafes from the API
     * Used by: List views, initial data loading
     */
    async loadCafes() {
      patchState(store, { loading: true, error: null });
      try {
        const cafes = await firstValueFrom(apiService.getCafes());
        patchState(store, { cafes, loading: false });
      } catch (error) {
        const errorMessage = 'Failed to load cafes';
        patchState(store, { error: errorMessage, loading: false });
        // Error notification shown by error interceptor
      }
    },

    /**
     * Loads a single cafe by ID
     * Used by: Detail views, edit forms (to load existing data)
     */
    async loadCafe(cafeId: string) {
      patchState(store, { loading: true, error: null });
      try {
        const cafe = await firstValueFrom(apiService.getCafe(cafeId));
        patchState(store, { selectedCafe: cafe, loading: false });
      } catch (error) {
        const errorMessage = 'Failed to load cafe';
        patchState(store, { error: errorMessage, loading: false });
      }
    },

    /**
     * Deletes a cafe (non-form operation)
     * Used by: Delete confirmations, bulk operations
     */
    async deleteCafe(cafeId: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(apiService.deleteCafe(cafeId));
        notifications.showSuccess('Cafe deleted successfully');
        // Remove from local state
        patchState(store, { 
          cafes: store.cafes().filter(c => c.id !== cafeId),
          loading: false 
        });
      } catch (error) {
        const errorMessage = 'Failed to delete cafe';
        patchState(store, { error: errorMessage, loading: false });
        notifications.showError(errorMessage);
      }
    },

    /**
     * Sets the selected cafe (UI state management)
     */
    selectCafe(cafe: CafeDto | null) {
      patchState(store, { selectedCafe: cafe });
    }
  }))
);
```

### Menu Store

**Note:** This store handles data loading and non-form operations. For create/update from forms, use `MenuFormService`.

```typescript
// libs/feature-menus/src/lib/store/menu.store.ts

import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MenuApiService } from './menu-api.service';
import { NotificationService } from '@smartcafe/shared/data-access';
import { MenuDto, MenuSummaryDto, MenuState } from '@smartcafe/shared/models';

interface MenuStoreState {
  menus: MenuSummaryDto[];
  selectedMenu: MenuDto | null;
  activeMenu: MenuDto | null;
  loading: boolean;
  error: string | null;
  currentCafeId: string | null;
}

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState<MenuStoreState>({
    menus: [],
    selectedMenu: null,
    activeMenu: null,
    loading: false,
    error: null,
    currentCafeId: null
  }),
  withComputed((store) => ({
    newMenus: computed(() => 
      store.menus().filter(m => m.state === MenuState.New)
    ),
    publishedMenus: computed(() => 
      store.menus().filter(m => m.state === MenuState.Published)
    ),
    activeMenuSummary: computed(() => 
      store.menus().find(m => m.state === MenuState.Active) ?? null
    ),
    menuCount: computed(() => store.menus().length),
    hasActiveMenu: computed(() => 
      store.menus().some(m => m.state === MenuState.Active)
    )
  })),
  withMethods((store, apiService = inject(MenuApiService), notifications = inject(NotificationService)) => ({
    /**
     * Loads menus for a specific cafe
     * Used by: Menu list views, navigation
     */
    async loadMenus(cafeId: string) {
      patchState(store, { loading: true, error: null, currentCafeId: cafeId });
      try {
        const response = await firstValueFrom(apiService.getMenus(cafeId));
        patchState(store, { menus: response.menus, loading: false });
      } catch (error) {
        const errorMessage = 'Failed to load menus';
        patchState(store, { error: errorMessage, loading: false });
      }
    },

    /**
     * Loads a single menu with full details
     * Used by: Menu builder, menu detail views
     */
    async loadMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        const menu = await firstValueFrom(apiService.getMenu(cafeId, menuId));
        patchState(store, { selectedMenu: menu, loading: false });
      } catch (error) {
        const errorMessage = 'Failed to load menu';
        patchState(store, { error: errorMessage, loading: false });
      }
    },

    /**
     * Loads the active menu for customers
     * Used by: Preview, public menu display
     */
    async loadActiveMenu(cafeId: string) {
      patchState(store, { loading: true, error: null });
      try {
        const menu = await firstValueFrom(apiService.getActiveMenu(cafeId));
        patchState(store, { activeMenu: menu, loading: false });
      } catch (error) {
        const errorMessage = 'No active menu found';
        patchState(store, { error: errorMessage, loading: false });
      }
    },

    /**
     * Publishes a menu (non-form operation)
     * Used by: Menu list actions, workflow buttons
     */
    async publishMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(apiService.publishMenu(cafeId, menuId));
        notifications.showSuccess('Menu published successfully');
        await this.loadMenus(cafeId);
      } catch (error) {
        const errorMessage = 'Failed to publish menu';
        patchState(store, { error: errorMessage, loading: false });
        notifications.showError(errorMessage);
      }
    },

    /**
     * Activates a menu (non-form operation)
     * Used by: Menu list actions, activation workflow
     */
    async activateMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(apiService.activateMenu(cafeId, menuId));
        notifications.showSuccess('Menu activated successfully');
        await this.loadMenus(cafeId);
      } catch (error) {
        const errorMessage = 'Failed to activate menu';
        patchState(store, { error: errorMessage, loading: false });
        notifications.showError(errorMessage);
      }
    },

    /**
     * Clones a menu (non-form operation)
     * Used by: Menu list actions, "Duplicate" button
     */
    async cloneMenu(cafeId: string, menuId: string, newName: string) {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(apiService.cloneMenu(cafeId, menuId, { newName }));
        notifications.showSuccess('Menu cloned successfully');
        await this.loadMenus(cafeId);
        return response;
      } catch (error) {
        const errorMessage = 'Failed to clone menu';
        patchState(store, { error: errorMessage, loading: false });
        notifications.showError(errorMessage);
      }
    },

    /**
     * Deletes a menu (non-form operation)
     * Used by: Delete confirmations, menu management
     */
    async deleteMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(apiService.deleteMenu(cafeId, menuId));
        notifications.showSuccess('Menu deleted successfully');
        patchState(store, {
          menus: store.menus().filter(m => m.id !== menuId),
          loading: false
        });
      } catch (error) {
        const errorMessage = 'Failed to delete menu';
        patchState(store, { error: errorMessage, loading: false });
        notifications.showError(errorMessage);
      }
    },

    /**
     * Sets the selected menu (UI state management)
     */
    selectMenu(menu: MenuDto | null) {
      patchState(store, { selectedMenu: menu });
    }
  }))
);
  withMethods((store, menuService = inject(MenuApiService), notificationService = inject(NotificationService)) => ({
    async loadMenus(cafeId: string) {
      patchState(store, { loading: true, error: null, currentCafeId: cafeId });
      try {
        const response = await firstValueFrom(menuService.getMenus(cafeId));
        patchState(store, { menus: response.menus, loading: false });
      } catch (error) {
        const errorMessage = 'Failed to load menus';
        patchState(store, { error: errorMessage, loading: false });
        notificationService.showError(errorMessage);
      }
    },

    async loadMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        const menu = await firstValueFrom(menuService.getMenu(cafeId, menuId));
        patchState(store, { selectedMenu: menu, loading: false });
      } catch (error) {
        const errorMessage = 'Failed to load menu';
        patchState(store, { error: errorMessage, loading: false });
        notificationService.showError(errorMessage);
      }
    },

    async loadActiveMenu(cafeId: string) {
      patchState(store, { loading: true, error: null });
      try {
        const menu = await firstValueFrom(menuService.getActiveMenu(cafeId));
        patchState(store, { activeMenu: menu, loading: false });
      } catch (error) {
        const errorMessage = 'No active menu found';
        patchState(store, { error: errorMessage, loading: false });
        notificationService.showError(errorMessage);
      }
    },

    async publishMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuService.publishMenu(cafeId, menuId));
        notificationService.showSuccess('Menu published successfully');
        await this.loadMenus(cafeId);
      } catch (error) {
        const errorMessage = 'Failed to publish menu';
        patchState(store, { error: errorMessage, loading: false });
        notificationService.showError(errorMessage);
      }
    },

    async activateMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuService.activateMenu(cafeId, menuId));
        notificationService.showSuccess('Menu activated successfully');
        await this.loadMenus(cafeId);
      } catch (error) {
        const errorMessage = 'Failed to activate menu';
        patchState(store, { error: errorMessage, loading: false });
        notificationService.showError(errorMessage);
      }
    },

    async cloneMenu(cafeId: string, menuId: string, newName: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuService.cloneMenu(cafeId, menuId, { newName }));
        notificationService.showSuccess('Menu cloned successfully');
        await this.loadMenus(cafeId);
      } catch (error) {
        const errorMessage = 'Failed to clone menu';
        patchState(store, { error: errorMessage, loading: false });
        notificationService.showError(errorMessage);
      }
    },

    async deleteMenu(cafeId: string, menuId: string) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuService.deleteMenu(cafeId, menuId));
        notificationService.showSuccess('Menu deleted successfully');
        patchState(store, { 
          menus: store.menus().filter(m => m.id !== menuId),
          loading: false 
        });
      } catch (error) {
        const errorMessage = 'Failed to delete menu';
        patchState(store, { error: errorMessage, loading: false });
        notificationService.showError(errorMessage);
      }
    },

    clearSelectedMenu() {
      patchState(store, { selectedMenu: null });
    }
  }))
);
```

---

## Form Validation

### Validation Rules (matching backend FluentValidation)

```typescript
// src/app/shared/validators/validation-rules.ts

export const ValidationRules = {
  Cafe: {
    name: {
      required: true,
      maxLength: 100,
      messages: {
        required: 'Cafe name is required',
        maxLength: 'Cafe name must not exceed 100 characters'
      }
    },
    contactInfo: {
      maxLength: 200,
      messages: {
        maxLength: 'Contact info must not exceed 200 characters'
      }
    }
  },
  Menu: {
    name: {
      required: true,
      maxLength: 100,
      messages: {
        required: 'Menu name is required',
        maxLength: 'Menu name must not exceed 100 characters'
      }
    }
  },
  Section: {
    name: {
      required: true,
      maxLength: 100,
      messages: {
        required: 'Section name is required',
        maxLength: 'Section name must not exceed 100 characters'
      }
    },
    maxItems: 100
  },
  MenuItem: {
    name: {
      required: true,
      maxLength: 100,
      messages: {
        required: 'Item name is required',
        maxLength: 'Item name must not exceed 100 characters'
      }
    },
    description: {
      maxLength: 500,
      messages: {
        maxLength: 'Description must not exceed 500 characters'
      }
    },
    price: {
      min: 0.01,
      messages: {
        required: 'Price is required',
        min: 'Price must be greater than 0'
      }
    }
  }
};
```

### Custom Validators

```typescript
// src/app/shared/validators/custom-validators.ts

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static timeSpan(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      return timePattern.test(value) ? null : { invalidTimeSpan: true };
    };
  }

  static availabilityRange(fromControlName: string, toControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const from = formGroup.get(fromControlName)?.value;
      const to = formGroup.get(toControlName)?.value;
      
      if (!from || !to) return null;
      
      return from < to ? null : { invalidRange: true };
    };
  }

  static maxSectionItems(maxItems: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const items = control.value as any[];
      return items && items.length > maxItems 
        ? { maxItems: { max: maxItems, actual: items.length } } 
        : null;
    };
  }
}
```

---

## Theming & Styling

### UI Library
**The application MUST use Angular Material (`@angular/material`) for all components and styling:**
- ✅ **Angular Material** is the official Material Design component library for Angular
- ✅ Use Angular Material components exclusively (buttons, cards, forms, dialogs, tables, etc.)
- ✅ Import Material modules from `@angular/material/*` packages
- ✅ Leverage Angular Material theming system (`@use '@angular/material' as mat`)
- ✅ Use Material CDK (`@angular/cdk`) for advanced behaviors (drag-drop, virtual scroll, overlay)
- ✅ Custom components should follow Material Design patterns and use Material theming tokens
- ✅ Do NOT use other UI libraries (Bootstrap, Tailwind, etc.) - Angular Material only

### Design System Requirements
**The application MUST follow Material Design 3 (M3) principles:**
- ✅ Use Angular Material components with Material Design 3 theming
- ✅ Follow Material Design guidelines for spacing, typography, elevation, and motion
- ✅ Use Material Design color system (primary, secondary, tertiary, error, neutral)
- ✅ Implement Material Design 3 components (cards, buttons, navigation, dialogs, etc.)
- ✅ Follow Material You dynamic color principles
- ✅ Responsive layouts following Material Design breakpoint system
- ✅ Accessibility compliance (WCAG 2.1 AA) built into Material components

### Theme Requirements
**The application MUST:**
- ✅ Support light and dark themes (Material Design 3)
- ✅ **Automatically detect and apply system/device theme preference** (`prefers-color-scheme`)
- ✅ Allow manual theme override with toggle switch in UI
- ✅ Persist user theme preference in localStorage
- ✅ React to system theme changes in real-time
- ✅ Default to 'system' theme (respects device setting)
- ✅ Use Material Design 3 color tokens and elevation system

### Material Design 3 Theme Configuration

**Angular Material 20+ uses the new Material Design 3 (M3) theme API:**

```scss
// src/styles/_themes.scss

@use '@angular/material' as mat;

// ============================================
// Material Design 3 Theme Definition
// ============================================

// Define M3 light theme
$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: (
    brand-family: 'Roboto, sans-serif',
    plain-family: 'Roboto, sans-serif',
  ),
  density: (
    scale: 0,
  )
));

// Define M3 dark theme
$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: (
    brand-family: 'Roboto, sans-serif',
    plain-family: 'Roboto, sans-serif',
  ),
  density: (
    scale: 0,
  )
));

// ============================================
// Apply Themes
// ============================================

// Default (light) theme
:root {
  @include mat.all-component-themes($light-theme);
  
  // Custom CSS variables for app-specific styling
  --background-color: #fafafa;
  --surface-color: #ffffff;
  --text-primary: rgba(0, 0, 0, 0.87);
  --text-secondary: rgba(0, 0, 0, 0.54);
}

// Dark theme (applied when .dark-theme class is on <body>)
.dark-theme {
  @include mat.all-component-colors($dark-theme);
  
  // Custom CSS variables for dark mode
  --background-color: #303030;
  --surface-color: #424242;
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
}

// ============================================
// Import Material 3 theme in global styles
// ============================================

// src/styles.scss
@use '@angular/material' as mat;
@use './styles/themes' as themes;

@include mat.core();

html, body {
  height: 100%;
  margin: 0;
  font-family: Roboto, 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
}
```

**Key Differences from Material 2:**
- ✅ Use `mat.define-theme()` instead of `mat.define-light-theme()` / `mat.define-dark-theme()`
- ✅ Specify `theme-type: light` or `theme-type: dark` in color config
- ✅ Use `mat.$azure-palette`, `mat.$blue-palette` instead of custom palette definitions
- ✅ Use `mat.all-component-colors($dark-theme)` for dark mode (not `all-component-themes`)
- ✅ Typography uses `brand-family` and `plain-family` instead of single font family

### Theme Service (System Preference Detection)

```typescript
// src/app/core/services/theme.service.ts

import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'smartcafe-theme';
  private systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Default to 'system' to respect device preference
  theme = signal<Theme>(this.getStoredTheme());
  effectiveTheme = signal<'light' | 'dark'>(this.getEffectiveTheme());
  
  constructor() {
    // Apply theme whenever it changes
    effect(() => {
      const theme = this.theme();
      this.applyTheme(theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
    
    // Listen to system theme changes in real-time
    this.systemThemeMediaQuery.addEventListener('change', (e) => {
      if (this.theme() === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        this.effectiveTheme.set(newTheme);
        this.applyTheme('system');
      }
    });
  }
  
  toggleTheme() {
    const current = this.effectiveTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
  }
  
  setTheme(theme: Theme) {
    this.theme.set(theme);
  }
  
  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
    // Default to 'system' if no preference stored
    return stored || 'system';
  }
  
  private getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.getStoredTheme();
    if (theme === 'system') {
      return this.systemThemeMediaQuery.matches ? 'dark' : 'light';
    }
    return theme;
  }
  
  private applyTheme(theme: Theme) {
    const effectiveTheme = theme === 'system' 
      ? (this.systemThemeMediaQuery.matches ? 'dark' : 'light')
      : theme;
    
    this.effectiveTheme.set(effectiveTheme);
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${effectiveTheme}-theme`);
  }
}
```

### Theme Toggle Component

```typescript
// src/app/layout/theme-toggle/theme-toggle.component.ts

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService, Theme } from '../../core/services/theme.service';

@Component({
  selector: 'sc-theme-toggle',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="themeMenu" 
            [attr.aria-label]="'Theme: ' + themeService.theme()">
      <mat-icon>
        @if (themeService.effectiveTheme() === 'light') {
          light_mode
        } @else {
          dark_mode
        }
      </mat-icon>
    </button>
    
    <mat-menu #themeMenu="matMenu">
      <button mat-menu-item (click)="setTheme('light')">
        <mat-icon>light_mode</mat-icon>
        <span>Light</span>
      </button>
      <button mat-menu-item (click)="setTheme('dark')">
        <mat-icon>dark_mode</mat-icon>
        <span>Dark</span>
      </button>
      <button mat-menu-item (click)="setTheme('system')">
        <mat-icon>settings_brightness</mat-icon>
        <span>System</span>
      </button>
    </mat-menu>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  
  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}
```

---

## Responsive Design

### Requirements
**All components and pages MUST be fully responsive:**
- ✅ Work seamlessly on mobile (320px+), tablet (768px+), and desktop (1024px+)
- ✅ Use mobile-first approach
- ✅ Touch-friendly interactions (minimum 44x44px tap targets)
- ✅ Responsive typography and spacing
- ✅ Optimized images with appropriate sizes

### Breakpoints
```scss
// src/styles/_variables.scss

$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'wide': 1440px
);

// Mobile-first media queries
@mixin tablet {
  @media (min-width: 768px) { @content; }
}

@mixin desktop {
  @media (min-width: 1024px) { @content; }
}

@mixin wide {
  @media (min-width: 1440px) { @content; }
}
```

### Responsive Grid Example
```scss
// Cafe/Menu grids
.card-grid {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  
  // Mobile: 1 column
  grid-template-columns: 1fr;
  
  // Tablet: 2 columns
  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  // Desktop: 3 columns
  @include desktop {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }
  
  // Wide: 4 columns
  @include wide {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Angular CDK Layout
```typescript
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, signal } from '@angular/core';

@Component({
  selector: 'sc-menu-grid',
  // ...
})
export class MenuGridComponent {
  private breakpointObserver = inject(BreakpointObserver);
  
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(false);
  
  constructor() {
    // Detect mobile
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => this.isMobile.set(result.matches));
    
    // Detect tablet
    this.breakpointObserver
      .observe([Breakpoints.Tablet])
      .subscribe(result => this.isTablet.set(result.matches));
      
    // Detect desktop
    this.breakpointObserver
      .observe([Breakpoints.Web])
      .subscribe(result => this.isDesktop.set(result.matches));
  }
  
  // Computed columns based on screen size
  gridColumns = computed(() => {
    if (this.isMobile()) return 1;
    if (this.isTablet()) return 2;
    if (this.isDesktop()) return 3;
    return 4;
  });
}
```

---

## Internationalization (i18n)

### Translation Files

```json
// src/assets/i18n/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "confirm": "Confirm"
  },
  "cafes": {
    "title": "Cafes",
    "create": "Create Cafe",
    "name": "Cafe Name",
    "contactInfo": "Contact Info",
    "deleteConfirm": "Are you sure you want to delete this cafe?",
    "created": "Cafe created successfully",
    "deleted": "Cafe deleted successfully"
  },
  "menus": {
    "title": "Menus",
    "create": "Create Menu",
    "name": "Menu Name",
    "state": {
      "new": "New",
      "published": "Published",
      "active": "Active"
    },
    "actions": {
      "publish": "Publish",
      "activate": "Activate",
      "clone": "Clone",
      "preview": "Preview"
    },
    "sections": "Sections",
    "items": "Items"
  }
}
```

```json
// src/assets/i18n/uk.json
{
  "common": {
    "save": "Зберегти",
    "cancel": "Скасувати",
    "delete": "Видалити",
    "edit": "Редагувати",
    "create": "Створити",
    "loading": "Завантаження...",
    "error": "Помилка",
    "success": "Успіх",
    "confirm": "Підтвердити"
  },
  "cafes": {
    "title": "Кафе",
    "create": "Створити кафе",
    "name": "Назва кафе",
    "contactInfo": "Контактна інформація",
    "deleteConfirm": "Ви впевнені, що хочете видалити це кафе?",
    "created": "Кафе успішно створено",
    "deleted": "Кафе успішно видалено"
  },
  "menus": {
    "title": "Меню",
    "create": "Створити меню",
    "name": "Назва меню",
    "state": {
      "new": "Нове",
      "published": "Опубліковане",
      "active": "Активне"
    },
    "actions": {
      "publish": "Опублікувати",
      "activate": "Активувати",
      "clone": "Клонувати",
      "preview": "Переглянути"
    },
    "sections": "Розділи",
    "items": "Страви"
  }
}
```

---

## Testing

### Vitest Configuration

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.config.ts'
      ]
    }
  }
});
```

### Playwright Configuration

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Testing

### Vitest Configuration

**Vitest is the default test runner in Angular 18+. No additional installation needed.**

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.config.ts',
        '.nx/',
        'dist/'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
});
```

### Unit Test Examples

#### 1. Testing API Service

```typescript
// libs/data-access-cafes/src/lib/services/cafe-api.service.spec.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { CafeApiService } from './cafe-api.service';

describe('CafeApiService', () => {
  let service: CafeApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5000/api/cafes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CafeApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CafeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch cafes', (done) => {
    const mockResponse = {
      cafes: [
        { id: '123', name: 'Test Cafe', contactInfo: 'test@cafe.com' }
      ]
    };

    service.getCafes().subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.cafes.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create cafe', (done) => {
    const newCafe = { name: 'New Cafe', contactInfo: 'new@cafe.com' };
    const mockResponse = { cafeId: 'abc-123' };

    service.createCafe(newCafe).subscribe(response => {
      expect(response.cafeId).toBe('abc-123');
      done();
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCafe);
    req.flush(mockResponse);
  });
});
```

#### 2. Testing Component with Signal Store

```typescript
// libs/feature-cafes/src/lib/cafe-grid/cafe-grid.component.spec.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CafeGridComponent } from './cafe-grid.component';
import { CafeStore } from '@smartcafe/admin/feature-cafes';

describe('CafeGridComponent', () => {
  let component: CafeGridComponent;
  let fixture: ComponentFixture<CafeGridComponent>;
  let mockStore: any;

  beforeEach(async () => {
    // Create mock store with signals
    mockStore = {
      cafes: signal([
        { id: '1', name: 'Cafe 1', contactInfo: 'contact1@test.com' },
        { id: '2', name: 'Cafe 2', contactInfo: 'contact2@test.com' }
      ]),
      loading: signal(false),
      error: signal(null),
      hasError: () => false,
      cafeCount: signal(2),
      loadCafes: vi.fn(),
      deleteCafe: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CafeGridComponent],
      providers: [
        { provide: CafeStore, useValue: mockStore },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CafeGridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadCafes on init', () => {
    fixture.detectChanges();
    expect(mockStore.loadCafes).toHaveBeenCalled();
  });

  it('should display cafes', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('sc-cafe-card');
    expect(cards.length).toBe(2);
  });

  it('should show loading spinner when loading', () => {
    mockStore.loading.set(true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should call deleteCafe when delete is confirmed', async () => {
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await component.onDelete('1');

    expect(mockStore.deleteCafe).toHaveBeenCalledWith('1');
  });
});
```

#### 3. Testing Reactive Forms

```typescript
// libs/feature-cafes/src/lib/cafe-form/cafe-form.component.spec.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CafeFormComponent } from './cafe-form.component';
import { CafeStore } from '@smartcafe/admin/feature-cafes';

describe('CafeFormComponent', () => {
  let component: CafeFormComponent;
  let fixture: ComponentFixture<CafeFormComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      createCafe: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [
        CafeFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CafeStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CafeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have invalid form when empty', () => {
    expect(component.cafeForm.valid).toBe(false);
  });

  it('should have valid form when name is provided', () => {
    component.cafeForm.patchValue({ name: 'Test Cafe' });
    expect(component.cafeForm.valid).toBe(true);
  });

  it('should show validation error for empty name', () => {
    const nameControl = component.cafeForm.get('name')!;
    nameControl.markAsTouched();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('mat-error');
    expect(errorElement).toBeTruthy();
  });

  it('should call createCafe on submit', async () => {
    component.cafeForm.patchValue({
      name: 'New Cafe',
      contactInfo: 'contact@cafe.com'
    });

    await component.onSubmit();

    expect(mockStore.createCafe).toHaveBeenCalledWith(
      'New Cafe',
      'contact@cafe.com'
    );
  });

  it('should reset form after successful submit', async () => {
    component.cafeForm.patchValue({ name: 'Test Cafe' });

    await component.onSubmit();

    expect(component.cafeForm.value.name).toBe(null);
  });
});
```

### Playwright E2E Test Examples

```typescript
// apps/admin-e2e/src/cafe-management.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Cafe Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cafes');
  });

  test('should display cafe grid', async ({ page }) => {
    await expect(page.locator('sc-cafe-grid')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Cafes');
  });

  test('should navigate to create cafe page', async ({ page }) => {
    await page.click('button:has-text("Create Cafe")');
    await expect(page).toHaveURL(/.*cafes\/create/);
  });

  test('should create new cafe', async ({ page }) => {
    await page.goto('/cafes/create');

    await page.fill('input[name="name"]', 'E2E Test Cafe');
    await page.fill('textarea[name="contactInfo"]', 'e2e@test.com');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=E2E Test Cafe')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/cafes/create');

    // Try to submit without filling required field
    await page.click('button[type="submit"]');

    // Form should not submit
    await expect(page).toHaveURL(/.*cafes\/create/);

    // Validation error should appear
    await expect(page.locator('mat-error')).toBeVisible();
  });

  test('should delete cafe with confirmation', async ({ page }) => {
    // Wait for cafes to load
    await page.waitForSelector('sc-cafe-card');

    // Setup dialog confirmation
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    await page.click('button[aria-label="Delete cafe"]');

    // Cafe should be removed
    await expect(page.locator('sc-cafe-card')).toHaveCount(0);
  });
});

test.describe('Responsive Design', () => {
  test('should adapt to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cafes');

    // Check that grid adapts to mobile (single column)
    const grid = page.locator('.grid');
    const gridStyles = await grid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    expect(gridStyles).toContain('1fr');
  });

  test('should adapt to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/cafes');

    const grid = page.locator('.grid');
    const gridStyles = await grid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // Should have 2 columns on tablet
    expect(gridStyles.split(' ').length).toBe(2);
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/cafes');

    const createButton = page.locator('button:has-text("Create Cafe")');
    await expect(createButton).toHaveAttribute('aria-label', /.+/);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/cafes');

    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);

    expect(focused).toBeTruthy();
  });
});
```

### Playwright Configuration

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/admin-e2e/src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'TestResults/e2e-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'nx serve admin',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
```

---

## Storybook Configuration

### Setup

Storybook is automatically configured during Step 4. **It is mandatory for all shared UI components.**

### Example Stories

```typescript
// libs/shared/ui/src/lib/loading-spinner/loading-spinner.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { LoadingSpinnerComponent } from './loading-spinner.component';

const meta: Meta<LoadingSpinnerComponent> = {
  title: 'Shared/Loading Spinner',
  component: LoadingSpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the spinner'
    },
    color: {
      control: 'select',
      options: ['primary', 'accent', 'warn'],
      description: 'Color theme'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A loading spinner component used throughout the application'
      }
    }
  }
};

export default meta;
type Story = StoryObj<LoadingSpinnerComponent>;

export const Small: Story = {
  args: {
    size: 'small',
    color: 'primary'
  }
};

export const Medium: Story = {
  args: {
    size: 'medium',
    color: 'primary'
  }
};

export const Large: Story = {
  args: {
    size: 'large',
    color: 'primary'
  }
};

export const AccentColor: Story = {
  args: {
    size: 'medium',
    color: 'accent'
  }
};
```

```typescript
// libs/shared/ui/src/lib/error-message/error-message.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { ErrorMessageComponent } from './error-message.component';

const meta: Meta<ErrorMessageComponent> = {
  title: 'Shared/Error Message',
  component: ErrorMessageComponent,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<ErrorMessageComponent>;

export const Default: Story = {
  args: {
    message: 'An error occurred while loading data'
  }
};

export const NetworkError: Story = {
  args: {
    message: 'Network connection failed. Please check your internet connection.'
  }
};

export const ValidationError: Story = {
  args: {
    message: 'Please fill in all required fields'
  }
};
```

**Run Storybook:**

```powershell
npm run storybook
```

---

## Storybook Configuration

### Setup

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "lint:pr": "nx affected:lint --base=origin/main",
    "lint:ci": "nx run-many --target=lint --all",
    "test:pr": "nx affected:test --base=origin/main --coverage",
    "test:ci": "nx run-many --target=test --all --coverage",
    "build:pr": "nx affected:build --base=origin/main --configuration=production",
    "build:ci": "nx run-many --target=build --all --configuration=production"
  }
}
```

### 1. Build and Test Workflow (Reusable)

```yaml
# .github/workflows/build-and-test.yml

name: Build and Test

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use'
        required: false
        type: string
        default: '24'
      environment:
        description: 'Environment context (pr or ci)'
        required: false
        type: string
        default: 'pr'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    name: Build and Test
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:${{ inputs.environment }}

      - name: Lint
        run: npm run lint:${{ inputs.environment }}

      - name: Test
        run: npm run test:${{ inputs.environment }}
```

### 2. Pull Request Workflow

```yaml
# .github/workflows/pr.yml

name: PR Validation

on:
  pull_request:
    branches:
      - main

# Cancel previous runs if a new commit is pushed
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  validate:
    name: Validate Pull Request
    uses: ./.github/workflows/build-and-test.yml
    with:
      node-version: '24'
      environment: 'pr'
```

### 3. Continuous Integration Workflow

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches:
      - main

jobs:
  build:
    name: Build and Test Entire Workspace
    uses: ./.github/workflows/build-and-test.yml
    with:
      node-version: '24'
      environment: 'ci'
```

### 4. Continuous Deployment Workflow

```yaml
# .github/workflows/cd.yml

name: CD - Deploy to Dev

on:
  workflow_run:
    workflows: ["CI"]
    types:
      - completed
    branches:
      - main

jobs:
  deploy-dev:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    name: Deploy to Development
    environment:
      name: development
      url: https://smartcafe-admin-dev.azurewebsites.net
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for Production
        run: npx nx build admin --configuration=production

      - name: Deploy to Azure Static Web Apps (Dev)
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist/apps/admin/browser"

  deploy-failed:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    name: CI Failed - Skip Deployment
    steps:
      - name: Log CI Failure
        run: |
          echo "CI workflow failed. Skipping deployment."
          exit 1
```

---

## Additional Features

### Drag & Drop (Angular CDK)

```typescript
// src/app/features/menus/components/section-drag-drop/section-drag-drop.component.ts

import { Component, input, output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { SectionDto } from '../../../../shared/models/api.models';

@Component({
  selector: 'sc-section-drag-drop',
  imports: [DragDropModule],
  template: `
    <div cdkDropList (cdkDropListDropped)="drop($event)">
      @for (section of sections(); track section.id) {
        <div cdkDrag class="section-item">
          <div class="section-drag-handle" cdkDragHandle>
            <mat-icon>drag_indicator</mat-icon>
          </div>
          <div class="section-content">
            <h3>{{ section.name }}</h3>
            <p>{{ section.items.length }} items</p>
          </div>
        </div>
      }
    </div>
  `
})
export class SectionDragDropComponent {
  sections = input.required<SectionDto[]>();
  sectionsReordered = output<SectionDto[]>();

  drop(event: CdkDragDrop<SectionDto[]>) {
    const sections = [...this.sections()];
    moveItemInArray(sections, event.previousIndex, event.currentIndex);
    this.sectionsReordered.emit(sections);
  }
}
```

### Image Compression

```typescript
// src/app/core/services/image-compression.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Canvas is empty'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  }
}
```

### Unsaved Changes Guard

```typescript
// src/app/core/guards/unsaved-changes.guard.ts

import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.canDeactivate()) {
    return true;
  }
  
  const dialog = inject(MatDialog);
  const dialogRef = dialog.open(ConfirmationDialogComponent, {
    data: {
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Do you want to leave this page?',
      confirmText: 'Leave',
      cancelText: 'Stay'
    }
  });
  
  return dialogRef.afterClosed();
};
```

---

## Performance Targets

### Lighthouse Scores
- **Performance**: 90+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 90+

### Bundle Size Targets
- **Initial Bundle**: < 200KB (gzipped)
- **Lazy Loaded Modules**: < 50KB each (gzipped)

---

## Development Workflow

### Daily Development Tasks

1. **Generate Component in Feature Library**:
   ```bash
   # In feature library
   nx g @nx/angular:component cafe-card \
     --project=feature-cafes \
     --export \
     --changeDetection=OnPush
   
   # In UI library
   nx g @nx/angular:component loading-spinner \
     --project=shared-ui \
     --export
   ```

2. **Generate Service in Data Access Library**:
   ```bash
   nx g @nx/angular:service cafe-api \
     --project=data-access-cafes
   ```

3. **Run Development Server**:
   ```bash
   # Serve main app
   nx serve admin
   
   # With proxy configuration
   nx serve admin --configuration=development
   ```

4. **Run Tests**:
   ```bash
   # Test specific library
   nx test feature-cafes
   
   # Test all affected by changes
   nx affected:test
   
   # Test with coverage
   nx test admin --coverage
   
   # Watch mode
   nx test feature-cafes --watch
   
   # E2E tests
   nx e2e admin-e2e
   ```

5. **Run Storybook**:
   ```bash
   # Start Storybook for shared UI
   nx storybook shared-ui
   ```

6. **Build for Production**:
   ```bash
   # Build main app
   nx build admin --configuration=production
   
   # Build all affected projects
   nx affected:build --configuration=production
   
   # Build specific library
   nx build admin-feature-cafes
   ```

7. **Lint & Format**:
   ```bash
   # Lint specific library
   nx lint feature-cafes
   
   # Lint all affected
   nx affected:lint
   
   # Format all files
   nx format:write
   
   # Check formatting
   nx format:check
   ```

8. **View Dependency Graph**:
   ```bash
   # Interactive graph
   nx graph
   
   # Show affected projects
   nx affected:graph
   ```

9. **Clear Cache** (if needed):
   ```bash
   nx reset
   ```

### Nx Caching & Performance

**Nx automatically caches:**
- Build outputs
- Test results
- Lint results

**Benefits:**
- Subsequent runs are instant if nothing changed
- Only affected projects rebuild
- Shared cache across team (with Nx Cloud - optional)

```bash
# See what would be affected by changes
nx affected:apps
nx affected:libs

# Run command only for affected
nx affected:test
nx affected:build
nx affected:lint
```

---

## Nx Best Practices Summary

### ✅ DO:

1. **Organize by Type**: Feature, Data Access, UI, Utils
2. **Use Tags**: Enforce module boundaries with tags
3. **Lazy Load Features**: Load feature libraries on demand
4. **Export Barrel Files**: Clean imports via index.ts
5. **Use Path Aliases**: `@smartcafe/admin/feature-cafes`
6. **Run Affected Commands**: `nx affected:test` in CI
7. **Generate with Nx**: Use `nx generate` for consistency
8. **Leverage Caching**: Let Nx cache builds and tests
9. **Visualize Dependencies**: Use `nx graph` regularly
10. **Keep Libraries Small**: Single responsibility per library

### ❌ DON'T:

1. **Don't Create Circular Dependencies**: Nx will error
2. **Don't Skip Tags**: Tagging enables boundary enforcement
3. **Don't Import from Apps**: Libraries should not import from apps
4. **Don't Mix Concerns**: Keep feature/data-access/ui separate
5. **Don't Bypass Module Boundaries**: Respect dependency rules
6. **Don't Skip Affected**: Always use affected in CI
7. **Don't Ignore Graph**: Visualize to spot issues early
8. **Don't Overcomplicate**: Start simple, add complexity as needed

---

## Key Implementation Notes

1. **Always use OnPush change detection** - Set in all components
2. **Use signals everywhere** - For state, inputs, outputs, computed values
3. **Organize code in Nx libraries** - Follow type-based organization
4. **Use path aliases** - `@smartcafe/admin/feature-cafes` for clean imports
5. **Implement virtual scrolling** - For cafe and menu grids
6. **Add confirmation dialogs** - For all destructive actions (delete, activate)
7. **Implement unsaved changes guard** - On all forms (in shared library)
8. **Use trackBy functions** - In all @for loops
9. **Lazy load feature libraries** - Load on route access
10. **Compress images** - Before uploading (utility in shared/utils)
11. **Validate forms** - Match backend validation exactly
12. **Handle errors** - Use interceptors (in shared/data-access)
13. **Support drag & drop** - For menu sections and items (Angular CDK)
14. **Test accessibility** - Run AXE checks on all components
15. **Support theming** - Light/dark modes with system detection
16. **Support i18n** - English and Ukrainian translations
17. **Use Nx affected commands** - In development and CI/CD
18. **Maintain dependency graph** - Run `nx graph` to visualize

---

## Success Criteria

✅ Application builds without errors  
✅ All tests pass (unit + integration + E2E)  
✅ **Fully responsive on mobile, tablet, and desktop**  
✅ **System theme preference auto-detected and applied**  
✅ **Theme toggle works (light/dark/system)**  
✅ Lighthouse scores meet targets (Performance 90+, Accessibility 100)  
✅ WCAG 2.1 AA compliance (AXE checks pass)  
✅ Forms validate correctly  
✅ Drag & drop works smoothly  
✅ i18n works for both languages (English/Ukrainian)  
✅ API integration works end-to-end  
✅ Virtual scrolling performs well with 1000+ items  
✅ Image upload with compression works  
✅ Confirmation dialogs prevent accidental deletions  
✅ Unsaved changes guard works on forms  
✅ Touch-friendly UI (44x44px minimum tap targets)  

---

## Reference Links

- **Angular Documentation**: https://angular.dev
- **Angular Material**: https://material.angular.io
- **NgRx Signals**: https://ngrx.io/guide/signals
- **Angular CLI**: https://angular.dev/tools/cli
- **Angular MCP Server**: https://angular.dev/ai/mcp
- **Vitest**: https://vitest.dev
- **Playwright**: https://playwright.dev
- **Storybook**: https://storybook.js.org
- **Azure Static Web Apps**: https://learn.microsoft.com/azure/static-web-apps

---

**Begin implementation following instructions.md for coding standards. Good luck! 🚀**
