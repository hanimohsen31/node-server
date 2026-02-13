## 1) **What is a Component in Angular?**

- ال Component هو **building block الأساسي** في Angular.
- هو class مكتوب بـ TypeScript، مربوط بـ template (HTML) و styles، وبيتحكم في جزء محدد من الـ UI.

## 2) **What is a Component Selector?**

الـ selector هو **الطريقة اللي بنستخدم بيها الـ component في الـ HTML**.

## 3) **What is a Component Selector Types?**

1. **Element selector** (الأشهر)

```tsx
selector:'app-user'
```

Usage:

```html
<app-user></app-user>
```

1. **Attribute selector**

```tsx
selector:'[appUser]'
```

Usage:

```html
<div appUser></div>
```

1. **Class selector** (نادر جدًا)

```tsx
selector:'.app-user'
```

Usage:

```html
<div class="app-user"></div>
```

نقطة interview:

> Best practice is using element selectors for components.
> 

## 4) What is a Module in Angular**?**

- هو Angular Module (NgModule) هو **container** بيجمع:
- Components
- Directives
- Pipes
- Services

الغرض منه:

- تنظيم التطبيق
- تحديد الـ scope
- التحكم في الـ dependency graph

## 5) What is Standalone Component in Angular**?**

A **Standalone Component** in Angular is a **component that doesn’t require being declared in an NgModule**. This is part of Angular’s move to make the framework more modular and simplify dependency management, starting from Angular 14 and improving in Angular 15+.

### **Benefits**

1. **No need for NgModule boilerplate** – simplifies small apps or libraries.
2. **Direct imports** – you can import a standalone component into another component directly.
3. **Tree-shakable** – reduces bundle size because only what’s used is included.
4. **Better DX (Developer Experience)** – easier to reason about dependencies.

## 6) Compare NgModule & Standalone Component**?**

**NgModule (قديم):**

- لازم تعلن فيه كل حاجة
- Boilerplate كتير
- Tree shaking أضعف
- مناسب للتطبيقات القديمة

**Standalone Component (حديث – Angular 14+):**

- Component مستقل بذاته
- بيستورد dependencies بنفسه
- أقل كود
- Tree shaking أفضل