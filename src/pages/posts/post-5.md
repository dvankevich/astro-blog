---
layout: ../../layouts/MarkdownPostLayout.astro
title: Typescript issues
author: bangor
description: "This post will show up on its own!"
image:
  url: "https://docs.astro.build/default-og-image.png"
  alt: "The word astro against an illustration of planets and stars."
pubDate: 2026-09-08
tags: ["astro", "successes", "typescript", AI]
---

Ці помилки виникають тому, що в інтерфейсі `Frontmatter` ми позначили теги як необов'язкові (`tags?: string[]`). TypeScript — хлопець обережний, він бачить, що у якомусь файлі тегів може не бути взагалі, і тому забороняє використовувати методи на кшталт `.includes()` або `.flat()`, щоб програма не "впала" з помилкою `cannot read property of undefined`.

Ось як це виправити, зробивши код безпечним.

---

### Виправлений код

Нам потрібно додати перевірку на наявність тегів за допомогою оператора **Optional Chaining (`?.`)** або значень за замовчуванням (`|| []`).

```typescript
---
import type { MarkdownInstance } from "astro";
import BaseLayout from "../../layouts/BaseLayout.astro";
import BlogPost from "../../components/BlogPost.astro";

interface Frontmatter {
  title: string;
  tags?: string[];
}

export async function getStaticPaths() {
  const allPosts = Object.values(
    import.meta.glob("../posts/*.md", { eager: true }),
  ) as MarkdownInstance<Frontmatter>[];

  // Використовуємо ?. та || [], щоб flat() працював навіть якщо tags немає
  const uniqueTags = [
    ...new Set(allPosts.map((post) => post.frontmatter.tags || []).flat()),
  ];

  return uniqueTags.map((tag) => {
    // Додаємо ?. перед includes, щоб уникнути помилки на постах без тегів
    const filteredPosts = allPosts.filter((post) =>
      post.frontmatter.tags?.includes(tag as string),
    );
    return {
      params: { tag },
      props: { posts: filteredPosts },
    };
  });
}

const { tag } = Astro.params;
const { posts } = Astro.props as { posts: MarkdownInstance<Frontmatter>[] };
---

<BaseLayout pageTitle={tag}>
  <p>Дописи з тегом: <strong>{tag}</strong></p>
  <ul>
    {
      posts.map((post) => (
        <BlogPost url={post.url} title={post.frontmatter.title} />
      ))
    }
  </ul>
</BaseLayout>

```

---

### Що ми змінили для виправлення помилок?

1. **`post.frontmatter.tags || []`**:
Ми сказали TypeScript: "Якщо тегів немає (`undefined`), візьми порожній масив `[]`". Тепер метод `.flat()` завжди працює з масивом, і помилка зникає.
2. **`post.frontmatter.tags?.includes(tag as string)`**:
Символ `?.` означає: "Якщо `tags` існує — перевір, чи є там цей тег. Якщо `tags` немає (undefined) — просто поверни `false` і не ламай програму".
3. **Автоматизація**:
Тепер, якщо у вас з'явиться новий пост із тегом, якого раніше не було, Astro сам знайде його, створить для нього сторінку в `dist/` і відфільтрує туди потрібні пости.

### Чому аплікація видавала помилку?

Коли ви намагалися викликати метод на `undefined` (тобто на тегах, яких не існує), JavaScript зупиняв виконання коду. У режимі розробки Astro виводить велике червоне вікно з помилкою, щоб ви могли це виправити.