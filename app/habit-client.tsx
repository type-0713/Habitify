'use client';

import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from './lib/firebase';
import { createHabit, deleteHabitById, listHabitsByUser, type SupabaseHabitRow } from './lib/supabase-habits';
import { Check, Plus, Flame, Menu, LogOut, Home, ListTodo, BarChart3, Bell, User, Calendar, Edit2, Save, X, ChevronLeft, ChevronRight, Sun, Moon, Apple, Chrome, Mail, LockKeyhole, Eye, EyeOff, Play, Pause, Sparkles } from 'lucide-react';

const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });

// Types
type Theme = 'dark' | 'light';
type Page = 'dashboard' | 'habits' | 'calendar' | 'stats' | 'profile';
type Language = 'en' | 'ru' | 'uz';
type AuthProvider = 'google' | 'apple' | 'github' | 'microsoft' | 'email';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  createdAt: string;
  avatarUrl?: string;
}

const translations = {
  en: {
    languageLabel: 'Language',
    dashboard: 'Dashboard',
    habits: 'Habits',
    calendar: 'Calendar',
    statistics: 'Statistics',
    profile: 'Profile',
    signInTitle: 'Sign in to Habitify',
    signInSubtitle: 'Use your email and password to sign in, or create an account with Google, Apple, or Microsoft.',
    nameLabel: 'Name',
    emailLabel: 'Email',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@example.com',
    continueWithGoogle: 'Create account with Google',
    continueWithApple: 'Create account with Apple',
    continueWithGitHub: 'Create account with Microsoft',
    continueWithEmail: 'Sign in with Email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    authErrorMissingFields: 'Enter your email and password.',
    light: 'Light',
    dark: 'Dark',
    logout: 'Logout',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    reminderTitle: 'Habit reminder',
    reminderBody: 'You still have {count} habits to complete today.',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    habitsCompletedToday: 'habits completed today',
    todaysProgress: "Today's Progress",
    complete: 'Complete',
    habitsCompleted: 'Habits completed',
    currentStreak: 'Current Streak',
    days: 'days',
    best: 'Best',
    totalHabits: 'Total Habits',
    activeHabits: 'Active habits',
    addNewHabit: 'Add New Habit',
    todaysHabits: "Today's Habits",
    noHabitsYet: 'No habits yet. Create your first habit to get started!',
    createFirstHabit: 'Create First Habit',
    thisWeekOverview: 'This Week Overview',
    allHabits: 'All Habits',
    newHabit: 'New Habit',
    searchHabits: 'Search habits',
    searchPlaceholder: 'Search by name or category',
    noHabitsFound: 'No habits match your search.',
    clearSearch: 'Clear search',
    noHabitsCreated: 'No habits created yet. Start building better habits today!',
    createYourFirstHabit: 'Create Your First Habit',
    category: 'Category',
    goal: 'Goal',
    streak: 'Streak',
    bestStreakLabel: 'Best Streak',
    statisticsTitle: 'Statistics',
    completedToday: 'Completed Today',
    trend30Days: '30-Day Trend',
    habitDistribution: 'Habit Distribution',
    completed: 'Completed',
    active: 'Active',
    habitsPerformance: 'Habits Performance',
    completion: 'Completion',
    bio: 'Bio',
    joined: 'Joined',
    totalCompleted: 'Total Completed',
    accountAge: 'Account Age',
    yourHabits: 'Your Habits',
    noHabitsYetShort: 'No habits yet',
    completedCount: 'completed',
    completedCheckbox: 'Completed',
    addHabitTitle: 'Add New Habit',
    habitName: 'Habit Name',
    habitNamePlaceholder: 'e.g., Morning Meditation',
    unit: 'Unit',
    icon: 'Icon',
    reminderTimeOptional: 'Reminder Time (Optional)',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    addHabit: 'Add Habit',
    monthlyResetTitle: 'Monthly reset',
    resetNoticePrefix: 'Local data was cleared on',
    closeNotice: 'Close notice',
    weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  ru: {
    signInTitle: 'Р’С…РѕРґ РІ Habitify',
    signInSubtitle: 'Р’С‹Р±РµСЂРёС‚Рµ РїСЂРѕРІР°Р№РґРµСЂР° РґР»СЏ РІС…РѕРґР°',
    nameLabel: 'РРјСЏ',
    emailLabel: 'Email',
    namePlaceholder: 'Р’Р°С€Рµ РёРјСЏ',
    emailPlaceholder: 'you@example.com',
    continueWithGoogle: 'Р’РѕР№С‚Рё С‡РµСЂРµР· Google',
    continueWithApple: 'Р’РѕР№С‚Рё С‡РµСЂРµР· Apple',
    continueWithGitHub: 'Р’РѕР№С‚Рё С‡РµСЂРµР· GitHub',
    continueWithEmail: 'Продолжить с Email',
    passwordLabel: 'Пароль',
    passwordPlaceholder: 'Придумайте пароль',
    authErrorMissingFields: 'Введите email и пароль.',
    languageLabel: 'Язык',
    dashboard: 'Панель',
    habits: 'Привычки',
    calendar: 'Календарь',
    statistics: 'Статистика',
    profile: 'Профиль',
    light: 'Светлая',
    dark: 'Темная',
    logout: 'Выйти',
    soundOn: 'Звук вкл.',
    soundOff: 'Звук выкл.',
    reminderTitle: 'Напоминание',
    reminderBody: 'Сегодня осталось выполнить: {count}.',
    greetingMorning: 'Доброе утро',
    greetingAfternoon: 'Добрый день',
    greetingEvening: 'Добрый вечер',
    habitsCompletedToday: 'привычек выполнено сегодня',
    todaysProgress: 'Прогресс за сегодня',
    complete: 'Выполнено',
    habitsCompleted: 'Привычек выполнено',
    currentStreak: 'Текущая серия',
    days: 'дней',
    best: 'Лучшее',
    totalHabits: 'Всего привычек',
    activeHabits: 'Активные привычки',
    addNewHabit: 'Добавить привычку',
    todaysHabits: 'Привычки сегодня',
    noHabitsYet: 'Пока нет привычек. Создайте первую привычку!',
    createFirstHabit: 'Создать первую привычку',
    thisWeekOverview: 'Обзор недели',
    allHabits: 'Все привычки',
    newHabit: 'Новая привычка',
    searchHabits: 'Поиск привычек',
    searchPlaceholder: 'Поиск по названию или категории',
    noHabitsFound: 'Ничего не найдено по вашему запросу.',
    clearSearch: 'Очистить поиск',
    noHabitsCreated: 'Привычек еще нет. Начните сегодня!',
    createYourFirstHabit: 'Создать первую привычку',
    category: 'Категория',
    goal: 'Цель',
    streak: 'Серия',
    bestStreakLabel: 'Лучшая серия',
    statisticsTitle: 'Статистика',
    completedToday: 'Выполнено сегодня',
    trend30Days: 'Тренд за 30 дней',
    habitDistribution: 'Распределение привычек',
    completed: 'Выполнено',
    active: 'Активные',
    habitsPerformance: 'Эффективность привычек',
    completion: 'Выполнение',
    bio: 'О себе',
    joined: 'Присоединился',
    totalCompleted: 'Всего выполнено',
    accountAge: 'Возраст аккаунта',
    yourHabits: 'Ваши привычки',
    noHabitsYetShort: 'Пока нет привычек',
    completedCount: 'выполнено',
    completedCheckbox: 'Выполнено',
    addHabitTitle: 'Добавить привычку',
    habitName: 'Название привычки',
    habitNamePlaceholder: 'например, Утренняя медитация',
    unit: 'Ед. измерения',
    icon: 'Иконка',
    reminderTimeOptional: 'Время напоминания (необязательно)',
    cancel: 'Отмена',
    saveChanges: 'Сохранить',
    addHabit: 'Добавить',
    monthlyResetTitle: 'Ежемесячная очистка',
    resetNoticePrefix: 'Локальные данные очищены',
    closeNotice: 'Закрыть уведомление',
    weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  },
  uz: {
    signInTitle: 'Habitify hisobiga kiring',
    signInSubtitle: "Email va parol bilan kiring yoki Google, Apple va Microsoft orqali davom eting.",
    nameLabel: 'Ism',
    emailLabel: 'Email',
    namePlaceholder: 'Ismingizni kiriting',
    emailPlaceholder: 'you@example.com',
    continueWithGoogle: 'Google orqali davom etish',
    continueWithApple: 'Apple orqali davom etish',
    continueWithGitHub: 'Microsoft orqali davom etish',
    continueWithEmail: 'Email orqali kirish',
    passwordLabel: 'Parol',
    passwordPlaceholder: 'Parolingizni kiriting',
    authErrorMissingFields: 'Email va parolni kiriting.',
    languageLabel: 'Til',
    dashboard: 'Bosh sahifa',
    habits: 'Odatlar',
    calendar: 'Kalendar',
    statistics: 'Statistika',
    profile: 'Profil',
    light: "Yorug'",
    dark: "Qorong'i",
    logout: 'Chiqish',
    soundOn: 'Ovoz yoqilgan',
    soundOff: "Ovoz o'chirilgan",
    reminderTitle: 'Eslatma',
    reminderBody: 'Bugun yana {count} ta odatni bajarishingiz kerak.',
    greetingMorning: 'Xayrli tong',
    greetingAfternoon: 'Xayrli kun',
    greetingEvening: 'Xayrli kech',
    habitsCompletedToday: 'ta odat bugun bajarildi',
    todaysProgress: "Bugungi ko'rsatkich",
    complete: 'Bajarilgan',
    habitsCompleted: 'Bajarilgan odatlar',
    currentStreak: 'Joriy seriya',
    days: 'kun',
    best: 'Eng yaxshi',
    totalHabits: 'Jami odatlar',
    activeHabits: 'Faol odatlar',
    addNewHabit: 'Yangi odat',
    todaysHabits: 'Bugungi odatlar',
    noHabitsYet: "Hali odat yo'q. Birinchi odatingizni yarating.",
    createFirstHabit: 'Birinchi odatni yarating',
    thisWeekOverview: "Haftalik ko'rinish",
    allHabits: 'Barcha odatlar',
    newHabit: 'Yangi odat',
    searchHabits: 'Odatlarni qidirish',
    searchPlaceholder: "Nomi yoki kategoriya bo'yicha qidiring",
    noHabitsFound: 'Qidiruv bo‘yicha hech narsa topilmadi.',
    clearSearch: 'Qidiruvni tozalash',
    noHabitsCreated: "Hali odat yaratilmagan. Bugundan boshlang.",
    createYourFirstHabit: 'Birinchi odatni yarating',
    category: 'Kategoriya',
    goal: 'Maqsad',
    streak: 'Seriya',
    bestStreakLabel: 'Eng yaxshi seriya',
    statisticsTitle: 'Statistika',
    completedToday: 'Bugun bajarildi',
    trend30Days: "So'nggi 30 kun",
    habitDistribution: 'Odatlar taqsimoti',
    completed: 'Bajarilgan',
    active: 'Faol',
    habitsPerformance: 'Odatlar samaradorligi',
    completion: 'Bajarilish darajasi',
    bio: "Qisqacha ma'lumot",
    joined: "Qo'shilgan sana",
    totalCompleted: 'Jami bajarilgan',
    accountAge: 'Hisob yoshi',
    yourHabits: 'Sizning odatlaringiz',
    noHabitsYetShort: "Hali odat yo'q",
    completedCount: 'bajarildi',
    completedCheckbox: 'Bajarildi',
    addHabitTitle: "Yangi odat qo'shish",
    habitName: 'Odat nomi',
    habitNamePlaceholder: 'masalan, Ertalabki meditatsiya',
    unit: 'Birlik',
    icon: 'Belgi',
    reminderTimeOptional: 'Eslatma vaqti (ixtiyoriy)',
    cancel: 'Bekor qilish',
    saveChanges: "O'zgarishlarni saqlash",
    addHabit: "Odat qo'shish",
    monthlyResetTitle: 'Oylik tozalash',
    resetNoticePrefix: "Mahalliy ma'lumotlar tozalandi:",
    closeNotice: 'Bildirishnomani yopish',
    weekdaysShort: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  },
};

// Normalize legacy text values that were previously saved with broken encoding.
Object.assign(translations.ru, {
  signInTitle: 'Вход в Habitify',
  signInSubtitle: 'Войдите с помощью email и пароля или продолжите через Google, Apple и Microsoft.',
  nameLabel: 'Имя',
  namePlaceholder: 'Ваше имя',
  continueWithGoogle: 'Продолжить через Google',
  continueWithApple: 'Продолжить через Apple',
  continueWithGitHub: 'Продолжить через Microsoft',
  continueWithEmail: 'Войти через Email',
  passwordLabel: 'Пароль',
  passwordPlaceholder: 'Введите пароль',
  authErrorMissingFields: 'Введите email и пароль.',
  languageLabel: 'Язык',
  dashboard: 'Главная',
  habits: 'Привычки',
  calendar: 'Календарь',
  statistics: 'Статистика',
  profile: 'Профиль',
  light: 'Светлая',
  dark: 'Тёмная',
  logout: 'Выйти',
  soundOn: 'Звук включён',
  soundOff: 'Звук выключен',
  reminderTitle: 'Напоминание',
  reminderBody: 'Сегодня вам осталось выполнить ещё {count} привычек.',
  greetingMorning: 'Доброе утро',
  greetingAfternoon: 'Добрый день',
  greetingEvening: 'Добрый вечер',
  habitsCompletedToday: 'привычек выполнено сегодня',
  todaysProgress: 'Прогресс за сегодня',
  complete: 'Выполнено',
  habitsCompleted: 'Выполненные привычки',
  currentStreak: 'Текущая серия',
  days: 'дней',
  best: 'Лучший',
  totalHabits: 'Всего привычек',
  activeHabits: 'Активные привычки',
  addNewHabit: 'Новая привычка',
  todaysHabits: 'Привычки на сегодня',
  noHabitsYet: 'Пока нет привычек. Создайте первую привычку.',
  createFirstHabit: 'Создать первую привычку',
  thisWeekOverview: 'Обзор недели',
  allHabits: 'Все привычки',
  newHabit: 'Новая привычка',
  searchHabits: 'Поиск привычек',
  searchPlaceholder: 'Поиск по названию или категории',
  noHabitsFound: 'Ничего не найдено по вашему запросу.',
  clearSearch: 'Очистить поиск',
  noHabitsCreated: 'Привычек пока нет. Начните сегодня.',
  createYourFirstHabit: 'Создать первую привычку',
  category: 'Категория',
  goal: 'Цель',
  streak: 'Серия',
  bestStreakLabel: 'Лучшая серия',
  statisticsTitle: 'Статистика',
  completedToday: 'Выполнено сегодня',
  trend30Days: 'Последние 30 дней',
  habitDistribution: 'Распределение привычек',
  completed: 'Выполнено',
  active: 'Активные',
  habitsPerformance: 'Эффективность привычек',
  completion: 'Процент выполнения',
  bio: 'О себе',
  joined: 'Дата регистрации',
  totalCompleted: 'Всего выполнено',
  accountAge: 'Возраст аккаунта',
  yourHabits: 'Ваши привычки',
  noHabitsYetShort: 'Привычек пока нет',
  completedCount: 'выполнено',
  completedCheckbox: 'Выполнено',
  addHabitTitle: 'Добавить привычку',
  habitName: 'Название привычки',
  habitNamePlaceholder: 'например, Утренняя медитация',
  unit: 'Единица',
  icon: 'Иконка',
  reminderTimeOptional: 'Время напоминания (необязательно)',
  cancel: 'Отмена',
  saveChanges: 'Сохранить изменения',
  addHabit: 'Добавить привычку',
  monthlyResetTitle: 'Ежемесячная очистка',
  resetNoticePrefix: 'Локальные данные очищены:',
  closeNotice: 'Закрыть уведомление',
  weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
});
translations.uz.noHabitsFound = "Qidiruv bo'yicha hech narsa topilmadi.";

const categoryLabels: Record<Language, Record<string, string>> = {
  en: {
    health: 'Health',
    productivity: 'Productivity',
    learning: 'Learning',
    fitness: 'Fitness',
    wellness: 'Wellness',
    finance: 'Finance',
    hobbies: 'Hobbies',
  },
  ru: {
    health: 'Здоровье',
    productivity: 'Продуктивность',
    learning: 'Обучение',
    fitness: 'Фитнес',
    wellness: 'Самочувствие',
    finance: 'Финансы',
    hobbies: 'Хобби',
  },
  uz: {
    health: "Sog'liq",
    productivity: 'Samaradorlik',
    learning: "O'qish",
    fitness: 'Fitnes',
    wellness: 'Farovonlik',
    finance: 'Moliya',
    hobbies: 'Xobbi',
  },
};

const unitLabels: Record<Language, Record<string, string>> = {
  en: {
    min: 'min',
    hours: 'hours',
    reps: 'reps',
    km: 'km',
    liters: 'liters',
    count: 'count',
    pages: 'pages',
  },
  ru: {
    min: 'мин',
    hours: 'ч',
    reps: 'повт.',
    km: 'км',
    liters: 'л',
    count: 'раз',
    pages: 'стр.',
  },
  uz: {
    min: 'daq',
    hours: 'soat',
    reps: 'marta',
    km: 'km',
    liters: 'l',
    count: 'marta',
    pages: 'bet',
  },
};

interface HabitCompletion {
  date: string;
  completed: boolean;
  current: number;
  time?: string;
}

interface Habit {
  id: string;
  name: string;
  goal: number;
  unit: string;
  icon: string;
  color: string;
  createdAt: string;
  completions: HabitCompletion[];
  category: string;
  reminderTime?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarUrl?: string;
  bio: string;
  joinDate: string;
}

interface Metrics {
  totalHabits: number;
  completedToday: number;
  todayProgress: number;
  weeklyCompletion: number;
  currentStreak: number;
  bestStreak: number;
}

interface NewHabitDraft {
  name: string;
  goal: string;
  unit: string;
  icon: string;
  category: string;
  reminderTime: string;
}

interface ProfileOverrides {
  name?: string;
  email?: string;
  bio?: string;
}

interface ActiveTimer {
  habitId: string;
  date: string;
}

interface LiveTimerProgress {
  current: number;
}

interface HabitMeta {
  color: string;
  createdAt: string;
  completions: HabitCompletion[];
  category: string;
}

type HabitMetaMap = Record<string, HabitMeta>;

// Theme Configuration
const themes = {
  dark: {
    bg: 'bg-[radial-gradient(circle_at_top_left,#4a2f08_0%,#1a2030_20%,#0b1220_58%,#08111c_100%)]',
    bgSecondary: 'bg-[linear-gradient(180deg,rgba(24,20,24,0.96)_0%,rgba(13,20,36,0.95)_16%,rgba(9,17,29,0.97)_100%)]',
    bgTertiary: 'bg-[linear-gradient(135deg,#1c2539_0%,#111a2a_100%)]',
    border: 'border-[#34405c]',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300/80',
    card: 'bg-[linear-gradient(160deg,rgba(22,29,44,0.95)_0%,rgba(16,23,37,0.92)_46%,rgba(10,17,30,0.96)_100%)] shadow-[0_30px_90px_-44px_rgba(2,8,23,0.85)]',
    input: 'bg-[linear-gradient(135deg,rgba(24,33,49,0.98)_0%,rgba(17,24,39,0.97)_100%)] border-[#3b4a6b] placeholder:text-slate-500',
    hover: 'hover:bg-[#1a2740] focus-visible:bg-[#1a2740] hover:border-amber-400/20 focus-visible:border-amber-400/30',
    gradient: 'from-amber-300 via-orange-500 to-sky-500',
  },
  light: {
    bg: 'bg-[linear-gradient(135deg,#fff3df_0%,#fffdf8_42%,#ebf6ff_100%)]',
    bgSecondary: 'bg-[linear-gradient(180deg,rgba(255,248,238,0.88)_0%,rgba(255,255,255,0.97)_34%,rgba(239,247,255,0.96)_100%)]',
    bgTertiary: 'bg-[linear-gradient(135deg,#fff8ee_0%,#f3f9ff_100%)]',
    border: 'border-[#d9e4f2]',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    card: 'bg-[linear-gradient(135deg,rgba(255,250,243,0.98)_0%,rgba(255,255,255,0.97)_42%,rgba(241,248,255,0.99)_100%)] shadow-[0_26px_80px_-42px_rgba(71,85,105,0.24)]',
    input: 'bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_52%,#f4f9ff_100%)] border-[#d5e0ef] placeholder:text-slate-400',
    hover: 'hover:bg-[#edf3ff] focus-visible:bg-[#edf3ff] hover:border-amber-200 focus-visible:border-amber-300',
    gradient: 'from-amber-400 via-orange-500 to-sky-500',
  },
};

type ThemeConfig = (typeof themes)['dark'];

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const habitIcons = ['💻', '📚', '💪', '💧', '🌙', '🧘', '🏃', '🍎', '🎯', '⭐'];
const defaultHabitIcon = '⭐';
const legacyIconMap: Record<string, string> = {
  'рџ’»': '💻',
  'рџ“љ': '📚',
  'рџ’Є': '💪',
  'рџ’§': '💧',
  'рџЌ™': '🌙',
  'рџ§': '🧘',
  'рџЏѓ': '🏃',
  'рџЌЋ': '🍎',
  'рџЋЇ': '🎯',
  'в­ђ': '⭐',
};
const normalizeIcon = (icon: string | null | undefined) => {
  if (!icon) return defaultHabitIcon;
  const mapped = (legacyIconMap[icon] ?? icon).trim();
  return mapped || defaultHabitIcon;
};

const normalizeLanguage = (value: string | null | undefined): Language => {
  if (value === 'ru' || value === 'uz' || value === 'en') {
    return value;
  }
  return 'en';
};

const getLocale = (language: Language) => {
  if (language === 'ru') return 'ru-RU';
  if (language === 'uz') return 'uz-UZ';
  return 'en-US';
};

const getWeekStartIndex = () => {
  return 1;
};

const getWeekdayLabels = (language: Language) => {
  return translations[language].weekdaysShort;
};

const getCategoryLabel = (language: Language, category: string) => {
  return categoryLabels[language][category] ?? category;
};

const getUnitLabel = (language: Language, unit: string) => {
  return unitLabels[language][unit] ?? unit;
};

const getGreeting = (language: Language) => {
  const hour = new Date().getHours();
  const text = translations[language];
  if (hour < 12) return text.greetingMorning;
  if (hour < 18) return text.greetingAfternoon;
  return text.greetingEvening;
};

// Utility Functions
function getLocalStorage<T>(key: string, defaultValue: T): T;
function getLocalStorage<T>(key: string, defaultValue?: T): T | null;
function getLocalStorage<T>(key: string, defaultValue?: T) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

const setLocalStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('habitify:storage', { detail: { key } }));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

const getHabitMetaStorageKey = (userId: string) => `habit_meta_${userId}`;

const normalizeUserEmail = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

const getHabitOwner = (user: AuthUser | null) => {
  return normalizeUserEmail(user?.email);
};

const getFirebaseUserEmail = (firebaseUser: {
  email: string | null;
  providerData: Array<{ email?: string | null } | null>;
}) => {
  const primaryEmail = normalizeUserEmail(firebaseUser.email);
  if (primaryEmail) {
    return primaryEmail;
  }

  return firebaseUser.providerData
    .map((provider) => normalizeUserEmail(provider?.email))
    .find(Boolean) ?? '';
};

const normalizeReminderTime = (value: string | null | undefined) => {
  if (!value) return '09:00';
  return value.slice(0, 5);
};

const normalizeHabitMetaMap = (value: unknown): HabitMetaMap => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>).map(([habitId, item]) => {
    const rawItem = item && typeof item === 'object' && !Array.isArray(item) ? (item as Partial<HabitMeta>) : {};
    return [
      habitId,
      {
        color: typeof rawItem.color === 'string' ? rawItem.color : getRandomColor(),
        createdAt: typeof rawItem.createdAt === 'string' ? rawItem.createdAt : getTodayDate(),
        completions: Array.isArray(rawItem.completions) ? (rawItem.completions as HabitCompletion[]) : [],
        category: typeof rawItem.category === 'string' ? rawItem.category : 'health',
      },
    ] as const;
  });

  return Object.fromEntries(entries);
};

const normalizeLegacyHabit = (item: unknown): Habit | null => {
  if (!item || typeof item !== 'object') return null;
  const habit = item as Partial<Habit>;
  if (!habit.id || !habit.name || typeof habit.goal !== 'number' || !habit.unit) {
    return null;
  }

  return {
    id: String(habit.id),
    name: habit.name,
    goal: habit.goal,
    unit: habit.unit,
    icon: normalizeIcon(habit.icon),
    color: typeof habit.color === 'string' ? habit.color : getRandomColor(),
    createdAt: typeof habit.createdAt === 'string' ? habit.createdAt : getTodayDate(),
    completions: Array.isArray(habit.completions) ? (habit.completions as HabitCompletion[]) : [],
    category: typeof habit.category === 'string' ? habit.category : 'health',
    reminderTime: normalizeReminderTime(habit.reminderTime),
  };
};

const habitToMeta = (habit: Habit): HabitMeta => ({
  color: habit.color,
  createdAt: habit.createdAt,
  completions: habit.completions,
  category: habit.category,
});

const habitsToMetaMap = (habits: Habit[]): HabitMetaMap =>
  Object.fromEntries(habits.map((habit) => [habit.id, habitToMeta(habit)]));

const mergeHabitRowWithMeta = (row: SupabaseHabitRow, meta?: HabitMeta): Habit => ({
  id: String(row.id),
  name: row.Name,
  goal: Number(row.Goal),
  unit: row.Unit,
  icon: normalizeIcon(row.Icon),
  color: meta?.color ?? getRandomColor(),
  createdAt: meta?.createdAt ?? getTodayDate(),
  completions: meta?.completions ?? [],
  category: meta?.category ?? 'health',
  reminderTime: normalizeReminderTime(row.ReminderTime),
});

type SoundCue = 'success' | 'complete' | 'reminder' | 'add' | 'start' | 'pause';
const SOUND_GAIN_MULTIPLIER = 2.4;
const MAX_NOTIFICATION_GAIN = 0.12;

const soundCueMap: Record<SoundCue, Array<{ frequency: number; duration: number; delay: number; gain?: number; type?: OscillatorType }>> = {
  success: [
    { frequency: 659.25, duration: 0.11, delay: 0, gain: 0.04, type: 'triangle' },
    { frequency: 783.99, duration: 0.12, delay: 0.1, gain: 0.05, type: 'triangle' },
    { frequency: 987.77, duration: 0.18, delay: 0.22, gain: 0.06, type: 'sine' },
  ],
  complete: [
    { frequency: 523.25, duration: 0.08, delay: 0, gain: 0.038, type: 'triangle' },
    { frequency: 659.25, duration: 0.09, delay: 0.08, gain: 0.046, type: 'triangle' },
    { frequency: 783.99, duration: 0.1, delay: 0.16, gain: 0.046, type: 'triangle' },
    { frequency: 1046.5, duration: 0.24, delay: 0.28, gain: 0.06, type: 'sine' },
  ],
  reminder: [
    { frequency: 440, duration: 0.1, delay: 0, gain: 0.04, type: 'sine' },
    { frequency: 554.37, duration: 0.14, delay: 0.12, gain: 0.05, type: 'triangle' },
  ],
  add: [
    { frequency: 587.33, duration: 0.08, delay: 0, gain: 0.032, type: 'triangle' },
    { frequency: 783.99, duration: 0.12, delay: 0.09, gain: 0.042, type: 'triangle' },
  ],
  start: [
    { frequency: 493.88, duration: 0.08, delay: 0, gain: 0.03, type: 'sine' },
    { frequency: 659.25, duration: 0.1, delay: 0.08, gain: 0.038, type: 'triangle' },
  ],
  pause: [
    { frequency: 587.33, duration: 0.07, delay: 0, gain: 0.03, type: 'triangle' },
    { frequency: 440, duration: 0.1, delay: 0.08, gain: 0.03, type: 'sine' },
  ],
};

const playNotificationSound = (enabled: boolean, cue: SoundCue = 'success') => {
  if (!enabled || typeof window === 'undefined') return;
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  try {
    const context = new AudioContextCtor();
    const now = context.currentTime;
    const steps = soundCueMap[cue];

    steps.forEach((step) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = now + step.delay;
      const endAt = startAt + step.duration;
      const peakGain = Math.min((step.gain ?? 0.025) * SOUND_GAIN_MULTIPLIER, MAX_NOTIFICATION_GAIN);

      oscillator.type = step.type ?? 'sine';
      oscillator.frequency.setValueAtTime(step.frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(endAt);
    });

    const totalDuration = steps.reduce((max, step) => Math.max(max, step.delay + step.duration), 0);
    window.setTimeout(() => {
      context.close();
    }, Math.ceil((totalDuration + 0.08) * 1000));
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getTodayDate = () => {
  return formatLocalDate(new Date());
};

const getMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getCurrentTimeString = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const isTimedHabit = (unit: string) => unit === 'min' || unit === 'hours';

const getHabitProgressRatio = (habit: Habit, completion?: HabitCompletion) => {
  if (!completion || habit.goal <= 0) return 0;
  return Math.max(0, Math.min(completion.current / habit.goal, 1));
};

const getHabitGoalSeconds = (habit: Habit) => {
  if (habit.unit === 'hours') return habit.goal * 3600;
  if (habit.unit === 'min') return habit.goal * 60;
  return 0;
};

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatHabitCurrentValue = (habit: Habit, current: number) => {
  if (isTimedHabit(habit.unit)) {
    return formatDuration((current / habit.goal) * getHabitGoalSeconds(habit));
  }

  if (Number.isInteger(current)) return String(current);
  return current.toFixed(1);
};

const formatHabitGoalValue = (habit: Habit) => {
  if (isTimedHabit(habit.unit)) {
    return formatDuration(getHabitGoalSeconds(habit));
  }

  if (Number.isInteger(habit.goal)) return String(habit.goal);
  return habit.goal.toFixed(1);
};

const formatDate = (dateString: string, locale: string) => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
};

const getWeekDates = (weekStartIndex: number) => {
  const today = new Date();
  const offset = (today.getDay() - weekStartIndex + 7) % 7;
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - offset);
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() + i);
    weekDates.push(formatLocalDate(date));
  }
  return weekDates;
};

const getStreak = (habit: Habit): number => {
  let streak = 0;
  const checkDate = new Date();
  
  while (true) {
    const dateStr = formatLocalDate(checkDate);
    const completion = habit.completions.find(c => c.date === dateStr);
    
    if (completion && completion.completed) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const getBestStreak = (habit: Habit): number => {
  if (habit.completions.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  
  [...habit.completions].reverse().forEach(completion => {
    if (completion.completed) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
};

const getRandomColor = () => {
  const colors = [
    'from-amber-300 via-orange-400 to-sky-500',
    'from-cyan-400 via-sky-500 to-indigo-500',
    'from-amber-300 via-orange-400 to-sky-500',
    'from-amber-400 via-orange-500 to-rose-500',
    'from-rose-400 via-pink-500 to-fuchsia-500',
    'from-amber-300 via-orange-500 to-rose-500',
    'from-sky-400 via-blue-500 to-indigo-500',
    'from-fuchsia-400 via-violet-500 to-indigo-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  const initials = parts.slice(0, 2).map(part => part[0]).join('');
  return initials.toUpperCase() || 'U';
};

const getAuthErrorMessage = (code: string, fallback: string) => {
  if (code === 'auth/wrong-password') return 'Incorrect password.';
  if (code === 'auth/user-not-found') return 'No account found for this email.';
  if (code === 'auth/invalid-email') return 'Enter a valid email address.';
  if (code === 'auth/email-already-in-use') return 'Email is already in use.';
  if (code === 'auth/popup-closed-by-user') return 'Popup closed. Try again.';
  return fallback;
};

const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousDocumentOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    documentElement.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [locked]);
};

const calculateMetricsForHabits = (habits: Habit[], date: string): Metrics => {
  const isHabitActiveOn = (habit: Habit, dateStr: string) => {
    return !habit.createdAt || habit.createdAt <= dateStr;
  };

  const activeHabits = habits.filter((habit) => isHabitActiveOn(habit, date));
  const totalProgress = activeHabits.reduce((sum, habit) => {
    const completion = habit.completions.find((entry) => entry.date === date);
    return sum + getHabitProgressRatio(habit, completion);
  }, 0);
  const completedToday = activeHabits.filter((habit) => {
    const completion = habit.completions.find((entry) => entry.date === date);
    return getHabitProgressRatio(habit, completion) >= 1;
  }).length;

  const isDayFullyCompleted = (dateStr: string) => {
    const currentActiveHabits = habits.filter((habit) => isHabitActiveOn(habit, dateStr));
    if (currentActiveHabits.length === 0) return false;
    return currentActiveHabits.every((habit) => habit.completions.find((completion) => completion.date === dateStr && completion.completed));
  };

  const getCurrentStreak = () => {
    if (habits.length === 0) return 0;
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = formatLocalDate(checkDate);
      if (!isDayFullyCompleted(dateStr)) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const getBestStreakValue = () => {
    if (habits.length === 0) return 0;
    const validDates = habits
      .map((habit) => habit.createdAt)
      .filter((value): value is string => Boolean(value));
    const startDate = validDates.length > 0
      ? parseLocalDate(validDates.reduce((min, value) => (value < min ? value : min)))
      : new Date();
    const today = new Date();
    let best = 0;
    let current = 0;
    const cursor = new Date(startDate);

    while (cursor <= today) {
      const dateStr = formatLocalDate(cursor);
      if (isDayFullyCompleted(dateStr)) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return best;
  };

  return {
    totalHabits: activeHabits.length,
    completedToday,
    todayProgress: Math.round((totalProgress / Math.max(activeHabits.length, 1)) * 100),
    weeklyCompletion: Math.round((totalProgress / Math.max(activeHabits.length, 1)) * 100),
    currentStreak: getCurrentStreak(),
    bestStreak: getBestStreakValue(),
  };
};

// Main App Component
export default function HabitClientApp() {
  return <HabitTrackerApp />;
}

function HabitTrackerApp() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const isLoaded = authReady;
  const isSignedIn = Boolean(authUser);
  const user = authUser;
  const [theme, setTheme] = useState<Theme>(() => getLocalStorage<Theme>('theme', 'light') ?? 'light');
  const [profileOverrides, setProfileOverrides] = useState<ProfileOverrides>({});
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<{ title: string; message: string } | null>(null);
  const [celebrationToast, setCelebrationToast] = useState<{ title: string; message: string } | null>(null);
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => getLocalStorage<boolean>('sound_enabled', true) ?? true);
  const [language, setLanguage] = useState<Language>(() => normalizeLanguage(getLocalStorage<string>('language', 'en')));
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [liveTimerProgress, setLiveTimerProgress] = useState<LiveTimerProgress | null>(null);
  const timerTickRef = useRef<number | null>(null);

  const [newHabit, setNewHabit] = useState<NewHabitDraft>({
    name: '',
    goal: '',
    unit: 'min',
    icon: defaultHabitIcon,
    category: 'health',
    reminderTime: '09:00',
  });

  const themeConfig = themes[theme];
  const locale = getLocale(language);
  const text = translations[language];
  const minMonth = getMonthStart(new Date());
  const habitOwner = getHabitOwner(user);
  const handleThemeChange = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    setLocalStorage('theme', nextTheme);
  }, []);
  const handleLanguageChange = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setLocalStorage('language', nextLanguage);
  }, []);

  const launchCelebration = useCallback((title: string, message: string) => {
    setCelebrationToast({ title, message });
    setCelebrationBurst((prev) => prev + 1);
  }, []);

  const handleMonthChange = useCallback((date: Date) => {
    const nextMonth = getMonthStart(date);
    if (nextMonth < minMonth) {
      setCurrentMonth(minMonth);
      return;
    }
    setCurrentMonth(nextMonth);
  }, [minMonth]);

  // Monthly reset only clears local completion/profile state.
  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      return;
    }
    const checkMonthlyReset = () => {
      const now = new Date();
      const monthKey = getMonthKey(now);
      const resetKey = `monthly_reset_${user.id}`;
      const lastReset = getLocalStorage<string>(resetKey, '');
      const currentMeta = normalizeHabitMetaMap(getLocalStorage<unknown>(getHabitMetaStorageKey(user.id), {}));

      if (!lastReset) {
        setLocalStorage(resetKey, monthKey);
        return;
      }

      if (lastReset !== monthKey) {
        const resetMeta = Object.fromEntries(
          Object.entries(currentMeta).map(([habitId, meta]) => [
            habitId,
            {
              ...meta,
              completions: [],
            },
          ]),
        ) as HabitMetaMap;

        setHabits((prev) => prev.map((habit) => ({ ...habit, completions: [] })));
        setProfileOverrides({});
        setLocalStorage(getHabitMetaStorageKey(user.id), resetMeta);
        setLocalStorage(`habits_${user.id}`, []);
        setLocalStorage(`profile_${user.id}`, {});
        setLocalStorage(resetKey, monthKey);
        setSelectedDate(getTodayDate());
        setCurrentMonth(getMonthStart(now));
        const resetDateLabel = now.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        setResetNotice(`${text.resetNoticePrefix} ${resetDateLabel}.`);
        playNotificationSound(soundEnabled, 'reminder');
      }
    };
    checkMonthlyReset();
    const intervalId = window.setInterval(checkMonthlyReset, 1000 * 60 * 60);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSignedIn, language, locale, soundEnabled, text.resetNoticePrefix, user?.id]);

  // Load user-specific data after auth is ready.
  useEffect(() => {
    let ignore = false;

    const loadUserData = async () => {
      if (!isSignedIn || !user?.id) {
        setHabits([]);
        setProfileOverrides({});
        return;
      }

      const savedProfile = getLocalStorage<unknown>(`profile_${user.id}`, {});
      const isProfileObject = Boolean(savedProfile) && typeof savedProfile === 'object' && !Array.isArray(savedProfile);
      const safeProfile = isProfileObject ? (savedProfile as ProfileOverrides) : {};
      if (!isProfileObject) {
        setLocalStorage(`profile_${user.id}`, {});
      }
      if (!ignore) {
        setProfileOverrides(safeProfile);
      }

      const savedMeta = getLocalStorage<unknown>(getHabitMetaStorageKey(user.id), {});
      const habitMeta = normalizeHabitMetaMap(savedMeta);
      const shouldRewriteMeta =
        !savedMeta ||
        typeof savedMeta !== 'object' ||
        Array.isArray(savedMeta);
      if (shouldRewriteMeta) {
        setLocalStorage(getHabitMetaStorageKey(user.id), habitMeta);
      }

      const legacyHabitsRaw = getLocalStorage<unknown>(`habits_${user.id}`, []);
      const legacyHabits = Array.isArray(legacyHabitsRaw)
        ? legacyHabitsRaw.map(normalizeLegacyHabit).filter((habit): habit is Habit => Boolean(habit))
        : [];
      if (!Array.isArray(legacyHabitsRaw)) {
        setLocalStorage(`habits_${user.id}`, []);
      }

      if (!habitOwner) {
        if (!ignore) {
          setHabits(legacyHabits);
        }
        return;
      }

      try {
        const remoteRows = await listHabitsByUser(habitOwner);

        if (remoteRows.length === 0 && legacyHabits.length > 0) {
          const migratedHabits: Habit[] = [];

          for (const legacyHabit of legacyHabits) {
            const row = await createHabit({
              name: legacyHabit.name,
              goal: legacyHabit.goal,
              unit: legacyHabit.unit,
              icon: normalizeIcon(legacyHabit.icon),
              reminderTime: legacyHabit.reminderTime,
              user: habitOwner,
              habitt: false,
            });

            migratedHabits.push(mergeHabitRowWithMeta(row, habitToMeta(legacyHabit)));
          }

          const migratedMeta = habitsToMetaMap(migratedHabits);
          setLocalStorage(getHabitMetaStorageKey(user.id), migratedMeta);
          setLocalStorage(`habits_${user.id}`, []);

          if (!ignore) {
            setHabits(migratedHabits);
          }
          return;
        }

        const nextHabits = remoteRows.map((row) => mergeHabitRowWithMeta(row, habitMeta[String(row.id)]));
        if (!ignore) {
          setHabits(nextHabits);
        }
      } catch (error) {
        console.error('Error loading habits from Supabase:', error);
        if (!ignore) {
          setHabits(legacyHabits);
        }
      }
    };
    void loadUserData();
    return () => {
      ignore = true;
    };
  }, [habitOwner, isSignedIn, user?.id]);

  // Save sound preference
  useEffect(() => {
    setLocalStorage('sound_enabled', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        setAuthUser(null);
        setAuthReady(true);
        return;
      }
      const createdAt = firebaseUser.metadata?.creationTime
        ? formatLocalDate(new Date(firebaseUser.metadata.creationTime))
        : getTodayDate();
      const providerId = firebaseUser.providerData[0]?.providerId ?? 'email';
      const provider: AuthProvider =
        providerId === 'google.com'
          ? 'google'
          : providerId === 'github.com'
          ? 'github'
          : providerId === 'microsoft.com'
          ? 'microsoft'
          : providerId === 'apple.com'
          ? 'apple'
          : 'email';
      setAuthUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: getFirebaseUserEmail(firebaseUser),
        provider,
        createdAt,
        avatarUrl: firebaseUser.photoURL || undefined,
      });
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Save only local habit metadata. Habit rows live in Supabase.
  useEffect(() => {
    if (isSignedIn && user?.id) {
      setLocalStorage(getHabitMetaStorageKey(user.id), habitsToMetaMap(habits));
    }
  }, [habits, isSignedIn, user?.id]);

  // Update Habit Completion
  const handleUpdateHabitCompletion = useCallback((habitId: string, date: string, current: number, time?: string) => {
    let completedHabitName = '';
    let becameCompleted = false;

    setHabits((prev) => prev.map(h => {
      if (h.id === habitId) {
        const completions = [...h.completions];
        const existingIndex = completions.findIndex(c => c.date === date);
        const wasCompleted = existingIndex >= 0 ? completions[existingIndex].completed : false;
        const nextCompleted = current >= h.goal;

        if (existingIndex >= 0) {
          completions[existingIndex] = {
            ...completions[existingIndex],
            current,
            completed: nextCompleted,
            time: time || completions[existingIndex].time,
          };
        } else {
          completions.push({
            date,
            completed: nextCompleted,
            current,
            time,
          });
        }

        if (!wasCompleted && nextCompleted) {
          becameCompleted = true;
          completedHabitName = h.name;
        }

        return { ...h, completions };
      }
      return h;
    }));

    if (becameCompleted) {
      playNotificationSound(soundEnabled, 'complete');
      launchCelebration('Habit completed', `${completedHabitName} finished successfully.`);
    }
  }, [launchCelebration, soundEnabled]);

  useEffect(() => {
    if (!activeTimer) {
      timerTickRef.current = null;
      return;
    }

    const timerHabit = habits.find((habit) => habit.id === activeTimer.habitId);
    if (!timerHabit || !isTimedHabit(timerHabit.unit)) {
      return;
    }

    timerTickRef.current = Date.now();
    const timerIntervalMs = isMobile ? 5000 : 2000;

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const lastTick = timerTickRef.current ?? now;
      const elapsedSeconds = Math.max(1, Math.round((now - lastTick) / 1000));
      timerTickRef.current = now;

      startTransition(() => {
        let completed = false;
        let nextCurrentValue = 0;

        setLiveTimerProgress((prev) => {
          const baseCurrent = prev?.current ?? 0;
          const increment = timerHabit.unit === 'hours' ? elapsedSeconds / 3600 : elapsedSeconds / 60;
          nextCurrentValue = Math.min(timerHabit.goal, baseCurrent + increment);
          completed = nextCurrentValue >= timerHabit.goal;
          return { current: nextCurrentValue };
        });

        if (completed) {
          handleUpdateHabitCompletion(activeTimer.habitId, activeTimer.date, timerHabit.goal, getCurrentTimeString());
          setActiveTimer((currentTimer) => (
            currentTimer?.habitId === activeTimer.habitId ? null : currentTimer
          ));
          setLiveTimerProgress(null);
          playNotificationSound(soundEnabled, 'complete');
          setCelebrationToast({ title: 'Habit completed', message: 'Beautiful work. That session is fully done.' });
          setCelebrationBurst((prev) => prev + 1);
        }
      });
    }, timerIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeTimer, habits, handleUpdateHabitCompletion, isMobile, soundEnabled]);

  useEffect(() => {
    if (!activeTimer) return;

    const timerHabit = habits.find((habit) => habit.id === activeTimer.habitId);

    if (!timerHabit) {
      const timeoutId = window.setTimeout(() => {
        setActiveTimer(null);
        setLiveTimerProgress(null);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [activeTimer, habits]);

  useEffect(() => {
    if (!celebrationToast) return;
    const timeoutId = window.setTimeout(() => setCelebrationToast(null), 3800);
    return () => window.clearTimeout(timeoutId);
  }, [celebrationToast]);

  // Daily reminder after 14:00 if any habit is still incomplete.
  useEffect(() => {
    if (!isSignedIn || !user?.id || habits.length === 0 || !soundEnabled) {
      return;
    }

    const alertKey = `daily_reminder_${user.id}`;

    const checkReminder = () => {
      if (!soundEnabled) return;

      const now = new Date();
      if (now.getHours() < 14) return;

      const todayStr = getTodayDate();
      const lastAlert = getLocalStorage<string>(alertKey, '');
      if (lastAlert === todayStr) return;

      const activeHabits = habits.filter((habit) => !habit.createdAt || habit.createdAt <= todayStr);
      if (activeHabits.length === 0) {
        return;
      }

      const incomplete = activeHabits.filter(
        (habit) => !habit.completions.find((c) => c.date === todayStr && c.completed)
      );

      if (incomplete.length === 0) {
        return;
      }

      const message = text.reminderBody.replace('{count}', String(incomplete.length));
      setReminderToast({ title: text.reminderTitle, message });
      playNotificationSound(soundEnabled, 'reminder');
      setLocalStorage(alertKey, todayStr);
      window.setTimeout(() => {
        setReminderToast(null);
      }, 10000);
    };

    checkReminder();
    const intervalId = window.setInterval(checkReminder, 1000 * 60);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [habits, isSignedIn, soundEnabled, text.reminderBody, text.reminderTitle, user?.id]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => setIsMounted(true));
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(media.matches);
    update();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  /*
      avatar: '👤',
      bio: 'Building better habits daily!',
      joinDate: getTodayDate(),
      theme: 'dark',
    };

    allUsers.push(newUser);
    setLocalStorage('all_users', allUsers);

    setAuthState({
      isLoggedIn: true,
      user: newUser,
    });

    setHabits([]);
    setLocalStorage(`habits_${newUser.id}`, []);
  };
  */

  const handleLogin = async (provider: AuthProvider, email: string, password: string) => {
    setAuthError(null);
    try {
      if (provider === 'email') {
        if (!email || !password) {
          setAuthError(translations[language].authErrorMissingFields);
          return;
        }
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        const providerInstance =
          provider === 'google'
            ? new GoogleAuthProvider()
            : provider === 'apple'
            ? new OAuthProvider('apple.com')
            : new OAuthProvider('microsoft.com');
        await signInWithPopup(firebaseAuth, providerInstance);
      }
      setCurrentPage('dashboard');
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const fallback = err.message || 'Authentication failed.';
      setAuthError(getAuthErrorMessage(err.code || '', fallback));
    }
  };

  // Logout Handler
  const handleLogout = useCallback(() => {
    void signOut(firebaseAuth);
    setProfileOverrides({});
    setCurrentPage('dashboard');
    setHabits([]);
    setActiveTimer(null);
    setLiveTimerProgress(null);
  }, []);

  // Add Habit
  const handleAddHabit = useCallback(async () => {
    const trimmedName = newHabit.name.trim();
    const parsedGoal = parseFloat(newHabit.goal);

    if (!trimmedName || Number.isNaN(parsedGoal) || !habitOwner) {
      return;
    }

    try {
      const row = await createHabit({
        name: trimmedName,
        goal: parsedGoal,
        unit: newHabit.unit,
        icon: normalizeIcon(newHabit.icon),
        reminderTime: newHabit.reminderTime,
        user: habitOwner,
        habitt: false,
      });

      const habit = mergeHabitRowWithMeta(row, {
        color: getRandomColor(),
        createdAt: getTodayDate(),
        completions: [],
        category: newHabit.category,
      });

      setHabits((prev) => [...prev, habit]);
      setNewHabit({
        name: '',
        goal: '',
        unit: 'min',
        icon: defaultHabitIcon,
        category: 'health',
        reminderTime: '09:00',
      });
      setShowAddHabit(false);
      playNotificationSound(soundEnabled, 'add');
      launchCelebration('New habit added', `${trimmedName} is ready for today.`);
    } catch (error) {
      console.error('Error creating habit in Supabase:', error);
      setReminderToast({
        title: 'Sync error',
        message: 'Habitni Supabase ga saqlab bo‘lmadi. Iltimos qayta urinib ko‘ring.',
      });
    }
  }, [habitOwner, launchCelebration, newHabit, soundEnabled]);

  const handleToggleHabitTimer = useCallback((habitId: string, date: string) => {
    const targetHabit = habits.find((habit) => habit.id === habitId);

    if (!targetHabit) return;

    const completion = targetHabit.completions.find((entry) => entry.date === date);
    const progressRatio = getHabitProgressRatio(targetHabit, completion);

    if (!isTimedHabit(targetHabit.unit)) {
      if (progressRatio >= 1) {
        handleUpdateHabitCompletion(habitId, date, 0);
      } else {
        handleUpdateHabitCompletion(habitId, date, targetHabit.goal, getCurrentTimeString());
      }
      return;
    }

    if (activeTimer?.habitId === habitId && activeTimer.date === date) {
      if (liveTimerProgress) {
        handleUpdateHabitCompletion(habitId, date, liveTimerProgress.current);
      }
      setActiveTimer(null);
      setLiveTimerProgress(null);
      playNotificationSound(soundEnabled, 'pause');
      return;
    }

    if (activeTimer && activeTimer.habitId !== habitId) {
      return;
    }

    if (progressRatio >= 1) {
      return;
    }

    setLiveTimerProgress({ current: completion?.current || 0 });
    setActiveTimer({ habitId, date });
    playNotificationSound(soundEnabled, 'start');
  }, [activeTimer, habits, handleUpdateHabitCompletion, liveTimerProgress, soundEnabled]);

  // Delete Habit
  const deleteHabit = useCallback(async (habitId: string) => {
    if (!habitOwner) return;

    try {
      await deleteHabitById(Number(habitId), habitOwner);
      setHabits((prev) => prev.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit from Supabase:', error);
      setReminderToast({
        title: 'Sync error',
        message: 'Habitni Supabase dan o‘chirib bo‘lmadi. Iltimos qayta urinib ko‘ring.',
      });
    }
  }, [habitOwner]);

  // Update Profile
  const updateProfileState = useCallback((updates: Partial<UserProfile>) => {
    if (!isSignedIn || !user?.id) return;
    const nextOverrides: ProfileOverrides = {
      name: updates.name ?? profileOverrides.name,
      email: updates.email ?? profileOverrides.email,
      bio: updates.bio ?? profileOverrides.bio,
    };
    setProfileOverrides(nextOverrides);
    setLocalStorage(`profile_${user.id}`, nextOverrides);
  }, [isSignedIn, profileOverrides, user]);
  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const openAddHabit = useCallback(() => setShowAddHabit(true), []);
  const closeAddHabit = useCallback(() => setShowAddHabit(false), []);
  const openProfilePage = useCallback(() => setCurrentPage('profile'), []);
  const closeResetNotice = useCallback(() => setResetNotice(null), []);
  const closeReminderToast = useCallback(() => setReminderToast(null), []);
  const closeCelebrationToast = useCallback(() => setCelebrationToast(null), []);
  const handleSoundToggle = useCallback(() => {
    setSoundEnabled((prev) => {
      const nextValue = !prev;
      if (!nextValue) {
        setReminderToast(null);
      }
      return nextValue;
    });
  }, []);

  const todayDateKey = getTodayDate();
  const todayMetrics = useMemo(
    () => calculateMetricsForHabits(habits, todayDateKey),
    [habits, todayDateKey]
  );
  const userProfile = useMemo<UserProfile | null>(() => {
    if (!user) {
      return null;
    }

    const baseName = user.name || 'User';
    const displayName = profileOverrides.name ?? baseName;
    const displayEmail = profileOverrides.email ?? (user.email ?? '');

    return {
      id: user.id,
      name: displayName,
      email: displayEmail,
      avatar: getInitials(displayName),
      avatarUrl: user.avatarUrl || undefined,
      bio: profileOverrides.bio ?? 'Building better habits daily!',
      joinDate: user.createdAt || getTodayDate(),
    };
  }, [profileOverrides, user]);

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <AuthPage theme={theme} language={language} onLogin={handleLogin} authError={authError} />;
  }

  return (
    <div className={`relative flex h-[100dvh] ${themeConfig.bg} ${themeConfig.text} overflow-hidden aurora-panel premium-shell`}>
      <div className="mesh-grid opacity-60" />
      <div className={`pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full blur-3xl orbital-halo ${theme === 'dark' ? 'bg-amber-500/12' : 'bg-amber-200/45'}`} />
      <div className={`pointer-events-none absolute right-0 top-16 h-80 w-80 rounded-full blur-3xl orbital-halo-reverse ${theme === 'dark' ? 'bg-sky-500/12' : 'bg-sky-200/50'}`} />
      <div className="comet-trail top-10 left-[12%] hidden xl:block" />
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[linear-gradient(135deg,rgba(15,23,42,0.52),rgba(15,23,42,0.26))] backdrop-blur-[6px] md:hidden"
            onClick={closeMobileSidebar}
          />
          <MemoSidebar
            isOpen
            variant="mobile"
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
            user={userProfile!}
            habitsCount={habits.length}
            theme={theme}
            onThemeChange={handleThemeChange}
            language={language}
            onLanguageChange={handleLanguageChange}
            onClose={closeMobileSidebar}
          />
        </>
      )}

      {/* Sidebar */}
      <MemoSidebar
        isOpen={sidebarOpen}
        variant="desktop"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        user={userProfile!}
        habitsCount={habits.length}
        theme={theme}
        onThemeChange={handleThemeChange}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-auto overflow-x-hidden">
        {!mobileSidebarOpen && (
          <MemoHeader
            user={userProfile!}
            onMenuClick={openMobileSidebar}
            onProfileClick={openProfilePage}
            metrics={todayMetrics}
            theme={theme}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            language={language}
          />
        )}

        {resetNotice && (
          <div className="px-6 md:px-8 pt-4">
            <div className={`${themeConfig.card} spotlight-card section-reveal rounded-[24px] p-4 border ${themeConfig.border} shadow-lg flex items-start justify-between gap-4 prism-surface premium-shell`}>
              <div className="min-w-0">
                <p className={`${themeConfig.text} font-semibold`}>{text.monthlyResetTitle}</p>
                <p className={`${themeConfig.textSecondary} text-sm break-words`}>{resetNotice}</p>
              </div>
              <button
                onClick={closeResetNotice}
                className={`icon-button-soft p-2 rounded-lg transition ${themeConfig.hover}`}
                aria-label={text.closeNotice}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className={`relative w-full rounded-[32px] p-4 sm:p-5 md:p-8 max-w-7xl mx-auto section-reveal aurora-panel premium-shell edge-glow glass-lux border ${theme === 'dark' ? 'border-white/6' : 'border-white/70'} ${themeConfig.bgSecondary}`}>
          <div className="mesh-grid opacity-40" />
          <div className={`pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-200/50'
          } orbital-halo`} />
          <div className={`pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-sky-500/10' : 'bg-sky-200/50'
          } orbital-halo-reverse`} />
          <div className="comet-trail top-16 right-[14%] hidden lg:block" />
          <div className="relative">
          {currentPage === 'dashboard' && (
            <MemoDashboardPage
              habits={habits}
              selectedDate={todayDateKey}
              metrics={todayMetrics}
              onToggleHabitTimer={handleToggleHabitTimer}
              onAddHabit={openAddHabit}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
              locale={locale}
              isMounted={isMounted}
              isMobile={isMobile}
              activeTimer={activeTimer}
              liveTimerProgress={liveTimerProgress}
            />
          )}

          {currentPage === 'habits' && (
            <MemoHabitsPage
              habits={habits}
              selectedDate={todayDateKey}
              onAddHabit={openAddHabit}
              onDeleteHabit={deleteHabit}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
            />
          )}

          {currentPage === 'calendar' && (
            <MemoCalendarPage
              habits={habits}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
              theme={theme}
              themeConfig={themeConfig}
              minMonth={minMonth}
              language={language}
              locale={locale}
            />
          )}

          {currentPage === 'stats' && (
            <MemoStatsPage
              habits={habits}
              metrics={todayMetrics}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
              locale={locale}
              isMounted={isMounted}
              isMobile={isMobile}
            />
          )}

          {currentPage === 'profile' && (
            <MemoProfilePage
              user={userProfile!}
              habits={habits}
              onUpdate={updateProfileState}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
              locale={locale}
              isMobile={isMobile}
            />
          )}
          </div>
        </div>
      </main>

      {/* Add Habit Modal */}
      {showAddHabit && (
          <AddHabitModal
            habit={newHabit}
            onChange={setNewHabit}
            onAdd={handleAddHabit}
            onClose={closeAddHabit}
          theme={theme}
          themeConfig={themeConfig}
          language={language}
        />
      )}

      {reminderToast && (
        <ReminderToast
          themeConfig={themeConfig}
          title={reminderToast.title}
          message={reminderToast.message}
            onClose={closeReminderToast}
        />
      )}

      {celebrationToast && (
        <CelebrationToast
          key={celebrationBurst}
          theme={theme}
          themeConfig={themeConfig}
          title={celebrationToast.title}
          message={celebrationToast.message}
            onClose={closeCelebrationToast}
        />
      )}
    </div>
  );
}

// Auth Page Component
function AuthPage({
  theme,
  language,
  onLogin,
  authError,
}: {
  theme: Theme;
  language: Language;
  onLogin: (provider: AuthProvider, email: string, password: string) => void;
  authError: string | null;
}) {
  const text = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const authCopy = language === 'uz'
    ? {
        badge: 'KIRISH',
        socialLabel: 'Quyidagilar orqali davom eting',
        microsoftLabel: 'Microsoft orqali davom etish',
        featureTitle: 'Kunlik tartib',
        featureDescription: "Odatlaringizni sodda, tez va chiroyli boshqaruv paneli orqali kuzating.",
        highlights: [
          'Tez boshlash va pauza boshqaruvi',
          "Kunlik bajarilish ko'rsatkichi",
          "Mobil va kompyuter uchun mos dizayn",
        ],
      }
    : language === 'ru'
    ? {
        badge: 'ВХОД',
        socialLabel: 'Create account with',
        microsoftLabel: 'Create account with Microsoft',
        featureTitle: 'Daily clarity',
        featureDescription: 'Track habits with a calmer, cleaner workflow and a focused dashboard.',
        highlights: [
          'Clean progress tracking',
          'Fast start and pause controls',
          'Responsive mobile-friendly layout',
        ],
      }
    : {
        badge: 'SIGN IN',
        socialLabel: 'Create account with',
        microsoftLabel: 'Create account with Microsoft',
        featureTitle: 'Daily clarity',
        featureDescription: 'Track habits with a calmer, cleaner workflow and a focused dashboard.',
        highlights: [
          'Clean progress tracking',
          'Fast start and pause controls',
          'Responsive mobile-friendly layout',
        ],
      };

  const handleProvider = (provider: AuthProvider) => {
    onLogin(provider, email, password);
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[linear-gradient(135deg,#fff8ec_0%,#fffdf7_48%,#f0fbff_100%)] text-slate-900'} flex items-center justify-center p-4 sm:p-6`}>
      <div className="mesh-grid opacity-50" />
      <div className={`pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-200/80'}`} />
      <div className={`pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl float-gentle ${theme === 'dark' ? 'bg-sky-500/15' : 'bg-sky-200/70'}`} />
      <div className={`pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full blur-3xl float-gentle ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-200/70'}`} />
      <div className="comet-trail left-[8%] top-16 hidden xl:block" />

      <div className="relative w-full max-w-5xl section-reveal">
        <div className={`${theme === 'dark' ? 'bg-slate-900/72 border-slate-800' : 'bg-white/88 border-amber-100'} spotlight-card glow-pulse aurora-panel prism-surface premium-shell edge-glow rounded-[32px] border shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] overflow-hidden backdrop-blur-xl`}>
          <div className="ambient-specks opacity-40" />
          <div className="grid gap-0 md:grid-cols-[1.25fr_1fr]">
              <div className="relative p-6 md:p-8 section-reveal section-delay-1">
                <div className="ambient-specks opacity-30" />
              <div className="flex items-center gap-3 mb-6 md:mb-7">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-[0.32em] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Habitify</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Small habits. Big momentum.</p>
                </div>
              </div>

              <div className={`chip-hover inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] ${theme === 'dark' ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {authCopy.badge}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>
                {text.signInTitle}
              </h1>
              <p className={`mt-2.5 max-w-xl text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{text.signInSubtitle}</p>

              <div className="mt-6 grid gap-3.5">
                <div>
                  <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{text.emailLabel}</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={text.emailPlaceholder}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-amber-400 transition`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{text.passwordLabel}</label>
                  <div className="relative">
                    <LockKeyhole className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={text.passwordPlaceholder}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-2xl ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-amber-400 transition`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3.5">
                <button
                  onClick={() => handleProvider('email')}
                  className="gradient-action w-full rounded-2xl px-4 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white font-semibold tracking-wide shadow-lg shadow-orange-500/20 hover:from-amber-300 hover:to-sky-400 transition"
                >
                  {text.continueWithEmail}
                </button>
                {authError && (
                  <div className={`text-xs px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                    {authError}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`h-px flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <p className={`text-[11px] uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                    {authCopy.socialLabel}
                  </p>
                  <div className={`h-px flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleProvider('google')}
                    className={`ghost-action hover-lift w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border ${theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-amber-50'} transition shadow-sm`}
                  >
                    <Chrome className="w-4 h-4" />
                    <span className="text-xs">{text.continueWithGoogle}</span>
                  </button>
                  <button
                    onClick={() => handleProvider('apple')}
                    className={`ghost-action hover-lift w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border ${theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-amber-50'} transition shadow-sm`}
                  >
                    <Apple className="w-4 h-4" />
                    <span className="text-xs">{text.continueWithApple}</span>
                  </button>
                  <button
                    onClick={() => handleProvider('microsoft')}
                    className={`ghost-action hover-lift w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border ${theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-amber-50'} transition shadow-sm`}
                  >
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>M</span>
                    <span className="text-xs">{authCopy.microsoftLabel}</span>
                  </button>
                </div>
              </div>
            </div>

              <div className={`relative hidden md:flex flex-col p-7 lg:p-8 section-reveal section-delay-2 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-[linear-gradient(160deg,#fff3d6_0%,#ffffff_45%,#eaf9ff_100%)]'}`}>
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_55%)]' : 'bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.24),_transparent_55%)]'}`} />
                <div className="ambient-specks opacity-40" />
                <div className="relative">
                  <div className={`chip-hover inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em] ${theme === 'dark' ? 'bg-slate-800 text-amber-200 border border-slate-700' : 'bg-white/80 text-amber-700 border border-amber-100 shadow-sm'}`}>
                    HABIT FLOW
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold" style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>{authCopy.featureTitle}</h2>
                  <p className={`mt-2.5 text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {authCopy.featureDescription}
                  </p>
                </div>
                <div className={`relative mt-5 overflow-hidden rounded-[26px] border p-4 prism-surface ${
                  theme === 'dark' ? 'border-slate-700 bg-slate-950/35' : 'border-white/80 bg-white/85'
                }`}>
                  <div className={`pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl ${theme === 'dark' ? 'bg-amber-500/18' : 'bg-amber-200/70'} ring-pulse`} />
                  <p className={`text-[11px] uppercase tracking-[0.18em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Focus snapshot</p>
                  <div className="mt-2.5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[2.5rem] font-bold leading-none">87%</p>
                      <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Clean progress rhythm</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      theme === 'dark' ? 'bg-amber-500/12 text-amber-200' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                <div className="relative mt-5 grid grid-cols-3 gap-2.5">
                  {[
                    { label: text.habitsCompleted, value: '12' },
                    { label: text.currentStreak, value: '5' },
                    { label: text.bestStreakLabel, value: '18' },
                  ].map((item) => (
                    <div key={item.label} className={`${theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-white/75 border-white/70 shadow-sm'} rounded-[22px] border p-3.5 prism-surface hover-lift`}>
                      <p className={`text-[11px] leading-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                      <p className="mt-1 text-2xl font-bold leading-none">{item.value}</p>
                    </div>
                  ))}
                </div>

              <div className={`relative mt-4 rounded-[26px] p-4 prism-surface hover-lift ${theme === 'dark' ? 'bg-slate-800/70 border border-slate-700' : 'bg-white/80 border border-white shadow-sm'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Why Habitify</p>
                    <p className={`mt-2 text-sm leading-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Cleaner structure, faster flow, better focus.</p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-500 to-sky-500" />
                </div>
                <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                  {authCopy.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({
  isOpen,
  currentPage,
  onPageChange,
  onLogout,
  user,
  habitsCount,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  variant = 'desktop',
  onClose,
}: {
  isOpen: boolean;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
  user: UserProfile;
  habitsCount: number;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  variant?: 'desktop' | 'mobile';
  onClose?: () => void;
}) {
  const themeConfig = themes[theme];
  const text = translations[language];
  const isMobile = variant === 'mobile';
  const showLabels = isMobile ? true : isOpen;
  const widthClass = isMobile ? 'w-[min(22rem,calc(100vw-1.5rem))]' : isOpen ? 'w-64' : 'w-20';
  const containerClass = `${
    isMobile
      ? 'flex md:hidden fixed inset-y-3 left-3 z-50 rounded-[32px] border shadow-[0_30px_70px_-30px_rgba(15,23,42,0.6)]'
      : 'hidden md:flex'
  } ${widthClass} ${theme === 'dark' ? 'bg-slate-800/88 border-slate-700' : 'bg-white/96 shadow-xl border-slate-200'} spotlight-card section-reveal backdrop-blur-xl aurora-panel prism-surface premium-shell edge-glow ${isMobile ? '' : 'border-r'} transition-all duration-300 flex flex-col overflow-y-auto`;
  const menuItems: { id: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: text.dashboard, icon: Home },
    { id: 'habits', label: text.habits, icon: ListTodo },
    { id: 'calendar', label: text.calendar, icon: Calendar },
    { id: 'stats', label: text.statistics, icon: BarChart3 },
    { id: 'profile', label: text.profile, icon: User },
  ];
  const handlePageChange = (page: Page) => {
    onPageChange(page);
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={containerClass}
    >
      <div className={`pointer-events-none absolute inset-0 ${
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_34%)]'
          : 'bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_34%)]'
      }`} />
      {/* Logo */}
      <div className={`relative p-6 border-b ${themeConfig.border}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 via-orange-500 to-sky-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_18px_35px_-18px_rgba(249,115,22,0.8)] ring-1 ring-white/20">
              <Check className="w-6 h-6 text-white" />
            </div>
            {showLabels && (
              <div>
                <h1 className={`text-xl font-bold ${themeConfig.text}`} style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>Habitify</h1>
                <p className={`text-[11px] uppercase tracking-[0.22em] ${themeConfig.textSecondary}`}>Focus system</p>
              </div>
            )}
          </div>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className={`icon-button-soft p-2 rounded-lg transition ${themeConfig.hover}`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="relative flex-1 p-4 space-y-2.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePageChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[20px] border hover-lift transition ${
              currentPage === item.id
                ? 'border-white/0 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white shadow-[0_22px_40px_-24px_rgba(249,115,22,0.85)]'
                : `${theme === 'dark' ? 'border-slate-700/70 bg-slate-900/35' : 'border-white/80 bg-white/60'} ${themeConfig.textSecondary} ${themeConfig.hover} glass-lux`
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {showLabels && <span className="text-sm font-medium">{item.label}</span>}
            {showLabels && item.id === 'habits' && habitsCount > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {habitsCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className={`relative p-4 border-t ${themeConfig.border}`}>
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className={`ghost-action hover-lift w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[20px] border transition ${
            theme === 'dark' 
              ? 'border-slate-700 bg-slate-900/45 text-amber-300 hover:bg-slate-800/90' 
              : 'border-white/80 bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          {showLabels && <span className="text-xs font-medium">{theme === 'dark' ? text.light : text.dark}</span>}
        </button>
      </div>

      {/* Language Toggle */}
      <div className={`relative p-4 border-t ${themeConfig.border}`}>
        {showLabels && <p className={`text-xs ${themeConfig.textSecondary} mb-2`}>{text.languageLabel}</p>}
        <div className={`flex rounded-[20px] border p-1 ${theme === 'dark' ? 'border-slate-700 bg-slate-900/45' : 'border-white/80 bg-white/70'} ${showLabels ? 'gap-1' : 'flex-col gap-1 items-center'}`}>
          {(['en', 'ru', 'uz'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`chip-hover px-3 py-1.5 rounded-2xl text-xs font-medium transition ${
                language === lang
                  ? theme === 'dark'
                    ? 'border border-amber-400/25 bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(56,189,248,0.18))] text-slate-50 shadow-[0_14px_28px_-20px_rgba(56,189,248,0.45)]'
                    : 'border border-amber-200 bg-[linear-gradient(135deg,#fff0c7,#edf7ff)] text-slate-800 shadow-[0_14px_28px_-20px_rgba(245,158,11,0.28)]'
                  : `${themeConfig.textSecondary} ${themeConfig.hover}`
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className={`relative p-4 border-t ${themeConfig.border} space-y-4`}>
        <div className={`rounded-[24px] border p-3 glass-lux hover-lift ${theme === 'dark' ? 'border-slate-700 bg-slate-900/45' : 'border-white/80 bg-white/68'}`}>
          <div className={`flex items-center gap-3 ${!showLabels && 'justify-center'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-300 via-orange-400 to-sky-500 rounded-full flex items-center justify-center text-base font-semibold shadow-lg overflow-hidden ring-2 ring-orange-300/40 shrink-0">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={40}
                height={40}
                sizes="40px"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="leading-none">{user.avatar}</span>
            )}
          </div>
          {showLabels && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${themeConfig.text} truncate`}>{user.name}</p>
              <p className={`text-xs ${themeConfig.textSecondary} truncate`}>{user.email}</p>
            </div>
          )}
          </div>
        </div>

        <button
          onClick={() => {
            onLogout();
            if (onClose) {
              onClose();
            }
          }}
          className="ghost-action hover-lift w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[20px] border border-red-500/15 transition text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {showLabels && text.logout}
        </button>
      </div>
    </aside>
  );
}

// Header Component
function Header({
  user,
  onMenuClick,
  onProfileClick,
  metrics,
  theme,
  soundEnabled,
  onSoundToggle,
  language,
}: {
  user: UserProfile;
  onMenuClick: () => void;
  onProfileClick: () => void;
  metrics: Metrics;
  theme: Theme;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  language: Language;
}) {
  const themeConfig = themes[theme];
  const text = translations[language];
  const completionRatio = metrics.todayProgress;
  const locale = getLocale(language);
  const headerDateLabel = new Date().toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const headerPills = [
    headerDateLabel,
    `${metrics.currentStreak} ${text.days}`,
    `${completionRatio}% ${text.complete.toLowerCase()}`,
  ];

  return (
    <header className="sticky top-0 z-50 px-2.5 pt-2.5 sm:px-4 sm:pt-4">
      <div
        className={`mx-auto max-w-7xl rounded-[24px] border px-2.5 py-2.5 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition sm:rounded-[28px] sm:px-5 sm:py-4 ${
          theme === 'dark'
            ? 'border-slate-700/80 bg-slate-900/72'
            : 'border-white/80 bg-white/82 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.22)]'
        } section-reveal spotlight-card aurora-panel prism-surface premium-shell edge-glow`}
      >
        <div className="ambient-specks opacity-40" />
        <div className="flex items-center justify-between gap-2.5 md:gap-4">
          <button
            onClick={onMenuClick}
            className={`icon-button-soft md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border transition sm:h-11 sm:w-11 sm:rounded-2xl ${themeConfig.hover} ${
              theme === 'dark' ? 'border-slate-700 bg-slate-800/85 text-slate-100' : 'border-slate-200 bg-white/90 text-slate-700'
            }`}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
            <div className="min-w-0 flex-1 md:max-w-[420px]">
              <h2 className={`truncate text-base font-bold leading-tight lg:text-[1.8rem] ${themeConfig.text}`}>
                {getGreeting(language)}, {user.name}!
              </h2>
              <p className={`${themeConfig.textSecondary} mt-1 text-sm`}>
                {metrics.completedToday} / {metrics.totalHabits} {text.habitsCompletedToday}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {headerPills.map((pill, index) => (
                  <span
                    key={pill}
                    className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      index === 1
                        ? theme === 'dark'
                          ? 'bg-amber-500/12 text-amber-200'
                          : 'bg-amber-50 text-amber-700'
                        : index === 2
                        ? theme === 'dark'
                        ? 'bg-amber-500/12 text-amber-200'
                        : 'bg-amber-50 text-amber-700'
                        : theme === 'dark'
                        ? 'bg-slate-800/90 text-slate-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:flex-nowrap">
            <div
              className={`hidden min-w-[260px] items-center gap-4 rounded-[24px] border px-4 py-3 md:flex prism-surface hover-lift ghost-action ${
                theme === 'dark' ? 'border-slate-700 bg-slate-800/75' : 'border-slate-200 bg-white/92'
              }`}
            >
              <div className="min-w-[92px]">
                <p className={`text-[10px] uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{text.todaysProgress}</p>
                <p className={`mt-1 text-sm font-semibold ${themeConfig.text}`}>{completionRatio}%</p>
                <p className={`mt-1 text-[11px] ${themeConfig.textSecondary}`}>{metrics.completedToday}/{metrics.totalHabits}</p>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className={`soft-progress h-2 w-full overflow-hidden rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div
                    className="soft-progress-fill h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 transition-all duration-500"
                    style={{ width: `${completionRatio}%` }}
                  />
                </div>
                <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  theme === 'dark' ? 'bg-slate-900/80 text-slate-100' : 'bg-slate-100 text-slate-700'
                }`}>
                  <div className={`absolute inset-1 rounded-[14px] ${theme === 'dark' ? 'bg-amber-500/12' : 'bg-amber-100'} ring-pulse`} />
                  <Sparkles className="relative h-4 w-4" />
                </div>
              </div>
            </div>

            <button
              onClick={onSoundToggle}
              aria-pressed={soundEnabled}
              className={`icon-button-soft relative flex h-10 w-10 items-center justify-center rounded-2xl border transition hover-lift sm:h-11 sm:w-11 ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-700'
                  : 'border-slate-200 bg-white/92 text-slate-700 hover:bg-slate-50'
              }`}
              title={soundEnabled ? text.soundOn : text.soundOff}
            >
              <Bell className="h-5 w-5" />
              {metrics.completedToday > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]" />
              )}
              {!soundEnabled && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-[2px] w-6 rotate-45 bg-red-500" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onProfileClick}
              className={`ghost-action flex items-center gap-2 rounded-[18px] border p-1 transition hover-lift md:min-w-[210px] md:justify-between sm:gap-3 sm:rounded-2xl sm:px-2 sm:py-1.5 ${
                theme === 'dark' ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white/92'
              }`}
              aria-label={text.profile}
            >
              <div className="hidden text-right sm:block">
                <p className={`max-w-[132px] truncate text-sm font-semibold ${themeConfig.text}`}>{user.name}</p>
                <p className={`text-[11px] ${themeConfig.textSecondary}`}>{text.profile}</p>
              </div>
              <div className="h-9 w-9 overflow-hidden rounded-[18px] bg-gradient-to-br from-amber-300 via-orange-400 to-sky-500 text-sm font-semibold text-white shadow-lg ring-2 ring-orange-300/40 float-gentle sm:h-10 sm:w-10 sm:rounded-2xl">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={40}
                    height={40}
                    sizes="40px"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="leading-none">{user.avatar}</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="mt-2.5 md:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div
              className={`ghost-action inline-flex max-w-[58vw] shrink-0 items-center gap-2 rounded-[18px] border px-3 py-2 prism-surface ${
                theme === 'dark' ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white/90'
              }`}
            >
              <span className={`truncate text-sm font-semibold ${themeConfig.text}`}>
                {getGreeting(language)}, {user.name}!
              </span>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme === 'dark' ? 'bg-amber-300' : 'bg-amber-500'}`} />
              <span className={`shrink-0 text-[11px] font-medium ${themeConfig.textSecondary}`}>
                {metrics.completedToday}/{metrics.totalHabits}
              </span>
            </div>

            {headerPills.slice(0, 2).map((pill, index) => (
              <span
                key={pill}
                className={`chip-hover shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  index === 1
                    ? theme === 'dark'
                      ? 'bg-amber-500/12 text-amber-200'
                      : 'bg-amber-50 text-amber-700'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {pill}
              </span>
            ))}

            <div
              className={`chip-hover inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 ${
                theme === 'dark' ? 'bg-amber-500/14 text-amber-200' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <span className="text-[11px] font-semibold">
                {completionRatio}% {text.complete.toLowerCase()}
              </span>
              <div className={`soft-progress h-1.5 w-16 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className="soft-progress-fill h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 transition-all duration-500"
                  style={{ width: `${completionRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Dashboard Page
function DashboardPage({
  habits,
  selectedDate,
  metrics,
  onToggleHabitTimer,
  onAddHabit,
  theme,
  themeConfig,
  language,
  locale,
  isMounted,
  isMobile,
  activeTimer,
  liveTimerProgress,
}: {
  habits: Habit[];
  selectedDate: string;
  metrics: Metrics;
  onToggleHabitTimer: (habitId: string, date: string) => void;
  onAddHabit: () => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
  locale: string;
  isMounted: boolean;
  isMobile: boolean;
  activeTimer: ActiveTimer | null;
  liveTimerProgress: LiveTimerProgress | null;
}) {
  const weekDates = getWeekDates(getWeekStartIndex());
  const text = translations[language];
  const selectedDateLabel = formatDate(selectedDate, locale);
  const hasActiveTimer = Boolean(activeTimer);
  const showDesktopExtras = !isMobile;
  const dashboardCopy = language === 'uz'
    ? {
        badge: 'Habitify ritmi',
        summary: "Bugungi ko'rsatkich {progress}% ga yetdi, joriy seriya esa {streak} kunni tashkil etmoqda.",
        timerActive: 'Hozir bitta faol taymer ishlayapti.',
        timerIdle: 'Hozircha hech bir taymer ishga tushmagan.',
        bestPulse: 'Eng yaxshi seriya',
      }
    : language === 'ru'
    ? {
        badge: 'Ритм Habitify',
        summary: 'Сегодня прогресс дошел до {progress}%, а серия держится уже {streak} дн.',
        timerActive: 'Сейчас запущен активный таймер.',
        timerIdle: 'Сейчас ни один таймер не запущен.',
        bestPulse: 'Лучшая серия',
      }
    : {
        badge: 'Habitify Flow',
        summary: 'Today is running at {progress}% progress with a {streak}-day streak in motion.',
        timerActive: 'There is an active timer running right now.',
        timerIdle: 'No timer is running right now.',
        bestPulse: 'Best streak',
      };
  const dashboardSummary = dashboardCopy.summary
    .replace('{progress}', String(metrics.todayProgress))
    .replace('{streak}', String(metrics.currentStreak));
  const weekSnapshot = useMemo(() => {
    const snapshotDates = [-1, 0, 1].map((offset) => {
      const baseDate = parseLocalDate(getTodayDate());
      baseDate.setDate(baseDate.getDate() + offset);
      return formatLocalDate(baseDate);
    });

    return snapshotDates.map((date) => {
      const activeHabits = habits.filter((habit) => !habit.createdAt || habit.createdAt <= date);
      const progress = activeHabits.reduce((sum, habit) => {
        const completion = habit.completions.find((entry) => entry.date === date);
        return sum + getHabitProgressRatio(habit, completion);
      }, 0);

      return {
        date,
        label: parseLocalDate(date).toLocaleDateString(locale, { weekday: 'short' }),
        progress: Math.round((progress / Math.max(activeHabits.length, 1)) * 100),
        isSelected: date === selectedDate,
      };
    });
  }, [habits, locale, selectedDate]);

  return (
    <div className="space-y-8">
      <section className={`relative overflow-hidden rounded-[32px] border ${themeConfig.border} ${themeConfig.card} spotlight-card glow-pulse section-reveal aurora-panel prism-surface p-5 shadow-lg sm:p-6 lg:p-8`}>
        <div className="mesh-grid opacity-40" />
        <div className="ambient-specks opacity-40" />
        <div className={`pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full blur-3xl orbital-halo ${theme === 'dark' ? 'bg-fuchsia-500/12' : 'bg-fuchsia-200/50'}`} />
        <div className={`pointer-events-none absolute left-8 bottom-6 h-28 w-28 rounded-full blur-3xl orbital-halo-reverse ${theme === 'dark' ? 'bg-amber-500/14' : 'bg-amber-200/50'}`} />
        <div className="comet-trail left-[14%] top-12 hidden lg:block" />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-1/2 ${
          theme === 'dark'
            ? 'bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_58%)]'
            : 'bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_60%)]'
        }`} />
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 ${
          theme === 'dark'
            ? 'bg-[radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.14),_transparent_55%)]'
            : 'bg-[radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.12),_transparent_58%)]'
        }`} />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800/80 text-amber-200'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              {dashboardCopy.badge}
            </div>
            <h3 className={`mt-4 text-3xl font-bold leading-tight ${themeConfig.text}`} style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>
              {text.todaysHabits}
            </h3>
            <p className={`mt-2 text-sm ${themeConfig.textSecondary}`}>{selectedDateLabel}</p>
            <p className={`mt-3 max-w-2xl text-sm leading-6 ${themeConfig.textSecondary}`}>{dashboardSummary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                theme === 'dark' ? 'bg-slate-800/90 text-slate-300' : 'bg-white/85 text-slate-700 border border-slate-200'
              }`}>
                {selectedDateLabel}
              </span>
              <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                hasActiveTimer
                  ? theme === 'dark'
                    ? 'bg-amber-500/12 text-amber-200'
                    : 'bg-amber-50 text-amber-700'
                  : theme === 'dark'
                  ? 'bg-sky-500/12 text-sky-200'
                  : 'bg-sky-50 text-sky-700'
              }`}>
                {hasActiveTimer ? dashboardCopy.timerActive : dashboardCopy.timerIdle}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={`rounded-2xl border px-4 py-3 hover-lift section-reveal section-delay-1 glass-band prism-surface ${
                theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/85'
              }`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{text.todaysProgress}</p>
                <p className={`mt-1 text-xl font-bold ${themeConfig.text}`}>{metrics.todayProgress}%</p>
              </div>
              <div className={`rounded-2xl border px-4 py-3 hover-lift section-reveal section-delay-2 glass-band prism-surface ${
                theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/85'
              }`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{text.currentStreak}</p>
                <p className={`mt-1 text-xl font-bold ${themeConfig.text}`}>{metrics.currentStreak} {text.days}</p>
              </div>
              <div className={`rounded-2xl border px-4 py-3 hover-lift section-reveal section-delay-3 glass-band prism-surface ${
                theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/85'
              }`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{text.totalHabits}</p>
                <p className={`mt-1 text-xl font-bold ${themeConfig.text}`}>{metrics.totalHabits}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md">
              {weekSnapshot.map((item, index) => (
                <div
                  key={item.date}
                    className={`min-w-0 rounded-2xl border px-2.5 py-3 section-reveal hover-lift chip-hover prism-surface ${
                      index % 4 === 0 ? 'section-delay-1' : index % 4 === 1 ? 'section-delay-2' : index % 4 === 2 ? 'section-delay-3' : 'section-delay-4'
                    } ${
                    item.isSelected
                      ? theme === 'dark'
                        ? 'border-amber-400/30 bg-amber-500/10'
                        : 'border-amber-300 bg-amber-50/90'
                      : theme === 'dark'
                      ? 'border-slate-700 bg-slate-900/60'
                      : 'border-white/80 bg-white/80'
                  }`}
                >
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <p className={`max-w-full truncate text-[10px] font-semibold uppercase tracking-[0.12em] ${themeConfig.textSecondary}`}>{item.label}</p>
                    <span className={`text-[11px] font-semibold ${themeConfig.text}`}>{item.progress}%</span>
                  </div>
                  <div className={`soft-progress mt-3 h-1.5 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                      className="soft-progress-fill h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`grid w-full gap-3 rounded-[28px] border p-4 sm:min-w-[360px] section-reveal section-delay-2 spotlight-card aurora-panel prism-surface hover-lift ghost-action ${
            theme === 'dark' ? 'border-slate-700 bg-slate-900/80' : 'border-white/80 bg-white/90'
          }`}>
            <div className="mesh-grid opacity-30" />
            <div className="ambient-specks opacity-40" />
            <div className={`relative overflow-hidden rounded-[24px] border px-4 py-4 hover-lift ${
              theme === 'dark' ? 'border-slate-700 bg-slate-950/35' : 'border-slate-200 bg-white/82'
            }`}>
              <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${theme === 'dark' ? 'bg-amber-500/18' : 'bg-amber-200/70'} ring-pulse`} />
              <p className={`text-[11px] uppercase tracking-[0.2em] ${themeConfig.textSecondary}`}>{text.todaysProgress}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-[2.75rem] font-bold leading-none sm:text-4xl ${themeConfig.text}`}>{metrics.todayProgress}%</p>
                  <p className={`mt-2 text-sm ${themeConfig.textSecondary}`}>{metrics.completedToday}/{metrics.totalHabits} {text.habitsCompleted}</p>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] sm:h-14 sm:w-14 sm:rounded-2xl ${
                  hasActiveTimer
                    ? theme === 'dark'
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-amber-50 text-amber-700'
                    : theme === 'dark'
                    ? 'bg-sky-500/12 text-sky-200'
                    : 'bg-sky-50 text-sky-700'
                }`}>
                  {hasActiveTimer ? <Pause className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                </div>
              </div>
              <div className={`soft-progress mt-4 h-2 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className="soft-progress-fill h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 transition-all duration-500"
                  style={{ width: `${metrics.todayProgress}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className={`text-xs uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{text.habitsCompleted}</p>
                <p className={`mt-1 text-2xl font-bold ${themeConfig.text}`}>{metrics.completedToday}/{metrics.totalHabits}</p>
              </div>
              <button
                onClick={onAddHabit}
                className="gradient-action inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:scale-[1.02] sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                {text.addNewHabit}
              </button>
            </div>
            <div className={`grid grid-cols-3 gap-2`}>
              <div className={`glass-band rounded-2xl px-3 py-3 prism-surface hover-lift ${theme === 'dark' ? 'bg-slate-950/20' : 'bg-white/85'}`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{dashboardCopy.bestPulse}</p>
                <p className={`mt-1 text-lg font-bold ${themeConfig.text}`}>{metrics.bestStreak}</p>
              </div>
              <div className={`glass-band rounded-2xl px-3 py-3 prism-surface hover-lift ${theme === 'dark' ? 'bg-slate-950/20' : 'bg-white/85'}`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{text.complete}</p>
                <p className={`mt-1 text-lg font-bold ${themeConfig.text}`}>{metrics.completedToday}</p>
              </div>
              <div className={`glass-band rounded-2xl px-3 py-3 prism-surface hover-lift ${theme === 'dark' ? 'bg-slate-950/20' : 'bg-white/85'}`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${themeConfig.textSecondary}`}>{text.totalHabits}</p>
                <p className={`mt-1 text-lg font-bold ${themeConfig.text}`}>{metrics.totalHabits}</p>
              </div>
            </div>
            <div className={`rounded-2xl px-4 py-3 ${
              hasActiveTimer
                ? theme === 'dark'
                  ? 'bg-amber-500/10 text-amber-200'
                  : 'bg-amber-50 text-amber-700'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <p className="text-sm font-medium">{hasActiveTimer ? dashboardCopy.timerActive : dashboardCopy.timerIdle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      {showDesktopExtras && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 content-auto">
        {/* Progress Card */}
        <div className={`${themeConfig.card} rounded-[26px] p-6 border ${themeConfig.border} shadow-lg spotlight-card hover-lift section-reveal section-delay-1 prism-surface aurora-panel premium-shell edge-glow`}>
          <div className="ambient-specks opacity-30" />
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className={`${themeConfig.textSecondary} text-sm font-medium`}>{text.todaysProgress}</h3>
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-amber-500/12 text-amber-200' : 'bg-amber-50 text-amber-700'}`}>
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={theme === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(200, 200, 200, 0.3)'}
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient1)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(metrics.todayProgress / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="55%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${themeConfig.text}`}>{metrics.todayProgress}%</p>
                  <p className={`${themeConfig.textSecondary} text-xs`}>{text.complete}</p>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className={`${themeConfig.text} font-semibold text-lg`}>{metrics.completedToday}/{metrics.totalHabits}</p>
              <p className={`${themeConfig.textSecondary} text-sm`}>{text.habitsCompleted}</p>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className={`${theme === 'dark' ? 'bg-orange-500/12 border-orange-500/30' : 'bg-orange-50/80 border-orange-200'} ${themeConfig.card} rounded-[26px] p-6 border shadow-lg spotlight-card hover-lift section-reveal section-delay-2 prism-surface premium-shell`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`${themeConfig.textSecondary} text-sm font-medium mb-2`}>{text.currentStreak}</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>{metrics.currentStreak}</p>
                <p className={`${themeConfig.textSecondary} text-sm`}>{text.days}</p>
              </div>
              <p className={`${themeConfig.textSecondary} text-xs mt-2`}>{text.best}: {metrics.bestStreak} {text.days}</p>
            </div>
            <Flame className={`w-12 h-12 ${theme === 'dark' ? 'text-orange-500/60' : 'text-orange-400/60'}`} />
          </div>
        </div>

        {/* Total Habits Card */}
        <div className={`${theme === 'dark' ? 'bg-sky-500/12 border-sky-500/30' : 'bg-sky-50/85 border-sky-200'} ${themeConfig.card} rounded-[26px] p-6 border shadow-lg spotlight-card hover-lift section-reveal section-delay-3 prism-surface premium-shell`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className={`${themeConfig.textSecondary} text-sm font-medium`}>{text.totalHabits}</p>
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-sky-500/14 text-sky-200' : 'bg-sky-50 text-sky-700'}`}>
              <ListTodo className="h-5 w-5" />
            </div>
          </div>
          <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-sky-300' : 'text-sky-700'}`}>{metrics.totalHabits}</p>
          <p className={`${themeConfig.textSecondary} text-xs mt-2`}>{text.activeHabits}</p>
        </div>

        {/* Add Habit Card */}
        <div className={`${theme === 'dark' ? 'bg-amber-500/12 border-amber-500/30' : 'bg-amber-50/85 border-amber-200'} ${themeConfig.card} rounded-[26px] p-6 border flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition shadow-lg spotlight-card hover-lift section-reveal section-delay-4 prism-surface aurora-panel premium-shell edge-glow`}>
          <button
            onClick={onAddHabit}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-[22px] ${theme === 'dark' ? 'bg-slate-900/55 text-amber-300' : 'bg-white/85 text-amber-600'} shadow-[0_18px_35px_-24px_rgba(249,115,22,0.7)]`}>
              <Plus className="w-8 h-8" />
            </div>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>{text.addNewHabit}</span>
            <span className={`text-xs ${themeConfig.textSecondary}`}>{text.createFirstHabit}</span>
          </button>
        </div>
      </div>
      )}

      {/* Today's Habits */}
      <div className="section-reveal section-delay-2 content-auto">
        <h3 className={`text-2xl font-bold ${themeConfig.text} mb-6`}>{text.todaysHabits}</h3>
        {habits.length === 0 ? (
          <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg spotlight-card aurora-panel`}>
            <div className="mesh-grid opacity-30" />
            <Plus className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
            <p className={`${themeConfig.textSecondary} mb-4`}>{text.noHabitsYet}</p>
            <button
              onClick={onAddHabit}
              className="gradient-action px-6 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white rounded-lg hover:shadow-lg transition"
              >
              {text.createFirstHabit}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit: Habit) => {
              const completion = habit.completions.find(c => c.date === selectedDate);
              return (
                <MemoHabitCard
                  key={`${habit.id}-${selectedDate}`}
                  habit={habit}
                  date={selectedDate}
                  completion={completion}
                  onToggleTimer={onToggleHabitTimer}
                  theme={theme}
                  themeConfig={themeConfig}
                  language={language}
                  isMobile={isMobile}
                  activeTimer={activeTimer}
                  liveTimerProgress={liveTimerProgress}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Week Overview Chart */}
      {showDesktopExtras && habits.length > 0 && (
        <div className={`${themeConfig.card} rounded-[28px] p-6 border ${themeConfig.border} shadow-lg spotlight-card section-reveal section-delay-3 prism-surface aurora-panel premium-shell content-auto`}>
          <div className="ambient-specks opacity-30" />
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className={`${themeConfig.text} font-bold`} style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>{text.thisWeekOverview}</h3>
            <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white/85 text-slate-700 border border-slate-200'}`}>
              7 days
            </span>
          </div>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
              <BarChart
                data={weekDates.map((date: string) => ({
                  day: parseLocalDate(date).toLocaleDateString(locale, { weekday: 'short' }),
                  progress: habits.reduce((sum, habit) => {
                    if (habit.createdAt && habit.createdAt > date) {
                      return sum;
                    }
                    const completion = habit.completions.find((entry) => entry.date === date);
                    return sum + getHabitProgressRatio(habit, completion);
                  }, 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(200, 200, 200, 0.2)'} />
                <XAxis dataKey="day" stroke={theme === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 100, 100, 0.5)'} />
                <YAxis stroke={theme === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 100, 100, 0.5)'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: theme === 'dark' ? '1px solid rgba(100, 116, 139, 0.5)' : '1px solid rgba(200, 200, 200, 0.5)',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#e2e8f0' : '#1f2937',
                  }}
                />
                <Bar
                  dataKey="progress"
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={42}
                  isAnimationActive={!isMobile}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="52%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={isMobile ? 'h-[220px]' : 'h-[300px]'} />
          )}
        </div>
      )}
    </div>
  );
}

// Habits Page
function HabitsPage({
  habits,
  selectedDate,
  onAddHabit,
  onDeleteHabit,
  theme,
  themeConfig,
  language,
}: {
  habits: Habit[];
  selectedDate: string;
  onAddHabit: () => void;
  onDeleteHabit: (habitId: string) => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
}) {
  const text = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredHabits = useMemo(
    () =>
      normalizedQuery
        ? habits.filter((habit) => {
            const name = habit.name.toLowerCase();
            const category = habit.category.toLowerCase();
            const categoryLabel = getCategoryLabel(language, habit.category).toLowerCase();
            return (
              name.includes(normalizedQuery) ||
              category.includes(normalizedQuery) ||
              categoryLabel.includes(normalizedQuery)
            );
          })
        : habits,
    [habits, language, normalizedQuery]
  );
  const visibleCount = filteredHabits.length;
  return (
    <div className="max-w-6xl space-y-6">
      <div className={`relative overflow-hidden rounded-[30px] border ${themeConfig.border} ${themeConfig.card} section-reveal spotlight-card aurora-panel prism-surface premium-shell edge-glow p-5 sm:p-6`}>
        <div className="mesh-grid opacity-30" />
        <div className="ambient-specks opacity-40" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={`chip-hover inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
              theme === 'dark' ? 'bg-slate-800/85 text-amber-200' : 'bg-amber-50 text-amber-700'
            }`}>
              {text.allHabits}
            </div>
            <h2 className={`mt-4 text-3xl font-bold ${themeConfig.text}`} style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>{text.habits}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
               <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                 theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white/85 text-slate-700 border border-slate-200'
               }`}>
                {text.totalHabits}: {habits.length}
              </span>
               <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                 theme === 'dark' ? 'bg-sky-500/12 text-sky-200' : 'bg-sky-50 text-sky-700'
               }`}>
                {text.searchHabits}: {visibleCount}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <label className={`block text-xs mb-2 ${themeConfig.textSecondary}`}>{text.searchHabits}</label>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.searchPlaceholder}
               className={`w-full sm:w-72 px-4 py-3 rounded-2xl ${themeConfig.input} ${themeConfig.text} placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.38)]`}
             />
            </div>
            <button
              onClick={onAddHabit}
              className="gradient-action flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white rounded-2xl hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              {text.newHabit}
            </button>
          </div>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg spotlight-card section-reveal section-delay-1`}>
          <ListTodo className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
          <p className={`${themeConfig.textSecondary} mb-4`}>{text.noHabitsCreated}</p>
          <button
            onClick={onAddHabit}
            className="gradient-action px-6 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white rounded-lg hover:shadow-lg transition"
          >
            {text.createYourFirstHabit}
          </button>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg spotlight-card section-reveal section-delay-1`}>
          <ListTodo className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
          <p className={`${themeConfig.textSecondary} mb-4`}>{text.noHabitsFound}</p>
          <button
            onClick={() => setSearchQuery('')}
            className="gradient-action px-6 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white rounded-lg hover:shadow-lg transition"
          >
            {text.clearSearch}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 content-auto">
          {filteredHabits.map((habit: Habit) => {
            const completion = habit.completions.find(c => c.date === selectedDate);
            const progress = Math.min(((completion?.current || 0) / habit.goal) * 100, 100);
            return (
              <div
                key={habit.id}
                className={`${themeConfig.card} rounded-[26px] p-4 border ${themeConfig.border} hover:border-amber-500/50 transition shadow-lg spotlight-card hover-lift section-reveal prism-surface aurora-panel premium-shell edge-glow`}
              >
                <div className="ambient-specks opacity-30" />
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 ${
                  theme === 'dark'
                    ? 'bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_58%)]'
                    : 'bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_62%)]'
                }`} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${habit.color} text-2xl text-white shadow-lg`}>
                      <span>{habit.icon}</span>
                    </div>
                    <div>
                      <h3 className={`${themeConfig.text} font-semibold`}>{habit.name}</h3>
                      <p className={`${themeConfig.textSecondary} text-xs`}>{text.category}: {getCategoryLabel(language, habit.category)}</p>
                      <p className={`${themeConfig.textSecondary} text-xs`}>
                        {text.goal}: {habit.goal} {getUnitLabel(language, habit.unit)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="icon-button-soft p-2 hover:bg-red-500/20 rounded-xl transition text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className={`soft-progress h-2 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                    <div
                      className={`soft-progress-fill h-full bg-gradient-to-r ${habit.color} transition-all`}
                      style={{
                        width: `${progress}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`${themeConfig.textSecondary} text-xs`}>
                      {formatHabitCurrentValue(habit, completion?.current || 0)} / {formatHabitGoalValue(habit)} {isTimedHabit(habit.unit) ? '' : getUnitLabel(language, habit.unit)}
                    </p>
                    <span className={`chip-hover rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      progress >= 100
                        ? 'bg-sky-500/15 text-sky-500'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${themeConfig.border} flex items-center justify-between text-xs`}>
                    <span className={`chip-hover rounded-full px-2.5 py-1 ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white/90 text-slate-700 border border-slate-200'}`}>
                      {text.streak}: {getStreak(habit)} {text.days}
                    </span>
                    <span className={`chip-hover rounded-full px-2.5 py-1 ${theme === 'dark' ? 'bg-orange-500/12 text-orange-300' : 'bg-orange-50 text-orange-700'}`}>
                      {text.best}: {getBestStreak(habit)} {text.days}
                    </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Calendar Page
function CalendarPage({
  habits,
  currentMonth,
  onMonthChange,
  onDateSelect,
  selectedDate,
  theme,
  themeConfig,
  minMonth,
  language,
  locale,
}: {
  habits: Habit[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: string) => void;
  selectedDate: string;
  theme: Theme;
  themeConfig: ThemeConfig;
  minMonth: Date;
  language: Language;
  locale: string;
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const atMinMonth = year === minMonth.getFullYear() && month === minMonth.getMonth();
  const weekStartIndex = getWeekStartIndex();
  const weekdayLabels = getWeekdayLabels(language);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() - weekStartIndex + 7) % 7;

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDateString = (day: number) => {
    return formatLocalDate(new Date(year, month, day));
  };

  const getCompletionRate = (dateStr: string) => {
    if (habits.length === 0) return 0;
    const activeHabits = habits.filter((habit) => !habit.createdAt || habit.createdAt <= dateStr);
    const progress = activeHabits.reduce((sum, habit) => {
      const completion = habit.completions.find((entry) => entry.date === dateStr);
      return sum + getHabitProgressRatio(habit, completion);
    }, 0);
    return Math.round((progress / Math.max(activeHabits.length, 1)) * 100);
  };

  return (
    <div className="max-w-4xl space-y-6">
        <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg spotlight-card section-reveal prism-surface aurora-panel premium-shell edge-glow`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${themeConfig.text}`}>
            {currentMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!atMinMonth) {
                  onMonthChange(new Date(year, month - 1));
                }
              }}
              disabled={atMinMonth}
                className={`icon-button-soft p-2 rounded-lg transition ${
                  atMinMonth ? 'opacity-40 cursor-not-allowed' : themeConfig.hover
                }`}
            >
              <ChevronLeft className={`w-5 h-5 ${themeConfig.textSecondary}`} />
            </button>
            <button
              onClick={() => onMonthChange(new Date(year, month + 1))}
              className={`icon-button-soft p-2 rounded-lg transition ${themeConfig.hover}`}
            >
              <ChevronRight className={`w-5 h-5 ${themeConfig.textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
          {weekdayLabels.map((day) => (
            <div key={day} className={`text-center ${themeConfig.textSecondary} text-[10px] sm:text-xs font-semibold py-1 sm:py-2`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }

            const dateStr = getDateString(day);
            const completionRate = getCompletionRate(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === getTodayDate();

            return (
              <button
                key={day}
                onClick={() => onDateSelect(dateStr)}
                className={`p-2 sm:p-3 rounded-lg text-center transition relative flex flex-col items-center hover-lift prism-surface ${
                  isSelected
                    ? 'bg-amber-500/30 border border-amber-500/50'
                    : isToday
                    ? theme === 'dark' ? 'bg-sky-500/18 border border-sky-500/30' : 'bg-sky-100 border border-sky-300'
                    : `${themeConfig.bgTertiary} border ${themeConfig.border} ${themeConfig.hover}`
                }`}
              >
                <div className={`${themeConfig.text} font-semibold text-xs sm:text-sm`}>{day}</div>
                {completionRate > 0 && (
                  <>
                    <div className={`hidden sm:block text-xs ${themeConfig.textSecondary} mt-1`}>{completionRate}%</div>
                    <span
                      className={`sm:hidden mt-1 w-1.5 h-1.5 rounded-full ${
                        completionRate === 100 ? 'bg-sky-500' : 'bg-amber-500'
                      }`}
                    />
                  </>
                )}
                {/* {completionRate === 100 && (
                  <div className="text-lg absolute -top-1 -right-1">✓</div>
                )} */}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
        <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg spotlight-card section-reveal section-delay-2 prism-surface aurora-panel premium-shell edge-glow`}>
        <h3 className={`${themeConfig.text} font-bold mb-4`}>
          {parseLocalDate(selectedDate).toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>

        <div className="space-y-3">
          {habits.map((habit: Habit) => {
            const completion = habit.completions.find(c => c.date === selectedDate);
            return (
              <div key={habit.id} className={`${themeConfig.bgTertiary} rounded-lg p-4 hover-lift section-reveal prism-surface ghost-action`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <span className={`${themeConfig.text} font-medium`}>{habit.name}</span>
                  </div>
                  {completion?.completed && <Check className="w-5 h-5 text-sky-500" />}
                </div>
                <div className={`soft-progress h-2 ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'} rounded-full overflow-hidden`}>
                  <div
                    className={`soft-progress-fill h-full bg-gradient-to-r ${habit.color}`}
                    style={{
                      width: `${Math.min(((completion?.current || 0) / habit.goal) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className={`${themeConfig.textSecondary} text-xs mt-2`}>
                  {formatHabitCurrentValue(habit, completion?.current || 0)} / {formatHabitGoalValue(habit)} {isTimedHabit(habit.unit) ? '' : getUnitLabel(language, habit.unit)}
                  {completion?.time && ` · ${completion.time}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Stats Page
function StatsPage({
  habits,
  metrics,
  theme,
  themeConfig,
  language,
  locale,
  isMounted,
  isMobile,
}: {
  habits: Habit[];
  metrics: Metrics;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
  locale: string;
  isMounted: boolean;
  isMobile: boolean;
}) {
  const text = translations[language];
  const chartHeight = isMobile ? 240 : 300;
  const enableChartEffects = !isMobile;
  const monthData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatLocalDate(date);
      const activeHabits = habits.filter((habit) => !habit.createdAt || habit.createdAt <= dateStr);
      const progress = activeHabits.reduce((sum, habit) => {
        const completion = habit.completions.find((entry) => entry.date === dateStr);
        return sum + getHabitProgressRatio(habit, completion);
      }, 0);
      data.push({
        date: date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
        completed: Math.round((progress / Math.max(activeHabits.length, 1)) * 100),
      });
    }
    return data;
  }, [habits, locale]);

  const habitPerformance = useMemo(
    () =>
      habits.map((habit) => {
        const streak = getStreak(habit);
        const bestStreak = getBestStreak(habit);
        const completionRate = Math.round(
          (habit.completions.filter((entry) => entry.completed).length / Math.max(habit.completions.length, 1)) * 100
        );

        return {
          habit,
          streak,
          bestStreak,
          completionRate,
        };
      }),
    [habits]
  );

  const completedCount = habitPerformance.filter(({ streak }) => streak > 0).length;
  const activeCount = habitPerformance.length - completedCount;
  const pieData =
    completedCount + activeCount > 0
      ? [
          { name: text.completed, value: completedCount },
          { name: text.active, value: activeCount },
        ]
      : [{ name: text.completed, value: 1 }];
  const pieGradientA = theme === 'dark'
    ? { start: '#34d399', mid: '#22d3ee', end: '#60a5fa' }
    : { start: '#10b981', mid: '#06b6d4', end: '#3b82f6' };
  const pieGradientB = theme === 'dark'
    ? { start: '#f59e0b', mid: '#fb7185', end: '#ec4899' }
    : { start: '#f97316', mid: '#f43f5e', end: '#ec4899' };
  const averageCompletion = habits.length
    ? Math.round(
        habits.reduce((sum, habit) => {
          const completionRate = Math.round(
            (habit.completions.filter((entry) => entry.completed).length / Math.max(habit.completions.length, 1)) * 100
          );
          return sum + completionRate;
        }, 0) / habits.length
      )
    : 0;

  return (
    <div className="max-w-6xl space-y-8">
      <section className={`relative overflow-hidden rounded-[30px] border ${themeConfig.border} ${themeConfig.card} p-6 shadow-lg section-reveal spotlight-card aurora-panel prism-surface`}>
        <div className="mesh-grid opacity-30" />
        <div className="ambient-specks opacity-40" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className={`chip-hover inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
              theme === 'dark' ? 'bg-slate-800/85 text-sky-300' : 'bg-sky-50 text-sky-700'
            }`}>
              {text.statisticsTitle}
            </div>
            <h2 className={`mt-4 text-3xl font-bold ${themeConfig.text}`}>{text.statisticsTitle}</h2>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${themeConfig.textSecondary}`}>
              {text.completedToday}: {metrics.completedToday}. {text.currentStreak}: {metrics.currentStreak} {text.days}. {text.completion}: {averageCompletion}%.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: text.totalHabits, value: metrics.totalHabits, tone: theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white/90 text-slate-700 border border-slate-200' },
              { label: text.completedToday, value: metrics.completedToday, tone: theme === 'dark' ? 'bg-amber-500/12 text-amber-200' : 'bg-amber-50 text-amber-700' },
              { label: text.currentStreak, value: `${metrics.currentStreak}${text.days}`, tone: theme === 'dark' ? 'bg-amber-500/12 text-amber-200' : 'bg-amber-50 text-amber-700' },
              { label: text.completion, value: `${averageCompletion}%`, tone: theme === 'dark' ? 'bg-sky-500/12 text-sky-200' : 'bg-sky-50 text-sky-700' },
            ].map((stat) => (
              <div key={stat.label} className={`chip-hover hover-lift rounded-2xl px-4 py-3 ${stat.tone}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 content-auto">
        {[
          { label: text.totalHabits, value: metrics.totalHabits, color: 'blue' },
          { label: text.completedToday, value: metrics.completedToday, color: 'green' },
          { label: text.currentStreak, value: `${metrics.currentStreak} ${text.days}`, color: 'orange' },
          { label: text.bestStreakLabel, value: `${metrics.bestStreak} ${text.days}`, color: 'purple' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`${themeConfig.card} rounded-[24px] p-6 border ${themeConfig.border} shadow-lg spotlight-card hover-lift section-reveal prism-surface aurora-panel premium-shell edge-glow`}
          >
            <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{stat.label}</p>
            <p className={`text-3xl font-bold ${themeConfig.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {!isMobile && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 content-auto">
        {/* 30-Day Trend */}
        <div className={`${themeConfig.card} rounded-[24px] p-6 border ${themeConfig.border} shadow-lg spotlight-card hover-lift section-reveal section-delay-1 prism-surface aurora-panel premium-shell edge-glow`}>
          <h3 className={`${themeConfig.text} font-bold mb-6`}>{text.trend30Days}</h3>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={monthData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(200, 200, 200, 0.2)'} />
                <XAxis
                  dataKey="date"
                  stroke={theme === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 100, 100, 0.5)'}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke={theme === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 100, 100, 0.5)'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: theme === 'dark' ? '1px solid rgba(100, 116, 139, 0.5)' : '1px solid rgba(200, 200, 200, 0.5)',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#e2e8f0' : '#1f2937',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  isAnimationActive={enableChartEffects}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={isMobile ? 'h-[240px]' : 'h-[300px]'} />
          )}
        </div>

        {/* Habit Distribution */}
        <div className={`${themeConfig.card} rounded-[24px] p-6 border ${themeConfig.border} shadow-lg spotlight-card hover-lift section-reveal section-delay-2 prism-surface aurora-panel premium-shell edge-glow`}>
          <h3 className={`${themeConfig.text} font-bold mb-6`}>{text.habitDistribution}</h3>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <defs>
                  <linearGradient id="pieGradientA" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={pieGradientA.start} />
                    <stop offset="55%" stopColor={pieGradientA.mid} />
                    <stop offset="100%" stopColor={pieGradientA.end} />
                  </linearGradient>
                  <linearGradient id="pieGradientB" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={pieGradientB.start} />
                    <stop offset="55%" stopColor={pieGradientB.mid} />
                    <stop offset="100%" stopColor={pieGradientB.end} />
                  </linearGradient>
                  <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="10"
                      stdDeviation="10"
                      floodColor={theme === 'dark' ? '#0b1220' : '#cbd5f5'}
                      floodOpacity={theme === 'dark' ? 0.35 : 0.35}
                    />
                  </filter>
                </defs>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={pieData.length > 1 ? 6 : 0}
                  cornerRadius={8}
                  fill="url(#pieGradientA)"
                  stroke={theme === 'dark' ? '#0b0f14' : '#f8f6f1'}
                  strokeWidth={2}
                  filter={enableChartEffects ? 'url(#pieGlow)' : undefined}
                  dataKey="value"
                  isAnimationActive={enableChartEffects}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`slice-${index}`}
                      fill={index === 0 ? 'url(#pieGradientA)' : 'url(#pieGradientB)'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={isMobile ? 'h-[240px]' : 'h-[300px]'} />
          )}
        </div>
      </div>
      )}

      {/* Habit Details */}
      <div className={`${themeConfig.card} rounded-[24px] p-6 border ${themeConfig.border} shadow-lg spotlight-card section-reveal section-delay-3 prism-surface premium-shell edge-glow content-auto`}>
        <h3 className={`${themeConfig.text} font-bold mb-6`}>{text.habitsPerformance}</h3>
        <div className="space-y-4">
          {habitPerformance.map(({ habit, streak, bestStreak, completionRate }) => {
            return (
              <div key={habit.id} className={`flex items-center justify-between p-4 ${themeConfig.bgTertiary} rounded-2xl hover-lift section-reveal prism-surface ghost-action`}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <p className={`${themeConfig.text} font-medium`}>{habit.name}</p>
                    <div className={`flex gap-4 text-xs ${themeConfig.textSecondary}`}>
                      <span>{text.streak}: {streak} {text.days}</span>
                      <span>{text.best}: {bestStreak} {text.days}</span>
                      <span>{text.completion}: {completionRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-500">{completionRate}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Profile Page
function ProfilePage({
  user,
  habits,
  onUpdate,
  theme,
  themeConfig,
  language,
  locale,
  isMobile,
}: {
  user: UserProfile;
  habits: Habit[];
  onUpdate: (user: UserProfile) => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
  locale: string;
  isMobile: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileEditOpen, setIsMobileEditOpen] = useState(false);
  const [editData, setEditData] = useState(user);
  const [todayDate] = useState(() => getTodayDate());
  const text = translations[language];

  useBodyScrollLock(isMobile && isMobileEditOpen);
  const profileBadgeSecondary = language === 'uz' ? "Profil bo'limi" : language === 'ru' ? 'Центр профиля' : 'Profile hub';

  useEffect(() => {
    setEditData(user);
  }, [user]);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
    setIsMobileEditOpen(false);
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
    setIsMobileEditOpen(false);
  };

  const openEditor = () => {
    setEditData(user);
    if (isMobile) {
      setIsMobileEditOpen(true);
    } else {
      setIsEditing(true);
    }
  };

  const showInlineEdit = isEditing && !isMobile;

  const totalCompleted = habits.reduce(
    (sum: number, h: Habit) => sum + h.completions.filter(c => c.completed).length,
    0
  );

  const accountAgeDays = Math.max(
    Math.floor(
      (new Date(`${todayDate}T00:00:00`).getTime() - new Date(`${user.joinDate}T00:00:00`).getTime()) / MS_PER_DAY
    ) + 1,
    1
  );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Card */}
      <div className={`${themeConfig.card} rounded-[30px] p-8 border ${themeConfig.border} shadow-lg spotlight-card glow-pulse section-reveal aurora-panel prism-surface premium-shell edge-glow`}>
        <div className="mesh-grid opacity-25" />
        <div className="ambient-specks opacity-35" />
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            theme === 'dark' ? 'bg-slate-800/90 text-amber-200' : 'bg-amber-50 text-amber-700'
          }`}>
            {text.profile}
          </span>
          <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            theme === 'dark' ? 'bg-sky-500/12 text-sky-200' : 'bg-sky-50 text-sky-700'
          }`}>
            {language === 'uz' ? "Profil bo'limi" : profileBadgeSecondary}
          </span>
        </div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-amber-300 via-orange-400 to-sky-500 rounded-full flex items-center justify-center text-3xl shadow-lg ring-2 ring-orange-300/40 overflow-hidden">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={64}
                  height={64}
                  sizes="64px"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{user.avatar}</span>
              )}
            </div>
            <div
              className={`min-w-0 flex-1 rounded-[24px] border px-4 py-3 glass-lux hover-lift ${
                theme === 'dark' ? 'border-slate-700 bg-slate-900/35' : 'border-white/80 bg-white/70'
              }`}
            >
              {showInlineEdit ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className={`text-2xl font-bold ${themeConfig.text} bg-opacity-50 ${themeConfig.bgTertiary} px-3 py-2 rounded-2xl w-full max-w-full`}
                  />
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className={`text-sm ${themeConfig.text} ${themeConfig.bgTertiary} px-3 py-2 rounded-2xl w-full max-w-full`}
                  />
                </div>
              ) : (
                <h2 className={`text-2xl font-bold ${themeConfig.text} break-words`}>{user.name}</h2>
              )}
              {!showInlineEdit && <p className={`${themeConfig.textSecondary} break-all`}>{user.email}</p>}
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{text.joined} {formatDate(user.joinDate, locale)}</p>
            </div>
          </div>

          {showInlineEdit ? (
            <div className="flex gap-2 sm:ml-4 self-start sm:self-auto">
              <button
                onClick={handleSave}
                className="icon-button-soft p-2 bg-sky-500/15 hover:bg-sky-500/25 text-sky-500 rounded-lg transition"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancel}
                className="icon-button-soft p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openEditor}
              className="icon-button-soft p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg transition self-start sm:self-auto"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className={`block text-sm ${themeConfig.textSecondary} mb-2`}>{text.bio}</label>
          {showInlineEdit ? (
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-amber-400`}
              rows={3}
            />
          ) : (
            <p className={`${themeConfig.text} opacity-90`}>{user.bio}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${themeConfig.card} rounded-[24px] p-6 border ${themeConfig.border} shadow-lg spotlight-card hover-lift section-reveal section-delay-1 prism-surface premium-shell edge-glow`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{text.totalHabits}</p>
          <p className={`text-3xl font-bold ${themeConfig.text}`}>{habits.length}</p>
        </div>
        <div className={`${themeConfig.card} rounded-[24px] p-6 border ${themeConfig.border} shadow-lg spotlight-card hover-lift section-reveal section-delay-2 prism-surface premium-shell edge-glow`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{text.totalCompleted}</p>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}>{totalCompleted}</p>
        </div>
        <div className={`${themeConfig.card} rounded-[24px] p-6 border ${themeConfig.border} shadow-lg spotlight-card hover-lift section-reveal section-delay-3 prism-surface premium-shell edge-glow`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{text.accountAge}</p>
          <p className={`text-3xl font-bold text-amber-500`}>
            {accountAgeDays}
            <span className="text-sm ml-1">{text.days}</span>
          </p>
        </div>
      </div>

      {/* Recent Habits */}
      <div className={`${themeConfig.card} rounded-[28px] p-6 border ${themeConfig.border} shadow-lg spotlight-card section-reveal section-delay-4 aurora-panel prism-surface`}>
        <div className="ambient-specks opacity-35" />
        <h3 className={`${themeConfig.text} font-bold mb-4`}>{text.yourHabits}</h3>
        <div className="space-y-2">
          {habits.length === 0 ? (
            <p className={themeConfig.textSecondary}>{text.noHabitsYetShort}</p>
          ) : (
            habits.map((habit: Habit) => (
              <div key={habit.id} className={`flex items-center justify-between p-3 ${themeConfig.bgTertiary} rounded-2xl hover-lift section-reveal prism-surface ghost-action`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.icon}</span>
                  <span className={themeConfig.text}>{habit.name}</span>
                </div>
                <div className={`text-sm ${themeConfig.textSecondary}`}>
                  {habit.completions.filter(c => c.completed).length} {text.completedCount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isMobile && isMobileEditOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto overscroll-contain bg-[linear-gradient(135deg,rgba(15,23,42,0.62),rgba(15,23,42,0.36))] p-3 backdrop-blur-sm sm:items-center sm:p-4 sm:backdrop-blur-md">
          <div className={`${themeConfig.card} mt-auto w-full max-w-md rounded-[24px] border ${themeConfig.border} p-4 shadow-2xl max-h-[calc(100dvh-0.75rem)] overflow-y-auto overscroll-contain spotlight-card section-reveal aurora-panel prism-surface sm:mt-0 sm:max-h-[90vh] sm:rounded-[28px] sm:p-6`}>
            <div className="ambient-specks opacity-35" />
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${themeConfig.text} text-lg font-bold`}>{text.profile}</h3>
              <button
                onClick={handleCancel}
                className={`icon-button-soft p-2 rounded-lg transition ${themeConfig.hover}`}
                aria-label={text.cancel}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm ${themeConfig.textSecondary} mb-2`}>{text.nameLabel}</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-amber-400`}
                />
              </div>
              <div>
                <label className={`block text-sm ${themeConfig.textSecondary} mb-2`}>{text.emailLabel}</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-amber-400`}
                />
              </div>
              <div>
                <label className={`block text-sm ${themeConfig.textSecondary} mb-2`}>{text.bio}</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-amber-400`}
                  rows={4}
                />
              </div>
            </div>

            <div className={`sticky bottom-0 -mx-4 mt-6 flex gap-3 border-t ${theme === 'dark' ? 'border-slate-700/80 bg-slate-950/95' : 'border-slate-200/80 bg-white/95'} px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0`}>
              <button
                onClick={handleCancel}
                className={`ghost-action flex-1 px-4 py-2 ${themeConfig.bgTertiary} ${themeConfig.textSecondary} rounded-lg hover:opacity-80 transition`}
              >
                {text.cancel}
              </button>
              <button
                onClick={handleSave}
                className="gradient-action flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white rounded-lg hover:shadow-lg transition"
              >
                <Save className="w-4 h-4 inline-block mr-2" />
                {text.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Habit Card Component
function HabitCard({
  habit,
  date,
  completion,
  onToggleTimer,
  theme,
  themeConfig,
  language,
  isMobile,
  activeTimer,
  liveTimerProgress,
}: {
  habit: Habit;
  date: string;
  completion?: HabitCompletion;
  onToggleTimer: (habitId: string, date: string) => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
  isMobile: boolean;
  activeTimer: ActiveTimer | null;
  liveTimerProgress: LiveTimerProgress | null;
}) {
  const isRunning = activeTimer?.habitId === habit.id && activeTimer.date === date;
  const currentValue = isRunning && liveTimerProgress ? liveTimerProgress.current : completion?.current || 0;
  const percentage = Math.min((currentValue / habit.goal) * 100, 100);
  const timerLocked = Boolean(activeTimer && activeTimer.habitId !== habit.id);
  const timedHabit = isTimedHabit(habit.unit);
  const elapsedSeconds = timedHabit ? (currentValue / habit.goal) * getHabitGoalSeconds(habit) : 0;
  const remainingSeconds = timedHabit ? Math.max(getHabitGoalSeconds(habit) - elapsedSeconds, 0) : 0;
  const buttonDisabled = timedHabit ? timerLocked || percentage >= 100 : false;
  const text = translations[language];
  const detailItems = [
    `${formatHabitCurrentValue(habit, currentValue)} / ${formatHabitGoalValue(habit)}${timedHabit ? '' : ` ${getUnitLabel(language, habit.unit)}`}`,
    timedHabit ? `Remaining: ${formatDuration(remainingSeconds)}` : null,
    completion?.time && percentage >= 100 ? completion.time : null,
  ].filter(Boolean) as string[];

  return (
    <div className={`group relative overflow-hidden rounded-[24px] border ${themeConfig.border} ${themeConfig.card} p-4 shadow-lg transition hover:-translate-y-0.5 hover:border-amber-500/30 spotlight-card hover-lift section-reveal prism-surface aurora-panel premium-shell edge-glow content-auto`}>
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 opacity-80 ${
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_58%)]'
          : 'bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.10),_transparent_62%)]'
      }`} />
      <div className="relative flex items-start gap-4 flex-1 w-full">
        {!timedHabit ? (
          <label className={`ghost-action hover-lift mt-1 flex-shrink-0 inline-flex items-center gap-2 ${isMobile ? 'self-start px-2.5 py-2 rounded-2xl' : 'px-3 py-2 rounded-xl'} border ${themeConfig.border} ${themeConfig.bgTertiary} ${themeConfig.text} cursor-pointer whitespace-nowrap shadow-sm`}>
            <input
              type="checkbox"
              checked={percentage >= 100}
              onChange={() => onToggleTimer(habit.id, date)}
              className="h-4 w-4 accent-amber-500"
            />
            <span className={`${isMobile ? 'text-xs font-semibold' : 'text-sm font-medium'}`}>{text.completedCheckbox}</span>
          </label>
        ) : !isMobile ? (
          <button
            onClick={() => onToggleTimer(habit.id, date)}
            disabled={buttonDisabled}
            aria-disabled={buttonDisabled}
            className={`icon-button-soft mt-1 flex-shrink-0 w-12 h-12 rounded-2xl border ${themeConfig.border} flex items-center justify-center transition ${
              percentage >= 100
                ? 'bg-sky-500/20 text-sky-500'
                : isRunning
                ? 'bg-amber-500/20 text-amber-500'
                : `${themeConfig.bgTertiary} ${themeConfig.textSecondary} hover:bg-amber-500/16 hover:text-amber-500 focus-visible:bg-amber-500/16 focus-visible:text-amber-500`
            } ${buttonDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            aria-label={isRunning ? 'Pause habit timer' : 'Start habit timer'}
          >
            {percentage >= 100 ? (
              <Check className="w-6 h-6" />
            ) : isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
        ) : (
          <div className="flex-shrink-0 w-0" aria-hidden="true" />
        )}

        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${habit.color} text-lg text-white shadow-lg`}>
                <span>{habit.icon}</span>
              </div>
              <div className="min-w-0">
                <h4 className={`${themeConfig.text} truncate text-xl font-semibold leading-tight`}>{habit.name}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`chip-hover rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    theme === 'dark' ? 'bg-slate-800/90 text-slate-300' : 'bg-white/85 text-slate-600 border border-slate-200/80'
                  }`}>
                    {text.category}: {getCategoryLabel(language, habit.category)}
                  </span>
                  <span className={`chip-hover rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    theme === 'dark' ? 'bg-slate-800/90 text-slate-300' : 'bg-white/85 text-slate-600 border border-slate-200/80'
                  }`}>
                    {text.goal}: {formatHabitGoalValue(habit)} {timedHabit ? '' : getUnitLabel(language, habit.unit)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {timedHabit && isMobile && (
                <button
                  onClick={() => onToggleTimer(habit.id, date)}
                  disabled={buttonDisabled}
                  aria-disabled={buttonDisabled}
                  className={`icon-button-soft w-10 h-10 rounded-xl border ${themeConfig.border} flex items-center justify-center transition ${
                    percentage >= 100
                      ? 'bg-sky-500/20 text-sky-500'
                    : isRunning
                      ? 'bg-amber-500/20 text-amber-500'
                      : `${themeConfig.bgTertiary} ${themeConfig.textSecondary} hover:bg-amber-500/16 hover:text-amber-500 focus-visible:bg-amber-500/16 focus-visible:text-amber-500`
                  } ${buttonDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  aria-label={isRunning ? 'Pause habit timer' : 'Start habit timer'}
                >
                  {percentage >= 100 ? (
                    <Check className="w-5 h-5" />
                  ) : isRunning ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              )}
              <div className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                percentage >= 100
                  ? 'bg-sky-500/15 text-sky-500'
                  : isRunning
                  ? 'bg-amber-500/15 text-amber-500'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {Math.round(percentage)}%
              </div>
            </div>
          </div>

          <div className={`soft-progress relative h-2.5 w-full overflow-hidden rounded-full ${
            theme === 'dark'
              ? 'bg-[linear-gradient(90deg,rgba(30,41,59,0.92)_0%,rgba(51,65,85,0.7)_100%)]'
              : 'bg-[linear-gradient(90deg,rgba(226,232,240,0.9)_0%,rgba(203,213,225,0.72)_100%)]'
          }`}>
            <div
              className={`soft-progress-fill h-full rounded-full bg-gradient-to-r ${habit.color} shadow-[0_0_18px_rgba(59,130,246,0.18)] transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className={`${themeConfig.textSecondary} mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs`}>
            {detailItems.map((item) => (
              <span
                key={item}
                className={`chip-hover rounded-full px-2.5 py-1 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/85 border border-slate-200/80'}`}
              >
                {item}
              </span>
            ))}
          </div>

          {timerLocked && percentage < 100 && (
            <p className={`${themeConfig.textSecondary} text-[11px] mt-2`}>
              Another habit is running now.
            </p>
          )}

          {!timedHabit && (
            <p className={`${themeConfig.textSecondary} text-[11px] mt-2`}>
              {text.completedCheckbox}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReminderToast({
  themeConfig,
  title,
  message,
  onClose,
}: {
  themeConfig: ThemeConfig;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 sm:w-auto section-reveal">
      <div className={`${themeConfig.card} rounded-2xl border ${themeConfig.border} p-4 sm:p-5 shadow-2xl backdrop-blur-xl max-w-sm spotlight-card`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-sky-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${themeConfig.text}`}>{title}</p>
            <p className={`text-xs sm:text-sm ${themeConfig.textSecondary} mt-1`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`icon-button-soft p-1.5 rounded-lg transition ${themeConfig.hover}`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Image src="/icon.png" alt="Habitify" width={18} height={18} className="rounded-md" />
          <span className={themeConfig.textSecondary}>Habitify</span>
        </div>
      </div>
    </div>
  );
}

function CelebrationToast({
  theme,
  themeConfig,
  title,
  message,
  onClose,
}: {
  theme: Theme;
  themeConfig: ThemeConfig;
  title: string;
  message: string;
  onClose: () => void;
}) {
  const particles = Array.from({ length: 10 }, (_, index) => index);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:justify-end sm:items-end sm:pt-0 sm:pb-8">
      <div className="relative pointer-events-auto w-full max-w-sm">
        {particles.map((particle) => (
          <span
            key={particle}
            className={`absolute h-2.5 w-2.5 rounded-full ${
              particle % 3 === 0 ? 'bg-amber-400' : particle % 3 === 1 ? 'bg-sky-400' : 'bg-rose-400'
            } animate-bounce opacity-80`}
            style={{
              left: `${10 + particle * 8}%`,
              top: particle % 2 === 0 ? '18%' : '8%',
              animationDelay: `${particle * 40}ms`,
              animationDuration: '1.2s',
            }}
          />
        ))}
        <div className={`relative overflow-hidden rounded-[28px] border p-5 shadow-2xl backdrop-blur-xl section-reveal spotlight-card ${
          theme === 'dark'
            ? `${themeConfig.card} border-amber-500/30`
            : 'bg-white/95 border-amber-200'
        }`}>
          <div className={`pointer-events-none absolute inset-0 ${
            theme === 'dark'
              ? 'bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_52%)]'
              : 'bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_55%)]'
          }`} />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${themeConfig.text}`}>{title}</p>
              <p className={`mt-1 text-xs sm:text-sm ${themeConfig.textSecondary}`}>{message}</p>
            </div>
            <button
              onClick={onClose}
              className={`icon-button-soft rounded-lg p-1.5 transition ${themeConfig.hover}`}
              aria-label="Close celebration"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Habit Modal
function AddHabitModal({
  habit,
  onChange,
  onAdd,
  onClose,
  theme,
  themeConfig,
  language,
}: {
  habit: NewHabitDraft;
  onChange: (habit: NewHabitDraft) => void;
  onAdd: () => void;
  onClose: () => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
}) {
  const categories = ['health', 'productivity', 'learning', 'fitness', 'wellness', 'finance', 'hobbies'];
  const units = ['min', 'hours', 'reps', 'km', 'liters', 'count', 'pages'];
  const text = translations[language];
  const selectedIcon = normalizeIcon(habit.icon);
  useBodyScrollLock(true);
  const modalCopy = language === 'uz'
    ? {
        badgeSecondary: 'Tez sozlash',
        helper: "Bu yerda nom, maqsad, belgi va eslatma vaqtini sozlaysiz. Asosiy oqim o'zgarmaydi.",
      }
    : language === 'ru'
    ? {
        badgeSecondary: 'Быстрая настройка',
        helper: 'Здесь задаются название, цель, иконка и напоминание без изменения общего потока приложения.',
      }
    : {
        badgeSecondary: 'Quick setup',
        helper: 'Set the name, goal, icon, and reminder here without changing the overall app flow.',
      };

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-[linear-gradient(135deg,rgba(2,6,23,0.72),rgba(15,23,42,0.48))]' : 'bg-[linear-gradient(135deg,rgba(255,247,237,0.72),rgba(255,255,255,0.56))]'} flex items-end justify-center overflow-y-auto overscroll-contain p-3 z-50 backdrop-blur-sm sm:items-center sm:p-4 sm:backdrop-blur-md`}>
      <div className={`${themeConfig.card} mt-auto max-w-lg w-full border ${themeConfig.border} max-h-[calc(100dvh-0.75rem)] overflow-y-auto overscroll-contain rounded-[24px] p-4 shadow-2xl spotlight-card section-reveal aurora-panel prism-surface premium-shell edge-glow sm:mt-0 sm:max-h-[90vh] sm:rounded-[30px] sm:p-8`}>
        <div className="ambient-specks opacity-35" />
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6">
          <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            theme === 'dark' ? 'bg-slate-800/90 text-amber-200' : 'bg-amber-50 text-amber-700'
          }`}>
            New Habit
          </span>
          <span className={`chip-hover rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            theme === 'dark' ? 'bg-sky-500/12 text-sky-200' : 'bg-sky-50 text-sky-700'
          }`}>
            {modalCopy.badgeSecondary}
          </span>
        </div>
        <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
          <div className="min-w-0">
            <h2 className={`text-xl font-bold sm:text-2xl ${themeConfig.text}`}>{text.addHabitTitle}</h2>
            <p className={`mt-2 text-sm leading-6 ${themeConfig.textSecondary}`}>{modalCopy.helper}</p>
          </div>
          <button
            onClick={onClose}
            className={`icon-button-soft rounded-2xl p-2 transition ${themeConfig.hover}`}
            aria-label={text.cancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              {text.habitName}
            </label>
            <input
              type="text"
              value={habit.name}
              onChange={(e) => onChange({ ...habit, name: e.target.value })}
              placeholder={text.habitNamePlaceholder}
              className={`w-full px-4 py-3 ${themeConfig.input} rounded-2xl ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              {text.category}
            </label>
            <select
              value={habit.category}
              onChange={(e) => onChange({ ...habit, category: e.target.value })}
              className={`w-full px-4 py-3 ${themeConfig.input} rounded-2xl ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-amber-400`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(language, cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                {text.goal}
              </label>
              <input
                type="number"
                value={habit.goal}
                onChange={(e) => onChange({ ...habit, goal: e.target.value })}
                placeholder="30"
                className={`w-full px-4 py-3 ${themeConfig.input} rounded-2xl ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                {text.unit}
              </label>
              <select
                value={habit.unit}
                onChange={(e) => onChange({ ...habit, unit: e.target.value })}
                className={`w-full px-4 py-3 ${themeConfig.input} rounded-2xl ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-amber-400`}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {getUnitLabel(language, unit)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              {text.icon}
            </label>
            <input
              type="text"
              value={habit.icon}
              onChange={(e) => onChange({ ...habit, icon: e.target.value })}
              placeholder="emoji yoki text"
              className={`w-full px-4 py-3 mb-3 ${themeConfig.input} rounded-2xl ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400`}
            />
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {habitIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => onChange({ ...habit, icon })}
                  className={`chip-hover hover-lift p-3 rounded-2xl text-xl transition ${
                    selectedIcon === icon
                      ? 'bg-amber-500/30 border border-amber-500/50'
                      : `${themeConfig.bgTertiary} border ${themeConfig.border} ${themeConfig.hover}`
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              {text.reminderTimeOptional}
            </label>
            <input
              type="time"
              value={habit.reminderTime}
              onChange={(e) => onChange({ ...habit, reminderTime: e.target.value })}
              className={`w-full px-4 py-3 ${themeConfig.input} rounded-2xl ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-amber-400`}
            />
          </div>

          <div className={`sticky bottom-0 -mx-4 mt-6 flex gap-3 border-t ${theme === 'dark' ? 'border-slate-700/80 bg-slate-950/95' : 'border-slate-200/80 bg-white/95'} px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:mt-8 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0`}>
            <button
              onClick={onClose}
              className={`ghost-action flex-1 px-4 py-3 ${themeConfig.bgTertiary} ${themeConfig.textSecondary} rounded-2xl hover:opacity-80 transition`}
            >
              {text.cancel}
            </button>
            <button
              onClick={onAdd}
              className="gradient-action flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500 text-white rounded-2xl hover:shadow-lg transition"
            >
              {text.addHabit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const areHabitCardPropsEqual = (
  prev: Parameters<typeof HabitCard>[0],
  next: Parameters<typeof HabitCard>[0],
) => {
  if (
    prev.habit !== next.habit ||
    prev.completion !== next.completion ||
    prev.date !== next.date ||
    prev.onToggleTimer !== next.onToggleTimer ||
    prev.theme !== next.theme ||
    prev.themeConfig !== next.themeConfig ||
    prev.language !== next.language ||
    prev.isMobile !== next.isMobile
  ) {
    return false;
  }

  if (!isTimedHabit(next.habit.unit)) {
    return true;
  }

  const prevIsRunning = Boolean(prev.activeTimer && prev.activeTimer.habitId === prev.habit.id && prev.activeTimer.date === prev.date);
  const nextIsRunning = Boolean(next.activeTimer && next.activeTimer.habitId === next.habit.id && next.activeTimer.date === next.date);
  if (prevIsRunning !== nextIsRunning) {
    return false;
  }

  if ((prev.liveTimerProgress?.current ?? null) !== (next.liveTimerProgress?.current ?? null) && (prevIsRunning || nextIsRunning)) {
    return false;
  }

  const prevLocked = Boolean(prev.activeTimer && prev.activeTimer.habitId !== prev.habit.id);
  const nextLocked = Boolean(next.activeTimer && next.activeTimer.habitId !== next.habit.id);
  return prevLocked === nextLocked;
};

const MemoSidebar = React.memo(Sidebar);
const MemoHeader = React.memo(Header);
const MemoDashboardPage = React.memo(DashboardPage);
const MemoHabitsPage = React.memo(HabitsPage);
const MemoCalendarPage = React.memo(CalendarPage);
const MemoStatsPage = React.memo(StatsPage);
const MemoProfilePage = React.memo(ProfilePage);
const MemoHabitCard = React.memo(HabitCard, areHabitCardPropsEqual);

// Animation styles live in app/globals.css to avoid module-level side effects.
