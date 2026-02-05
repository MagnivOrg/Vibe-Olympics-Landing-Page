# Claude Context & Instructions

IMPORTANT: Keep this file minimal and focused. Only essential project context.

## Project Overview

PromptLayer monorepo with:
- **Front-end**: React TypeScript with yarn package management
- **Back-end**: Next.js API routes

## Quick Reference

### Package Management

Use `yarn` commands (not npm)

### Linting - IMPORTANT

Before committing, run linting on **only the files you changed**:

```bash
# TypeScript type check (run on whole project)
npx tsc --noEmit

# ESLint with auto-fix (only on changed files/directories)
npx eslint --fix --max-warnings=0 --no-warn-ignored src/path/to/changed/files/

# Prettier (only on changed files/directories)
npx prettier --write src/path/to/changed/files/
```

⚠️ **NEVER run prettier on the entire codebase** - it will modify SVGs and other files unnecessarily.

Key lint rules to be aware of:

- No `autoFocus` prop (accessibility)
- No unused variables (prefix with `_` if intentional)
- Import order must have newlines between groups
- Arrow body style: use concise form when possible
- No nested ternaries

### TypeScript - CRITICAL RULES

🚨 **NEVER USE `any` TYPE** 🚨

- Keep the request types with the respective request hooks! Only keep shared types in the general scoped types.ts file!
- Always use proper TypeScript types
- Check existing types in `src/types/` before creating new ones
- Import specific types: `PromptBlueprint`, `Metadata`, etc.
- If unsure of type, use `object` or `unknown` instead of `any`
- **ALWAYS verify no `any` types before committing**

### Icons - CRITICAL RULES

🚨 **NEVER CREATE CUSTOM SVGs** 🚨

- Always use existing icon libraries: `@heroicons/react`, `lucide-react`
- Check existing icons in components before adding new libraries
- Import specific icons: `import { CogIcon } from "lucide-react"`
- **NEVER inline SVG elements - always use icon components**

### Component Guidelines

- Extract >50 lines into separate components
- Extract dialogs/modals into dedicated components
- Avoid coupling logic directly in page components
- Minimize comments - clean code is self-documenting

### AI Features Pattern

1. Create custom hook in `src/queries/` using `useMutation`
2. POST to Make.com webhook URL
3. Include `displayErrorToast` for errors
4. Add 35-second timeout with AbortController
5. Create reusable component consuming the hook

## Next.js Backend Guidelines

### API Route Structure

- Place API routes in `pages/api/` or `app/api/` depending on Next.js version
- Use Next.js API route conventions: `export default async function handler(req, res)`
- Organize routes by domain/feature

### API Best Practices

- **Type safety**: Define request/response types
		```typescript
		type CreatePromptRequest = { name: string; template: string };
		type CreatePromptResponse = { id: string; success: boolean };
		```

- **Error handling**: Use consistent error responses
		```typescript
		return res.status(400).json({ error: "Invalid request" });
		```

- **Validation**: Validate input at API boundary
- **Authentication**: Check auth before processing requests
- **HTTP methods**: Properly handle GET, POST, PUT, DELETE
		```typescript
		if (req.method !== 'POST') {
				return res.status(405).json({ error: 'Method not allowed' });
		}
		```

### Backend File Organization

```
pages/api/
		prompts/
				index.ts          # GET /api/prompts
				[id].ts           # GET/PUT/DELETE /api/prompts/:id
		workflows/
				index.ts
				[id].ts
```

### Database & External Services

- Keep database logic in separate service/repository files
- Use dependency injection patterns for testability
- Handle async operations properly with try/catch
- Always close connections/clean up resources

### Backend-Frontend Integration

- Share types between frontend and backend using common `types/` directory
- Keep API request/response contracts clear
- Use the same validation schemas on both sides when possible

## Naming Conventions

### Components

**PascalCase** - Be specific

- ✅ `WorkflowCanvas` (not `Canvas`)
- ✅ `NodeTypeSelector` (not `Selector`)

**Props:**

- Event handlers: `onEvent` syntax
- Keep general: `items` (not `bananas`)

### Hooks

**camelCase** - Be descriptive

- `useWorkflowData` (not `useData`)

### Stores & Context

**kebab-case**

- `workflow-store.ts`
- `workflow-context.ts`

### Constants

**CAPS_WITH_UNDERSCORES**

- `MY_CONSTANT`

### API Routes

**kebab-case** for file names

- `create-prompt.ts`
- `get-workflows.ts`

## File Structure

```bash
/MyComponent
			/hooks
						useCustomHook.ts
			MyComponentButton.tsx
			/MoreComplicatedComponent
						/hooks
						ChildComponentUsedinComplexComponent.tsx
						/ComplexChildComponent
										/hooks
								types.ts
								utils.ts
										index.tsx
						more-complicated-store.ts
						index.tsx
			index.tsx
			utils.ts
			my-component-context.ts
			my-component-store.ts
			types.ts
```

Core component in `index.tsx`. Extract complexity into root folder as needed.

### Feature Organization

Group adjacent concepts by scope:

```tsx
/Feature1
			/PageOne
						/BigComponent
									/hooks
									index.tsx
						SmallComponent.tsx
						index.tsx
			/PageTwo
						index.tsx
```

## Key Patterns

### Hook Encapsulation

Extract logic into hooks. Components should be primarily JSX.

```tsx
// Good - Logic in hook
const useSomething = () => {
		const [test, setTest] = useState("");
		const doSomething = () => console.log("Something");
		useEffect(() => doSomething(), [test]);
		return [test, setTest] as const;
};

const MyComponent = () => {
		const [_, setTest] = useSomething();
		return <Button onClick={() => setTest("test")} />;
};
```

### Component Props

**Boolean props:** Use optional with default

```tsx
// Good
<MyComponent isAwesome />
const MyComponent = ({isAwesome=false}: {isAwesome?:boolean}) => ...
```

**Consolidate when >5 props:**

```tsx
// Good
<MyComponent fruits={fruits} vegetables={vegetables} />
```

### MobX Pattern

Use Context + localObservable:

```tsx
// mobx-store.ts
class MobXInstance {
		private _value: string = "";

		constructor() {
				makeAutoObservable(this);
		}

		@action setValue(newValue: string) {
				this._value = newValue;
		}

		get value() {
				return this._value;
		}
}

// mobx-context.tsx
const MobXInstanceContext = React.createContext(null);
const useMobXInstance = () => React.useContext(MobXInstanceContext);

const MobXInstanceProvider = ({ children }) => {
		const instance = useLocalObservable(new MobXInstance());
		return <MobXInstanceContext.Provider value={instance}>{children}</MobXInstanceContext.Provider>;
};
```

**Conventions:**

- Private vars: `_variableName`
- Computed values: Use getters
- Actions: Mark with `@action`

### Component Router Pattern

For component variants:

```tsx
enum ButtonType {
		ERROR,
		SUCCESS,
}

const Button = (props: ButtonSkeletonProps & { type: ButtonType }) => {
		switch (props.type) {
				case ButtonType.ERROR:
						return <ErrorButton {...props} />;
				case ButtonType.SUCCESS:
						return <SuccessButton {...props} />;
		}
};
```

### Loading States

Use shimmers to prevent content shifting:

```tsx
<div className="flex flex-col gap-y-1">
		<Skeleton />
		<Skeleton />
		<Skeleton />
</div>
```

Default: `width: 100%`, `height: 1rem`

## Query Organization

Domain-based structure:

```
src/queries/
			playground/
						useExampleHook.ts
						index.ts
			index.ts
```

**Per hook file:**

- Types: `ExampleHookRequest`, `ExampleHookResponse`
- Export through domain index
- No ambiguous typing

## Core Principles

1. **DRY** - Don't repeat yourself
2. **Scope** - Group related concepts
3. **Clarity** - Names should explain purpose
4. **Simplicity** - Extract when complex

## Modal & Dialog Best Practices

Based on PR feedback patterns, follow these guidelines:

### Modal Rendering

- **ALWAYS render modals, control visibility with props**

		```tsx
		// ❌ BAD - Breaks exit animations
		{
				isOpen && <Modal />;
		}

		// ✅ GOOD - Preserves animations
		<Modal isOpen={isOpen} />;
		```

### Data Initialization

- **Initialize data via props, not effects**

		```tsx
		// ❌ BAD - Using effects and refs to track initialization
		const hasLoaded = useRef(false);
		useEffect(() => {
				if (!hasLoaded.current && data) {
						store.applyData(data);
						hasLoaded.current = true;
				}
		}, [data]);

		// ✅ GOOD - Pass data to provider/store
		<StoreProvider value={{ initialData: data }}>
		```

### Stable Values

- **Pass stable values as props from parent components**

		```tsx
		// ❌ BAD - "Freezing" values with useState
		const [stableValue] = useState(potentiallyChangingValue);

		// ✅ GOOD - Get stable value from parent and pass as prop
		// In parent: const workspaceId = user?.activeWorkspaceId;
		// Pass down: <Component workspaceId={workspaceId} />
		```

### Complex Component Organization

- **Break complex components (>200 lines) into folder structure**
		```
		/ComponentName
				/hooks
						useComponentLogic.ts    # Business logic
				SubComponent.tsx        # Reusable parts
				index.tsx                # Thin wrapper
				ComponentContent.tsx     # Main UI logic
		```

### Async Operations

- **Avoid setTimeout for data synchronization**

		```tsx
		// ❌ BAD - Arbitrary delays
		setTimeout(() => onComplete(), 300);

		// ✅ GOOD - Use proper async patterns
		await queryClient.invalidateQueries();
		onComplete();
		```

### Feature Removal vs Complex Solutions

- **Consider removing features instead of adding complexity**
		- If a feature causes conflicts (like j/k navigation in version selector)
		- Remove it rather than adding complex detection/prevention logic
		- Simpler codebase > more features with workarounds

### DOM Queries

- **Avoid direct DOM queries for state detection**

		```tsx
		// ❌ BAD - Fragile DOM queries
		const hasDialog = document.querySelector('[role="dialog"]');

		// ✅ GOOD - Use React state/context
		const { isDialogOpen } = useDialogContext();
		```

### React Lifecycle

- **Trust React's lifecycle, avoid manual cleanup**

		```tsx
		// ❌ BAD - Unnecessary manual resets
		useEffect(() => {
				return () => {
						someRef.current = false;
						setState(undefined);
				};
		}, []);

		// ✅ GOOD - Let React handle component lifecycle
		// Component unmounting naturally cleans up
		```

## Change Verification Process

### When to Run

After completing a feature or fix, especially when multiple files were modified.

### Trigger Commands

User can invoke with: "go over changes", "verify changes", "review branch", or "check for side effects"

### Verification Steps

1. **Review all changed files**

			```bash
			git diff master...HEAD --stat
			git diff master...HEAD --name-only
			```

2. **Identify unrelated changes**

			- Files that touch areas outside the feature scope
			- Changes that "fix" things that weren't broken
			- Overengineered solutions to simple problems

3. **Check for each file:**

			- Is this change necessary for the feature?
			- Did I fix something unrelated while working?
			- Could this have been done simpler?
			- Will this cause unintended side effects?

4. **Common patterns to watch for:**

			- Global state additions that could be local
			- Infrastructure changes for edge cases
			- Touching shared components unnecessarily
			- Adding complexity to work around issues that could be fixed at the source

5. **Simplification opportunities:**
			- Remove overengineered solutions
			- Revert unrelated "fixes"
			- Simplify complex implementations
			- Reduce the change surface area

### Example Review

```
Changed files:
- PromptEditor.tsx ✅ (core feature)
- dialog.tsx ⚠️ (global component - minimize changes)
- utils.ts ❌ (unrelated - consider reverting)
```

### Goal

Minimize change surface area to reduce risk of unintended side effects. Every changed line is a potential bug - only change what's necessary.
