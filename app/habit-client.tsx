'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from './lib/firebase';
import { Check, Plus, Flame, Menu, LogOut, Home, ListTodo, BarChart3, Bell, User, Calendar, Edit2, Save, X, ChevronLeft, ChevronRight, Sun, Moon, Github, Apple, Chrome, Mail, LockKeyhole } from 'lucide-react';

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
type AuthProvider = 'google' | 'apple' | 'github' | 'email';

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
    signInSubtitle: 'Choose a provider to continue',
    nameLabel: 'Name',
    emailLabel: 'Email',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@example.com',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    continueWithGitHub: 'Continue with GitHub',
    continueWithEmail: 'Continue with Email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Create a password',
    authErrorMissingFields: 'Enter email and password to continue.',
    light: 'Light',
    dark: 'Dark',
    logout: 'Logout',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
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
    addHabit: 'Добавить',
    monthlyResetTitle: 'Ежемесячная очистка',
    resetNoticePrefix: 'Локальные данные очищены',
    closeNotice: 'Закрыть уведомление',
    weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  },
  uz: {
    signInTitle: 'Habitify ga kirish',
    signInSubtitle: 'Davom etish uchun provayderni tanlang',
    nameLabel: 'Ism',
    emailLabel: 'Email',
    namePlaceholder: 'Ismingiz',
    emailPlaceholder: 'you@example.com',
    continueWithGoogle: 'Google orqali davom etish',
    continueWithApple: 'Apple orqali davom etish',
    continueWithGitHub: 'GitHub orqali davom etish',
    continueWithEmail: 'Email bilan davom etish',
    passwordLabel: 'Parol',
    passwordPlaceholder: 'Parol yarating',
    authErrorMissingFields: 'Email va parolni kiriting.',
    languageLabel: 'Til',
    dashboard: 'Boshqaruv',
    habits: 'Odatlar',
    calendar: 'Kalendar',
    statistics: 'Statistika',
    profile: 'Profil',
    light: "Yorug'",
    dark: "Qorong'i",
    logout: 'Chiqish',
    soundOn: 'Ovoz yoqilgan',
    soundOff: "Ovoz o'chirilgan",
    greetingMorning: 'Xayrli tong',
    greetingAfternoon: 'Xayrli kun',
    greetingEvening: 'Xayrli kech',
    habitsCompletedToday: 'odat bugun bajarildi',
    todaysProgress: 'Bugungi progress',
    complete: 'Bajarildi',
    habitsCompleted: 'Bajarilgan odatlar',
    currentStreak: 'Hozirgi seriya',
    days: 'kun',
    best: 'Eng yaxshisi',
    totalHabits: 'Jami odatlar',
    activeHabits: 'Faol odatlar',
    addNewHabit: "Yangi odat qo'shish",
    todaysHabits: 'Bugungi odatlar',
    noHabitsYet: "Hali odatlar yo'q. Birinchi odatni yarating!",
    createFirstHabit: 'Birinchi odatni yaratish',
    thisWeekOverview: "Haftalik ko'rinish",
    allHabits: 'Barcha odatlar',
    newHabit: 'Yangi odat',
    searchHabits: 'Odatlarni qidirish',
    searchPlaceholder: "Nomi yoki kategoriya bo'yicha qidiring",
    noHabitsFound: 'Qidiruv bo‘yicha hech narsa topilmadi.',
    clearSearch: 'Qidiruvni tozalash',
    noHabitsCreated: "Hali odatlar yo'q. Bugun boshlang!",
    createYourFirstHabit: 'Birinchi odatni yaratish',
    category: 'Kategoriya',
    goal: 'Maqsad',
    streak: 'Seriya',
    bestStreakLabel: 'Eng yaxshi seriya',
    statisticsTitle: 'Statistika',
    completedToday: 'Bugun bajarildi',
    trend30Days: '30 kunlik trend',
    habitDistribution: 'Odatlar taqsimoti',
    completed: 'Bajarilgan',
    active: 'Faol',
    habitsPerformance: 'Odatlar natijasi',
    completion: 'Bajarilish',
    bio: 'Bio',
    joined: "Qo'shilgan",
    totalCompleted: 'Jami bajarilgan',
    accountAge: 'Akkount yoshi',
    yourHabits: 'Odatlaringiz',
    noHabitsYetShort: "Hali odatlar yo'q",
    completedCount: 'bajarildi',
    completedCheckbox: 'Bajarildi',
    addHabitTitle: "Yangi odat qo'shish",
    habitName: 'Odat nomi',
    habitNamePlaceholder: 'masalan, Ertalabki meditatsiya',
    unit: 'Birlik',
    icon: 'Ikonka',
    reminderTimeOptional: 'Eslatma vaqti (ixtiyoriy)',
    cancel: 'Bekor qilish',
    addHabit: "Qo'shish",
    monthlyResetTitle: 'Oylik tozalash',
    resetNoticePrefix: "Lokal ma'lumotlar tozalandi",
    closeNotice: 'Bildirishnomani yopish',
    weekdaysShort: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  },
};

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

// Theme Configuration
const themes = {
  dark: {
    bg: 'bg-[#0b0f14]',
    bgSecondary: 'bg-[#0f1621]',
    bgTertiary: 'bg-[#141e2b]',
    border: 'border-[#1f2a3a]',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    card: 'bg-[#0f1624]/80',
    input: 'bg-[#0f1621] border-[#223047] placeholder:text-slate-500',
    hover: 'hover:bg-[#162232]',
    gradient: 'from-emerald-500 to-cyan-700',
  },
  light: {
    bg: 'bg-[#f8f6f1]',
    bgSecondary: 'bg-[#fdfaf5]',
    bgTertiary: 'bg-[#f3efe7]',
    border: 'border-[#e6ded1]',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    card: 'bg-white/80 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.25)]',
    input: 'bg-white border-[#d8cbb7] placeholder:text-slate-400',
    hover: 'hover:bg-[#f2eadc]',
    gradient: 'from-emerald-500 to-cyan-600',
  },
};

type ThemeConfig = (typeof themes)['dark'];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

const playNotificationSound = (enabled: boolean, frequency: number = 880, durationSeconds: number = 0.15) => {
  if (!enabled || typeof window === 'undefined') return;
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  try {
    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.05;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + durationSeconds);
    oscillator.onended = () => {
      context.close();
    };
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

const formatDate = (dateString: string, locale: string) => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
};

const getWeekDates = () => {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const firstDay = new Date(today.setDate(today.getDate() - mondayOffset));
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
    'from-emerald-400 to-emerald-600',
    'from-cyan-400 to-cyan-600',
    'from-teal-400 to-teal-600',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-rose-600',
    'from-lime-400 to-lime-600',
    'from-sky-400 to-sky-600',
    'from-fuchsia-400 to-fuchsia-600',
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
  const [theme, setTheme] = useState<Theme>(() => getLocalStorage<Theme>('theme', 'dark') ?? 'dark');
  const [profileOverrides, setProfileOverrides] = useState<ProfileOverrides>({});
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => getLocalStorage<boolean>('sound_enabled', true) ?? true);
  const [language, setLanguage] = useState<Language>(() => normalizeLanguage(getLocalStorage<string>('language', 'en')));
  const [isMounted, setIsMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [newHabit, setNewHabit] = useState<NewHabitDraft>({
    name: '',
    goal: '',
    unit: 'min',
    icon: '⭐',
    category: 'health',
    reminderTime: '09:00',
  });

  const themeConfig = themes[theme];
  const locale = getLocale(language);
  const text = translations[language];
  const minMonth = getMonthStart(new Date());

  const handleMonthChange = (date: Date) => {
    const nextMonth = getMonthStart(date);
    if (nextMonth < minMonth) {
      setCurrentMonth(minMonth);
      return;
    }
    setCurrentMonth(nextMonth);
  };

  // Monthly reset for local storage (habits + profile overrides).
  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      return;
    }
    const checkMonthlyReset = () => {
      const now = new Date();
      const monthKey = getMonthKey(now);
      const resetKey = `monthly_reset_${user.id}`;
      const lastReset = getLocalStorage<string>(resetKey, '');
      if (lastReset !== monthKey) {
        setHabits([]);
        setProfileOverrides({});
        setLocalStorage(`habits_${user.id}`, []);
        setLocalStorage(`profile_${user.id}`, {});
        setLocalStorage(resetKey, monthKey);
        setSelectedDate(getTodayDate());
        setCurrentMonth(getMonthStart(now));
        const resetDateLabel = now.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        setResetNotice(`${text.resetNoticePrefix} ${resetDateLabel}.`);
        playNotificationSound(soundEnabled, 740);
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
    const loadUserData = () => {
      if (!isSignedIn || !user?.id) {
        setHabits([]);
        setProfileOverrides({});
        return;
      }
      const savedHabits = getLocalStorage<Habit[]>(`habits_${user.id}`, []);
      setHabits(savedHabits);
      const savedProfile = getLocalStorage<ProfileOverrides>(`profile_${user.id}`, {});
      setProfileOverrides(savedProfile || {});
    };
    loadUserData();
  }, [isSignedIn, user?.id]);

  // Save theme
  useEffect(() => {
    setLocalStorage('theme', theme);
  }, [theme]);

  // Save sound preference
  useEffect(() => {
    setLocalStorage('sound_enabled', soundEnabled);
  }, [soundEnabled]);

  // Save language preference
  useEffect(() => {
    setLocalStorage('language', language);
  }, [language]);

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
          : providerId === 'apple.com'
          ? 'apple'
          : 'email';
      setAuthUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        provider,
        createdAt,
        avatarUrl: firebaseUser.photoURL || undefined,
      });
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Save habits
  useEffect(() => {
    if (isSignedIn && user?.id) {
      setLocalStorage(`habits_${user.id}`, habits);
    }
  }, [habits, isSignedIn, user?.id]);

  // Missed-day alert (once per day).
  useEffect(() => {
    if (!isSignedIn || !user?.id || habits.length === 0) {
      return;
    }
    const checkMissedDay = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatLocalDate(yesterday);
      const alertKey = `missed_alert_${user.id}`;
      const lastAlert = getLocalStorage<string>(alertKey, '');
      if (lastAlert === yesterdayStr) {
        return;
      }
      const missed = habits.some(habit => {
        if (habit.createdAt && habit.createdAt > yesterdayStr) {
          return false;
        }
        const completion = habit.completions.find(c => c.date === yesterdayStr);
        return !completion?.completed;
      });
      if (missed) {
        playNotificationSound(soundEnabled, 660);
        setLocalStorage(alertKey, yesterdayStr);
      }
    };
    checkMissedDay();
    const intervalId = window.setInterval(checkMissedDay, 1000 * 60 * 60);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [habits, isSignedIn, soundEnabled, user?.id]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => setIsMounted(true));
    return () => {
      window.cancelAnimationFrame(rafId);
    };
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

  const handleLogin = async (provider: AuthProvider, name: string, email: string, password: string) => {
    setAuthError(null);
    try {
      if (provider === 'email') {
        if (!email || !password) {
          setAuthError(translations[language].authErrorMissingFields);
          return;
        }
        try {
          await signInWithEmailAndPassword(firebaseAuth, email, password);
        } catch (error) {
          const err = error as { code?: string; message?: string };
          if (err.code === 'auth/user-not-found') {
          const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          if (name) {
            await updateProfile(credential.user, { displayName: name });
          }
          } else {
            throw error;
          }
        }
      } else {
        const providerInstance =
          provider === 'google'
            ? new GoogleAuthProvider()
            : provider === 'github'
            ? new GithubAuthProvider()
            : new OAuthProvider('apple.com');
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
  const handleLogout = () => {
    void signOut(firebaseAuth);
    setProfileOverrides({});
    setCurrentPage('dashboard');
    setHabits([]);
  };

  // Add Habit
  const handleAddHabit = () => {
    if (newHabit.name && newHabit.goal) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit.name,
        goal: parseFloat(newHabit.goal),
        unit: newHabit.unit,
        icon: newHabit.icon,
        color: getRandomColor(),
        createdAt: getTodayDate(),
        completions: [],
        category: newHabit.category,
        reminderTime: newHabit.reminderTime,
      };

      setHabits((prev) => [...prev, habit]);
      setNewHabit({
        name: '',
        goal: '',
        unit: 'min',
        icon: '⭐',
        category: 'health',
        reminderTime: '09:00',
      });
      setShowAddHabit(false);
      playNotificationSound(soundEnabled, 880);
    }
  };

  // Update Habit Completion
  const handleUpdateHabitCompletion = (habitId: string, date: string, current: number, time?: string) => {
    setHabits((prev) => prev.map(h => {
      if (h.id === habitId) {
        const completions = [...h.completions];
        const existingIndex = completions.findIndex(c => c.date === date);

        if (existingIndex >= 0) {
          completions[existingIndex] = {
            ...completions[existingIndex],
            current,
            completed: current >= h.goal,
            time: time || completions[existingIndex].time,
          };
        } else {
          completions.push({
            date,
            completed: current >= h.goal,
            current,
            time,
          });
        }

        return { ...h, completions };
      }
      return h;
    }));
  };

  // Toggle Habit Completion
  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits((prev) => prev.map(h => {
      if (h.id === habitId) {
        const completions = [...h.completions];
        const existingIndex = completions.findIndex(c => c.date === date);

        if (existingIndex >= 0) {
          completions[existingIndex].completed = !completions[existingIndex].completed;
        } else {
          completions.push({
            date,
            completed: true,
            current: h.goal,
          });
        }

        return { ...h, completions };
      }
      return h;
    }));
  };

  // Delete Habit
  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter(h => h.id !== habitId));
  };

  // Update Profile
  const updateProfileState = (updates: Partial<UserProfile>) => {
    if (!isSignedIn || !user?.id) return;
    const nextOverrides: ProfileOverrides = {
      name: updates.name ?? profileOverrides.name,
      email: updates.email ?? profileOverrides.email,
      bio: updates.bio ?? profileOverrides.bio,
    };
    setProfileOverrides(nextOverrides);
    setLocalStorage(`profile_${user.id}`, nextOverrides);
  };

  // Calculate metrics
  const calculateMetrics = (date: string = getTodayDate()): Metrics => {
    const todaysHabits = habits.filter(h => {
      const completion = h.completions.find(c => c.date === date);
      return completion?.completed;
    });

    return {
      totalHabits: habits.length,
      completedToday: todaysHabits.length,
      weeklyCompletion: Math.round((todaysHabits.length / Math.max(habits.length, 1)) * 100),
      currentStreak: Math.max(...habits.map(h => getStreak(h)), 0),
      bestStreak: Math.max(...habits.map(h => getBestStreak(h)), 0),
    };
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (!isLoaded) {
    return null;
  }

  const baseName = user?.name || 'User';
  const displayName = profileOverrides.name ?? baseName;
  const displayEmail = profileOverrides.email ?? (user?.email ?? '');
  const userProfile: UserProfile | null = user
    ? {
        id: user.id,
        name: displayName,
        email: displayEmail,
        avatar: getInitials(displayName),
        avatarUrl: user.avatarUrl || undefined,
        bio: profileOverrides.bio ?? 'Building better habits daily!',
        joinDate: user.createdAt || getTodayDate(),
      }
    : null;

  if (!isSignedIn) {
    return <AuthPage theme={theme} language={language} onLogin={handleLogin} authError={authError} />;
  }

  return (
    <div className={`flex h-screen ${themeConfig.bg} ${themeConfig.text} overflow-hidden`}>
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <Sidebar
            isOpen
            variant="mobile"
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
            user={userProfile!}
            habitsCount={habits.length}
            theme={theme}
            onThemeChange={setTheme}
            language={language}
            onLanguageChange={setLanguage}
            onClose={() => setMobileSidebarOpen(false)}
          />
        </>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        variant="desktop"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        user={userProfile!}
        habitsCount={habits.length}
        theme={theme}
        onThemeChange={setTheme}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Header
          user={userProfile!}
          onMenuClick={() => setMobileSidebarOpen(true)}
          metrics={calculateMetrics()}
          theme={theme}
          soundEnabled={soundEnabled}
          onSoundToggle={() => setSoundEnabled((prev) => !prev)}
          language={language}
        />

        {resetNotice && (
          <div className="px-6 md:px-8 pt-4">
            <div className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.border} shadow-lg flex items-start justify-between gap-4`}>
              <div className="min-w-0">
                <p className={`${themeConfig.text} font-semibold`}>{text.monthlyResetTitle}</p>
                <p className={`${themeConfig.textSecondary} text-sm break-words`}>{resetNotice}</p>
              </div>
              <button
                onClick={() => setResetNotice(null)}
                className={`p-2 rounded-lg transition ${themeConfig.hover}`}
                aria-label={text.closeNotice}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className={`p-6 md:p-8 max-w-7xl mx-auto ${themeConfig.bgSecondary}`}>
          {currentPage === 'dashboard' && (
            <DashboardPage
              habits={habits}
              selectedDate={getTodayDate()}
              metrics={calculateMetrics()}
              onToggleHabit={toggleHabitCompletion}
              onUpdateProgress={handleUpdateHabitCompletion}
              onAddHabit={() => setShowAddHabit(true)}
              onDeleteHabit={deleteHabit}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
              locale={locale}
              isMounted={isMounted}
            />
          )}

          {currentPage === 'habits' && (
            <HabitsPage
              habits={habits}
              selectedDate={getTodayDate()}
              onAddHabit={() => setShowAddHabit(true)}
              onDeleteHabit={deleteHabit}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
            />
          )}

          {currentPage === 'calendar' && (
            <CalendarPage
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
            <StatsPage
              habits={habits}
              metrics={calculateMetrics()}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
              locale={locale}
              isMounted={isMounted}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              user={userProfile!}
              habits={habits}
              onUpdate={updateProfileState}
              theme={theme}
              themeConfig={themeConfig}
              language={language}
              locale={locale}
            />
          )}
        </div>
      </main>

      {/* Add Habit Modal */}
      {showAddHabit && (
        <AddHabitModal
          habit={newHabit}
          onChange={setNewHabit}
          onAdd={handleAddHabit}
          onClose={() => setShowAddHabit(false)}
          theme={theme}
          themeConfig={themeConfig}
          language={language}
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
  onLogin: (provider: AuthProvider, name: string, email: string, password: string) => void;
  authError: string | null;
}) {
  const text = translations[language];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleProvider = (provider: AuthProvider) => {
    onLogin(provider, name, email, password);
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-amber-50 text-slate-900'} flex items-center justify-center p-6`}>
      <div className={`pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-200/70'}`} />
      <div className={`pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full blur-3xl ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-200/70'}`} />

      <div className="relative w-full max-w-5xl">
        <div className={`${theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-amber-100'} rounded-3xl border shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] overflow-hidden backdrop-blur-xl`}>
          <div className="grid gap-0 md:grid-cols-[1.25fr_1fr]">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-[0.32em] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Habitify</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Small habits. Big momentum.</p>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>
                {text.signInTitle}
              </h1>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{text.signInSubtitle}</p>

              <div className="mt-8 grid gap-4">
                <div>
                  <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{text.nameLabel}</label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={text.namePlaceholder}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{text.emailLabel}</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={text.emailPlaceholder}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{text.passwordLabel}</label>
                  <div className="relative">
                    <LockKeyhole className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={text.passwordPlaceholder}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <button
                  onClick={() => handleProvider('email')}
                  className="w-full rounded-xl px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold tracking-wide shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-500 transition"
                >
                  {text.continueWithEmail}
                </button>
                {authError && (
                  <div className={`text-xs px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                    {authError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleProvider('google')}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border ${theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-amber-50'} transition`}
                  >
                    <Chrome className="w-4 h-4" />
                    <span className="text-xs">{text.continueWithGoogle}</span>
                  </button>
                  <button
                    onClick={() => handleProvider('apple')}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border ${theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-amber-50'} transition`}
                  >
                    <Apple className="w-4 h-4" />
                    <span className="text-xs">{text.continueWithApple}</span>
                  </button>
                  <button
                    onClick={() => handleProvider('github')}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border ${theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-amber-50'} transition`}
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-xs">{text.continueWithGitHub}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`relative hidden md:flex flex-col justify-between p-10 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-amber-100 via-white to-emerald-50'}`}>
              <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_55%)]' : 'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]'}`} />
              <div className="relative">
                <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}>Daily clarity</h2>
                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Track habits with a calm, focused dashboard. Your progress stays local and fast.
                </p>
              </div>
              <div className="relative grid gap-4">
                {[
                  { label: text.habitsCompleted, value: '12' },
                  { label: text.currentStreak, value: '5' },
                  { label: text.bestStreakLabel, value: '18' },
                ].map((item) => (
                  <div key={item.label} className={`${theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-white/70 border-amber-100'} rounded-2xl border p-4`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                ))}
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
  const widthClass = isMobile ? 'w-64' : isOpen ? 'w-64' : 'w-20';
  const containerClass = `${
    isMobile ? 'flex md:hidden fixed inset-y-0 left-0 z-50' : 'hidden md:flex'
  } ${widthClass} ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white shadow-xl border-slate-200'} backdrop-blur-xl border-r transition-all duration-300 flex flex-col overflow-y-auto`;
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
      {/* Logo */}
      <div className={`p-6 border-b ${themeConfig.border}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <Check className="w-6 h-6 text-white" />
            </div>
            {showLabels && <h1 className={`text-xl font-bold ${themeConfig.text}`}>Habitify</h1>}
          </div>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${themeConfig.hover}`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePageChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === item.id
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg'
                : `${themeConfig.textSecondary} ${themeConfig.hover}`
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {showLabels && <span className="text-sm font-medium">{item.label}</span>}
            {showLabels && item.id === 'habits' && habitsCount > 0 && (
              <span className="ml-auto bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {habitsCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className={`p-4 border-t ${themeConfig.border}`}>
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
            theme === 'dark' 
              ? 'bg-slate-700/50 text-yellow-400 hover:bg-slate-700' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
      <div className={`p-4 border-t ${themeConfig.border}`}>
        {showLabels && <p className={`text-xs ${themeConfig.textSecondary} mb-2`}>{text.languageLabel}</p>}
        <div className={`flex ${showLabels ? 'gap-2' : 'flex-col gap-2 items-center'}`}>
          {(['en', 'ru', 'uz'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                language === lang
                  ? 'bg-emerald-500 text-white shadow'
                  : `${themeConfig.bgTertiary} ${themeConfig.textSecondary} hover:opacity-80`
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-t ${themeConfig.border} space-y-4`}>
        <div className={`flex items-center gap-3 ${!showLabels && 'justify-center'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-base font-semibold shadow-lg overflow-hidden ring-2 ring-emerald-400/30 shrink-0">
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

        <button
          onClick={() => {
            onLogout();
            if (onClose) {
              onClose();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition text-sm font-medium"
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
  metrics,
  theme,
  soundEnabled,
  onSoundToggle,
  language,
}: {
  user: UserProfile;
  onMenuClick: () => void;
  metrics: Metrics;
  theme: Theme;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  language: Language;
}) {
  const themeConfig = themes[theme];
  const text = translations[language];

  return (
    <header className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white shadow-md border-slate-200'} backdrop-blur-xl border-b sticky top-0 z-40`}>
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className={`md:hidden p-2 rounded-lg transition ${themeConfig.hover} shrink-0`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h2 className={`text-lg sm:text-xl font-bold ${themeConfig.text} leading-tight break-words`}>
              {getGreeting(language)}, {user.name}!
            </h2>
            <p className={`${themeConfig.textSecondary} text-xs sm:text-sm`}>
              {metrics.completedToday} / {metrics.totalHabits} {text.habitsCompletedToday}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={onSoundToggle}
            aria-pressed={!soundEnabled}
            className={`relative p-2 rounded-lg transition ${themeConfig.hover}`}
            title={soundEnabled ? text.soundOn : text.soundOff}
          >
            <Bell className="w-6 h-6" />
            {metrics.completedToday > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
            {!soundEnabled && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-7 h-[2px] bg-red-500 rotate-45"></span>
              </span>
            )}
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-sm sm:text-lg font-semibold shadow-lg overflow-hidden ring-2 ring-emerald-400/30 shrink-0">
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
  onToggleHabit,
  onUpdateProgress,
  onAddHabit,
  onDeleteHabit,
  theme,
  themeConfig,
  language,
  locale,
  isMounted,
}: {
  habits: Habit[];
  selectedDate: string;
  metrics: Metrics;
  onToggleHabit: (habitId: string, date: string) => void;
  onUpdateProgress: (habitId: string, date: string, current: number, time?: string) => void;
  onAddHabit: () => void;
  onDeleteHabit: (habitId: string) => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
  locale: string;
  isMounted: boolean;
}) {
  const weekDates = getWeekDates();
  const text = translations[language];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Progress Card */}
        <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
          <h3 className={`${themeConfig.textSecondary} text-sm font-medium mb-4`}>{text.todaysProgress}</h3>
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
                  strokeDasharray={`${(metrics.weeklyCompletion / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${themeConfig.text}`}>{metrics.weeklyCompletion}%</p>
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
        <div className={`${theme === 'dark' ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'} ${themeConfig.card} rounded-2xl p-6 border shadow-lg`}>
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
        <div className={`${theme === 'dark' ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200'} ${themeConfig.card} rounded-2xl p-6 border shadow-lg`}>
          <p className={`${themeConfig.textSecondary} text-sm font-medium mb-4`}>{text.totalHabits}</p>
          <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{metrics.totalHabits}</p>
          <p className={`${themeConfig.textSecondary} text-xs mt-2`}>{text.activeHabits}</p>
        </div>

        {/* Add Habit Card */}
        <div className={`${theme === 'dark' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} ${themeConfig.card} rounded-2xl p-6 border flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition shadow-lg`}>
          <button
            onClick={onAddHabit}
            className="flex flex-col items-center gap-2 text-center"
          >
            <Plus className={`w-8 h-8 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{text.addNewHabit}</span>
          </button>
        </div>
      </div>

      {/* Today's Habits */}
      <div>
        <h3 className={`text-2xl font-bold ${themeConfig.text} mb-6`}>{text.todaysHabits}</h3>
        {habits.length === 0 ? (
          <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg`}>
            <Plus className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
            <p className={`${themeConfig.textSecondary} mb-4`}>{text.noHabitsYet}</p>
            <button
              onClick={onAddHabit}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition"
            >
              {text.createFirstHabit}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit: Habit) => {
              const completion = habit.completions.find(c => c.date === selectedDate);
              return (
                <HabitCard
                  key={`${habit.id}-${selectedDate}`}
                  habit={habit}
                  date={selectedDate}
                  completion={completion}
                  onToggle={onToggleHabit}
                  onUpdate={onUpdateProgress}
                  onDelete={onDeleteHabit}
                  theme={theme}
                  themeConfig={themeConfig}
                  language={language}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Week Overview Chart */}
      {habits.length > 0 && (
        <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
          <h3 className={`${themeConfig.text} font-bold mb-6`}>{text.thisWeekOverview}</h3>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={weekDates.map((date: string) => ({
                  day: parseLocalDate(date).toLocaleDateString(locale, { weekday: 'short' }),
                  completed: habits.filter(
                    h => h.completions.find(c => c.date === date && c.completed)
                  ).length,
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
                <Bar dataKey="completed" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px]" />
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
  const filteredHabits = normalizedQuery
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
    : habits;
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={`text-3xl font-bold ${themeConfig.text}`}>{text.allHabits}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <label className={`block text-xs mb-2 ${themeConfig.textSecondary}`}>{text.searchHabits}</label>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className={`w-full sm:w-72 px-4 py-2 rounded-full ${themeConfig.input} ${themeConfig.text} placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            />
          </div>
          <button
            onClick={onAddHabit}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-full hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            {text.newHabit}
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg`}>
          <ListTodo className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
          <p className={`${themeConfig.textSecondary} mb-4`}>{text.noHabitsCreated}</p>
          <button
            onClick={onAddHabit}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition"
          >
            {text.createYourFirstHabit}
          </button>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg`}>
          <ListTodo className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
          <p className={`${themeConfig.textSecondary} mb-4`}>{text.noHabitsFound}</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition"
          >
            {text.clearSearch}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit: Habit) => {
            const completion = habit.completions.find(c => c.date === selectedDate);
            return (
              <div
                key={habit.id}
                className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.border} hover:border-emerald-500/50 transition shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{habit.icon}</span>
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
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full bg-gradient-to-r ${habit.color} transition-all`}
                      style={{
                        width: `${Math.min(((completion?.current || 0) / habit.goal) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className={`${themeConfig.textSecondary} text-xs`}>
                    {completion?.current || 0} / {habit.goal} {getUnitLabel(language, habit.unit)}
                  </p>
                </div>

                <div className={`mt-4 pt-4 border-t ${themeConfig.border} flex items-center justify-between text-xs`}>
                  <span className={themeConfig.textSecondary}>{text.streak}: {getStreak(habit)} {text.days}</span>
                  <span className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>{text.best}: {getBestStreak(habit)} {text.days}</span>
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
  const text = translations[language];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

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
    const completed = habits.filter(h => h.completions.find(c => c.date === dateStr && c.completed)).length;
    return Math.round((completed / habits.length) * 100);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
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
              className={`p-2 rounded-lg transition ${
                atMinMonth ? 'opacity-40 cursor-not-allowed' : themeConfig.hover
              }`}
            >
              <ChevronLeft className={`w-5 h-5 ${themeConfig.textSecondary}`} />
            </button>
            <button
              onClick={() => onMonthChange(new Date(year, month + 1))}
              className={`p-2 rounded-lg transition ${themeConfig.hover}`}
            >
              <ChevronRight className={`w-5 h-5 ${themeConfig.textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
          {text.weekdaysShort.map((day) => (
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
                className={`p-2 sm:p-3 rounded-lg text-center transition relative flex flex-col items-center ${
                  isSelected
                    ? 'bg-emerald-500/30 border border-emerald-500/50'
                    : isToday
                    ? theme === 'dark' ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100 border border-green-300'
                    : `${themeConfig.bgTertiary} border ${themeConfig.border} ${themeConfig.hover}`
                }`}
              >
                <div className={`${themeConfig.text} font-semibold text-xs sm:text-sm`}>{day}</div>
                {completionRate > 0 && (
                  <>
                    <div className={`hidden sm:block text-xs ${themeConfig.textSecondary} mt-1`}>{completionRate}%</div>
                    <span
                      className={`sm:hidden mt-1 w-1.5 h-1.5 rounded-full ${
                        completionRate === 100 ? 'bg-green-500' : 'bg-emerald-500'
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
      <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
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
              <div key={habit.id} className={`${themeConfig.bgTertiary} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <span className={`${themeConfig.text} font-medium`}>{habit.name}</span>
                  </div>
                  {completion?.completed && <Check className="w-5 h-5 text-green-500" />}
                </div>
                <div className={`h-2 ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full bg-gradient-to-r ${habit.color}`}
                    style={{
                      width: `${Math.min(((completion?.current || 0) / habit.goal) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className={`${themeConfig.textSecondary} text-xs mt-2`}>
                  {completion?.current || 0} / {habit.goal} {getUnitLabel(language, habit.unit)}
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
}: {
  habits: Habit[];
  metrics: Metrics;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
  locale: string;
  isMounted: boolean;
}) {
  const text = translations[language];
  const getMonthData = () => {
    const today = new Date();
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatLocalDate(date);
      const completed = habits.filter(h => h.completions.find(c => c.date === dateStr && c.completed)).length;
      data.push({
        date: date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
        completed,
      });
    }
    return data;
  };

  const completedCount = habits.filter(h => getStreak(h) > 0).length;
  const activeCount = habits.filter(h => getStreak(h) === 0).length;
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

  return (
    <div className="max-w-6xl space-y-8">
      <h2 className={`text-3xl font-bold ${themeConfig.text}`}>{text.statisticsTitle}</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: text.totalHabits, value: metrics.totalHabits, color: 'blue' },
          { label: text.completedToday, value: metrics.completedToday, color: 'green' },
          { label: text.currentStreak, value: `${metrics.currentStreak} ${text.days}`, color: 'orange' },
          { label: text.bestStreakLabel, value: `${metrics.bestStreak} ${text.days}`, color: 'purple' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}
          >
            <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{stat.label}</p>
            <p className={`text-3xl font-bold ${themeConfig.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Trend */}
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <h3 className={`${themeConfig.text} font-bold mb-6`}>{text.trend30Days}</h3>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getMonthData()}>
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
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px]" />
          )}
        </div>

        {/* Habit Distribution */}
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <h3 className={`${themeConfig.text} font-bold mb-6`}>{text.habitDistribution}</h3>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={300}>
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
                  stroke={theme === 'dark' ? '#0b0f14' : '#f8f6f1'}
                  strokeWidth={2}
                  filter="url(#pieGlow)"
                  dataKey="value"
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
            <div className="h-[300px]" />
          )}
        </div>
      </div>

      {/* Habit Details */}
      <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
        <h3 className={`${themeConfig.text} font-bold mb-6`}>{text.habitsPerformance}</h3>
        <div className="space-y-4">
          {habits.map((habit: Habit) => {
            const streak = getStreak(habit);
            const bestStreak = getBestStreak(habit);
            const completionRate = Math.round(
              (habit.completions.filter(c => c.completed).length / Math.max(habit.completions.length, 1)) * 100
            );

            return (
              <div key={habit.id} className={`flex items-center justify-between p-4 ${themeConfig.bgTertiary} rounded-lg`}>
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
                  <p className="text-lg font-bold text-emerald-500">{completionRate}%</p>
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
}: {
  user: UserProfile;
  habits: Habit[];
  onUpdate: (user: UserProfile) => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
  locale: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);
  const [todayDate] = useState(() => getTodayDate());
  const text = translations[language];

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

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
    <div className="max-w-2xl space-y-6">
      {/* Profile Card */}
      <div className={`${themeConfig.card} rounded-2xl p-8 border ${themeConfig.border} shadow-lg`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-3xl shadow-lg ring-2 ring-emerald-400/30 overflow-hidden">
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
            <div className="min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className={`text-2xl font-bold ${themeConfig.text} bg-opacity-50 ${themeConfig.bgTertiary} px-2 py-1 rounded w-full sm:w-auto max-w-full`}
                  />
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className={`text-sm ${themeConfig.text} ${themeConfig.bgTertiary} px-2 py-1 rounded w-full sm:w-auto max-w-full`}
                  />
                </div>
              ) : (
                <h2 className={`text-2xl font-bold ${themeConfig.text} break-words`}>{user.name}</h2>
              )}
              {!isEditing && <p className={themeConfig.textSecondary}>{user.email}</p>}
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{text.joined} {formatDate(user.joinDate, locale)}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2 sm:ml-4 self-start sm:self-auto">
              <button
                onClick={handleSave}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg transition"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setEditData(user);
                  setIsEditing(false);
                }}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 rounded-lg transition self-start sm:self-auto"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className={`block text-sm ${themeConfig.textSecondary} mb-2`}>{text.bio}</label>
          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
              rows={3}
            />
          ) : (
            <p className={`${themeConfig.text} opacity-90`}>{user.bio}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{text.totalHabits}</p>
          <p className={`text-3xl font-bold ${themeConfig.text}`}>{habits.length}</p>
        </div>
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{text.totalCompleted}</p>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{totalCompleted}</p>
        </div>
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>{text.accountAge}</p>
          <p className={`text-3xl font-bold text-emerald-500`}>
            {accountAgeDays}
            <span className="text-sm ml-1">{text.days}</span>
          </p>
        </div>
      </div>

      {/* Recent Habits */}
      <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
        <h3 className={`${themeConfig.text} font-bold mb-4`}>{text.yourHabits}</h3>
        <div className="space-y-2">
          {habits.length === 0 ? (
            <p className={themeConfig.textSecondary}>{text.noHabitsYetShort}</p>
          ) : (
            habits.map((habit: Habit) => (
              <div key={habit.id} className={`flex items-center justify-between p-3 ${themeConfig.bgTertiary} rounded-lg`}>
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
    </div>
  );
}

// Habit Card Component
function HabitCard({
  habit,
  date,
  completion,
  onToggle,
  onUpdate,
  onDelete,
  theme,
  themeConfig,
  language,
}: {
  habit: Habit;
  date: string;
  completion?: HabitCompletion;
  onToggle: (habitId: string, date: string) => void;
  onUpdate: (habitId: string, date: string, current: number, time?: string) => void;
  onDelete: (habitId: string) => void;
  theme: Theme;
  themeConfig: ThemeConfig;
  language: Language;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(completion?.current || 0);
  const [time, setTime] = useState(completion?.time || getCurrentTimeString());
  const text = translations[language];

  const percentage = Math.min((currentValue / habit.goal) * 100, 100);

  return (
    <div className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 hover:border-emerald-500/50 transition shadow-lg`}>
      <div className="flex items-center gap-4 flex-1 w-full">
        <button
          onClick={() => onToggle(habit.id, date)}
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition ${
            completion?.completed
              ? 'bg-green-500/20 text-green-500'
              : `${themeConfig.bgTertiary} ${themeConfig.textSecondary} hover:bg-emerald-500/20`
          }`}
        >
          {completion?.completed && <Check className="w-6 h-6" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{habit.icon}</span>
            <h4 className={`${themeConfig.text} font-semibold`}>{habit.name}</h4>
          </div>
          <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'} rounded-full overflow-hidden w-full sm:max-w-xs`}>
            <div
              className={`h-full bg-gradient-to-r ${habit.color} transition-all`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className={`${themeConfig.textSecondary} text-xs mt-1`}>
            {currentValue} / {habit.goal} {getUnitLabel(language, habit.unit)}
            {completion?.time && ` · ${completion.time}`}
          </p>
        </div>
      </div>

      {/* Edit Progress */}
      {isEditing ? (
        <div className="hidden sm:flex gap-2 ml-4">
          <label className={`flex items-center gap-2 px-2 py-1 ${themeConfig.input} ${themeConfig.text} rounded text-sm`}>
            <input
              type="checkbox"
              checked={currentValue >= habit.goal}
              onChange={(e) => setCurrentValue(e.target.checked ? habit.goal : 0)}
              className="w-4 h-4 accent-green-500"
            />
            {text.completedCheckbox}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`px-2 py-1 ${themeConfig.input} ${themeConfig.text} rounded text-sm`}
          />
          <button
            onClick={() => {
              onUpdate(habit.id, date, currentValue, time);
              setIsEditing(false);
            }}
            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded transition"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="hidden sm:flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className={`p-2 hover:bg-emerald-500/20 rounded-lg transition text-emerald-500`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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
  const icons = ['💻', '📚', '💪', '💧', '🌙', '🧘', '🏃', '🍎', '🎯', '⭐'];
  const categories = ['health', 'productivity', 'learning', 'fitness', 'wellness', 'finance', 'hobbies'];
  const units = ['min', 'hours', 'reps', 'km', 'liters', 'count', 'pages'];
  const text = translations[language];

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-sm flex items-center justify-center p-4 z-50`}>
      <div className={`${themeConfig.card} rounded-2xl p-8 max-w-md w-full border ${themeConfig.border} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <h2 className={`text-2xl font-bold ${themeConfig.text} mb-6`}>{text.addHabitTitle}</h2>

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
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              {text.category}
            </label>
            <select
              value={habit.category}
              onChange={(e) => onChange({ ...habit, category: e.target.value })}
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(language, cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                {text.goal}
              </label>
              <input
                type="number"
                value={habit.goal}
                onChange={(e) => onChange({ ...habit, goal: e.target.value })}
                placeholder="30"
                className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                {text.unit}
              </label>
              <select
                value={habit.unit}
                onChange={(e) => onChange({ ...habit, unit: e.target.value })}
                className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
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
            <div className="grid grid-cols-5 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => onChange({ ...habit, icon })}
                  className={`p-3 rounded-lg text-xl transition ${
                    habit.icon === icon
                      ? 'bg-emerald-500/30 border border-emerald-500/50'
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
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            />
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 ${themeConfig.bgTertiary} ${themeConfig.textSecondary} rounded-lg hover:opacity-80 transition`}
            >
              {text.cancel}
            </button>
            <button
              onClick={onAdd}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition"
            >
              {text.addHabit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS for animations
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
