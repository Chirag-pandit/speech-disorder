"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  Volume2,
  VolumeX,
  Star,
  Music,
  Download,
  Share2,
  Trophy,
  Target,
  Zap,
  Sparkles,
  MicIcon,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  BookOpen,
} from "lucide-react"
import { cn } from "../utils/cn"

const KaraokeTherapy: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(180) // 3 minutes
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedSong, setSelectedSong] = useState(0)
  const [showLyrics, setShowLyrics] = useState(true)
  const [currentLine, setCurrentLine] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const songs = [
    {
      id: 1,
      title: "Twinkle Twinkle Little Star",
      artist: "Traditional",
      difficulty: "beginner",
      duration: "2:30",
      category: "Nursery Rhymes",
      therapeuticFocus: ["Articulation", "Rhythm", "Breathing"],
      lyrics: [
        { time: 0, text: "Twinkle, twinkle, little star", phonetic: "TWING-kul TWING-kul LIT-ul STAR" },
        { time: 8, text: "How I wonder what you are", phonetic: "HOW AY WUN-der WHAT YOO AR" },
        { time: 16, text: "Up above the world so high", phonetic: "UP uh-BUV thuh WURLD SO HY" },
        { time: 24, text: "Like a diamond in the sky", phonetic: "LYK uh DY-mund IN thuh SKY" },
        { time: 32, text: "Twinkle, twinkle, little star", phonetic: "TWING-kul TWING-kul LIT-ul STAR" },
        { time: 40, text: "How I wonder what you are", phonetic: "HOW AY WUN-der WHAT YOO AR" },
      ],
      color: "from-pink-500 to-rose-400",
    },
    {
      id: 2,
      title: "Happy Birthday",
      artist: "Traditional",
      difficulty: "beginner",
      duration: "1:45",
      category: "Celebrations",
      therapeuticFocus: ["Pronunciation", "Social Skills", "Confidence"],
      lyrics: [
        { time: 0, text: "Happy birthday to you", phonetic: "HAP-ee BURTH-day TOO YOO" },
        { time: 6, text: "Happy birthday to you", phonetic: "HAP-ee BURTH-day TOO YOO" },
        { time: 12, text: "Happy birthday dear friend", phonetic: "HAP-ee BURTH-day DEER FREND" },
        { time: 18, text: "Happy birthday to you", phonetic: "HAP-ee BURTH-day TOO YOO" },
      ],
      color: "from-rose-500 to-pink-400",
    },
    {
      id: 3,
      title: "Row Your Boat",
      artist: "Traditional",
      difficulty: "intermediate",
      duration: "2:15",
      category: "Action Songs",
      therapeuticFocus: ["Fluency", "Rhythm", "Motor Skills"],
      lyrics: [
        { time: 0, text: "Row, row, row your boat", phonetic: "ROH ROH ROH YOR BOHT" },
        { time: 6, text: "Gently down the stream", phonetic: "JENT-lee DOWN thuh STREEM" },
        {
          time: 12,
          text: "Merrily, merrily, merrily, merrily",
          phonetic: "MER-uh-lee MER-uh-lee MER-uh-lee MER-uh-lee",
        },
        { time: 18, text: "Life is but a dream", phonetic: "LYF IZ BUT uh DREEM" },
      ],
      color: "from-pink-400 to-peach-400",
    },
    {
      id: 4,
      title: "The Alphabet Song",
      artist: "Traditional",
      difficulty: "beginner",
      duration: "3:00",
      category: "Educational",
      therapeuticFocus: ["Articulation", "Letter Sounds", "Memory"],
      lyrics: [
        { time: 0, text: "A B C D E F G", phonetic: "AY BEE SEE DEE EE EF JEE" },
        { time: 8, text: "H I J K L M N O P", phonetic: "AYCH AY JAY KAY EL EM EN OH PEE" },
        { time: 16, text: "Q R S T U V", phonetic: "KYOO AR ES TEE YOO VEE" },
        { time: 24, text: "W X Y and Z", phonetic: "DUB-ul-yoo EKS WY and ZEE" },
        { time: 32, text: "Now I know my ABCs", phonetic: "NOW AY NOH MY AY-BEE-SEES" },
        { time: 40, text: "Next time won't you sing with me", phonetic: "NEKST TYM WOHNT YOO SING WITH MEE" },
      ],
      color: "from-peach-500 to-orange-400",
    },
  ]

  const achievements = [
    { name: "First Song", icon: Music, unlocked: true, description: "Complete your first karaoke session" },
    { name: "Perfect Pitch", icon: Target, unlocked: false, description: "Score 90% or higher on a song" },
    { name: "Streak Master", icon: Zap, unlocked: false, description: "Maintain a 7-day practice streak" },
    { name: "Pronunciation Pro", icon: Sparkles, unlocked: true, description: "Master 10 difficult words" },
  ]

  const currentSong = songs[selectedSong]

  // Simulate time progression
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  // Update current lyric line based on time
  useEffect(() => {
    const currentLyricIndex = currentSong.lyrics.findIndex((lyric, index) => {
      const nextLyric = currentSong.lyrics[index + 1]
      return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time)
    })
    if (currentLyricIndex !== -1) {
      setCurrentLine(currentLyricIndex)
    }
  }, [currentTime, currentSong])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Simulate scoring
      setTimeout(() => {
        const newScore = Math.floor(Math.random() * 30) + 70 // 70-100
        setScore(newScore)
        setStreak(streak + 1)
      }, 2000)
    }
  }

  const handleRestart = () => {
    setCurrentTime(0)
    setIsPlaying(false)
    setScore(0)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-rose-50 p-4 md:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-peach-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-rose-200/30 to-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-peach-200/20 to-pink-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-4 justify-center mb-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-pink-500 to-peach-400 rounded-2xl flex items-center justify-center text-white shadow-xl"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(236, 72, 153, 0.3)",
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              <MicIcon className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-peach-500 bg-clip-text text-transparent">
                Karaoke Therapy
              </h1>
              <p className="text-gray-600 text-lg mt-2">Sing your way to better speech</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Karaoke Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Now Playing */}
            <motion.div variants={cardVariants}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    className={cn(
                      "w-20 h-20 bg-gradient-to-r rounded-2xl flex items-center justify-center text-white shadow-lg",
                      currentSong.color,
                    )}
                    whileHover={{ scale: 1.05 }}
                    animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
                  >
                    <Music className="w-10 h-10" />
                  </motion.div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentSong.title}</h2>
                    <p className="text-gray-600 mb-2">{currentSong.artist}</p>
                    <div className="flex flex-wrap gap-2">
                      {currentSong.therapeuticFocus.map((focus, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-pink-100 to-peach-100 text-pink-600 px-3 py-1 rounded-full text-sm"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Difficulty</div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        currentSong.difficulty === "beginner"
                          ? "bg-green-100 text-green-600"
                          : currentSong.difficulty === "intermediate"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600",
                      )}
                    >
                      {currentSong.difficulty}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-pink-500 to-peach-400 h-2 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <motion.button
                    className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-400 hover:from-gray-600 hover:to-gray-500 rounded-full flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRestart}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="w-16 h-16 bg-gradient-to-r from-pink-500 to-peach-400 hover:from-pink-600 hover:to-peach-500 rounded-full flex items-center justify-center text-white shadow-xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
                  </motion.button>

                  <motion.button
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg",
                      isRecording
                        ? "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"
                        : "bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-600 hover:to-pink-500",
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRecord}
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-gray-600 hover:text-pink-600">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{isMuted ? 0 : volume}</span>
                </div>
              </div>
            </motion.div>

            {/* Lyrics Display */}
            <motion.div variants={cardVariants}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Lyrics & Pronunciation</h3>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="text-pink-600 hover:text-pink-700 font-medium"
                  >
                    {showLyrics ? "Hide" : "Show"} Phonetics
                  </button>
                </div>

                <AnimatePresence>
                  {showLyrics && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {currentSong.lyrics.map((lyric, index) => (
                        <motion.div
                          key={index}
                          className={cn(
                            "p-4 rounded-xl transition-all duration-300",
                            index === currentLine
                              ? "bg-gradient-to-r from-pink-100 to-peach-100 border-2 border-pink-300 scale-105"
                              : "bg-gray-50 hover:bg-gray-100",
                          )}
                          animate={index === currentLine ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="text-lg font-medium text-gray-900 mb-2">{lyric.text}</div>
                          <div className="text-sm text-pink-600 font-mono">{lyric.phonetic}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score & Stats */}
            <motion.div variants={cardVariants}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Trophy className="w-5 h-5" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                    Performance
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <motion.div
                      className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-peach-500 bg-clip-text text-transparent mb-2"
                      animate={{ scale: score > 0 ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {score}%
                    </motion.div>
                    <p className="text-gray-600">Current Score</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-pink-600">{streak}</div>
                      <div className="text-xs text-gray-600">Day Streak</div>
                    </div>
                    <div className="bg-gradient-to-br from-peach-100 to-orange-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-peach-600">12</div>
                      <div className="text-xs text-gray-600">Songs Sung</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Song Selection */}
            <motion.div variants={cardVariants}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-peach-500 to-orange-400 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    <BookOpen className="w-5 h-5" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-peach-600 to-orange-500 bg-clip-text text-transparent">
                    Song Library
                  </h3>
                </div>

                <div className="space-y-3">
                  {songs.map((song, index) => (
                    <motion.button
                      key={song.id}
                      onClick={() => setSelectedSong(index)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all duration-300",
                        selectedSong === index
                          ? "bg-gradient-to-r from-pink-100 to-peach-100 border-2 border-pink-300"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent",
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", song.color)} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{song.title}</div>
                          <div className="text-sm text-gray-500">
                            {song.category} • {song.duration}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={cardVariants}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-400 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Star className="w-5 h-5" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
                    Achievements
                  </h3>
                </div>

                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl",
                        achievement.unlocked
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                          : "bg-gray-50 border border-gray-200",
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          achievement.unlocked
                            ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white"
                            : "bg-gray-300 text-gray-500",
                        )}
                      >
                        <achievement.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className={cn("font-medium", achievement.unlocked ? "text-green-700" : "text-gray-500")}>
                          {achievement.name}
                        </div>
                        <div className="text-xs text-gray-500">{achievement.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={cardVariants}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <motion.button
                    className="w-full bg-gradient-to-r from-pink-500 to-peach-400 hover:from-pink-600 hover:to-peach-500 text-white rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Save Recording
                  </motion.button>
                  <motion.button
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-600 hover:to-pink-500 text-white rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Progress
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ec4899, #fb7185);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #ec4899, #fb7185);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}

export default KaraokeTherapy
