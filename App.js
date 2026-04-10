import React, { useContext, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LayoutDashboard, CalendarDays, ChartBarBig, NotebookPen, PlusCircle } from 'lucide-react-native';

// ── Shared ──────────────────────────────────────────────────────────────────
import ErrorBoundary from './shared/components/ErrorBoundary';
import LoadingScreen from './shared/components/LoadingScreen';
import { useTheme, ThemeProvider } from './shared/utils/theme';
import { DailyResetProvider } from './shared/context/DailyResetContext';
import { runMigrations } from './shared/utils/dataMigration';

// ── Feature Contexts ─────────────────────────────────────────────────────────
import { TaskProvider, TaskContext } from './features/tasks/context/TaskContext';
import { HabitProvider, HabitContext } from './features/habits/context/HabitContext';
import { SkillProvider, SkillContext } from './features/skills/context/SkillContext';
import { PlannerProvider, PlannerContext } from './features/planner/context/PlannerContext';
import { JournalProvider, JournalContext } from './features/journal/context/JournalContext';
import { SettingsProvider, SettingsContext } from './features/settings/context/SettingsContext';

// ── Tab Screens ───────────────────────────────────────────────────────────────
import DashboardScreen from './features/dashboard/screens/DashboardScreen';
import PlannerScreen from './features/planner/screens/PlannerScreen';
import AddScreen from './features/add/screens/AddScreen';
import AnalyticsScreen from './features/insights/screens/AnalyticsScreen';
import JournalScreen from './features/journal/screens/JournalScreen';

// ── Stack Screens ─────────────────────────────────────────────────────────────
import AddEditTaskScreen from './features/tasks/screens/AddEditTaskScreen';
import AddEditHabitScreen from './features/habits/screens/AddEditHabitScreen';
import AddEditSkillScreen from './features/skills/screens/AddEditSkillScreen';
import AddEditBlockScreen from './features/planner/screens/AddEditBlockScreen';
import DailyPageScreen from './features/planner/screens/DailyPageScreen';
import LogSessionScreen from './features/skills/screens/LogSessionScreen';
import SettingsScreen from './features/settings/screens/SettingsScreen';
import BackupScreen from './features/settings/screens/BackupScreen';
import JournalEntryScreen from './features/journal/screens/JournalEntryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  const { C } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.borderMed,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 4,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: C.text,
        tabBarInactiveTintColor: C.textMuted,
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Dashboard') {
            return <LayoutDashboard size={21} color={color} strokeWidth={focused ? 2 : 1.5} />;
          } else if (route.name === 'Planner') {
            return <CalendarDays size={21} color={color} strokeWidth={focused ? 2 : 1.5} />;
          } else if (route.name === 'Add') {
            return <PlusCircle size={21} color={color} strokeWidth={focused ? 2 : 1.5} />;
          } else if (route.name === 'Insights') {
            return <ChartBarBig size={21} color={color} strokeWidth={focused ? 2 : 1.5} />;
          } else if (route.name === 'Journal') {
            return <NotebookPen size={21} color={color} strokeWidth={focused ? 2 : 1.5} />;
          }
          return null;
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.2,
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Insights" component={AnalyticsScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { C, isDarkTheme } = useTheme();
  const { loading: tasksLoading } = useContext(TaskContext);
  const { loading: habitsLoading } = useContext(HabitContext);
  const { loading: skillsLoading } = useContext(SkillContext);
  const { loading: plannerLoading } = useContext(PlannerContext);
  const { loading: journalLoading } = useContext(JournalContext);
  const { loading: settingsLoading } = useContext(SettingsContext);

  useEffect(() => {
    const checkAndRunMigrations = async () => {
      try {
        const { success, migrationsRun } = await runMigrations();
        if (success && migrationsRun > 0) {
          console.log(`Successfully ran ${migrationsRun} data migrations`);
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    };
    checkAndRunMigrations();
  }, []);

  const isLoading = tasksLoading || habitsLoading || skillsLoading ||
    plannerLoading || journalLoading || settingsLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="AddEditHabit" component={AddEditHabitScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="AddEditSkill" component={AddEditSkillScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="AddEditBlock" component={AddEditBlockScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="DailyPage" component={DailyPageScreen} />
        <Stack.Screen name="LogSession" component={LogSessionScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Backup" component={BackupScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SettingsProvider>
            <ThemeProvider>
              <TaskProvider>
                <HabitProvider>
                  <SkillProvider>
                    <PlannerProvider>
                      <JournalProvider>
                        <DailyResetProvider>
                          <AppContent />
                        </DailyResetProvider>
                      </JournalProvider>
                    </PlannerProvider>
                  </SkillProvider>
                </HabitProvider>
              </TaskProvider>
            </ThemeProvider>
          </SettingsProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
