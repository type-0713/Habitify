'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Check, Plus, Flame, TrendingUp, Menu, LogOut, Home, ListTodo, BarChart3, Settings, Bell, User, Calendar, Clock, Edit2, Save, X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';

// Types
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
  password: string;
  avatar: string;
  bio: string;
  joinDate: string;
  theme: 'dark' | 'light';
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
}

// Theme Configuration
const themes = {
  dark: {
    bg: 'bg-slate-950',
    bgSecondary: 'bg-slate-900',
    bgTertiary: 'bg-slate-800',
    border: 'border-slate-700',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    card: 'bg-slate-800/50',
    input: 'bg-slate-700/50 border-slate-600',
    hover: 'hover:bg-slate-700/50',
    gradient: 'from-blue-600 to-purple-700',
  },
  light: {
    bg: 'bg-white',
    bgSecondary: 'bg-slate-50',
    bgTertiary: 'bg-slate-100',
    border: 'border-slate-200',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    card: 'bg-white shadow-lg',
    input: 'bg-slate-50 border-slate-300',
    hover: 'hover:bg-slate-100',
    gradient: 'from-blue-500 to-purple-600',
  },
};

// Utility Functions
const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const setLocalStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getWeekDates = () => {
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  return weekDates;
};

const getStreak = (habit: Habit): number => {
  let streak = 0;
  let checkDate = new Date();
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
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
    'from-green-400 to-green-600',
    'from-blue-400 to-blue-600',
    'from-red-400 to-red-600',
    'from-cyan-400 to-cyan-600',
    'from-purple-400 to-purple-600',
    'from-yellow-400 to-yellow-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Main App Component
export default function HabitTrackerApp() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
  });

  const [currentPage, setCurrentPage] = useState<'dashboard' | 'habits' | 'calendar' | 'stats' | 'profile'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [newHabit, setNewHabit] = useState({
    name: '',
    goal: '',
    unit: 'min',
    icon: '⭐',
    category: 'health',
    reminderTime: '09:00',
  });

  const themeConfig = themes[theme];

  // Load data on mount
  useEffect(() => {
    const savedTheme = getLocalStorage('theme', 'dark');
    setTheme(savedTheme);

    const savedAuth = getLocalStorage('auth_state');
    if (savedAuth && savedAuth.isLoggedIn) {
      setAuthState(savedAuth);
      const savedHabits = getLocalStorage(`habits_${savedAuth.user.id}`, []);
      setHabits(savedHabits);
    }
  }, []);

  // Save theme
  useEffect(() => {
    setLocalStorage('theme', theme);
  }, [theme]);

  // Save auth state
  useEffect(() => {
    if (authState.isLoggedIn) {
      setLocalStorage('auth_state', authState);
    }
  }, [authState]);

  // Save habits
  useEffect(() => {
    if (authState.isLoggedIn && authState.user) {
      setLocalStorage(`habits_${authState.user.id}`, habits);
    }
  }, [habits, authState.isLoggedIn, authState.user]);

  // Login Handler
  const handleLogin = (email: string, password: string) => {
    const allUsers = getLocalStorage('all_users', []);
    const existingUser = allUsers.find((u: UserProfile) => u.email === email && u.password === password);

    if (existingUser) {
      setAuthState({
        isLoggedIn: true,
        user: existingUser,
      });
      const userHabits = getLocalStorage(`habits_${existingUser.id}`, []);
      setHabits(userHabits);
    } else {
      alert('Invalid email or password!');
    }
  };

  // Sign Up Handler
  const handleSignUp = (name: string, email: string, password: string) => {
    const allUsers = getLocalStorage('all_users', []);
    if (allUsers.some((u: UserProfile) => u.email === email)) {
      alert('Email already registered!');
      return;
    }

    const newUser: UserProfile = {
      id: Date.now().toString(),
      name,
      email,
      password,
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

  // Logout Handler
  const handleLogout = () => {
    setAuthState({
      isLoggedIn: false,
      user: null,
    });
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

      setHabits([...habits, habit]);
      setNewHabit({
        name: '',
        goal: '',
        unit: 'min',
        icon: '⭐',
        category: 'health',
        reminderTime: '09:00',
      });
      setShowAddHabit(false);
    }
  };

  // Update Habit Completion
  const handleUpdateHabitCompletion = (habitId: string, date: string, current: number, time?: string) => {
    setHabits(habits.map(h => {
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
    setHabits(habits.map(h => {
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
    setHabits(habits.filter(h => h.id !== habitId));
  };

  // Update Profile
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      setAuthState({ ...authState, user: updatedUser });
      
      const allUsers = getLocalStorage('all_users', []);
      const userIndex = allUsers.findIndex((u: UserProfile) => u.id === updatedUser.id);
      if (userIndex >= 0) {
        allUsers[userIndex] = updatedUser;
        setLocalStorage('all_users', allUsers);
      }
    }
  };

  // Calculate metrics
  const calculateMetrics = (date: string = getTodayDate()) => {
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

  if (!authState.isLoggedIn) {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} theme={theme} />;
  }

  return (
    <div className={`flex h-screen ${themeConfig.bg} ${themeConfig.text} overflow-hidden`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        user={authState.user!}
        habitsCount={habits.length}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Header
          user={authState.user!}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          metrics={calculateMetrics()}
          theme={theme}
        />

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
            />
          )}

          {currentPage === 'habits' && (
            <HabitsPage
              habits={habits}
              selectedDate={getTodayDate()}
              onToggleHabit={toggleHabitCompletion}
              onUpdateProgress={handleUpdateHabitCompletion}
              onAddHabit={() => setShowAddHabit(true)}
              onDeleteHabit={deleteHabit}
              theme={theme}
              themeConfig={themeConfig}
            />
          )}

          {currentPage === 'calendar' && (
            <CalendarPage
              habits={habits}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
              theme={theme}
              themeConfig={themeConfig}
            />
          )}

          {currentPage === 'stats' && (
            <StatsPage habits={habits} metrics={calculateMetrics()} theme={theme} themeConfig={themeConfig} />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              user={authState.user!}
              habits={habits}
              onUpdate={updateProfile}
              theme={theme}
              themeConfig={themeConfig}
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
        />
      )}
    </div>
  );
}

// Auth Page Component
function AuthPage({ onLogin, onSignUp, theme }: { onLogin: (email: string, password: string) => void; onSignUp: (name: string, email: string, password: string) => void; theme: 'dark' | 'light' }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const themeConfig = themes[theme];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (name && email && password) {
        onSignUp(name, email, password);
      } else {
        alert('Please fill all fields!');
      }
    } else {
      if (email && password) {
        onLogin(email, password);
      } else {
        alert('Please fill all fields!');
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-4xl font-bold ${themeConfig.text} mb-2`}>Habitify</h1>
          <p className={`${themeConfig.textSecondary} text-lg`}>Build better habits, transform your life</p>
        </div>

        {/* Auth Card */}
        <div className={`${themeConfig.card} backdrop-blur-xl rounded-3xl p-8 border ${themeConfig.border}`}>
          <h2 className={`text-2xl font-bold ${themeConfig.text} mb-6`}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 ${themeConfig.input} rounded-lg ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 ${themeConfig.input} rounded-lg ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 ${themeConfig.input} rounded-lg ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 mt-6"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`${themeConfig.textSecondary} text-sm`}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-blue-500 hover:text-blue-600 font-medium transition"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          {!isSignUp && (
            <div className={`mt-6 pt-6 border-t ${themeConfig.border}`}>
              <p className={`${themeConfig.textSecondary} text-xs mb-3`}>Demo Credentials:</p>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('javohir@gmail.com');
                    setPassword('demo123');
                  }}
                  className={`w-full text-left px-3 py-2 ${themeConfig.bgTertiary} hover:opacity-80 rounded text-sm transition`}
                >
                  📧 javohir@gmail.com / demo123
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('john@example.com');
                    setPassword('demo123');
                  }}
                  className={`w-full text-left px-3 py-2 ${themeConfig.bgTertiary} hover:opacity-80 rounded text-sm transition`}
                >
                  📧 john@example.com / demo123
                </button>
              </div>
              <p className={`${themeConfig.textSecondary} text-xs mt-2 opacity-70`}>Click to fill, then sign in</p>
            </div>
          )}

          {/* Auto-create Demo Accounts */}
          {!isSignUp && (
            <button
              type="button"
              onClick={() => {
                const allUsers = getLocalStorage('all_users', []);
                if (!allUsers.some((u: UserProfile) => u.email === 'javohir@gmail.com')) {
                  const demoUsers = [
                    {
                      id: '1',
                      name: 'Javohir',
                      email: 'javohir@gmail.com',
                      password: 'demo123',
                      avatar: '👤',
                      bio: 'Building better habits daily!',
                      joinDate: getTodayDate(),
                      theme: 'dark' as const,
                    },
                    {
                      id: '2',
                      name: 'John',
                      email: 'john@example.com',
                      password: 'demo123',
                      avatar: '👤',
                      bio: 'Habit tracking enthusiast!',
                      joinDate: getTodayDate(),
                      theme: 'dark' as const,
                    },
                  ];
                  setLocalStorage('all_users', demoUsers);
                  alert('Demo accounts created! Now you can sign in.');
                }
              }}
              className="w-full mt-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition"
            >
              ✨ Create Demo Accounts
            </button>
          )}
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
}: {
  isOpen: boolean;
  currentPage: string;
  onPageChange: (page: any) => void;
  onLogout: () => void;
  user: UserProfile;
  habitsCount: number;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}) {
  const themeConfig = themes[theme];
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'habits', label: 'Habits', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white shadow-xl border-slate-200'} backdrop-blur-xl border-r transition-all duration-300 flex flex-col overflow-y-auto hidden md:flex`}
    >
      {/* Logo */}
      <div className={`p-6 border-b ${themeConfig.border}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <Check className="w-6 h-6 text-white" />
          </div>
          {isOpen && <h1 className={`text-xl font-bold ${themeConfig.text}`}>Habitify</h1>}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentPage === item.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : `${themeConfig.textSecondary} ${themeConfig.hover}`
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            {isOpen && item.id === 'habits' && habitsCount > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
          {isOpen && <span className="text-xs font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
        </button>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-t ${themeConfig.border} space-y-4`}>
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl shadow-lg">
            {user.avatar}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${themeConfig.text} truncate`}>{user.name}</p>
              <p className={`text-xs ${themeConfig.textSecondary} truncate`}>{user.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {isOpen && 'Logout'}
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
}: {
  user: UserProfile;
  onMenuClick: () => void;
  metrics: any;
  theme: 'dark' | 'light';
}) {
  const themeConfig = themes[theme];

  return (
    <header className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white shadow-md border-slate-200'} backdrop-blur-xl border-b sticky top-0 z-40`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className={`md:hidden p-2 rounded-lg transition ${themeConfig.hover}`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className={`text-xl font-bold ${themeConfig.text}`}>
              Good morning, {user.name}! 👋
            </h2>
            <p className={`${themeConfig.textSecondary} text-sm`}>
              {metrics.completedToday} / {metrics.totalHabits} habits completed today
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className={`relative p-2 rounded-lg transition ${themeConfig.hover}`}>
            <Bell className="w-6 h-6" />
            {metrics.completedToday > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-lg shadow-lg">
            {user.avatar}
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
}: any) {
  const weekDates = getWeekDates();

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Progress Card */}
        <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
          <h3 className={`${themeConfig.textSecondary} text-sm font-medium mb-4`}>Today's Progress</h3>
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
                  <p className={`${themeConfig.textSecondary} text-xs`}>Complete</p>
                </div>
              </div>
            </div>
            <div>
              <p className={`${themeConfig.text} font-semibold text-lg`}>{metrics.completedToday}/{metrics.totalHabits}</p>
              <p className={`${themeConfig.textSecondary} text-sm`}>Habits completed</p>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className={`${theme === 'dark' ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'} ${themeConfig.card} rounded-2xl p-6 border shadow-lg`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`${themeConfig.textSecondary} text-sm font-medium mb-2`}>Current Streak</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>{metrics.currentStreak}</p>
                <p className={`${themeConfig.textSecondary} text-sm`}>days</p>
              </div>
              <p className={`${themeConfig.textSecondary} text-xs mt-2`}>Best: {metrics.bestStreak} days</p>
            </div>
            <Flame className={`w-12 h-12 ${theme === 'dark' ? 'text-orange-500/60' : 'text-orange-400/60'}`} />
          </div>
        </div>

        {/* Total Habits Card */}
        <div className={`${theme === 'dark' ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200'} ${themeConfig.card} rounded-2xl p-6 border shadow-lg`}>
          <p className={`${themeConfig.textSecondary} text-sm font-medium mb-4`}>Total Habits</p>
          <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{metrics.totalHabits}</p>
          <p className={`${themeConfig.textSecondary} text-xs mt-2`}>Active habits</p>
        </div>

        {/* Add Habit Card */}
        <div className={`${theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} ${themeConfig.card} rounded-2xl p-6 border flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition shadow-lg`}>
          <button
            onClick={onAddHabit}
            className="flex flex-col items-center gap-2 text-center"
          >
            <Plus className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Add New Habit</span>
          </button>
        </div>
      </div>

      {/* Today's Habits */}
      <div>
        <h3 className={`text-2xl font-bold ${themeConfig.text} mb-6`}>Today's Habits</h3>
        {habits.length === 0 ? (
          <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg`}>
            <Plus className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
            <p className={`${themeConfig.textSecondary} mb-4`}>No habits yet. Create your first habit to get started!</p>
            <button
              onClick={onAddHabit}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
            >
              Create First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit: Habit) => {
              const completion = habit.completions.find(c => c.date === selectedDate);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  date={selectedDate}
                  completion={completion}
                  onToggle={onToggleHabit}
                  onUpdate={onUpdateProgress}
                  onDelete={onDeleteHabit}
                  theme={theme}
                  themeConfig={themeConfig}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Week Overview Chart */}
      {habits.length > 0 && (
        <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
          <h3 className={`${themeConfig.text} font-bold mb-6`}>This Week Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weekDates.map((date: string) => ({
                day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
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
        </div>
      )}
    </div>
  );
}

// Habits Page
function HabitsPage({
  habits,
  selectedDate,
  onToggleHabit,
  onUpdateProgress,
  onAddHabit,
  onDeleteHabit,
  theme,
  themeConfig,
}: any) {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-3xl font-bold ${themeConfig.text}`}>All Habits</h2>
        <button
          onClick={onAddHabit}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className={`${themeConfig.card} rounded-2xl p-12 border ${themeConfig.border} text-center shadow-lg`}>
          <ListTodo className={`w-12 h-12 ${themeConfig.textSecondary} mx-auto mb-4 opacity-50`} />
          <p className={`${themeConfig.textSecondary} mb-4`}>No habits created yet. Start building better habits today!</p>
          <button
            onClick={onAddHabit}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit: Habit) => {
            const completion = habit.completions.find(c => c.date === selectedDate);
            return (
              <div
                key={habit.id}
                className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.border} hover:border-blue-500/50 transition shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{habit.icon}</span>
                    <div>
                      <h3 className={`${themeConfig.text} font-semibold`}>{habit.name}</h3>
                      <p className={`${themeConfig.textSecondary} text-xs`}>Category: {habit.category}</p>
                      <p className={`${themeConfig.textSecondary} text-xs`}>
                        Goal: {habit.goal} {habit.unit}
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
                    {completion?.current || 0} / {habit.goal} {habit.unit}
                  </p>
                </div>

                <div className={`mt-4 pt-4 border-t ${themeConfig.border} flex items-center justify-between text-xs`}>
                  <span className={themeConfig.textSecondary}>Streak: {getStreak(habit)} days</span>
                  <span className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>Best: {getBestStreak(habit)} days</span>
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
}: any) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
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
    return new Date(year, month, day).toISOString().split('T')[0];
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
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => onMonthChange(new Date(year, month - 1))}
              className={`p-2 rounded-lg transition ${themeConfig.hover}`}
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
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className={`text-center ${themeConfig.textSecondary} text-xs font-semibold py-2`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
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
                className={`p-3 rounded-lg text-center transition relative ${
                  isSelected
                    ? 'bg-blue-500/30 border border-blue-500/50'
                    : isToday
                    ? theme === 'dark' ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100 border border-green-300'
                    : `${themeConfig.bgTertiary} border ${themeConfig.border} ${themeConfig.hover}`
                }`}
              >
                <div className={`${themeConfig.text} font-semibold text-sm`}>{day}</div>
                {completionRate > 0 && (
                  <div className={`text-xs ${themeConfig.textSecondary} mt-1`}>{completionRate}%</div>
                )}
                {completionRate === 100 && (
                  <div className="text-lg absolute -top-1 -right-1">✓</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
        <h3 className={`${themeConfig.text} font-bold mb-4`}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
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
                  {completion?.current || 0} / {habit.goal} {habit.unit}
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
function StatsPage({ habits, metrics, theme, themeConfig }: any) {
  const getMonthData = () => {
    const today = new Date();
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completed = habits.filter(h => h.completions.find(c => c.date === dateStr && c.completed)).length;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
      });
    }
    return data;
  };

  return (
    <div className="max-w-6xl space-y-8">
      <h2 className={`text-3xl font-bold ${themeConfig.text}`}>Statistics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Habits', value: metrics.totalHabits, color: 'blue' },
          { label: 'Completed Today', value: metrics.completedToday, color: 'green' },
          { label: 'Current Streak', value: `${metrics.currentStreak} days`, color: 'orange' },
          { label: 'Best Streak', value: `${metrics.bestStreak} days`, color: 'purple' },
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
          <h3 className={`${themeConfig.text} font-bold mb-6`}>30-Day Trend</h3>
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
        </div>

        {/* Habit Distribution */}
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <h3 className={`${themeConfig.text} font-bold mb-6`}>Habit Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Completed', value: habits.filter(h => getStreak(h) > 0).length },
                  { name: 'Active', value: habits.filter(h => getStreak(h) === 0).length },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#3b82f6" />
                <Cell fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit Details */}
      <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
        <h3 className={`${themeConfig.text} font-bold mb-6`}>Habits Performance</h3>
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
                      <span>Streak: {streak} days</span>
                      <span>Best: {bestStreak} days</span>
                      <span>Completion: {completionRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-500">{completionRate}%</p>
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
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const totalCompleted = habits.reduce(
    (sum: number, h: Habit) => sum + h.completions.filter(c => c.completed).length,
    0
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Card */}
      <div className={`${themeConfig.card} rounded-2xl p-8 border ${themeConfig.border} shadow-lg`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
              {user.avatar}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className={`text-2xl font-bold ${themeConfig.text} bg-opacity-50 ${themeConfig.bgTertiary} px-2 py-1 rounded mb-2`}
                />
              ) : (
                <h2 className={`text-2xl font-bold ${themeConfig.text}`}>{user.name}</h2>
              )}
              <p className={themeConfig.textSecondary}>{user.email}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Joined {formatDate(user.joinDate)}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2">
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
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg transition"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className={`block text-sm ${themeConfig.textSecondary} mb-2`}>Bio</label>
          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>Total Habits</p>
          <p className={`text-3xl font-bold ${themeConfig.text}`}>{habits.length}</p>
        </div>
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>Total Completed</p>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{totalCompleted}</p>
        </div>
        <div className={`${themeConfig.card} rounded-xl p-6 border ${themeConfig.border} shadow-lg`}>
          <p className={`${themeConfig.textSecondary} text-sm mb-2`}>Account Age</p>
          <p className={`text-3xl font-bold text-blue-500`}>
            {Math.floor((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
            <span className="text-sm ml-1">days</span>
          </p>
        </div>
      </div>

      {/* Recent Habits */}
      <div className={`${themeConfig.card} rounded-2xl p-6 border ${themeConfig.border} shadow-lg`}>
        <h3 className={`${themeConfig.text} font-bold mb-4`}>Your Habits</h3>
        <div className="space-y-2">
          {habits.length === 0 ? (
            <p className={themeConfig.textSecondary}>No habits yet</p>
          ) : (
            habits.map((habit: Habit) => (
              <div key={habit.id} className={`flex items-center justify-between p-3 ${themeConfig.bgTertiary} rounded-lg`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.icon}</span>
                  <span className={themeConfig.text}>{habit.name}</span>
                </div>
                <div className={`text-sm ${themeConfig.textSecondary}`}>
                  {habit.completions.filter(c => c.completed).length} completed
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
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(completion?.current || 0);
  const [time, setTime] = useState(completion?.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  const percentage = Math.min((currentValue / habit.goal) * 100, 100);

  return (
    <div className={`${themeConfig.card} rounded-xl p-4 border ${themeConfig.border} flex items-center justify-between hover:border-blue-500/50 transition shadow-lg`}>
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => onToggle(habit.id, date)}
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition ${
            completion?.completed
              ? 'bg-green-500/20 text-green-500'
              : `${themeConfig.bgTertiary} ${themeConfig.textSecondary} hover:bg-blue-500/20`
          }`}
        >
          {completion?.completed && <Check className="w-6 h-6" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{habit.icon}</span>
            <h4 className={`${themeConfig.text} font-semibold`}>{habit.name}</h4>
          </div>
          <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'} rounded-full overflow-hidden max-w-xs`}>
            <div
              className={`h-full bg-gradient-to-r ${habit.color} transition-all`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className={`${themeConfig.textSecondary} text-xs mt-1`}>
            {currentValue} / {habit.goal} {habit.unit}
            {completion?.time && ` · ${completion.time}`}
          </p>
        </div>
      </div>

      {/* Edit Progress */}
      {isEditing ? (
        <div className="flex gap-2 ml-4">
          <input
            type="number"
            min="0"
            max={habit.goal}
            value={currentValue}
            onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
            className={`w-16 px-2 py-1 ${themeConfig.input} ${themeConfig.text} rounded text-sm`}
          />
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
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className={`p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-500`}
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
}: any) {
  const icons = ['💻', '📚', '💪', '💧', '🌙', '🧘', '🏃', '🍎', '🎯', '⭐'];
  const categories = ['health', 'productivity', 'learning', 'fitness', 'wellness', 'finance', 'hobbies'];
  const units = ['min', 'hours', 'reps', 'km', 'liters', 'count', 'pages'];

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-sm flex items-center justify-center p-4 z-50`}>
      <div className={`${themeConfig.card} rounded-2xl p-8 max-w-md w-full border ${themeConfig.border} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <h2 className={`text-2xl font-bold ${themeConfig.text} mb-6`}>Add New Habit</h2>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              Habit Name
            </label>
            <input
              type="text"
              value={habit.name}
              onChange={(e) => onChange({ ...habit, name: e.target.value })}
              placeholder="e.g., Morning Meditation"
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              Category
            </label>
            <select
              value={habit.category}
              onChange={(e) => onChange({ ...habit, category: e.target.value })}
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                Goal
              </label>
              <input
                type="number"
                value={habit.goal}
                onChange={(e) => onChange({ ...habit, goal: e.target.value })}
                placeholder="30"
                className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
                Unit
              </label>
              <select
                value={habit.unit}
                onChange={(e) => onChange({ ...habit, unit: e.target.value })}
                className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeConfig.textSecondary} mb-2`}>
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => onChange({ ...habit, icon })}
                  className={`p-3 rounded-lg text-xl transition ${
                    habit.icon === icon
                      ? 'bg-blue-500/30 border border-blue-500/50'
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
              Reminder Time (Optional)
            </label>
            <input
              type="time"
              value={habit.reminderTime}
              onChange={(e) => onChange({ ...habit, reminderTime: e.target.value })}
              className={`w-full px-4 py-2 ${themeConfig.input} rounded-lg ${themeConfig.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 ${themeConfig.bgTertiary} ${themeConfig.textSecondary} rounded-lg hover:opacity-80 transition`}
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
            >
              Add Habit
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