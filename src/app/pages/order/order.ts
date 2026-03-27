import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { OrderPokemon } from '../../components/order-pokemon/order-pokemon';
import { OrderPokemonScreen } from '../../components/order-pokemon-screen/order-pokemon-screen';

@Component({
  selector: 'app-order',
  imports: [OrderPokemon, OrderPokemonScreen],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  readonly teamService = inject(TeamService);
  private readonly router = inject(Router);

  selectedIndex = signal<number>(0);

  activeTeam = computed(() => {
    const mode = this.teamService.selectionMode();
    return mode === 'team' ? this.teamService.playerTeam() : this.teamService.opponentTeam();
  });

  selectedPokemon = computed(() => this.activeTeam()[this.selectedIndex()] ?? null);

  isOpponentMode = computed(() => this.teamService.selectionMode() === 'opponent');

  selectPokemon(index: number) {
    this.selectedIndex.set(index);
  }

  moveUp(index: number) {
    if (index === 0) return;
    const mode = this.teamService.selectionMode();
    if (mode === 'team') {
      this.teamService.swapPlayerTeam(index, index - 1);
    } else {
      this.teamService.swapOpponentTeam(index, index - 1);
    }
    this.selectedIndex.set(index - 1);
  }

  moveDown(index: number) {
    if (index >= this.activeTeam().length - 1) return;
    const mode = this.teamService.selectionMode();
    if (mode === 'team') {
      this.teamService.swapPlayerTeam(index, index + 1);
    } else {
      this.teamService.swapOpponentTeam(index, index + 1);
    }
    this.selectedIndex.set(index + 1);
  }

  removePokemon(index: number) {
    const mode = this.teamService.selectionMode();
    if (mode === 'team') {
      this.teamService.removeFromPlayerTeam(index);
    } else {
      this.teamService.removeFromOpponentTeam(index);
    }
    const newLen = this.activeTeam().length;
    if (this.selectedIndex() >= newLen) {
      this.selectedIndex.set(Math.max(0, newLen - 1));
    }
  }

  changeLevel(index: number, level: number) {
    this.teamService.updatePokemonLevel(index, level);
  }

  advance() {
    const pending = this.teamService.pendingVsParam();
    if (pending) {
      this.router.navigate(['/battle'], { queryParams: { vs: pending } });
    } else if (this.isOpponentMode()) {
      this.router.navigate(['/battle']);
    } else {
      this.router.navigate(['/game-mode']);
    }
  }

  backToPokedex() {
    this.router.navigate(['/']);
  }
}
