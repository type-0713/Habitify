'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { ArrowLeft, Compass, Home, SearchSlash } from 'lucide-react';

type Language = 'en' | 'ru' | 'uz';
type Theme = 'dark' | 'light';
type Preferences = {
  language: Language;
  theme: Theme;
};

const copy = {
  en: {
    badge: 'Recovery Mode',
    title: 'This page broke the streak.',
    description: 'The route you requested does not exist, was removed, or the link is stale. The rest of the app is intact.',
    primary: 'Back To Dashboard',
    secondary: 'Open Safe Route',
    cards: [
      {
        title: 'Missing route',
        description: 'The address does not map to an active page in this build.',
      },
      {
        title: 'Reliable fallback',
        description: 'Return to the dashboard and continue from the main app entry point.',
      },
      {
        title: 'State preserved',
        description: 'Your auth and stored habit data are not affected by this missing page.',
      },
    ],
    statusLabel: 'Route Status',
    unavailable: 'Unavailable',
    causes: 'Likely Causes',
    causeList: [
      'Typo in the URL',
      'Removed or renamed route',
      'Old bookmark or stale external link',
    ],
    action: 'Recommended Action',
    actionBody: 'Use the dashboard route and navigate again from inside the app so the path stays consistent with the current build.',
  },
  ru: {
    badge: 'Режим восстановления',
    title: 'Эта страница прервала серию.',
    description: 'Запрошенный маршрут не существует, был удален или ссылка устарела. Остальная часть приложения работает.',
    primary: 'Назад к панели',
    secondary: 'Открыть безопасный маршрут',
    cards: [
      {
        title: 'Маршрут не найден',
        description: 'Этот адрес не соответствует активной странице в текущей сборке.',
      },
      {
        title: 'Надежный путь',
        description: 'Вернитесь на главную панель и продолжайте навигацию оттуда.',
      },
      {
        title: 'Состояние сохранено',
        description: 'Авторизация и локальные данные привычек не повреждены этой ошибкой.',
      },
    ],
    statusLabel: 'Статус маршрута',
    unavailable: 'Недоступно',
    causes: 'Возможные причины',
    causeList: [
      'Опечатка в URL',
      'Маршрут был удален или переименован',
      'Старая закладка или устаревшая внешняя ссылка',
    ],
    action: 'Рекомендуемое действие',
    actionBody: 'Вернитесь на панель управления и снова перейдите по нужному пути уже из приложения.',
  },
  uz: {
    badge: 'Tiklash rejimi',
    title: 'Bu sahifa seriyani uzib qo‘ydi.',
    description: 'So‘ralgan route mavjud emas, o‘chirilgan yoki link eskirgan. Ilovaning qolgan qismi normal ishlaydi.',
    primary: 'Dashboardga qaytish',
    secondary: 'Xavfsiz route ochish',
    cards: [
      {
        title: 'Route topilmadi',
        description: 'Bu manzil joriy build ichidagi faol sahifaga bog‘lanmagan.',
      },
      {
        title: 'Ishonchli yo‘l',
        description: 'Dashboardga qayting va navigatsiyani ilova ichidan davom ettiring.',
      },
      {
        title: 'State saqlangan',
        description: 'Bu xato auth yoki saqlangan habit ma’lumotlaringizga zarar bermaydi.',
      },
    ],
    statusLabel: 'Route holati',
    unavailable: 'Mavjud emas',
    causes: 'Ehtimoliy sabablar',
    causeList: [
      'URL ichida xato bor',
      'Route o‘chirilgan yoki nomi o‘zgargan',
      'Eski bookmark yoki eski tashqi link ishlatilgan',
    ],
    action: 'Tavsiya etilgan amal',
    actionBody: 'Dashboard route orqali qayting va kerakli sahifaga ilova ichidan qayta o‘ting.',
  },
} satisfies Record<
  Language,
  {
    badge: string;
    title: string;
    description: string;
    primary: string;
    secondary: string;
    cards: Array<{ title: string; description: string }>;
    statusLabel: string;
    unavailable: string;
    causes: string;
    causeList: string[];
    action: string;
    actionBody: string;
  }
>;

const icons = [SearchSlash, Compass, Home] as const;
const delayClasses = ['section-delay-1', 'section-delay-2', 'section-delay-3'] as const;

const getFallbackPreferences = (): Preferences => ({
  language: 'en' as Language,
  theme: 'dark' as Theme,
});

const getClientPreferences = (): Preferences => {
  if (typeof window === 'undefined') {
    return getFallbackPreferences();
  }

  try {
    const savedLanguage = window.localStorage.getItem('language');
    const savedTheme = window.localStorage.getItem('theme');

    return {
      language:
        savedLanguage === 'en' || savedLanguage === 'ru' || savedLanguage === 'uz'
          ? savedLanguage
          : 'en',
      theme: savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'dark',
    };
  } catch {
    return getFallbackPreferences();
  }
};

export default function NotFound() {
  const preferences = useSyncExternalStore(
    () => () => undefined,
    getClientPreferences,
    getFallbackPreferences,
  );
  const text = copy[preferences.language];
  const isDark = preferences.theme === 'dark';

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        isDark
          ? 'bg-[linear-gradient(140deg,#08101d_0%,#0e1729_34%,#172554_68%,#052e2b_100%)] text-slate-50'
          : 'bg-[linear-gradient(140deg,#fff9ef_0%,#f6fbff_40%,#eefcf7_100%)] text-slate-900'
      }`}
    >
      <div className="mesh-grid" />
      <div className={`comet-trail left-[8%] top-20 hidden lg:block ${isDark ? '' : 'opacity-70'}`} />
      <div className={`pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full blur-3xl ${isDark ? 'bg-emerald-400/18' : 'bg-emerald-300/45'} orbital-halo`} />
      <div className={`pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full blur-3xl ${isDark ? 'bg-sky-400/16' : 'bg-sky-300/40'} orbital-halo-reverse`} />
      <div className={`pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl ${isDark ? 'bg-amber-300/10' : 'bg-amber-200/45'} orbital-halo`} />

      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="section-reveal">
            <div
              className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] backdrop-blur-xl ${
                isDark
                  ? 'border-white/12 bg-white/8 text-emerald-200 shadow-[0_20px_60px_-35px_rgba(16,185,129,0.55)]'
                  : 'border-emerald-200 bg-white/80 text-emerald-700 shadow-[0_20px_60px_-35px_rgba(16,185,129,0.25)]'
              }`}
            >
              <Image src="/icon.png" alt="Habitify" width={22} height={22} className="rounded-md" />
              {text.badge}
            </div>

            <div className="mt-8 max-w-3xl">
              <p
                className={`text-[5.25rem] font-bold leading-none sm:text-[7rem] ${isDark ? 'text-white/12' : 'text-slate-900/10'}`}
                style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}
              >
                404
              </p>
              <h1
                className={`mt-3 text-4xl font-bold leading-tight sm:text-6xl ${isDark ? 'text-white' : 'text-slate-900'}`}
                style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}
              >
                {text.title}
              </h1>
              <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {text.description}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#10b981_0%,#0ea5e9_56%,#2563eb_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_24px_55px_-28px_rgba(14,165,233,0.65)] transition hover:-translate-y-0.5"
              >
                <Home className="h-4 w-4" />
                {text.primary}
              </Link>
              <Link
                href="/"
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold backdrop-blur-xl transition ${
                  isDark
                    ? 'border border-white/14 bg-white/8 text-slate-100 hover:border-emerald-300/35 hover:bg-white/12'
                    : 'border border-slate-200 bg-white/82 text-slate-800 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                {text.secondary}
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {text.cards.map((card: { title: string; description: string }, index: number) => {
                const Icon = icons[index] ?? SearchSlash;

                return (
                  <div
                    key={card.title}
                    className={`spotlight-card rounded-3xl border p-5 backdrop-blur-xl section-reveal ${
                      isDark ? 'border-white/10 bg-white/8' : 'border-white/80 bg-white/72 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.2)]'
                    } ${delayClasses[index] ?? ''}`}
                  >
                    <Icon className={`h-5 w-5 ${index === 0 ? 'text-rose-300' : index === 1 ? 'text-sky-300' : 'text-emerald-300'}`} />
                    <p className={`mt-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.title}</p>
                    <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="section-reveal section-delay-2">
            <div
              className={`spotlight-card aurora-panel rounded-[32px] border p-6 shadow-[0_30px_100px_-50px_rgba(15,23,42,0.95)] backdrop-blur-2xl ${
                isDark
                  ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.06)_100%)]'
                  : 'border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.74)_100%)]'
              }`}
            >
              <div className="mesh-grid opacity-30" />
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-[0.24em] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{text.statusLabel}</p>
                  <p className={`mt-2 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.unavailable}</p>
                </div>
                <div className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${isDark ? 'border-rose-300/20 bg-rose-400/10 text-rose-100' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
                  404
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className={`glass-band rounded-2xl p-4 ${isDark ? 'bg-slate-950/30' : 'bg-white/85'}`}>
                  <p className={`text-xs uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{text.causes}</p>
                  <ul className={`mt-3 space-y-3 text-sm leading-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {text.causeList.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className={`glass-band rounded-2xl p-4 ${isDark ? 'bg-slate-950/30' : 'bg-white/85'}`}>
                  <p className={`text-xs uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{text.action}</p>
                  <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{text.actionBody}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
