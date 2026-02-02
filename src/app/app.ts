import { Component, HostListener, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = signal('pokehub');
  private audio?: HTMLAudioElement;
  count = 0;
  musics = ['pallet', 'welcome', 'gym'];
  musicPlayed = false;
  showOrientationWarning = signal(false);
  private orientationCheckInterval?: any;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit() {

    if (!this.isBrowser) {
      return;
    }


    this.checkOrientation();


    setTimeout(() => {
      this.checkOrientation();
    }, 100);

    setTimeout(() => {
      this.checkOrientation();
    }, 300);


    window.addEventListener('orientationchange', this.handleOrientationChange);
    window.addEventListener('resize', this.handleOrientationChange);


    this.orientationCheckInterval = setInterval(() => {
      this.checkOrientation();
    }, 1000);
  }

  ngOnDestroy() {

    if (!this.isBrowser) {
      return;
    }

    window.removeEventListener('orientationchange', this.handleOrientationChange);
    window.removeEventListener('resize', this.handleOrientationChange);
    if (this.orientationCheckInterval) {
      clearInterval(this.orientationCheckInterval);
    }
  }

  private handleOrientationChange = () => {
    if (!this.isBrowser) return;

    setTimeout(() => {
      this.checkOrientation();
    }, 100);
  }

  private checkOrientation() {

    if (!this.isBrowser || typeof window === 'undefined') {
      return;
    }


    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight;


    const isPortrait = screenHeight > screenWidth;


    const isMobile = screenWidth <= 768;

    
    const shouldShowWarning = isMobile && isPortrait;

    this.showOrientationWarning.set(shouldShowWarning);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      this.toggleMusic();
    }

    if (event.code === 'Enter') {
      this.nextAction();
    }
  }

  toggleMusic() {

    if (this.audio && this.musicPlayed) {
      this.audio.pause();
      this.musicPlayed = false;
      return;
    }

    this.musicPlayed = true;

    const randomIndex = Math.floor(Math.random() * this.musics.length);
    const musicName = this.musics[randomIndex];

    this.audio = new Audio(`musics/${musicName}.mp3`);
    this.audio.volume = 0.1;
    this.audio.play().catch(() => {});
  }

  nextAction() {
    console.log('ENTER pressionado → avançar');
  }
}
