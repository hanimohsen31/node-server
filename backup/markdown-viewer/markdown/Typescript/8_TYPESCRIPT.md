تمام. ده **TypeScript Senior-level interview content**.

مش هأديك “تعريفات”، هأديك **mental models + قرارات تصميم** تبيّن إنك فاهم اللغة مش بس مستخدمها.

---

## 1) Advanced Typing

### Union Types (`|`)

> قيمة واحدة من أكتر من نوع
> 

```tsx
typeStatus ='loading' |'success' |'error';

```

Use case حقيقي:

- finite states
- API responses
- UI modes

نقطة Senior:

> Union types force you to handle all cases explicitly.
> 

---

### Intersection Types (`&`)

> دمج خصائص من أكتر من نوع
> 

```tsx
typeWithId = {id:string };
typeWithTimestamp = {createdAt:Date };

typeEntity =WithId &WithTimestamp;

```

Use case:

- composition
- mixins
- cross-cutting concerns

---

### Generics

> type parameters بدل any
> 

```tsx
function wrap<T>(value: T): {data: T } {
return {data: value };
}

```

Use cases:

- reusable components
- collections
- APIs
- services

جملة Interview:

> Generics preserve type information across abstraction layers.
> 

---

### Mapped Types

> types بتتولد من types تانية
> 

```tsx
typeReadonly<T> = {
readonly [Kin keyof T]: T[K];
};

```

Use case:

- form states
- DTOs
- config objects

---

## 2) Interfaces vs Types vs Classes

**(الفرق الحقيقي)**

### Interface

- extendable
- declaration merging
- ideal للـ public APIs

```tsx
interfaceUser {
id:string;
}

```

Use case:

- contracts
- library APIs

---

### Type

- أقوى تعبيرًا
- unions / intersections
- mapped types

```tsx
typeUser = {
id:string;
};

```

Use case:

- complex domain modeling

---

### Class

- runtime existence
- logic + behavior
- DI targets

```tsx
classUserService {}

```

جملة Senior:

> Interfaces and types exist at compile time; classes exist at runtime.
> 

---

## 3) Utility Types

**Readonly, Partial, Pick, Omit**

### Readonly

```tsx
Readonly<User>

```

Use case:

- immutable state
- store snapshots

---

### Partial

```tsx
Partial<User>

```

Use case:

- update APIs
- forms
- patch operations

---

### Pick

```tsx
Pick<User,'id' |'email'>

```

Use case:

- DTOs
- projections

---

### Omit

```tsx
Omit<User,'password'>

```

Use case:

- safe API responses

---

## 4) Strict Mode Implications

`strict: true` = مجموعة flags:

- `strictNullChecks`
- `noImplicitAny`
- `strictFunctionTypes`
- `strictPropertyInitialization`

التأثير الحقيقي:

- أقل bugs
- أكتر type safety
- شغل أقل في runtime debugging

جملة Interview:

> Strict mode shifts errors from runtime to compile time.
> 

---

## 5) Type Narrowing & Type Guards

### Narrowing

```tsx
if (typeof value ==='string') {}

```

### Custom Type Guard

```tsx
functionisUser(x:any): x isUser {
return x &&typeof x.id ==='string';
}

```

Use case:

- API validation
- runtime safety
- union handling

جملة Senior:

> Type guards bridge runtime checks with compile-time safety.
> 

---

## 6) Enums vs Const Enums vs Literal Types

### Enums

```tsx
enumStatus {
Active,
Disabled
}

```

- runtime object
- heavier output
- not tree-shakable

---

### Const Enums

```tsx
constenumStatus {
Active,
Disabled
}

```

- inlined at compile time
- no runtime cost
- tooling limitations

---

### Literal Types (Preferred)

```tsx
typeStatus ='active' |'disabled';

```

- zero runtime cost
- fully type-safe
- best tree shaking
- perfect مع strict mode

جملة Interview ذهبية:

> In modern TypeScript, literal types usually replace enums.
> 

---

## TL;DR (اللي تقوله في الآخر)

> I use unions for state modeling, generics for reuse, mapped types for transformations, and prefer literal types over enums. I rely on strict mode and type guards to catch bugs early and keep runtime code minimal.
> 

ده كلام **Tech Lead** مش مجرد Developer.

لو حابب نكمل:

- conditional types
- infer keyword
- advanced generics in Angular APIs
- typing reactive forms بشكل clean

إنت وصلت لمرحلة التحكم في اللغة نفسها 🔥