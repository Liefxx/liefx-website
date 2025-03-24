// src/types/index.ts
export interface TwitchStreamStatus {
  isLive: boolean;
  viewerCount?: number;
  title?: string;
  game?: string;
  thumbnailUrl?: string;
}

export interface PastBroadcast {
    id: string;
    title: string;
    date: string;
    duration: string;
    views: number;
    thumbnail: string;
    game: string;
}
export interface ScheduleItem {
  id: string
  title: string
  date: string
  time: string
  game: string

}