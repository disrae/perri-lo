"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

// Sample tracks data
const tracks = [
  {
    id: 1,
    title: "Nocturne in E-flat major, Op. 9, No. 2",
    composer: "Frédéric Chopin",
    duration: "4:33",
  },
  {
    id: 2,
    title: "Clair de Lune",
    composer: "Claude Debussy",
    duration: "5:12",
  },
  {
    id: 3,
    title: "Moonlight Sonata (1st Movement)",
    composer: "Ludwig van Beethoven",
    duration: "6:22",
  },
]

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(tracks[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(30)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id)
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length
    setCurrentTrack(tracks[prevIndex])
  }

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % tracks.length
    setCurrentTrack(tracks[nextIndex])
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Calculate current time based on progress
  const totalSeconds = 273 // 4:33 in seconds
  const currentTime = (progress / 100) * totalSeconds

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold">{currentTrack.title}</h4>
              <p className="text-sm text-muted-foreground">{currentTrack.composer}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Shuffle className="h-4 w-4" />
                <span className="sr-only">Shuffle</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Repeat className="h-4 w-4" />
                <span className="sr-only">Repeat</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Slider
              value={[progress]}
              max={100}
              step={1}
              onValueChange={(value) => setProgress(value[0])}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{currentTrack.duration}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={handlePrevTrack}>
              <SkipBack className="h-5 w-5" />
              <span className="sr-only">Previous track</span>
            </Button>
            <Button className="h-12 w-12 rounded-full" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextTrack}>
              <SkipForward className="h-5 w-5" />
              <span className="sr-only">Next track</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleMuteToggle}>
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
            </Button>
            <Slider value={[isMuted ? 0 : 75]} max={100} step={1} className="w-28" />
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm">Up Next</h4>
            {tracks
              .filter((track) => track.id !== currentTrack.id)
              .map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => setCurrentTrack(track)}
                >
                  <div>
                    <div className="font-medium text-sm">{track.title}</div>
                    <div className="text-xs text-muted-foreground">{track.composer}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{track.duration}</div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
