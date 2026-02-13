Alright, let’s tour the mental gym of modern programming and front-end engineering. No fluff, no motivational posters—just the concepts, what they mean, and how they actually show up in real code and browsers.

---

### **SOLID**

- REF ['https://medium.com/backticks-tildes/the-s-o-l-i-d-principles-in-pictures-b34ce2f1e898']

A set of five principles for designing maintainable object-oriented systems. Think of them as “how to not hate your own code in six months.”

---

**SOLID – قواعد سهلة لتصميم كود مرتب وقابل للصيانة:**

**S – Single Responsibility (مسؤولية واحدة):**

* كل Class ليه سبب واحد للتغيير.
* لو Class بيعمل أكتر من حاجة، أي تعديل ممكن يكسر حاجات تانية.
* فكرة بسيطة: كل Class يركز على شغلة واحدة بس.

**O – Open/Closed (مفتوح للتطوير ومقفول للتعديل):**

* ضيف وظائف جديدة بدون ما تعدل الكود القديم.
* الكلاس الأساسي يفضل ثابت، والتوسعات تجي من وراثة أو تركيب.
* الهدف: نتجنب كسر أي حاجة موجودة باستخدام الكلاس في أي مكان.

**L – Liskov Substitution (الاستبدال السليم):**

* الكلاس الابن لازم يشتغل في أي مكان الاب يشتغل فيه.
* الابن ممكن يدي نتايج أدق أو محددة، بس لازم نفس نوع النتيجة.
* لو الابن رجع حاجة مختلفة تماماً، ده غلط.

**I – Interface Segregation (تقسيم الواجهات):**

* استخدم واجهات صغيرة ومحددة بدل ما تعمل واجهة كبيرة لكل حاجة.
* كل Class يشتغل على المهام اللي محتاجها بس.
* الهدف: نخفف من المهام الغير ضرورية ونقلل أخطاء الكود.

**D – Dependency Inversion (اعتماد على التجريد مش التفاصيل):**

* الكلاسات العالية المستوى تعتمد على واجهات أو تجريد، مش على الكلاسات المنخفضة.
* التفاصيل تعتمد على التجريد، مش العكس.
* الهدف: نقلل الاعتماد المباشر بين الكلاسات لتسهيل التعديل والصيانة.

---

- **Single Responsibility:** one class, one reason to change. A component that both fetches data and formats UI is already misbehaving.

  - If a Class has many responsibilities, it increases the possibility of bugs because making changes to one of its responsibilities, could affect the other ones without you knowing.

  - Goal:This principle aims to separate behaviours so that if bugs arise as a result of your change, it won’t affect other unrelated behaviours.

- **Open/Closed:** open for extension, closed for modification. Add behavior without rewriting existing code (inheritance, composition).

  - Changing the current behaviour of a Class will affect all the systems using that Class.

  - If you want the Class to perform more functions, the ideal approach is to add to the functions that already exist NOT change them.

  - Goal: This principle aims to extend a Class’s behaviour without changing the existing behaviour of that Class. This is to avoid causing bugs wherever the Class is being used.

- **Liskov Substitution:** subclasses must be usable wherever the parent is expected. If swapping breaks behavior, the design is lying.

  - If you have a Class and create another Class from it, it becomes a parent and the new Class becomes a child. The child Class should be able to do everything the parent Class can do. This process is called Inheritance.

  - The child Class should be able to process the same requests and deliver the same result as the parent Class or it could deliver a result that is of the same type.

  - The picture shows that the parent Class delivers Coffee(it could be any type of coffee). It is acceptable for the child Class to deliver Cappucino because it is a specific type of Coffee, but it is NOT acceptable to deliver Water.

  - If the child Class doesn’t meet these requirements, it means the child Class is changed completely and violates this principle.

  - Goal: This principle aims to enforce consistency so that the parent Class or its child Class can be used in the same way without any errors.

- **Interface Segregation:** many small, specific interfaces beat one god-interface. Frontend analogy: small services/hooks instead of one mega service.

  - When a Class is required to perform actions that are not useful, it is wasteful and may produce unexpected bugs if the Class does not have the ability to perform those actions.

  - A Class should perform only actions that are needed to fulfil its role. Any other action should be removed completely or moved somewhere else if it might be used by another Class in the future.

  - Goal: This principle aims at splitting a set of actions into smaller sets so that a Class executes ONLY the set of actions it requires.



- **Dependency Inversion:** depend on abstractions, not concrete implementations. Angular’s DI system is basically SOLID fan fiction.

  - High-level modules should not depend on low-level modules. Both should depend on the abstraction.

  - Abstractions should not depend on details. Details should depend on abstractions.

  - Goal: This principle aims at reducing the dependency of a high-level Class on the low-level Class by introducing an interface.

Why frontend cares: scalable Angular/React apps collapse without these ideas, even if you never write “class Foo”.

---

### **OOP (Object-Oriented Programming)**

A model for structuring code around objects that bundle data + behavior.

Core ideas:

- **Encapsulation:** hide internal state, expose a clean API.
- **Abstraction:** interact with _what_ something does, not _how_.
- **Inheritance:** reuse behavior (often overused).
- **Polymorphism:** different objects, same interface, different behavior.

Frontend reality check: modern frontend prefers **composition over inheritance**, but OOP still lives in services, state models, UI architecture, and frameworks like Angular.

## أولًا: يعني إيه OOP أصلًا؟

ال **Object-Oriented Programming**
أسلوب تفكير قبل ما يكون كود.

الفكرة البسيطة:

> البرنامج بتاعك متقسم لكائنات (Objects)
> كل كائن:

- ليه **بيانات** (Properties)
- وليه **سلوك** (Methods)

في الفرونت إند؟
الـ components، الـ services، الـ models… كلهم تمثيل عملي للفكرة دي.

---

## ليه الـ OOP مهم في الفرونت إند؟

في الإنترفيو لازم تقول المعنى ده بصوت واثق:

- تنظيم الكود لما المشروع يكبر
- سهولة الصيانة والتطوير
- إعادة الاستخدام
- تقليل الأخطاء
- الكود يبقى مفهوم لأي حد داخل المشروع بعدك

ال Angular مثلًا مبني حرفيًا على OOP + SOLID.

---

## الأعمدة الأربعة للـ OOP (دول قلب السؤال)

### 1️⃣ Encapsulation – التغليف

يعني:

> أخبي التفاصيل الداخلية، وأطلع واجهة استخدام واضحة

في الفرونت إند:

- المستخدم أو الـ component التاني **ما يعرفش** تفاصيل التنفيذ
- يتعامل مع methods جاهزة

#### مثال بسيط (TypeScript):

```ts
class User {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  checkPassword(input: string): boolean {
    return input === this.password;
  }
}
```

الإنترفيو:

> “I hide internal state and expose only what’s needed.”

Angular مثال:

- Service فيها private logic
- component ينادي method وخلاص

---

### 2️⃣ Abstraction – التجريد

يعني:

> أتعامل مع _إيه اللي بيحصل_ مش _إزاي بيحصل_

#### مثال:

```ts
interface Payment {
  pay(amount: number): void;
}
```

```ts
class VisaPayment implements Payment {
  pay(amount: number) {
    console.log('Paid with Visa', amount);
  }
}
```

```ts
class CashPayment implements Payment {
  pay(amount: number) {
    console.log('Paid with Cash', amount);
  }
}
```

الـ component:

```ts
constructor(private payment: Payment) {}
```

هو مش مهتم الدفع Visa ولا Cash
هو مهتم إن فيه `pay()` وخلاص.

دي نقطة **تقيلة جدًا في الإنترفيو**.

---

### 3️⃣ Inheritance – الوراثة

يعني:

> كلاس ياخد خصائص وسلوك من كلاس تاني

#### مثال:

```ts
class ComponentBase {
  log(msg: string) {
    console.log(msg);
  }
}

class UserComponent extends ComponentBase {
  save() {
    this.log('User saved');
  }
}
```

⚠️ تصحيح مهم:

- الوراثة **مش دايمًا حل كويس**
- الإفراط فيها بيعمل coupling عالي

لو قلت الجملة دي في الإنترفيو → نقطة زيادة ليك ✔️

---

### 4️⃣ Polymorphism – تعدد الأشكال

دي أكتر واحدة بتتلخبط.

يعني:

> نفس الـ interface
> سلوك مختلف حسب الـ implementation

#### مثال:

```ts
function makePayment(payment: Payment) {
  payment.pay(100);
}
```

ممكن تبعت:

- VisaPayment
- CashPayment
- ApplePay

والـ function شغال زي ما هو.

الإنترفيو:

> “Same interface, different behavior.”

---

## OOP في Angular تحديدًا (سؤال مضمون)

لو سألوك:
**فين الـ OOP في Angular؟**

جاوب كده:

- Components = Classes
- Services = Classes
- Dependency Injection = Abstraction + Polymorphism
- Interfaces & Models = Contracts
- Access modifiers = Encapsulation

مثال عملي:

```ts
@Injectable()
export class AuthService {
  private token: string;

  login() {}
}
```

---

## أخطاء شائعة لازم تتجنبها

- ❌ OOP = classes بس
- ❌ أي كود فيه class يبقى OOP
- ❌ الوراثة أهم حاجة

الصحيح:

> OOP = طريقة تفكير وتنظيم مسؤوليات

---

## إجابة إنترفيو نموذجية (مختصرة وجاهزة)

لو سألوك:
**Explain OOP in Frontend**

قول:

> “OOP helps me structure frontend applications using objects that encapsulate state and behavior.
> In frameworks like Angular, components and services are classes that follow OOP principles like encapsulation, abstraction through interfaces, and polymorphism via dependency injection. This makes the code more maintainable, scalable, and testable.”

---

### **DRY & WET**

DRY: Don’t Repeat Yourself. Duplicate logic is a bug farm.
WET: Write Everything Twice / We Enjoy Typing.

The nuance: premature DRY can be worse than repetition. Two similar things are not always the same thing.
Frontend example: abstracting every button too early creates a “component graveyard”.

Rule of thumb: repeat once, abstract on the third time when patterns are undeniable.

---

### **KISS**

Keep It Simple, Stupid.

Simple beats clever. Always.
If your code needs a README to explain a `map(reduce(filter()))` chain, it’s already guilty.

Frontend impact: simpler state, fewer abstractions, boring solutions that work at 3 a.m. under pressure.

---

### **MVS (Model–View–Service)**

A frontend-friendly cousin of MVC.

Model: data and business logic
View: UI (templates/components)
Service: communication, shared logic, side effects

Angular leans heavily on this separation. Services handle HTTP, caching, state; components focus on rendering and interaction.

Why it matters: keeps UI dumb and testable, logic centralized, and side effects controlled.

---

### **Immutability**

Data doesn’t change; you create new versions instead.

Instead of mutating an object, you return a copy with changes.
This enables predictable state, easy change detection, and time-travel debugging.

Frontend superpower: frameworks like React rely on it. Angular’s OnPush change detection loves it.
Tradeoff: more memory, but far fewer mental bugs.

---

### **Event Loop**

The engine behind JavaScript’s “single-threaded but asynchronous” magic.

How it works, simplified:
Call stack executes synchronous code.
Async tasks go to queues (microtasks and macrotasks).
Event loop pushes queued tasks back to the stack when it’s clear.

Microtasks (Promises) run before macrotasks (setTimeout).
UI rendering waits until the stack is clear.

Frontend implication: blocking the main thread kills UX. Heavy computation belongs in Web Workers or backend.

---

### **HTTP Basics**

The language browsers speak to servers.

Stateless request–response protocol.
Methods: GET, POST, PUT, PATCH, DELETE (intent matters).
Status codes: 2xx success, 4xx client errors, 5xx server errors.
Headers: metadata (auth, caching, content type).
Body: the actual data.

Frontend angle: correct method usage, headers, and status handling is not backend “detail”—it directly affects performance, caching, and UX.

---

### **Caching Strategies in Angular**

Caching avoids unnecessary network requests and speeds up perceived performance.

Common strategies:
In-memory caching in services (simple, volatile).
HTTP caching via headers (Cache-Control, ETag).
Service Workers (Angular PWA) for offline and asset caching.
State caching (NgRx, signals, query caching).

Golden rule: cache **data that changes slowly**, invalidate aggressively when correctness matters.

---

### **CORS (Cross-Origin Resource Sharing)**

A browser security rule, not a server feature.

Browsers block requests to different origins unless the server explicitly allows them via headers.
Preflight requests (OPTIONS) check permissions before the real request.

Important correction: CORS errors mean the **server is reachable**, but the browser refuses to expose the response.
Fixing CORS is a backend configuration task, not a frontend one.

---

### **Web Storage**

Client-side persistence.

localStorage: persistent, synchronous, shared across tabs.
sessionStorage: cleared per tab session.
IndexedDB: async, large, structured data.

Frontend reality:
Never store secrets.
localStorage blocks the main thread—use sparingly.
IndexedDB is the real storage workhorse for serious apps.

---

### **Web Vitals**

Metrics that measure real user experience, not vibes.

LCP (Largest Contentful Paint): when the main content becomes visible. Target: < 2.5s.
CLS (Cumulative Layout Shift): visual stability. Surprise jumps annoy humans.
TTI (Time to Interactive): when the app actually responds to input.

Frontend causes:
Large images, slow APIs, blocking JS, late font loading.
Fixes: code splitting, lazy loading, proper image sizes, minimizing main-thread work.

---

### Final mental model

These concepts aren’t academic trivia. They’re pressure-tested survival tools for building systems that scale in users, features, and developers. Ignore them and velocity collapses. Apply them blindly and complexity explodes. The art is knowing _when_ each principle earns its keep.

Software is a living system. Treat it like one.
