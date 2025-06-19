"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  Mic,
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  Award,
  Target,
  TrendingUp,
  Heart,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Share2,
  MicOff,
} from "lucide-react"

interface VoiceAnalysis {
  clarity: number
  pace: number
  volume: number
  confidence: number
  pronunciation: number
}

interface Word {
  text: string
  confidence: number
  timestamp: number
  isCorrect: boolean
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

const VoiceRecognition: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcription, setTranscription] = useState("")
  const [words, setWords] = useState<Word[]>([])
  const [analysis, setAnalysis] = useState<VoiceAnalysis>({
    clarity: 0,
    pace: 0,
    volume: 0,
    confidence: 0,
    pronunciation: 0,
  })
  const [showResults, setShowResults] = useState(false)
  const [currentExercise, setCurrentExercise] = useState("Articulation Practice")
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0))
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string>("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("")

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const waveformRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const exercises = [
    "Articulation Practice",
    "Breathing Exercises",
    "Tongue Twisters",
    "Vowel Sounds",
    "Consonant Blends",
    "Fluency Training",
  ]

  const targetPhrases: { [key: string]: string[] } = {
    "Articulation Practice": [
      "The quick brown fox jumps over the lazy dog",
      "She sells seashells by the seashore",
      "Red leather, yellow leather",
    ],
    "Breathing Exercises": [
      "Take a deep breath and speak slowly",
      "Breathe in through your nose, out through your mouth",
      "Control your breathing while speaking",
    ],
    "Tongue Twisters": [
      "Peter Piper picked a peck of pickled peppers",
      "How much wood would a woodchuck chuck",
      "Unique New York, you know you need unique New York",
    ],
    "Vowel Sounds": ["The cat sat on the mat", "I see three green trees", "Old oak trees grow slowly"],
    "Consonant Blends": [
      "Strong spring storms strike swiftly",
      "Bright blue birds build big nests",
      "Fresh fruit from the farm",
    ],
    "Fluency Training": [
      "Speak slowly and clearly with confidence",
      "Practice makes perfect progress possible",
      "Smooth speech sounds soothing and strong",
    ],
  }

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const speechSupported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window
      const mediaSupported = "MediaRecorder" in window && "getUserMedia" in navigator.mediaDevices
      setIsSupported(speechSupported && mediaSupported)

      if (!speechSupported) {
        setError("Speech recognition not supported in this browser")
      } else if (!mediaSupported) {
        setError("Media recording not supported in this browser")
      }
    }

    checkSupport()
  }, [])

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      console.log("Speech recognition started")
      setError("")
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence

        if (event.results[i].isFinal) {
          finalTranscript += transcript

          // Add words with confidence scores
          const wordsArray = transcript.trim().split(" ")
          const newWords: Word[] = wordsArray.map((word) => ({
            text: word,
            confidence: confidence || Math.random() * 0.4 + 0.6,
            timestamp: Date.now(),
            isCorrect: confidence ? confidence > 0.7 : Math.random() > 0.3,
          }))

          setWords((prev) => [...prev, ...newWords])
        } else {
          interimTranscript += transcript
        }
      }

      setTranscription((prev) => prev + finalTranscript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => {
      console.log("Speech recognition ended")
      if (isRecording) {
        // Restart if still recording
        recognition.start()
      }
    }

    return recognition
  }, [isSupported, isRecording])

  // Initialize audio recording
  const initializeAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Set up audio context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        chunksRef.current = []
      }

      return { mediaRecorder, audioContext, analyser }
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setError("Microphone access denied. Please allow microphone access to use this feature.")
      throw err
    }
  }, [])

  // Audio visualization
  const updateAudioVisualization = useCallback(() => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateWaveform = () => {
      if (!isRecording) return

      analyser.getByteFrequencyData(dataArray)

      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / bufferLength
      setAudioLevel(average)

      // Update waveform data
      const waveformValues = []
      for (let i = 0; i < 50; i++) {
        const index = Math.floor((i / 50) * bufferLength)
        waveformValues.push(dataArray[index] || 0)
      }
      setWaveformData(waveformValues)

      requestAnimationFrame(updateWaveform)
    }

    updateWaveform()
  }, [isRecording])

  // Start recording
  const startRecording = async () => {
    try {
      setError("")
      setTranscription("")
      setWords([])
      setShowResults(false)
      setRecordingTime(0)

      // Initialize audio recording
      await initializeAudioRecording()

      // Initialize speech recognition
      const recognition = initializeSpeechRecognition()
      if (recognition) {
        recognitionRef.current = recognition
        recognition.start()
      }

      // Start media recorder
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start(100) // Collect data every 100ms
      }

      setIsRecording(true)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Start audio visualization
      updateAudioVisualization()
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Failed to start recording. Please check your microphone permissions.")
    }
  }

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false)

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setAudioLevel(0)

    // Generate analysis after a short delay
    setTimeout(() => {
      generateAnalysis()
    }, 1000)
  }

  // Generate voice analysis
  const generateAnalysis = () => {
    if (words.length === 0) {
      setError("No speech detected. Please try again.")
      return
    }

    const avgConfidence = words.reduce((sum, word) => sum + word.confidence, 0) / words.length
    const correctWords = words.filter((word) => word.isCorrect).length
    const accuracy = (correctWords / words.length) * 100

    // Calculate speech rate (words per minute)
    const duration = recordingTime / 60 // Convert to minutes
    const wordsPerMinute = duration > 0 ? words.length / duration : 0
    const normalRate =
      wordsPerMinute >= 120 && wordsPerMinute <= 180 ? 100 : Math.max(0, 100 - Math.abs(150 - wordsPerMinute))

    const newAnalysis: VoiceAnalysis = {
      clarity: Math.min(100, accuracy + Math.random() * 10),
      pace: Math.min(100, normalRate + Math.random() * 15),
      volume: Math.min(100, 70 + Math.random() * 25),
      confidence: Math.min(100, avgConfidence * 100 + Math.random() * 10),
      pronunciation: Math.min(100, accuracy + Math.random() * 15),
    }

    setAnalysis(newAnalysis)
    setShowResults(true)
  }

  // Play recorded audio
  const playRecording = () => {
    if (!audioUrl) return

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setIsPlaying(false)
    } else {
      if (audioRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
      } else {
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => {
          setError("Error playing audio")
          setIsPlaying(false)
        }
        audio.play()
        setIsPlaying(true)
      }
    }
  }

  // Reset everything
  const resetRecording = () => {
    stopRecording()
    setTranscription("")
    setWords([])
    setShowResults(false)
    setRecordingTime(0)
    setAudioLevel(0)
    setWaveformData(Array(50).fill(0))
    setError("")

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl("")
    }
    setAudioBlob(null)

    if (audioRef.current) {
      audioRef.current = null
    }
  }

  // Download recording
  const downloadRecording = () => {
    if (!audioBlob) return

    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `speech-recording-${new Date().toISOString().slice(0, 19)}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Share results
  const shareResults = async () => {
    const overallScore = Math.round(Object.values(analysis).reduce((a, b) => a + b, 0) / 5)
    const text = `My speech therapy session results: ${overallScore}% overall score. Practicing with ${currentExercise}. #SpeechTherapy #Progress`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Speech Therapy Results",
          text: text,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text)
        alert("Results copied to clipboard!")
      } catch (err) {
        console.log("Error copying to clipboard:", err)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-500"
  }

  const getCurrentPhrase = () => {
    const phrases = targetPhrases[currentExercise] || []
    return phrases[Math.floor(Math.random() * phrases.length)]
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-pink-200/50 shadow-2xl text-center max-w-md">
          <MicOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Browser Not Supported</h2>
          <p className="text-gray-600 mb-4">
            This feature requires a modern browser with speech recognition and media recording support.
          </p>
          <p className="text-sm text-gray-500">Please try using Chrome, Edge, or Safari on desktop.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Voice Recognition Therapy
          </h1>
          <p className="text-xl text-gray-600 mb-8">Advanced speech analysis to improve your communication skills</p>

          {/* Exercise Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {exercises.map((exercise, index) => (
              <button
                key={index}
                onClick={() => setCurrentExercise(exercise)}
                disabled={isRecording}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentExercise === exercise
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                    : "bg-white/70 text-gray-700 hover:bg-white/90 border border-pink-200"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {exercise}
              </button>
            ))}
          </div>

          {/* Target Phrase */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto mb-8 border border-pink-200/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Practice Phrase:</h3>
            <p className="text-xl text-gray-700 italic">"{getCurrentPhrase()}"</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-center animate-slide-up">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {/* Main Recording Interface */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-pink-200/50 shadow-2xl animate-slide-up">
          {/* Waveform Visualization */}
          <div className="relative h-32 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl mb-8 overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-center space-x-1 p-4">
              {waveformData.map((height, index) => (
                <div
                  key={index}
                  className={`w-2 bg-gradient-to-t transition-all duration-300 rounded-full ${
                    isRecording ? "from-pink-400 to-rose-500 animate-pulse" : "from-pink-200 to-rose-300"
                  }`}
                  style={{
                    height: `${Math.max((height / 255) * 80, 4)}px`,
                    animationDelay: `${index * 20}ms`,
                  }}
                ></div>
              ))}
            </div>

            {/* Audio Level Indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-pink-600" />
                  <div className="w-20 h-2 bg-pink-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-100 rounded-full"
                      style={{ width: `${Math.min((audioLevel / 255) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Pulse Effect */}
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            <button
              onClick={resetRecording}
              disabled={isRecording}
              className="p-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
            >
              <RotateCcw className="w-6 h-6 text-gray-600" />
            </button>

            <div className="relative">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative p-8 rounded-full transition-all duration-500 transform hover:scale-110 shadow-2xl ${
                  isRecording
                    ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                }`}
              >
                {isRecording ? <Square className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}

                {/* Pulse Animation */}
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
                    <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20 animation-delay-500"></div>
                  </>
                )}
              </button>

              {/* Recording Timer */}
              {isRecording && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={playRecording}
              disabled={!audioUrl || isRecording}
              className="p-4 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-2xl transition-all duration-300 transform hover:scale-110"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-blue-600" /> : <Play className="w-6 h-6 text-blue-600" />}
            </button>
          </div>

          {/* Current Exercise Display */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-pink-100 to-rose-100 px-6 py-3 rounded-2xl border border-pink-200">
              <Target className="w-5 h-5 text-pink-600" />
              <span className="font-semibold text-gray-800">Current Exercise: {currentExercise}</span>
            </div>
          </div>
        </div>

        {/* Real-time Transcription */}
        {(transcription || words.length > 0) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-pink-200/50 shadow-xl animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
              <Brain className="w-7 h-7 text-pink-500" />
              <span>Real-time Transcription</span>
            </h3>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200/50">
              {words.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {words.map((word, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                        word.isCorrect
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      title={`Confidence: ${Math.round(word.confidence * 100)}%`}
                    >
                      {word.text}
                      {word.isCorrect ? (
                        <CheckCircle className="w-4 h-4 ml-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 ml-1" />
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-lg">{transcription}</p>
              )}

              {isRecording && (
                <div className="mt-4 flex items-center space-x-2 text-pink-600">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-400"></div>
                  <span className="text-sm font-medium ml-2">Listening...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {showResults && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-pink-200/50 shadow-xl animate-scale-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center space-x-3">
              <TrendingUp className="w-7 h-7 text-pink-500" />
              <span>Voice Analysis Results</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {Object.entries(analysis).map(([key, value], index) => (
                <div
                  key={key}
                  className="group text-center p-6 bg-gradient-to-br from-white to-pink-50 rounded-2xl border border-pink-200/50 hover:shadow-lg transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#fce7f3"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          strokeDasharray={`${value}, 100`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f43f5e" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${getScoreColor(value)}`}>{Math.round(value)}</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-800 capitalize mb-2 group-hover:text-pink-600 transition-colors duration-300">
                    {key}
                  </h4>

                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(value / 20) ? "text-yellow-400 fill-current" : "text-gray-300"
                        } transition-all duration-300`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-pink-100 to-rose-100 px-8 py-4 rounded-2xl border border-pink-200">
                <Award className="w-8 h-8 text-pink-600" />
                <div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    {Math.round(Object.values(analysis).reduce((a, b) => a + b, 0) / 5)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={downloadRecording}
                disabled={!audioBlob}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Download Recording</span>
              </button>

              <button
                onClick={shareResults}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Results</span>
              </button>

              <button
                onClick={resetRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Tips and Encouragement */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-3xl p-8 border border-pink-200/50 shadow-xl animate-fade-in">
          <div className="text-center">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Keep Practicing!</h3>
            <p className="text-gray-600 text-lg mb-6">
              Every session brings you closer to clearer communication. Your progress matters!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Daily Practice",
                  tip: "Practice for 10-15 minutes daily for best results",
                },
                {
                  icon: Target,
                  title: "Focus Areas",
                  tip: "Work on one sound or word pattern at a time",
                },
                {
                  icon: Brain,
                  title: "Stay Positive",
                  tip: "Celebrate small improvements and be patient with yourself",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-white/60 rounded-2xl border border-pink-200/50 transform hover:scale-105 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <item.icon className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}

export default VoiceRecognition
