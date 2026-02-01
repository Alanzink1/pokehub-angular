import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = signal('pokehub');
  private audio?: HTMLAudioElement;
  count = 0;
  musics = ['pallet', 'welcome', 'gym'];
  musicPlayed = false;

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
