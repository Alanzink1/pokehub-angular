import { Component, HostListener, signal, OnInit, OnDestroy, PLATFORM_ID, inject, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MusicService } from './services/music.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  public readonly musicService = inject(MusicService);
  private readonly platformId = inject(PLATFORM_ID);

  title = signal('pokehub');
  count = 0;
  showOrientationWarning = signal(false);
  private orientationCheckInterval?: any;

  private isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit() {
    if (!this.isBrowser) return;

    this.checkOrientation();

    setTimeout(() => this.checkOrientation(), 100);
    setTimeout(() => this.checkOrientation(), 300);

    window.addEventListener('orientationchange', this.handleOrientationChange);
    window.addEventListener('resize', this.handleOrientationChange);

    this.orientationCheckInterval = setInterval(() => {
      this.checkOrientation();
    }, 1000);
  }

  ngAfterViewInit() {
    if (!this.isBrowser || typeof window === 'undefined') return;
  }

  @HostListener('document:click')
  @HostListener('document:keydown')
  startGlobalMusic() {
    if (this.isBrowser) {
      this.musicService.start();
    }
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;

    window.removeEventListener('orientationchange', this.handleOrientationChange);
    window.removeEventListener('resize', this.handleOrientationChange);

    if (this.orientationCheckInterval) {
      clearInterval(this.orientationCheckInterval);
    }
  }

  private handleOrientationChange = () => {
    if (!this.isBrowser) return;
    setTimeout(() => this.checkOrientation(), 100);
  }

  private checkOrientation() {
    if (!this.isBrowser || typeof window === 'undefined') return;

    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight;

    const isPortrait = screenHeight > screenWidth;
    const isMobile = screenWidth <= 768;

    this.showOrientationWarning.set(isMobile && isPortrait);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (!this.isBrowser) return;

    if (event.code === 'Space') {
      event.preventDefault();
    }

    if (event.code === 'Enter') {
      this.nextAction();
    }
  }

  toggleMusic() {
  }

  nextAction() {
    console.log('ENTER pressionado → avançar');
  }
}
