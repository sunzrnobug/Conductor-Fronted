# React Best Practices

React-specific coding standards for GeoScenarioScripters projects.

## Component Structure

### Functional Components
Always use functional components with hooks:

```tsx
// ✅ Good
import { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: number;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Component File Structure
```tsx
// 1. Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types/Interfaces
interface Props {
  id: number;
}

// 3. Constants
const MAX_ITEMS = 10;

// 4. Helper functions
function formatData(data: any) {
  return data.map(/* ... */);
}

// 5. Main component
export function MyComponent({ id }: Props) {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => {};

  // Render
  return <div>{/* JSX */}</div>;
}

// 6. Sub-components (if small and only used here)
function SubComponent() {
  return <div />;
}
```

## Naming Conventions

### Components
Use `PascalCase`:
```tsx
export function UserProfile() {}
export function ShoppingCart() {}
```

### Props Interfaces
Use `ComponentNameProps`:
```tsx
interface UserProfileProps {
  userId: number;
  onUpdate?: (user: User) => void;
}
```

### Event Handlers
Use `handle` prefix:
```tsx
function MyComponent() {
  const handleClick = () => {};
  const handleSubmit = () => {};
  const handleInputChange = () => {};

  return <button onClick={handleClick}>Click</button>;
}
```

### Custom Hooks
Use `use` prefix:
```tsx
function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  // ... logic
  return user;
}

function useDebounce<T>(value: T, delay: number): T {
  // ... logic
  return debouncedValue;
}
```

## Props

### Destructure Props
```tsx
// ✅ Good
function UserCard({ name, email, avatar }: UserCardProps) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// ❌ Bad
function UserCard(props: UserCardProps) {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>{props.email}</p>
    </div>
  );
}
```

### TypeScript Props
```tsx
interface Props {
  // Required props
  id: number;
  name: string;

  // Optional props
  email?: string;

  // Functions
  onClick: () => void;
  onUpdate?: (data: User) => void;

  // Children
  children: React.ReactNode;

  // Specific component types
  icon?: React.ComponentType<{ size: number }>;
}
```

### Prop Spreading
Use sparingly and deliberately:
```tsx
// ✅ Good - Explicit spreading for known props
function Button({ onClick, children, ...restProps }: ButtonProps) {
  return (
    <button onClick={onClick} {...restProps}>
      {children}
    </button>
  );
}

// ❌ Bad - Unclear what's being passed
function Button(props: any) {
  return <button {...props} />;
}
```

## Hooks

### Hook Order
Always call hooks in the same order:
```tsx
function MyComponent() {
  // 1. State hooks
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // 2. Effect hooks
  useEffect(() => {}, []);

  // 3. Custom hooks
  const user = useUser(userId);

  // 4. Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 5. Callbacks
  const handleClick = useCallback(() => {}, []);

  // 6. Memos
  const expensiveValue = useMemo(() => {}, []);

  return <div />;
}
```

### useState

```tsx
// ✅ Good - Type inference
const [count, setCount] = useState(0);
const [name, setName] = useState('');

// ✅ Good - Explicit type for complex state
const [user, setUser] = useState<User | null>(null);

// ✅ Good - Functional updates
setCount(prevCount => prevCount + 1);

// ✅ Good - Object state updates
setUser(prevUser => ({ ...prevUser, name: 'New Name' }));
```

### useEffect

```tsx
// ✅ Good - Cleanup function
useEffect(() => {
  const subscription = api.subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);

// ✅ Good - Dependency array
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ Bad - Missing dependencies (use ESLint rule)
useEffect(() => {
  fetchUser(userId); // userId should be in dependencies
}, []);
```

### useCallback

Use for callbacks passed to child components:
```tsx
function ParentComponent() {
  const [count, setCount] = useState(0);

  // ✅ Good - Memoized callback
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return <ChildComponent onClick={handleClick} />;
}
```

### useMemo

Use for expensive calculations:
```tsx
function DataList({ items }: Props) {
  // ✅ Good - Expensive calculation memoized
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.value - b.value);
  }, [items]);

  // ❌ Bad - Unnecessary memoization
  const doubled = useMemo(() => count * 2, [count]);

  return <div>{/* render sortedItems */}</div>;
}
```

### Custom Hooks

Extract reusable logic:
```tsx
// ✅ Good - Reusable hook
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }: Props) {
  const { data: user, loading, error } = useApi<User>(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{user?.name}</div>;
}
```

## JSX

### Conditional Rendering

```tsx
// ✅ Good - Ternary for if/else
{isLoggedIn ? <Dashboard /> : <LoginForm />}

// ✅ Good - && for conditional render
{error && <ErrorMessage error={error} />}

// ✅ Good - Early return
if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <Content data={data} />;

// ❌ Bad - Nested ternaries
{isLoggedIn ? (
  isAdmin ? <AdminPanel /> : <UserPanel />
) : (
  <LoginForm />
)}

// ✅ Good - Extract to function
function renderPanel() {
  if (!isLoggedIn) return <LoginForm />;
  if (isAdmin) return <AdminPanel />;
  return <UserPanel />;
}
```

### Lists and Keys

```tsx
// ✅ Good - Unique, stable keys
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ❌ Bad - Index as key (only if list never changes)
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}

// ❌ Bad - Non-unique keys
{users.map(user => (
  <UserCard key={user.name} user={user} />
))}
```

### Fragments

```tsx
// ✅ Good - Short syntax
return (
  <>
    <Header />
    <Main />
    <Footer />
  </>
);

// ✅ Good - With keys
{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </Fragment>
))}
```

### Self-Closing Tags

```tsx
// ✅ Good
<UserAvatar user={user} />
<Image src={url} alt={alt} />

// ❌ Bad
<UserAvatar user={user}></UserAvatar>
```

## State Management

### Lift State Up

```tsx
// ✅ Good - State in common ancestor
function ParentComponent() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <Sidebar onSelect={setSelectedId} />
      <Content selectedId={selectedId} />
    </>
  );
}
```

### Context API

For global/shared state:
```tsx
// Create context
interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage
function ProfilePage() {
  const { user, logout } = useAuth();
  return <div>{user?.name}</div>;
}
```

## Performance

### React.memo

Prevent unnecessary re-renders:
```tsx
// ✅ Good - Memoized component
export const UserCard = React.memo(function UserCard({ user }: Props) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
});

// With custom comparison
export const UserCard = React.memo(
  function UserCard({ user }: Props) {
    return <div>{/* ... */}</div>;
  },
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id,
);
```

### Lazy Loading

```tsx
// ✅ Good - Code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

## Forms

### Controlled Components

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Form Libraries

For complex forms, use libraries like React Hook Form:
```tsx
import { useForm } from 'react-hook-form';

function RegistrationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: FormData) => {
    register(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>Email is required</span>}

      <button type="submit">Register</button>
    </form>
  );
}
```

## Testing

### Component Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('UserCard', () => {
  it('renders user information', () => {
    const user = { id: 1, name: 'John Doe', email: 'john@example.com' };

    render(<UserCard user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Common Pitfalls

### Infinite Loops

```tsx
// ❌ Bad - Infinite loop
useEffect(() => {
  setCount(count + 1); // count changes, triggers effect again
}, [count]);

// ✅ Good
const handleClick = () => {
  setCount(c => c + 1);
};
```

### Stale Closures

```tsx
// ❌ Bad - Stale closure
useEffect(() => {
  const interval = setInterval(() => {
    console.log(count); // Always logs initial count
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ✅ Good - Use ref or include in dependencies
useEffect(() => {
  const interval = setInterval(() => {
    console.log(count); // Logs current count
  }, 1000);
  return () => clearInterval(interval);
}, [count]);
```

## Project Architecture & Organization

### Directory Structure (Feature-based)
Adopt a **feature-based** organization rather than grouping by file type. This keeps related code together and makes the codebase more scalable.

```text
src/
  features/
    auth/               # Feature specific code
      components/       # Components used ONLY in auth
      hooks/            # Hooks used ONLY in auth
      api/              # API calls for auth
      types/            # Types specific to auth
    user/
  components/           # Shared UI components (Button, Input)
  hooks/                # Shared hooks (useDebounce, useLocalStorage)
  utils/                # Shared utilities
  lib/                  # Third-party library configurations (axios, react-query)
```

## Data Fetching

### Server State Management
If it possibly introduces race conditions and lacks caching/deduplication, avoid using `useEffect` for data fetching. Use **TanStack Query (React Query)** or **SWR** instead.

```tsx
// ❌ Bad - Manual fetching
useEffect(() => {
  setLoading(true);
  fetchUser(id).then(setUser).finally(() => setLoading(false));
}, [id]);

// ✅ Good - React Query
const { data: user, isLoading } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
```

## Styling

#### Tailwind CSS
Use utility classes and `clsx`/`cn` helper for conditional styling.

```tsx
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded font-medium transition-colors",
        variant === 'primary' && "bg-blue-500 text-white hover:bg-blue-600",
        variant === 'secondary' && "bg-gray-200 text-gray-900 hover:bg-gray-300",
        className
      )}
      {...props}
    />
  );
}
```

## TypeScript Practices

### Event Types
Don't use `any`. Use specific React event types.

```tsx
// ✅ Good
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};
```

### No Explicit Any
Avoid `any` at all costs. If the type is truly dynamic, use `unknown` and narrow it down.

## Accessibility (a11y)

### Basic Rules
1. **Images**: Always provide `alt` text. Use empty string `alt=""` for decorative images.
2. **Interactive Elements**: Use semantic HTML (`<button>`, `<a>`) instead of `div`s with click handlers.
3. **Forms**: Ensure all inputs have associated labels (via `htmlFor` or nesting).

```tsx
// ✅ Good
<button onClick={doAction}>Click Me</button>

// ❌ Bad - Not accessible via keyboard
<div onClick={doAction}>Click Me</div>
```

## Resources

- [React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library](https://testing-library.com/react)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)
