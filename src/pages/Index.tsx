
import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Calendar, ChartLine, Check, CircleCheck, Clock, Moon, Settings, Sun, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { getCurrentDate } from '@/utils/dateUtils';

// Categories for habits
type HabitCategory = 'fitness' | 'wellness' | 'productivity';

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  fitness: '#F97316',
  wellness: '#8B5CF6',
  productivity: '#10B981'
};

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  fitness: '🏋️ Fitness',
  wellness: '🧘 Wellness',
  productivity: '📈 Productivity'
};

// Sample data for habits and stats
const INITIAL_HABITS = [
  // Fitness habits
  { id: 1, name: 'Morning Run', icon: 'activity', target: 30, unit: 'minutes', current: 25, streak: 8, color: '#F97316', category: 'fitness' as HabitCategory },
  { id: 2, name: 'Strength Training', icon: 'activity', target: 45, unit: 'minutes', current: 45, streak: 12, color: '#EF4444', category: 'fitness' as HabitCategory },
  { id: 3, name: 'Steps', icon: 'activity', target: 10000, unit: 'steps', current: 7500, streak: 5, color: '#F59E0B', category: 'fitness' as HabitCategory },
  { id: 4, name: 'Stretching', icon: 'activity', target: 15, unit: 'minutes', current: 10, streak: 3, color: '#FB923C', category: 'fitness' as HabitCategory },
  
  // Wellness habits
  { id: 5, name: 'Water Intake', icon: 'droplet', target: 8, unit: 'glasses', current: 6, streak: 15, color: '#60A5FA', category: 'wellness' as HabitCategory },
  { id: 6, name: 'Sleep', icon: 'moon', target: 8, unit: 'hours', current: 7.5, streak: 20, color: '#8B5CF6', category: 'wellness' as HabitCategory },
  { id: 7, name: 'Meditation', icon: 'brain', target: 15, unit: 'minutes', current: 15, streak: 14, color: '#A855F7', category: 'wellness' as HabitCategory },
  { id: 8, name: 'Healthy Meals', icon: 'activity', target: 3, unit: 'meals', current: 2, streak: 7, color: '#22C55E', category: 'wellness' as HabitCategory },
  { id: 9, name: 'No Junk Food', icon: 'activity', target: 1, unit: 'day', current: 1, streak: 4, color: '#EC4899', category: 'wellness' as HabitCategory },
  
  // Productivity habits
  { id: 10, name: 'Deep Work', icon: 'activity', target: 4, unit: 'hours', current: 3, streak: 9, color: '#10B981', category: 'productivity' as HabitCategory },
  { id: 11, name: 'Reading', icon: 'book', target: 30, unit: 'minutes', current: 20, streak: 11, color: '#14B8A6', category: 'productivity' as HabitCategory },
  { id: 12, name: 'Learn New Skill', icon: 'activity', target: 1, unit: 'hour', current: 0.5, streak: 6, color: '#06B6D4', category: 'productivity' as HabitCategory },
  { id: 13, name: 'Journal', icon: 'activity', target: 1, unit: 'entry', current: 1, streak: 18, color: '#0EA5E9', category: 'productivity' as HabitCategory },
  { id: 14, name: 'No Social Media', icon: 'activity', target: 1, unit: 'day', current: 0, streak: 2, color: '#6366F1', category: 'productivity' as HabitCategory }
];

const WEEKLY_DATA = {
  'Water Intake': [
    { day: 'Mon', value: 7 },
    { day: 'Tue', value: 8 },
    { day: 'Wed', value: 6 },
    { day: 'Thu', value: 8 },
    { day: 'Fri', value: 5 },
    { day: 'Sat', value: 9 },
    { day: 'Sun', value: 6 }
  ],
  'Sleep': [
    { day: 'Mon', value: 7.5 },
    { day: 'Tue', value: 8 },
    { day: 'Wed', value: 6.5 },
    { day: 'Thu', value: 7 },
    { day: 'Fri', value: 8 },
    { day: 'Sat', value: 9 },
    { day: 'Sun', value: 8.5 }
  ],
  'Exercise': [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 30 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 60 },
    { day: 'Fri', value: 25 },
    { day: 'Sat', value: 40 },
    { day: 'Sun', value: 25 }
  ],
  'Reading': [
    { day: 'Mon', value: 30 },
    { day: 'Tue', value: 15 },
    { day: 'Wed', value: 20 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 25 },
    { day: 'Sat', value: 45 },
    { day: 'Sun', value: 15 }
  ],
  'Meditation': [
    { day: 'Mon', value: 10 },
    { day: 'Tue', value: 5 },
    { day: 'Wed', value: 10 },
    { day: 'Thu', value: 12 },
    { day: 'Fri', value: 10 },
    { day: 'Sat', value: 15 },
    { day: 'Sun', value: 10 }
  ]
};

const SCREEN_TIME_DATA = [
  { day: 'Mon', value: 4.2 },
  { day: 'Tue', value: 3.8 },
  { day: 'Wed', value: 5.1 },
  { day: 'Thu', value: 4.5 },
  { day: 'Fri', value: 6.2 },
  { day: 'Sat', value: 7.1 },
  { day: 'Sun', value: 5.8 }
];

// Habit type
type Habit = typeof INITIAL_HABITS[number];

// HabitCard Component
const HabitCard = ({ 
  habit, 
  theme, 
  onToggle, 
  onChange, 
  onSelect 
}: { 
  habit: Habit; 
  theme: string; 
  onToggle: (id: number) => void;
  onChange: (id: number, value: number) => void;
  onSelect: (id: number) => void;
}) => (
  <motion.div 
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.2 }}
    className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow`}
    onClick={() => onSelect(habit.id)}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center">
        <div 
          className="rounded-full p-2 mr-3" 
          style={{ backgroundColor: `${habit.color}${theme === 'dark' ? '20' : '15'}` }}
        >
          <Activity className="h-5 w-5" style={{ color: habit.color }} />
        </div>
        <div>
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{habit.name}</h3>
          <div className="flex items-center mt-0.5 gap-2">
            <div className={`${
              theme === 'dark' 
                ? 'bg-blue-900/30 text-blue-300' 
                : 'bg-blue-50 text-blue-800'
            } text-xs px-2 py-0.5 rounded`}>
              {habit.streak} day streak
            </div>
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${CATEGORY_COLORS[habit.category]}15`,
                color: CATEGORY_COLORS[habit.category]
              }}
            >
              {habit.category}
            </span>
          </div>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(habit.id); }}
        className={`rounded-full p-1.5 transition-colors ${
          habit.current >= habit.target
            ? theme === 'dark'
              ? 'bg-green-900/50 text-green-300 hover:bg-green-900/80'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
            : theme === 'dark'
              ? 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
    
    <div className="mt-4 mb-1 flex justify-between items-center text-sm">
      <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Progress</span>
      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        {habit.current} / {habit.target} {habit.unit}
      </span>
    </div>
    
    <div className={`relative h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
      <motion.div 
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min(100, (habit.current / habit.target) * 100)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute h-full rounded-full"
        style={{ backgroundColor: habit.color }}
      />
    </div>
    
    <div className="mt-4" onClick={e => e.stopPropagation()}>
      <input
        type="range"
        min="0"
        max={habit.target * 1.5}
        step={habit.unit === 'hours' || habit.unit === 'hour' ? 0.5 : 1}
        value={habit.current}
        onChange={e => onChange(habit.id, parseFloat(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 ${
          theme === 'dark' 
            ? 'bg-slate-700' 
            : 'bg-gray-100'
        }`}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className={theme === 'dark' ? 'text-gray-400' : ''}>0</span>
        <span className={theme === 'dark' ? 'text-gray-400' : ''}>Target: {habit.target}</span>
      </div>
    </div>
  </motion.div>
);

// Main Index Component
const Index = () => {
  // States
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', target: 1, unit: '', category: 'wellness' as HabitCategory });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const { theme, toggleTheme } = useTheme();
  
  // Update date at midnight
  useEffect(() => {
    // Update the date initially
    setCurrentDate(getCurrentDate());
    
    // Set up interval to check if day changes
    const intervalId = setInterval(() => {
      const newDate = getCurrentDate();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [currentDate]);
  
  // Calculate total stats
  const totalCompletionRate = Math.round(
    habits.reduce((acc, habit) => acc + (habit.current / habit.target) * 100, 0) / habits.length
  );
  
  const averageStreak = Math.round(
    habits.reduce((acc, habit) => acc + habit.streak, 0) / habits.length
  );

  // Display toast message
  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle habit value change
  const handleHabitValueChange = (id: number, value: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, current: value } : habit
    ));
  };

  // Add new habit
  const handleAddHabit = () => {
    if (newHabit.name && newHabit.target && newHabit.unit) {
      const newHabitObj = {
        id: habits.length + 1,
        name: newHabit.name,
        icon: 'activity',
        target: newHabit.target,
        unit: newHabit.unit,
        current: 0,
        streak: 0,
        color: CATEGORY_COLORS[newHabit.category],
        category: newHabit.category
      };
      
      setHabits([...habits, newHabitObj]);
      setNewHabit({ name: '', target: 1, unit: '', category: 'wellness' });
      setShowNewHabitForm(false);
      displayToast(`New habit "${newHabit.name}" added successfully!`);
    }
  };

  // Get filtered habits by category
  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(h => h.category === selectedCategory);

  // Group habits by category
  const habitsByCategory = habits.reduce((acc, habit) => {
    if (!acc[habit.category]) acc[habit.category] = [];
    acc[habit.category].push(habit);
    return acc;
  }, {} as Record<HabitCategory, typeof habits>);

  // Delete a habit
  const handleDeleteHabit = (id: number) => {
    const habitToDelete = habits.find(h => h.id === id);
    if (habitToDelete) {
      setHabits(habits.filter(habit => habit.id !== id));
      displayToast(`Habit "${habitToDelete.name}" has been deleted.`);
    }
  };

  // Toggle complete status for a habit
  const toggleComplete = (id: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isComplete = habit.current >= habit.target;
        const newStreak = isComplete ? habit.streak + 1 : habit.streak;
        return { 
          ...habit, 
          current: isComplete ? 0 : habit.target,
          streak: isComplete ? habit.streak : Math.max(0, habit.streak - 1) 
        };
      }
      return habit;
    }));
  };

  // Reset all habits for new day
  const resetAllHabits = () => {
    setHabits(habits.map(habit => ({
      ...habit,
      current: 0
    })));
    displayToast("All habits reset for a new day!");
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-gray-800'}`}>
      {/* Navigation */}
      <nav className={`${theme === 'dark' ? 'bg-slate-800 shadow-slate-700/20' : 'bg-white shadow-sm'} px-4 py-3 flex justify-between items-center sticky top-0 z-10`}>
        <div className="flex items-center space-x-2">
          <Activity className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>PersonalPulse</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className={`rounded-full p-2 ${
              theme === 'dark' 
                ? 'hover:bg-slate-700 text-yellow-300' 
                : 'hover:bg-gray-100 text-slate-600'
            } transition-colors`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className={`rounded-full p-2 ${
              theme === 'dark' 
                ? 'hover:bg-slate-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            JP
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className={`flex border-b mb-6 ${theme === 'dark' ? 'border-slate-700' : ''}`}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard' 
                ? theme === 'dark'
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-blue-600 border-b-2 border-blue-600'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('habits')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'habits' 
                ? theme === 'dark'
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-blue-600 border-b-2 border-blue-600'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Habits
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'stats' 
                ? theme === 'dark'
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-blue-600 border-b-2 border-blue-600'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row gap-6 mb-8"
            >
              {/* Welcome Card */}
              <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6 flex-1`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Welcome back!</h2>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{currentDate}</p>
                  </div>
                  <button 
                    onClick={resetAllHabits}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    } text-sm font-medium px-3 py-1 rounded-md transition-colors`}
                  >
                    Reset Day
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className={`${theme === 'dark' ? 'bg-slate-700/50' : 'bg-blue-50'} rounded-lg p-4`}>
                    <div className="flex items-center">
                      <div className={`rounded-full ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'} p-2 mr-3`}>
                        <TrendingUp className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Completion Rate</p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{totalCompletionRate}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-4`}>
                    <div className="flex items-center">
                      <div className={`rounded-full ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'} p-2 mr-3`}>
                        <Activity className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg. Streak</p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{averageStreak} days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Screen Time Card */}
              <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6 flex-1`}>
                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center`}>
                  <Clock className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  Screen Time
                </h2>
                <div className="h-[180px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SCREEN_TIME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} stroke={theme === 'dark' ? '#4B5563' : '#E5E7EB'} />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                        stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                        stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} hrs`, 'Screen Time']} 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                          color: theme === 'dark' ? '#E5E7EB' : '#111827'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={theme === 'dark' ? '#A78BFA' : '#8B5CF6'} 
                        strokeWidth={2}
                        dot={{ r: 4, fill: theme === 'dark' ? '#A78BFA' : '#8B5CF6', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: theme === 'dark' ? '#A78BFA' : '#8B5CF6', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Daily average</p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>5.2 hrs</p>
                  </div>
                  <div className="flex items-center text-orange-500 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+12% this week</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Today's Habits with Category Filter */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Today's Habits</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      selectedCategory === 'all'
                        ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                        : theme === 'dark' ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {(['fitness', 'wellness', 'productivity'] as HabitCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        selectedCategory === cat
                          ? 'text-white'
                          : theme === 'dark' ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={selectedCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                  <button 
                    onClick={() => setShowNewHabitForm(true)}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-md px-3 py-1.5 text-xs font-medium transition-colors`}
                  >
                    + Add New
                  </button>
                </div>
              </div>
              
              {selectedCategory === 'all' ? (
                // Show habits grouped by category
                <div className="space-y-6">
                  {(['fitness', 'wellness', 'productivity'] as HabitCategory[]).map(category => (
                    habitsByCategory[category]?.length > 0 && (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[category] }}
                          />
                          <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {CATEGORY_LABELS[category]}
                          </h3>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            ({habitsByCategory[category].length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {habitsByCategory[category].map(habit => (
                            <HabitCard 
                              key={habit.id}
                              habit={habit}
                              theme={theme}
                              onToggle={toggleComplete}
                              onChange={handleHabitValueChange}
                              onSelect={setSelectedHabit}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                // Show filtered habits
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHabits.map(habit => (
                    <HabitCard 
                      key={habit.id}
                      habit={habit}
                      theme={theme}
                      onToggle={toggleComplete}
                      onChange={handleHabitValueChange}
                      onSelect={setSelectedHabit}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Manage Your Habits</h2>
              <button 
                onClick={() => setShowNewHabitForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center"
              >
                <span className="mr-1">+</span> Add Habit
              </button>
            </div>
            
            <div className="space-y-4">
              {habits.map(habit => (
                <motion.div 
                  key={habit.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm p-5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div 
                        className="rounded-full p-3 mr-4" 
                        style={{ backgroundColor: `${habit.color}15` }}
                      >
                        <Activity className="h-6 w-6" style={{ color: habit.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{habit.name}</h3>
                        <p className="text-gray-600">Target: {habit.target} {habit.unit} daily</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedHabit(habit.id)}
                        className="rounded-md p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <ChartLine className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="rounded-md p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1 items-center">
                        <span className="text-sm text-gray-600">Current streak</span>
                        <span className="text-sm font-medium">{habit.streak} days</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(habit.streak / 30) * 100}%`,
                            backgroundColor: habit.color 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-6 pl-6 border-l">
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold">{Math.round((habit.current / habit.target) * 100)}%</span>
                        <span className="text-sm text-gray-600 ml-1">today</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Statistics</h2>
            
            {habits.map(habit => (
              <div key={habit.id} className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">{habit.name}</h3>
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-1">Weekly average:</span>
                    <span className="text-gray-600">
                      {Math.round(WEEKLY_DATA[habit.name as keyof typeof WEEKLY_DATA].reduce((acc, day) => acc + day.value, 0) / 7 * 10) / 10} {habit.unit}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-4 h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WEEKLY_DATA[habit.name as keyof typeof WEEKLY_DATA]} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value} ${habit.unit}`, habit.name]} />
                      <Bar dataKey="value" fill={habit.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-t py-6 mt-auto`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Activity className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>PersonalPulse</span>
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              © {new Date().getFullYear()} PersonalPulse. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl max-w-md w-full mx-4 p-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">User Profile</h3>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg mr-4">
                      JP
                    </div>
                    <div>
                      <p className="font-medium">John Programmer</p>
                      <p className="text-sm text-gray-600">john@example.com</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Daily Reminders</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Weekly Reports</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Achievement Alerts</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Theme</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm bg-white">Light</button>
                    <button className="border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm">Dark</button>
                    <button className="border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors flex items-center justify-center text-sm">System</button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Habit Detail Modal */}
      <AnimatePresence>
        {selectedHabit !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl max-w-md w-full mx-4 p-6 shadow-lg"
            >
              {(() => {
                const habit = habits.find(h => h.id === selectedHabit);
                if (!habit) return null;
                
                return (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">{habit.name} Details</h2>
                      <button 
                        onClick={() => setSelectedHabit(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Weekly Progress</h3>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={WEEKLY_DATA[habit.name as keyof typeof WEEKLY_DATA]} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value) => [`${value} ${habit.unit}`, habit.name]} />
                            <Bar dataKey="value" fill={habit.color} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current streak</span>
                          <span className="font-medium">{habit.streak} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Today's progress</span>
                          <span className="font-medium">{habit.current} / {habit.target} {habit.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weekly average</span>
                          <span className="font-medium">
                            {Math.round(WEEKLY_DATA[habit.name as keyof typeof WEEKLY_DATA].reduce((acc, day) => acc + day.value, 0) / 7 * 10) / 10} {habit.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weekly completion</span>
                          <span className="font-medium">
                            {WEEKLY_DATA[habit.name as keyof typeof WEEKLY_DATA].filter(day => day.value >= habit.target).length}/7 days
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        onClick={() => {
                          handleHabitValueChange(
                            habit.id, 
                            habit.current >= habit.target ? 0 : habit.target
                          );
                          setSelectedHabit(null);
                        }}
                        className={`w-full py-2 rounded-md font-medium transition-colors ${
                          habit.current >= habit.target
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {habit.current >= habit.target ? 'Mark as Incomplete' : 'Mark as Complete'}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Habit Modal */}
      <AnimatePresence>
        {showNewHabitForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl max-w-md w-full mx-4 p-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Add New Habit</h2>
                <button 
                  onClick={() => setShowNewHabitForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Drink Water"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Target
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newHabit.target}
                      onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={newHabit.unit}
                      onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="glasses"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowNewHabitForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors mr-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddHabit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  disabled={!newHabit.name || !newHabit.target || !newHabit.unit}
                >
                  Add Habit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-3 flex items-center z-50"
          >
            <CircleCheck className="h-5 w-5 text-green-500 mr-2" />
            <p>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
