"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/Card"
import Button from "@/components/UI/Button"
import { Badge } from "@/components/UI/Badge"
import { Progress } from "@/components/UI/Progress"
import {
  Bell,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Star,
  Target,
  Award,
  TrendingUp,
  Save,
  Zap,
  Moon,
  Sun,
  CheckCircle,
  Timer,
  Repeat,
  Users,
  Heart,
  Brain,
  Mic,
  BookOpen,
  Gamepad2,
  Camera,
  ArrowLeft,
  SettingsIcon,
} from "lucide-react"

// ==================== TYPES & INTERFACES ====================
interface Reminder {
  id: string
  title: string
  description: string
  time: string
  days: string[]
  isActive: boolean
  type: "practice" | "exercise" | "goal" | "medication" | "appointment" | "custom"
  priority: "low" | "medium" | "high"
  sound: boolean
  vibration: boolean
  notification: boolean
  activityType?: string
  streak: number
  completedToday: boolean
  lastCompleted?: string
  motivationalMessage: string
  icon: string
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  vibration: boolean
  email: boolean
  sms: boolean
  pushNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  reminderFrequency: "once" | "every15min" | "every30min" | "hourly"
  motivationalMessages: boolean
  progressUpdates: boolean
}

interface ReminderStats {
  totalReminders: number
  activeReminders: number
  completedToday: number
  weeklyCompletion: number
  longestStreak: number
  currentStreak: number
  averageCompletionTime: string
  missedReminders: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  action: () => void
  color: string
  bgColor: string
}

// ==================== SAMPLE DATA ====================
const defaultReminders: Reminder[] = [
  {
    id: "1",
    title: "Morning Speech Practice",
    description: "Start your day with 15 minutes of articulation practice",
    time: "08:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    isActive: true,
    type: "practice",
    priority: "high",
    sound: true,
    vibration: true,
    notification: true,
    activityType: "articulation",
    streak: 5,
    completedToday: false,
    motivationalMessage: "🌅 Good morning! Let's start the day with clear speech!",
    icon: "🌅",
  },
  {
    id: "2",
    title: "Lunch Break Vocabulary",
    description: "Quick vocabulary building session during lunch",
    time: "12:30",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    isActive: true,
    type: "exercise",
    priority: "medium",
    sound: true,
    vibration: false,
    notification: true,
    activityType: "vocabulary",
    streak: 3,
    completedToday: true,
    lastCompleted: "2024-01-20T12:35:00Z",
    motivationalMessage: "🍽️ Fuel your mind with new words!",
    icon: "🍽️",
  },
  {
    id: "3",
    title: "Evening Fluency Practice",
    description: "Wind down with relaxing fluency exercises",
    time: "19:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    isActive: true,
    type: "practice",
    priority: "high",
    sound: true,
    vibration: true,
    notification: true,
    activityType: "fluency",
    streak: 7,
    completedToday: false,
    motivationalMessage: "🌙 End your day with smooth, flowing speech!",
    icon: "🌙",
  },
  {
    id: "4",
    title: "Weekly Progress Review",
    description: "Review your weekly progress and set new goals",
    time: "10:00",
    days: ["Sunday"],
    isActive: true,
    type: "goal",
    priority: "medium",
    sound: false,
    vibration: false,
    notification: true,
    streak: 2,
    completedToday: false,
    motivationalMessage: "📊 Time to celebrate your progress!",
    icon: "📊",
  },
  {
    id: "5",
    title: "Therapist Appointment",
    description: "Monthly check-in with speech therapist",
    time: "14:00",
    days: ["Friday"],
    isActive: true,
    type: "appointment",
    priority: "high",
    sound: true,
    vibration: true,
    notification: true,
    streak: 0,
    completedToday: false,
    motivationalMessage: "👩‍⚕️ Professional guidance for better progress!",
    icon: "👩‍⚕️",
  },
]

const motivationalQuotes = [
  "🌟 Every practice session brings you closer to your goals!",
  "💪 Consistency is the key to speech improvement!",
  "🎯 Small steps lead to big achievements!",
  "✨ Your dedication is inspiring!",
  "🚀 Keep pushing forward - you're doing great!",
  "🏆 Practice makes progress, not perfection!",
  "💎 Your voice is unique and valuable!",
  "🌈 Every word you practice matters!",
  "⭐ Believe in yourself and your abilities!",
  "🎉 Celebrate every small victory!",
]

const timeSlots = [
  { time: "06:00", label: "6:00 AM", icon: "🌅", period: "Early Morning" },
  { time: "07:00", label: "7:00 AM", icon: "☀️", period: "Morning" },
  { time: "08:00", label: "8:00 AM", icon: "☀️", period: "Morning" },
  { time: "09:00", label: "9:00 AM", icon: "☀️", period: "Morning" },
  { time: "10:00", label: "10:00 AM", icon: "☀️", period: "Morning" },
  { time: "11:00", label: "11:00 AM", icon: "☀️", period: "Late Morning" },
  { time: "12:00", label: "12:00 PM", icon: "🌞", period: "Noon" },
  { time: "13:00", label: "1:00 PM", icon: "🌞", period: "Afternoon" },
  { time: "14:00", label: "2:00 PM", icon: "🌞", period: "Afternoon" },
  { time: "15:00", label: "3:00 PM", icon: "🌞", period: "Afternoon" },
  { time: "16:00", label: "4:00 PM", icon: "🌞", period: "Late Afternoon" },
  { time: "17:00", label: "5:00 PM", icon: "🌅", period: "Evening" },
  { time: "18:00", label: "6:00 PM", icon: "🌅", period: "Evening" },
  { time: "19:00", label: "7:00 PM", icon: "🌙", period: "Evening" },
  { time: "20:00", label: "8:00 PM", icon: "🌙", period: "Night" },
  { time: "21:00", label: "9:00 PM", icon: "🌙", period: "Night" },
]

const activityTypes = [
  {
    id: "articulation",
    name: "Articulation Practice",
    icon: Mic,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "fluency",
    name: "Fluency Exercises",
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "vocabulary",
    name: "Vocabulary Building",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "social",
    name: "Social Communication",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "games",
    name: "Speech Games",
    icon: Gamepad2,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    id: "mirror",
    name: "Mirror Practice",
    icon: Camera,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
]

// ==================== MAIN COMPONENT ====================
const Reminder: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [activeTab, setActiveTab] = useState<"today" | "all" | "settings" | "stats">("today")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [upcomingReminder, setUpcomingReminder] = useState<Reminder | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: "",
    description: "",
    time: "09:00",
    days: [],
    isActive: true,
    type: "practice",
    priority: "medium",
    sound: true,
    vibration: true,
    notification: true,
    motivationalMessage: "",
    icon: "🎯",
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    email: false,
    sms: false,
    pushNotifications: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "06:00",
    },
    reminderFrequency: "once",
    motivationalMessages: false,
    progressUpdates: false,
  })

  const [reminderStats, setReminderStats] = useState<ReminderStats>({
    totalReminders: defaultReminders.length,
    activeReminders: defaultReminders.filter((r) => r.isActive).length,
    completedToday: defaultReminders.filter((r) => r.completedToday).length,
    weeklyCompletion: 85,
    longestStreak: 12,
    currentStreak: 5,
    averageCompletionTime: "14:30",
    missedReminders: 2,
  })

  // Refs
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ==================== UTILITY FUNCTIONS ====================
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const isToday = (reminder: Reminder) => {
    const today = getDayName(new Date())
    return reminder.days.includes(today)
  }

  const getTimeUntilReminder = (reminder: Reminder) => {
    const now = new Date()
    const [hours, minutes] = reminder.time.split(":").map(Number)
    const reminderTime = new Date()
    reminderTime.setHours(hours, minutes, 0, 0)

    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    const diff = reminderTime.getTime() - now.getTime()
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60))
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursUntil === 0) {
      return `${minutesUntil}m`
    }
    return `${hoursUntil}h ${minutesUntil}m`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "practice":
        return <Mic className="w-4 h-4" />
      case "exercise":
        return <Target className="w-4 h-4" />
      case "goal":
        return <Award className="w-4 h-4" />
      case "medication":
        return <Heart className="w-4 h-4" />
      case "appointment":
        return <Calendar className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  // ==================== REMINDER FUNCTIONS ====================
  const createReminder = () => {
    if (!newReminder.title || !newReminder.time || !newReminder.days?.length) {
      showNotificationMessage("Please fill in all required fields", "error")
      return
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title!,
      description: newReminder.description || "",
      time: newReminder.time!,
      days: newReminder.days!,
      isActive: newReminder.isActive ?? true,
      type: newReminder.type!,
      priority: newReminder.priority!,
      sound: newReminder.sound ?? true,
      vibration: newReminder.vibration ?? true,
      notification: newReminder.notification ?? true,
      activityType: newReminder.activityType,
      streak: 0,
      completedToday: false,
      motivationalMessage:
        newReminder.motivationalMessage || motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
      icon: newReminder.icon || "🎯",
    }

    setReminders((prev) => [...prev, reminder])
    setNewReminder({
      title: "",
      description: "",
      time: "09:00",
      days: [],
      isActive: true,
      type: "practice",
      priority: "medium",
      sound: true,
      vibration: true,
      notification: true,
      motivationalMessage: "",
      icon: "🎯",
    })
    setShowCreateForm(false)
    showNotificationMessage("Reminder created successfully!", "success")
    updateStats()
  }

  const updateReminder = (updatedReminder: Reminder) => {
    setReminders((prev) => prev.map((r) => (r.id === updatedReminder.id ? updatedReminder : r)))
    setEditingReminder(null)
    showNotificationMessage("Reminder updated successfully!", "success")
    updateStats()
  }

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    showNotificationMessage("Reminder deleted successfully!", "success")
    updateStats()
  }

  const toggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)))
    updateStats()
  }

  const completeReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              completedToday: true,
              lastCompleted: new Date().toISOString(),
              streak: r.streak + 1,
            }
          : r,
      ),
    )
    showNotificationMessage("Great job! Reminder completed! 🎉", "success")
    updateStats()
  }

  const snoozeReminder = (id: string, minutes: number) => {
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) {
      const newTime = new Date()
      newTime.setMinutes(newTime.getMinutes() + minutes)
      const timeString = `${newTime.getHours().toString().padStart(2, "0")}:${newTime.getMinutes().toString().padStart(2, "0")}`

      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, time: timeString } : r)))
      showNotificationMessage(`Reminder snoozed for ${minutes} minutes`, "info")
    }
  }

  // ==================== NOTIFICATION FUNCTIONS ====================
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return permission === "granted"
    }
    return false
  }

  const showBrowserNotification = (reminder: Reminder) => {
    if (notificationPermission === "granted" && notificationSettings.pushNotifications) {
      const notification = new Notification(reminder.title, {
        body: reminder.description,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: reminder.id,
        requireInteraction: true,
      })

      notification.onclick = () => {
        window.focus()
        completeReminder(reminder.id)
        notification.close()
      }

      if (notificationSettings.sound && reminder.sound) {
        playNotificationSound()
      }

      setTimeout(() => {
        notification.close()
      }, 10000)
    }
  }

  const playNotificationSound = () => {
    if (notificationSettings.sound) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const showNotificationMessage = (message: string, type: "success" | "error" | "info") => {
    setUpcomingReminder({
      id: "notification",
      title: type === "success" ? "Success!" : type === "error" ? "Error!" : "Info",
      description: message,
      time: "",
      days: [],
      isActive: true,
      type: "custom",
      priority: "medium",
      sound: false,
      vibration: false,
      notification: false,
      streak: 0,
      completedToday: false,
      motivationalMessage: message,
      icon: type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️",
    })
    setShowNotification(true)

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false)
      setUpcomingReminder(null)
    }, 3000)
  }

  // ==================== STATS FUNCTIONS ====================
  const updateStats = () => {
    const activeReminders = reminders.filter((r) => r.isActive)
    const completedToday = reminders.filter((r) => r.completedToday)
    const allStreaks = reminders.map((r) => r.streak)
    const longestStreak = Math.max(...allStreaks, 0)
    const currentStreak = Math.round(allStreaks.reduce((a, b) => a + b, 0) / allStreaks.length) || 0

    setReminderStats({
      totalReminders: reminders.length,
      activeReminders: activeReminders.length,
      completedToday: completedToday.length,
      weeklyCompletion: Math.round((completedToday.length / Math.max(activeReminders.length, 1)) * 100),
      longestStreak,
      currentStreak,
      averageCompletionTime: "14:30",
      missedReminders: activeReminders.length - completedToday.length,
    })
  }

  // ==================== QUICK ACTIONS ====================
  const quickActions: QuickAction[] = [
    {
      id: "morning-practice",
      title: "Morning Practice",
      description: "Quick 10-minute session",
      icon: Sun,
      action: () => {
        completeReminder("1")
        showNotificationMessage("Morning practice completed! 🌅", "success")
      },
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-peach-100 hover:from-orange-100 hover:to-peach-200",
    },
    {
      id: "vocabulary-boost",
      title: "Vocabulary Boost",
      description: "Learn 5 new words",
      icon: Brain,
      action: () => {
        showNotificationMessage("Vocabulary session started! 📚", "info")
      },
      color: "text-pink-600",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-100 hover:from-pink-100 hover:to-rose-200",
    },
    {
      id: "quick-check",
      title: "Quick Check-in",
      description: "2-minute progress review",
      icon: CheckCircle,
      action: () => {
        showNotificationMessage("Progress reviewed! Keep it up! 📊", "success")
      },
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200",
    },
    {
      id: "motivation",
      title: "Daily Motivation",
      description: "Get inspired",
      icon: Star,
      action: () => {
        const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
        showNotificationMessage(quote, "info")
      },
      color: "text-rose-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-100 hover:from-rose-100 hover:to-pink-200",
    },
  ]

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Update current time every minute
    clockIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Request notification permission on mount
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
      if (Notification.permission === "default") {
        requestNotificationPermission()
      }
    }

    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current)
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    updateStats()
  }, [reminders])

  useEffect(() => {
    // Check for upcoming reminders
    const now = new Date()
    const currentTimeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const today = getDayName(now)

    const upcomingReminders = reminders.filter((r) => r.isActive && r.days.includes(today) && !r.completedToday)

    // Find the next reminder
    const nextReminder = upcomingReminders
      .filter((r) => r.time >= currentTimeString)
      .sort((a, b) => a.time.localeCompare(b.time))[0]

    if (nextReminder) {
      setUpcomingReminder(nextReminder)
    }

    // Check for reminders that should trigger now
    const currentReminders = upcomingReminders.filter((r) => r.time === currentTimeString)
    currentReminders.forEach((reminder) => {
      showBrowserNotification(reminder)
    })
  }, [currentTime, reminders, notificationSettings])

  // ==================== COMPONENT RENDERS ====================

  /**
   * Today's Reminders Component
   */
  const TodayReminders = () => {
    const todayReminders = reminders.filter((r) => r.isActive && isToday(r))
    const completedCount = todayReminders.filter((r) => r.completedToday).length
    const progressPercentage = todayReminders.length > 0 ? (completedCount / todayReminders.length) * 100 : 0

    return (
      <div className="space-y-8">
        {/* Hero Section with Progress */}
        <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-orange-300 rounded-2xl p-8 text-white transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Today's Progress</h2>
              <p className="text-blue-100 text-lg">
                {completedCount} of {todayReminders.length} reminders completed
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-1">{Math.round(progressPercentage)}%</div>
              <div className="text-blue-100">Complete</div>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-white to-pink-100 h-full rounded-full transition-all duration-1000 ease-out transform"
              style={{
                width: `${progressPercentage}%`,
                animation: "slideIn 1.5s ease-out",
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`${action.bgColor} border border-pink-200 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1 group transform`}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div
                    className={`w-12 h-12 ${action.color} mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <action.icon className="w-full h-full" />
                  </div>
                  <h3
                    className={`font-semibold ${action.color} mb-1 group-hover:text-opacity-80 transition-all duration-300`}
                  >
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-all duration-300">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Up */}
        {upcomingReminder && upcomingReminder.id !== "notification" && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-50 to-peach-50 border-pink-200 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl animate-pulse-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-peach-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                  {upcomingReminder.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{upcomingReminder.title}</h3>
                    <Badge className="bg-pink-100 text-pink-700 border-pink-200 animate-bounce">Next Up</Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{upcomingReminder.description}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-600 animate-pulse" />
                    <span className="text-sm font-medium text-pink-700">
                      {formatTime(upcomingReminder.time)} • In {getTimeUntilReminder(upcomingReminder)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => snoozeReminder(upcomingReminder.id, 15)}
                    variant="outline"
                    size="sm"
                    className="border-pink-200 text-pink-700 hover:bg-pink-50 transform transition-all duration-200 hover:scale-105"
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Snooze
                  </Button>
                  <Button
                    onClick={() => completeReminder(upcomingReminder.id)}
                    className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white shadow-sm transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Schedule */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayReminders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders today</h3>
                  <p className="text-gray-600 mb-6">You have a free day! Want to add a reminder?</p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reminder
                  </Button>
                </div>
              ) : (
                todayReminders
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reminder, index) => (
                    <Card
                      key={reminder.id}
                      className={`border transition-all duration-500 hover:shadow-lg transform hover:scale-[1.02] hover:-translate-y-1 ${
                        reminder.completedToday
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 animate-fadeIn"
                          : "bg-gradient-to-r from-white to-pink-50 border-pink-200 hover:border-pink-300 hover:from-pink-50 hover:to-peach-50"
                      }`}
                      style={{
                        animation: `slideInLeft 0.6s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${
                              reminder.completedToday ? "bg-emerald-100" : "bg-gray-50"
                            }`}
                          >
                            {reminder.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4
                                className={`font-semibold text-lg ${
                                  reminder.completedToday ? "line-through text-gray-500" : "text-gray-900"
                                }`}
                              >
                                {reminder.title}
                              </h4>
                              <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                              {reminder.streak > 0 && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                  🔥 {reminder.streak}
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`text-sm mb-3 ${reminder.completedToday ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {reminder.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{formatTime(reminder.time)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(reminder.type)}
                                <span className="capitalize">{reminder.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!reminder.completedToday ? (
                              <>
                                <Button
                                  onClick={() => snoozeReminder(reminder.id, 15)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                  <Timer className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => completeReminder(reminder.id)}
                                  className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white shadow-sm transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                  size="sm"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  /**
   * All Reminders Component
   */
  const AllReminders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Reminders</h2>
          <p className="text-gray-600">Manage your complete reminder schedule</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <Card
            key={reminder.id}
            className={`border-0 shadow-md transition-all duration-200 hover:shadow-lg ${
              !reminder.isActive ? "opacity-60" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-xl">
                  {reminder.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg text-gray-900">{reminder.title}</h4>
                    <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                    {reminder.streak > 0 && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">🔥 {reminder.streak}</Badge>
                    )}
                    {!reminder.isActive && (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{reminder.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{formatTime(reminder.time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{reminder.days.length === 7 ? "Daily" : reminder.days.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(reminder.type)}
                      <span className="capitalize">{reminder.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleReminder(reminder.id)}
                    variant="outline"
                    size="sm"
                    className={`border-gray-200 ${
                      reminder.isActive ? "text-orange-600 hover:bg-orange-50" : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {reminder.isActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => setEditingReminder(reminder)}
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteReminder(reminder.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  /**
   * Settings Component
   */
  const Settings = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h2>
        <p className="text-gray-600">Customize how and when you receive reminders</p>
      </div>

      {/* Notification Permissions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Browser Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Enable Browser Notifications</p>
              <p className="text-sm text-gray-600">Allow notifications to appear in your browser</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  notificationPermission === "granted"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }
              >
                {notificationPermission === "granted" ? "Enabled" : "Disabled"}
              </Badge>
              {notificationPermission !== "granted" && (
                <Button
                  onClick={requestNotificationPermission}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Enable
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                key: "sound",
                label: "Sound Notifications",
                icon: Volume2,
                description: "Play sound when reminders trigger",
              },
              {
                key: "vibration",
                label: "Vibration (Mobile)",
                icon: Smartphone,
                description: "Vibrate device for mobile notifications",
              },
              { key: "email", label: "Email Reminders", icon: Mail, description: "Send reminder emails to your inbox" },
              {
                key: "sms",
                label: "SMS Notifications",
                icon: MessageSquare,
                description: "Send text message reminders",
              },
              {
                key: "pushNotifications",
                label: "Push Notifications",
                icon: Bell,
                description: "Show browser push notifications",
              },
              {
                key: "motivationalMessages",
                label: "Motivational Messages",
                icon: Star,
                description: "Include inspiring messages",
              },
              {
                key: "progressUpdates",
                label: "Progress Updates",
                icon: TrendingUp,
                description: "Weekly progress summaries",
              },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <setting.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{setting.label}</p>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      [setting.key]: !prev[setting.key as keyof NotificationSettings],
                    }))
                  }
                  variant="outline"
                  size="sm"
                  className={
                    notificationSettings[setting.key as keyof NotificationSettings]
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }
                >
                  {notificationSettings[setting.key as keyof NotificationSettings] ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Enable Quiet Hours</p>
                <p className="text-sm text-gray-600">Disable notifications during specified hours</p>
              </div>
              <Button
                onClick={() =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled },
                  }))
                }
                variant="outline"
                size="sm"
                className={
                  notificationSettings.quietHours.enabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }
              >
                {notificationSettings.quietHours.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>

            {notificationSettings.quietHours.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={notificationSettings.quietHours.start}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value },
                      }))
                    }
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {slot.label} - {slot.period}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={notificationSettings.quietHours.end}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value },
                      }))
                    }
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {slot.label} - {slot.period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reminder Frequency */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
              <Repeat className="w-5 h-5 text-white" />
            </div>
            Reminder Frequency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { value: "once", label: "Once only", description: "Single notification per reminder" },
              {
                value: "every15min",
                label: "Every 15 minutes",
                description: "Repeat every 15 minutes until completed",
              },
              {
                value: "every30min",
                label: "Every 30 minutes",
                description: "Repeat every 30 minutes until completed",
              },
              { value: "hourly", label: "Every hour", description: "Repeat every hour until completed" },
            ].map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  notificationSettings.reminderFrequency === option.value
                    ? "border-purple-300 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    reminderFrequency: option.value as any,
                  }))
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id={option.value}
                    name="frequency"
                    value={option.value}
                    checked={notificationSettings.reminderFrequency === option.value}
                    onChange={() => {}}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div>
                    <label htmlFor={option.value} className="font-medium text-gray-900 cursor-pointer">
                      {option.label}
                    </label>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  /**
   * Statistics Component
   */
  const Statistics = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reminder Statistics</h2>
        <p className="text-gray-600">Track your consistency and progress over time</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Reminders",
            value: reminderStats.totalReminders,
            icon: Bell,
            color: "from-pink-400 to-rose-500",
            bgColor: "bg-pink-50",
            textColor: "text-pink-600",
          },
          {
            label: "Active Today",
            value: reminderStats.activeReminders,
            icon: CheckCircle,
            color: "from-emerald-400 to-green-500",
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600",
          },
          {
            label: "Completed",
            value: reminderStats.completedToday,
            icon: Award,
            color: "from-orange-400 to-peach-500",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
          },
          {
            label: "Current Streak",
            value: reminderStats.currentStreak,
            icon: Star,
            color: "from-rose-400 to-pink-500",
            bgColor: "bg-rose-50",
            textColor: "text-rose-600",
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
          >
            <CardContent className="p-6">
              <div
                className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 transform transition-all duration-300 hover:scale-110 hover:rotate-6`}
              >
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${stat.textColor} mb-1 transition-all duration-300`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Detailed Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Weekly Completion Rate</p>
                <p className="text-sm text-gray-600">How consistent you've been this week</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32">
                  <Progress value={reminderStats.weeklyCompletion} className="h-3" />
                </div>
                <span className="text-lg font-bold text-gray-900 min-w-[3rem]">{reminderStats.weeklyCompletion}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Longest Streak</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{reminderStats.longestStreak} days</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Avg. Completion</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{reminderStats.averageCompletionTime}</div>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Missed Today</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{reminderStats.missedReminders}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Activity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityTypes.map((activity) => {
              const count = reminders.filter((r) => r.activityType === activity.id).length
              const percentage = reminders.length > 0 ? (count / reminders.length) * 100 : 0

              return (
                <div key={activity.id} className={`p-4 rounded-xl border ${activity.borderColor} ${activity.bgColor}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center ${activity.color}`}>
                      <activity.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${activity.color}`}>{activity.name}</span>
                        <span className={`text-sm font-medium ${activity.color}`}>{count} reminders</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${activity.color.replace("text-", "from-").replace("-600", "-400")} ${activity.color.replace("text-", "to-").replace("-600", "-600")} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  /**
   * Create/Edit Reminder Form
   */
  const ReminderForm = ({
    reminder,
    onSave,
    onCancel,
  }: {
    reminder?: Reminder
    onSave: (reminder: Reminder) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState<Partial<Reminder>>(
      reminder || {
        title: "",
        description: "",
        time: "09:00",
        days: [],
        isActive: true,
        type: "practice",
        priority: "medium",
        sound: true,
        vibration: true,
        notification: true,
        motivationalMessage: "",
        icon: "🎯",
      },
    )

    const handleSave = () => {
      if (!formData.title || !formData.time || !formData.days?.length) {
        showNotificationMessage("Please fill in all required fields", "error")
        return
      }

      const reminderData: Reminder = {
        id: reminder?.id || Date.now().toString(),
        title: formData.title!,
        description: formData.description || "",
        time: formData.time!,
        days: formData.days!,
        isActive: formData.isActive ?? true,
        type: formData.type!,
        priority: formData.priority!,
        sound: formData.sound ?? true,
        vibration: formData.vibration ?? true,
        notification: formData.notification ?? true,
        activityType: formData.activityType,
        streak: reminder?.streak || 0,
        completedToday: reminder?.completedToday || false,
        lastCompleted: reminder?.lastCompleted,
        motivationalMessage:
          formData.motivationalMessage || motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
        icon: formData.icon || "🎯",
      }

      onSave(reminderData)
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{reminder ? "Edit Reminder" : "Create New Reminder"}</h2>
            <p className="text-gray-600">
              {reminder ? "Update your reminder settings" : "Set up a new practice reminder"}
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Reminder Title *</label>
                <input
                  type="text"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  value={formData.title || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Morning Speech Practice"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Time *</label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  value={formData.time || "09:00"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.time} value={slot.time}>
                      {slot.icon} {slot.label} - {slot.period}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 h-24 resize-none"
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this reminder is for..."
              />
            </div>

            {/* Days Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Days of the Week *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = formData.days || []
                      const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
                      setFormData((prev) => ({ ...prev, days: newDays }))
                    }}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      formData.days?.includes(day)
                        ? "border-purple-300 bg-purple-50 text-purple-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              Reminder Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type, Priority, and Icon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  value={formData.type || "practice"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="practice">🎯 Practice</option>
                  <option value="exercise">💪 Exercise</option>
                  <option value="goal">🏆 Goal</option>
                  <option value="medication">💊 Medication</option>
                  <option value="appointment">📅 Appointment</option>
                  <option value="custom">⚙️ Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Priority</label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  value={formData.priority || "medium"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Icon</label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  value={formData.icon || "🎯"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                >
                  {["🎯", "🌅", "🍽️", "🌙", "📊", "👩‍⚕️", "💊", "🎮", "📚", "🗣️", "🎤", "⭐", "💪", "🏆", "📱", "⏰"].map(
                    (icon) => (
                      <option key={icon} value={icon}>
                        {icon} {icon}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* Activity Type (for practice/exercise) */}
            {(formData.type === "practice" || formData.type === "exercise") && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Activity Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activityTypes.map((activity) => (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, activityType: activity.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.activityType === activity.id
                          ? `${activity.borderColor} ${activity.bgColor} ${activity.color}`
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <activity.icon className="w-5 h-5" />
                        <span className="font-medium">{activity.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Settings */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Notification Options</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: "sound", label: "Sound", icon: Volume2, description: "Play notification sound" },
                  { key: "vibration", label: "Vibration", icon: Smartphone, description: "Vibrate device (mobile)" },
                  {
                    key: "notification",
                    label: "Push Notification",
                    icon: Bell,
                    description: "Show browser notification",
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData[setting.key as keyof Reminder]
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, [setting.key]: !prev[setting.key as keyof Reminder] }))
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <setting.icon
                        className={`w-5 h-5 ${
                          formData[setting.key as keyof Reminder] ? "text-purple-600" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          formData[setting.key as keyof Reminder] ? "text-purple-900" : "text-gray-700"
                        }`}
                      >
                        {setting.label}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        formData[setting.key as keyof Reminder] ? "text-purple-600" : "text-gray-500"
                      }`}
                    >
                      {setting.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Motivational Message (Optional)</label>
              <input
                type="text"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                value={formData.motivationalMessage || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, motivationalMessage: e.target.value }))}
                placeholder="Add a custom motivational message..."
              />
              <p className="text-sm text-gray-500 mt-2">Leave empty to use a random motivational quote</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            className="px-8 py-3 border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Save className="w-4 h-4 mr-2" />
            {reminder ? "Update Reminder" : "Create Reminder"}
          </Button>
        </div>
      </div>
    )
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-rose-100">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animate-slideIn { animation: slideIn 1s ease-out; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
      `}</style>
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Notification Toast */}
        {showNotification && upcomingReminder && (
          <div className="fixed top-6 right-6 z-50 max-w-sm">
            <Card className="border-0 shadow-2xl bg-white border-l-4 border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg">
                    {upcomingReminder.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{upcomingReminder.title}</h4>
                    <p className="text-sm text-gray-600">{upcomingReminder.description}</p>
                  </div>
                  <Button
                    onClick={() => setShowNotification(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 bg-clip-text text-transparent mb-3 animate-fadeIn">
                Speech Therapy Reminders
              </h1>
              <p className="text-xl text-gray-600">Stay consistent with your practice schedule</p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-white to-pink-50 rounded-2xl p-2 shadow-lg border border-pink-100">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "today", label: "Today", icon: Calendar, description: "Today's schedule" },
                { id: "all", label: "All Reminders", icon: Bell, description: "Manage all reminders" },
                { id: "settings", label: "Settings", icon: SettingsIcon, description: "Notification preferences" },
                { id: "stats", label: "Statistics", icon: TrendingUp, description: "Progress analytics" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg animate-pulse-soft"
                      : "text-gray-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-peach-50 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className={`text-xs ${activeTab === tab.id ? "text-white/80" : "text-gray-500"}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {showCreateForm ? (
          <ReminderForm
            onSave={() => {
              createReminder()
              setShowCreateForm(false)
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : editingReminder ? (
          <ReminderForm reminder={editingReminder} onSave={updateReminder} onCancel={() => setEditingReminder(null)} />
        ) : (
          <>
            {activeTab === "today" && <TodayReminders />}
            {activeTab === "all" && <AllReminders />}
            {activeTab === "settings" && <Settings />}
            {activeTab === "stats" && <Statistics />}
          </>
        )}
      </div>
    </div>
  )
}

export default Reminder
