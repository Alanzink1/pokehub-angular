import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-game-mode',
  imports: [],
  templateUrl: './game-mode.html',
  styleUrl: './game-mode.scss',
})
export class GameMode {
  private readonly router = inject(Router);
  readonly teamService = inject(TeamService);

  onlineLinkCopied = signal(false);
  showOnlinePanel = signal(false);

  battleLink = computed(() => {
    if (typeof window === 'undefined') return '';
    const encoded = this.teamService.encodeTeam(this.teamService.playerTeam());
    return `${window.location.origin}/battle?vs=${encoded}`;
  });

  chooseOffline() {
    this.teamService.battleMode.set('offline');
    this.teamService.selectionMode.set('opponent');
    this.router.navigate(['/']);
  }

  chooseOnline() {
    this.teamService.battleMode.set('online');
    this.showOnlinePanel.set(true);
  }

  copyLink() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(this.battleLink()).then(() => {
        this.onlineLinkCopied.set(true);
        setTimeout(() => this.onlineLinkCopied.set(false), 2000);
      });
    }
  }

  backToOrder() {
    this.router.navigate(['/order']);
  }

  startBattleOnline() {
    this.router.navigate(['/battle']);
  }
}
