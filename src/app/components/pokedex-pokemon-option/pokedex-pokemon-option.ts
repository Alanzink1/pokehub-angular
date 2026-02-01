import { Component, computed, effect, inject, input, Input, OnInit } from '@angular/core';
import { HttpDataClient } from '../../services/http-data-client';

@Component({
  selector: 'app-pokedex-pokemon-option',
  imports: [],
  templateUrl: './pokedex-pokemon-option.html',
  styleUrl: './pokedex-pokemon-option.scss',
})
export class PokedexPokemonOption implements OnInit {
  private readonly pokemonService = inject(HttpDataClient)
  private audio?: HTMLAudioElement;
  private wasActive = false;
  url = input<string>('');
  isActive = input<boolean>(false);

  cardClass = computed(() => this.isActive() ? 'option-selected' : '');
  pokemon: any;

  constructor() {
    effect(() => {
      const active = this.isActive();

      // só dispara quando muda de false -> true
      if (active && !this.wasActive) {
        this.playAudio();
      }

      this.wasActive = active;
    });
  }

  ngOnInit() {
    if (this.url) {
      this.pokemonService.getPokemonByUrl(this.url()).subscribe({
        next: (data: any) => {
          this.pokemon = data;
        },
        error: (err) => console.error('Erro ao carregar dados do pokémon:', err)
      });
    }
  }

  onClick() {
    if (!this.isActive()) return;

    this.playAudio();
  }

  playAudio() {
    const cry = this.pokemon?.cries?.latest || this.pokemon?.cries?.legacy;
    if (!cry) return;

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    this.audio = new Audio(cry);
    this.audio.volume = 0.1;
    this.audio.play().catch(() => {
    });
  }

}
