## Habitify

Habitlar `Supabase` orqali sinxronlanadi, qolgan foydalanuvchi state esa `localStorage`da saqlanadi.

## Environment

`.env.local` ichida quyidagilar bo'lishi kerak:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SECRET_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SUPABASE_HABITS_TABLE=habitts
```

Ixtiyoriy:

```env
NEXT_PUBLIC_SUPABASE_HABITS_TABLE=habitts
```

`SUPABASE_SECRET_KEY` faqat server route ichida ishlatiladi. Uni browserga chiqarish kerak emas.
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` deployda fallback sifatida ham ishlatiladi.

## Vercel Deploy

Vercel ichida `Settings -> Environment Variables` bo'limiga kamida quyidagilarni qo'shing:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_HABITS_TABLE=habitts
```

`SUPABASE_SECRET_KEY` qo'yilmasa ham route endi `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` bilan ishlay oladi, lekin eng to'g'ri variant `SUPABASE_SECRET_KEY` ni ham qo'yishdir.

## Supabase Table

Supabase SQL Editor ichida [`supabase-habits.sql`](./supabase-habits.sql) faylidagi SQL ni ishga tushiring.

Jadval nomi default bo'yicha `habitts`.

Ustunlar:

- `id`
- `Name`
- `Goal`
- `Unit`
- `Icon`
- `ReminderTime`
- `User`
- `Habitt`

## Run

```bash
npm run dev
```

Root papkadan ishlatiladi:

```bash
npm run dev
npm run build
npm run lint
```
