import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from './firebase';
import SplashScreen from './SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#4F46E5',
  background: '#F5F7FB',
  white: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  green: '#16A34A',
  red: '#DC2626',
};

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const todayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'No deadline';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const isValidDate = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = new Date(`${dateString}T00:00:00`);
  return !Number.isNaN(date.getTime()) && dateString === [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

// -------------------- AUTHENTICATION --------------------

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.authContent}
      >
        <View style={styles.authLogo}>
          <Ionicons name="book" size={34} color={COLORS.white} />
        </View>
        <Text style={styles.authTitle}>Welcome back</Text>
        <Text style={styles.authSubtitle}>Sign in to continue to StudyMate</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.authSwitchRow}>
          <Text style={styles.mutedText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Create one</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.authContent}
      >
        <View style={styles.authLogo}>
          <Ionicons name="person-add" size={34} color={COLORS.white} />
        </View>
        <Text style={styles.authTitle}>Create account</Text>
        <Text style={styles.authSubtitle}>Start organizing your study tasks</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password (at least 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.authSwitchRow}>
          <Text style={styles.mutedText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -------------------- FIRESTORE DATA --------------------

function useUserTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setTasks([]);
      setLoading(false);
      return undefined;
    }

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid)
    );

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        const taskList = snapshot.docs.map((taskDoc) => ({
          id: taskDoc.id,
          ...taskDoc.data(),
        }));

        taskList.sort((a, b) => {
          if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return 0;
        });

        setTasks(taskList);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        Alert.alert('Could not load tasks', error.message);
      }
    );
  }, []);

  return { tasks, loading };
}

function useUserSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setSchedule([]);
      setLoading(false);
      return undefined;
    }

    const scheduleQuery = query(
      collection(db, 'schedules'),
      where('uid', '==', user.uid)
    );

    return onSnapshot(
      scheduleQuery,
      (snapshot) => {
        setSchedule(
          snapshot.docs.map((scheduleDoc) => ({
            id: scheduleDoc.id,
            ...scheduleDoc.data(),
          }))
        );
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        Alert.alert('Could not load timetable', error.message);
      }
    );
  }, []);

  return { schedule, loading };
}

// -------------------- HOME SCREEN --------------------

function HomeScreen({ navigation }) {
  const { tasks, loading } = useUserTasks();

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const progress =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const upcomingTasks = tasks
    .filter((task) => !task.completed && task.dueDate)
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.screenTitle}>
              {auth.currentUser?.displayName || 'Student'} 👋
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="school-outline" size={26} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Make today count</Text>
          <Text style={styles.heroSubtitle}>
            Stay focused, complete your tasks, and keep moving forward.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.heroButtonText}>View My Tasks</Text>
            <Ionicons name="arrow-forward" size={17} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your progress</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{tasks.length}</Text>
                <Text style={styles.statLabel}>Total tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{pendingTasks}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{completedTasks}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressHeading}>
                <Text style={styles.cardTitle}>Completion progress</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.mutedText}>
                {completedTasks} of {tasks.length} tasks completed
              </Text>
            </View>
          </>
        )}

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Upcoming deadlines</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.linkText}>Calendar</Text>
          </TouchableOpacity>
        </View>

        {upcomingTasks.length === 0 ? (
          <Text style={styles.mutedText}>No upcoming deadlines added.</Text>
        ) : (
          upcomingTasks.map((task) => (
            <View key={task.id} style={styles.upcomingCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>
                  Due {formatDate(task.dueDate)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Quick tip</Text>
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={24} color="#D97706" />
          <Text style={styles.tipText}>
            Break large assignments into smaller tasks. Completing one small
            step at a time makes studying easier.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------- TASKS SCREEN --------------------

function TasksScreen() {
  const { tasks, loading } = useUserTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [adding, setAdding] = useState(false);

  const addTask = async () => {
    if (!title.trim()) {
      Alert.alert('Enter a task', 'Please enter a task title first.');
      return;
    }

    if (dueDate.trim() && !isValidDate(dueDate.trim())) {
      Alert.alert('Invalid date', 'Enter the deadline as YYYY-MM-DD, for example 2026-12-05.');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Not signed in', 'Please sign in again.');
      return;
    }

    try {
      setAdding(true);
      await addDoc(collection(db, 'tasks'), {
        uid: auth.currentUser.uid,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.trim(),
        completed: false,
        createdAt: new Date(),
      });

      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (error) {
      Alert.alert('Could not add task', error.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed,
      });
    } catch (error) {
      Alert.alert('Could not update task', error.message);
    }
  };

  const removeTask = (task) => {
    Alert.alert('Delete task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'tasks', task.id));
          } catch (error) {
            Alert.alert('Could not delete task', error.message);
          }
        },
      },
    ]);
  };

  const filteredTasks = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchText) ||
        task.description?.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === 'All' ||
        (filter === 'Pending' && !task.completed) ||
        (filter === 'Completed' && task.completed);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const renderTask = ({ item }) => {
    const overdue =
      item.dueDate && item.dueDate < todayString() && !item.completed;

    return (
      <View style={styles.taskCard}>
        <TouchableOpacity style={styles.taskCheck} onPress={() => toggleTask(item)}>
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={25}
            color={item.completed ? COLORS.green : COLORS.muted}
          />
        </TouchableOpacity>

        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, item.completed && styles.completedTaskTitle]}>
            {item.title}
          </Text>
          {!!item.description && (
            <Text style={styles.taskDescription}>{item.description}</Text>
          )}
          {!!item.dueDate && (
            <Text style={[styles.taskDeadline, overdue && { color: COLORS.red }]}>
              {overdue ? 'Overdue · ' : 'Due · '}{formatDate(item.dueDate)}
            </Text>
          )}
          <Text style={styles.taskStatus}>
            {item.completed ? 'Completed' : 'Pending'}
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => removeTask(item)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.red} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.tasksHeader}>
        <Text style={styles.screenTitle}>My Tasks</Text>
        <Text style={styles.mutedText}>Add tasks and set their deadlines.</Text>
      </View>

      <View style={styles.addTaskCard}>
        <Text style={styles.cardTitle}>Add a new task</Text>
        <TextInput
          style={styles.input}
          placeholder="Task title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Deadline (YYYY-MM-DD), optional"
          value={dueDate}
          onChangeText={setDueDate}
          keyboardType="numbers-and-punctuation"
        />
        <Text style={styles.inputHint}>Example: 2026-12-05</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={addTask} disabled={adding}>
          {adding ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Add Task</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        {['All', 'Pending', 'Completed'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.filterButton, filter === item && styles.activeFilterButton]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.activeFilterText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={42} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.mutedText}>Add a task or change your search/filter.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// -------------------- CALENDAR SCREEN --------------------

function CalendarScreen() {
  const { tasks, loading } = useUserTasks();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayString());

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const monthName = visibleMonth.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const tasksForSelectedDate = tasks.filter(
    (task) => task.dueDate === selectedDate
  );

  const changeMonth = (amount) => {
    setVisibleMonth(new Date(year, month + amount, 1));
  };

  const selectDay = (day) => {
    if (!day) return;
    const monthPart = String(month + 1).padStart(2, '0');
    const dayPart = String(day).padStart(2, '0');
    setSelectedDate(`${year}-${monthPart}-${dayPart}`);
  };

  const hasTaskOnDate = (day) => {
    if (!day) return false;
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.some((task) => task.dueDate === dateString);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Calendar</Text>
        <Text style={styles.mutedText}>Tap a date to view tasks due that day.</Text>

        <View style={styles.calendarCard}>
          <View style={styles.calendarMonthRow}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthArrow}>
              <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.calendarMonthTitle}>{monthName}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrow}>
              <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekdayLabel}>{day}</Text>
            ))}

            {calendarCells.map((day, index) => {
              const dateString = day
                ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : '';
              const selected = dateString === selectedDate;
              const today = dateString === todayString();
              const hasTasks = hasTaskOnDate(day);

              return (
                <TouchableOpacity
                  key={`${dateString}-${index}`}
                  disabled={!day}
                  style={[
                    styles.calendarDay,
                    selected && styles.selectedCalendarDay,
                    today && !selected && styles.todayCalendarDay,
                  ]}
                  onPress={() => selectDay(day)}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      selected && styles.selectedCalendarDayText,
                    ]}
                  >
                    {day || ''}
                  </Text>
                  {hasTasks && <View style={[styles.calendarDot, selected && styles.selectedCalendarDot]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tasks for {formatDate(selectedDate)}</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : tasksForSelectedDate.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No tasks for this date</Text>
          </View>
        ) : (
          tasksForSelectedDate.map((task) => (
            <View key={task.id} style={styles.upcomingCard}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, task.completed && styles.completedTaskTitle]}>
                  {task.title}
                </Text>
                {!!task.description && (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                )}
                <Text style={styles.taskStatus}>
                  {task.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------- STUDY TIMETABLE SCREEN --------------------

function TimetableScreen() {
  const { schedule, loading } = useUserSchedule();
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [saving, setSaving] = useState(false);

  const addSchedule = async () => {
    if (!subject.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Missing details', 'Enter a subject, start time, and end time.');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Not signed in', 'Please sign in again.');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'schedules'), {
        uid: auth.currentUser.uid,
        subject: subject.trim(),
        day,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        createdAt: new Date(),
      });

      setSubject('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      Alert.alert('Could not save timetable entry', error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeSchedule = (entry) => {
    Alert.alert('Delete timetable entry', `Delete ${entry.subject}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'schedules', entry.id));
          } catch (error) {
            Alert.alert('Could not delete entry', error.message);
          }
        },
      },
    ]);
  };

  const sortedSchedule = [...schedule].sort((a, b) => {
    const dayDifference = WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day);
    return dayDifference || a.startTime.localeCompare(b.startTime);
  });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Study Timetable</Text>
        <Text style={styles.mutedText}>Plan your weekly study sessions.</Text>

        <View style={styles.addTaskCard}>
          <Text style={styles.cardTitle}>Add study session</Text>

          <TextInput
            style={styles.input}
            placeholder="Subject or activity"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.fieldLabel}>Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dayPickerRow}>
              {WEEKDAYS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.dayChip, day === item && styles.activeDayChip]}
                  onPress={() => setDay(item)}
                >
                  <Text style={[styles.dayChipText, day === item && styles.activeDayChipText]}>
                    {item.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Start time</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00 AM"
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>End time</Text>
              <TextInput
                style={styles.input}
                placeholder="10:00 AM"
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={addSchedule}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Save Study Session</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Weekly schedule</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : sortedSchedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No study sessions yet</Text>
            <Text style={styles.mutedText}>Add a session above to build your timetable.</Text>
          </View>
        ) : (
          WEEKDAYS.map((weekday) => {
            const dayEntries = sortedSchedule.filter((entry) => entry.day === weekday);
            if (dayEntries.length === 0) return null;

            return (
              <View key={weekday} style={styles.timetableDayGroup}>
                <Text style={styles.timetableDayTitle}>{weekday}</Text>
                {dayEntries.map((entry) => (
                  <View key={entry.id} style={styles.timetableCard}>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>{entry.startTime}</Text>
                      <Text style={styles.timeBadgeText}>{entry.endTime}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{entry.subject}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeSchedule(entry)}>
                      <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------- QUOTES SCREEN --------------------

const quotes = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B. B. King' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
];

function QuotesScreen() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quote = quotes[quoteIndex];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.quoteScreenContent}>
        <Text style={styles.screenTitle}>Daily Motivation</Text>
        <Text style={styles.mutedText}>A little motivation for your study journey.</Text>

        <View style={styles.quoteCard}>
          <Ionicons name="chatbox-ellipses" size={34} color={COLORS.primary} />
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>{quote.text}</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setQuoteIndex((current) => (current + 1) % quotes.length)}
        >
          <Text style={styles.primaryButtonText}>Next Quote</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// -------------------- PROFILE SCREEN --------------------

function ProfileScreen() {
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            Alert.alert('Could not sign out', error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>My Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={42} color={COLORS.primary} />
          </View>
          <Text style={styles.profileName}>{user?.displayName || 'Student'}</Text>
          <Text style={styles.mutedText}>{user?.email || ''}</Text>
        </View>

        <View style={styles.profileInfoCard}>
          <View style={styles.profileInfoRow}>
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
            <View style={styles.profileInfoText}>
              <Text style={styles.profileInfoLabel}>Name</Text>
              <Text style={styles.profileInfoValue}>{user?.displayName || 'Not provided'}</Text>
            </View>
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.profileInfoRow}>
            <Ionicons name="mail-outline" size={22} color={COLORS.primary} />
            <View style={styles.profileInfoText}>
              <Text style={styles.profileInfoLabel}>Email</Text>
              <Text style={styles.profileInfoValue}>{user?.email || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------- NAVIGATION --------------------

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Tasks: 'checkbox-outline',
            Calendar: 'calendar-outline',
            Timetable: 'time-outline',
            Quotes: 'chatbubble-ellipses-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Quotes" component={QuotesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// -------------------- APP --------------------

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (checkingAuth) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.mutedText}>Checking your account...</Text>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {user ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// -------------------- STYLES --------------------

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 35 },
  authContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  authContent: { width: '100%' },
  authLogo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 22,
  },
  authTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  authSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 13,
  },
  descriptionInput: { minHeight: 70, textAlignVertical: 'top' },
  inputHint: { color: COLORS.muted, fontSize: 12, marginTop: -8, marginBottom: 12 },
  primaryButton: {
    minHeight: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginTop: 4,
  },
  primaryButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  authSwitchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  linkText: { color: COLORS.primary, fontWeight: '700' },
  mutedText: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  greeting: { color: COLORS.muted, fontSize: 15 },
  screenTitle: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 22,
    marginBottom: 26,
  },
  heroTitle: { color: COLORS.white, fontSize: 23, fontWeight: '800' },
  heroSubtitle: { color: '#E0E7FF', fontSize: 14, lineHeight: 21, marginTop: 9, marginBottom: 18 },
  heroButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroButtonText: { color: COLORS.primary, fontWeight: '700' },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 14,
    minHeight: 90,
  },
  statNumber: { color: COLORS.text, fontSize: 23, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
  },
  progressHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  progressPercent: { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
  progressTrack: {
    height: 9,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: { height: '100%', borderRadius: 10, backgroundColor: COLORS.primary },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 21 },
  tasksHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  addTaskCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    color: COLORS.text,
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterButton: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  activeFilterText: { color: COLORS.white },
  taskList: { paddingHorizontal: 20, paddingBottom: 30, flexGrow: 1 },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheck: { marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  completedTaskTitle: { color: COLORS.muted, textDecorationLine: 'line-through' },
  taskDescription: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  taskDeadline: { color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 5 },
  taskStatus: { color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 6 },
  deleteButton: { padding: 8, marginLeft: 6 },
  emptyState: { alignItems: 'center', paddingTop: 35, paddingHorizontal: 20 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginTop: 12, marginBottom: 5 },
  loader: { marginTop: 30 },
  upcomingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    marginTop: 20,
    marginBottom: 24,
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarMonthTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  monthArrow: { padding: 8 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekdayLabel: {
    width: '14.2857%',
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 8,
  },
  calendarDay: {
    width: '14.2857%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  selectedCalendarDay: { backgroundColor: COLORS.primary },
  todayCalendarDay: { borderWidth: 1, borderColor: COLORS.primary },
  calendarDayText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  selectedCalendarDayText: { color: COLORS.white },
  calendarDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 2 },
  selectedCalendarDot: { backgroundColor: COLORS.white },
  fieldLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  dayPickerRow: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  dayChip: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeDayChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayChipText: { color: COLORS.muted, fontWeight: '700', fontSize: 12 },
  activeDayChipText: { color: COLORS.white },
  timeRow: { flexDirection: 'row', gap: 10 },
  timetableDayGroup: { marginBottom: 18 },
  timetableDayTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  timetableCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  timeBadgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  quoteScreenContent: { flex: 1, padding: 20, justifyContent: 'center' },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 25,
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  quoteMark: { color: COLORS.primary, fontSize: 60, fontWeight: '800', lineHeight: 65, marginTop: 8 },
  quoteText: { color: COLORS.text, fontSize: 21, fontWeight: '700', textAlign: 'center', lineHeight: 31, marginBottom: 20 },
  quoteAuthor: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  buttonIcon: { marginLeft: 8 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  profileName: { color: COLORS.text, fontSize: 21, fontWeight: '800', marginBottom: 5 },
  profileInfoCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 18 },
  profileInfoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  profileInfoText: { marginLeft: 13, flex: 1 },
  profileInfoLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  profileInfoValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  profileDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 13,
    padding: 16,
    marginTop: 18,
    gap: 8,
  },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  tabBar: {
    height: 64,
    paddingTop: 6,
    paddingBottom: 7,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tabBarLabel: { fontSize: 10, fontWeight: '600' },
});