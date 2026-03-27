import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private platformId = inject(PLATFORM_ID);
  private audio?: HTMLAudioElement;
  private isStarted = signal(false);
  private currentTrack = signal<string | null>(null);
  isMuted = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.volume = 0.15;
    }
  }

  toggleMute() {
    const newState = !this.isMuted();
    this.isMuted.set(newState);
    if (this.audio) {
      this.audio.muted = newState;
    }
  }

  start() {
    if (this.isStarted() || !this.audio) return;
    this.play('welcome');
    this.isStarted.set(true);
  }

  play(track: 'welcome' | 'gym' | 'pallet') {
    if (!this.audio) return;
    const url = `/musics/${track}.mp3`;
    if (this.currentTrack() === url) return;

    this.audio.pause();
    this.audio.src = url;
    this.audio.load();
    this.audio.play().catch(err => {
      console.warn('Autoplay blocked. Waiting for interaction.', err);
    });
    this.currentTrack.set(url);
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
    }
    this.currentTrack.set(null);
  }

  setVolume(vol: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }
}
