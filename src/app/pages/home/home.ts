import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PokedexScreen } from '../../components/pokedex-screen/pokedex-screen';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';
import { PokedexPokemonInfo } from '../../components/pokedex-pokemon-info/pokedex-pokemon-info';
import { HttpDataClient } from '../../services/http-data-client';
import { TeamService } from '../../services/team.service';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-home',
  imports: [PokedexPokemonInfo, PokedexScreen, PokemonList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit {
  private readonly pokemonService = inject(HttpDataClient);
  private readonly router = inject(Router);
  readonly teamService = inject(TeamService);
  private readonly musicService = inject(MusicService);

  readonly limit = 50;
  currentOffset = 0;
  pokemonList = signal<any[]>([]);
  allPokemonNames = signal<{ name: string; url: string }[]>([]);
  searchTerm = signal('');
  selectedPokemon = signal<any | null>(null);
  showTable = false;
  loadingSearch = signal(false);

  displayList = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.pokemonList();
    const all = this.allPokemonNames();
    if (all.length > 0) {
      return all.filter(p => p.name.includes(term));
    }
    return this.pokemonList().filter(p => p.name.includes(term));
  });

  activeTeamNames = computed(() => {
    const mode = this.teamService.selectionMode();
    const team = mode === 'team' ? this.teamService.playerTeam() : this.teamService.opponentTeam();
    return team.map(p => p.name);
  });

  teamSlots = computed(() => {
    const mode = this.teamService.selectionMode();
    const team = mode === 'team' ? this.teamService.playerTeam() : this.teamService.opponentTeam();
    return Array.from({ length: 6 }, (_, i) => team[i] ?? null);
  });

  canAdvance = computed(() => {
    const mode = this.teamService.selectionMode();
    const team = mode === 'team' ? this.teamService.playerTeam() : this.teamService.opponentTeam();
    return team.length > 0;
  });

  isOpponentMode = computed(() => this.teamService.selectionMode() === 'opponent');

  isTeamFull = computed(() => {
    const mode = this.teamService.selectionMode();
    return mode === 'team' ? this.teamService.playerTeamFull() : this.teamService.opponentTeamFull();
  });

  currentActiveName = computed(() => {
    const isOpp = this.isOpponentMode();
    return isOpp ? this.teamService.opponentName() : this.teamService.username();
  });

  ngOnInit() {
    this.musicService.play('pallet');
    this.loadMore();
    this.pokemonService.getAllPokemonNames().subscribe({
      next: names => this.allPokemonNames.set(names),
      error: () => {},
    });
  }

  loadMore() {
    this.pokemonService.getLimitedPokemon(this.currentOffset, this.limit).subscribe({
      next: (data: any) => {
        this.pokemonList.update(prev => [...prev, ...data.results]);
        this.currentOffset += this.limit;
      },
      error: (err) => console.error('Erro ao carregar pokémon:', err),
    });
  }

  onInfoOpenedChange(value: boolean) {
    this.showTable = value;
  }

  onNearEnd() {
    if (!this.searchTerm()) {
      this.loadMore();
    }
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
  }

  selectPokemon(pokemon: any) {
    this.pokemonService.getPokemonByUrl(pokemon.url).subscribe({
      next: (fullPokemon: any) => {
        this.selectedPokemon.set(fullPokemon);
        this.teamService.toggleInCurrentTeam(fullPokemon);
      },
      error: (err) => console.error('Erro ao buscar detalhes:', err),
    });
  }

  removeFromTeam(index: number) {
    const mode = this.teamService.selectionMode();
    if (mode === 'team') {
      this.teamService.removeFromPlayerTeam(index);
    } else {
      this.teamService.removeFromOpponentTeam(index);
    }
  }

  onUsernameChange(event: any) {
    const newName = event.target.value;
    if (this.isOpponentMode()) {
      this.teamService.opponentName.set(newName);
    } else {
      this.teamService.username.set(newName);
    }
  }

  advance() {
    const pending = this.teamService.pendingVsParam();
    if (pending && this.teamService.selectionMode() === 'team') {
      this.router.navigate(['/battle'], { queryParams: { vs: pending } });
    } else {
      this.router.navigate(['/order']);
    }
  }

  goBack() {
    this.teamService.clearAll();
  }
}
