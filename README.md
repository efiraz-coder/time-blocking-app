# תכנון זמן שבועי | Time Blocking App

אפליקציית ווב פולסטאק לניהול זמן שבועי עם Time Blocking.

## טכנולוגיה
- Next.js 14+ (App Router)
- TypeScript
- PostgreSQL + Prisma ORM
- TailwindCSS
- Recharts
- ממשק בעברית מלאה

## התקנה

```bash
npm install
```

## הגדרת בסיס נתונים

1. צור מסד PostgreSQL
2. העתק `.env.example` ל-`.env` ועדכן את `DATABASE_URL`
3. הרץ:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## הרצה

```bash
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000) - תועבר אוטומטית ל-`/dashboard`.

## מסכים
- `/dashboard` - מסך ראשי עם כרטיסים וסטטוס
- `/plan` - תכנון שבועי (א-ה) עם רשת 5×13
- `/report/[day]` - דיווח יומי (0-4)
- `/summary` - סיכום שבועי
- `/history` - היסטוריה שבועית
