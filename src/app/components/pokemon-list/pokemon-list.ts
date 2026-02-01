import { HttpDataClient } from './../../services/http-data-client';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { PokedexPokemonOption } from '../pokedex-pokemon-option/pokedex-pokemon-option';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [PokedexPokemonOption],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss',
})

export class PokemonList {
  pokemonList = input<any[]>([]);
  selectedPokemonName = input<string | undefined>('');

  nearEnd = output<void>();
  pokemonSelected = output<any>();
  private hasEmittedNearEnd = false;
  private readonly thresholdPx = 250;

  onScroll(event: Event) {
    const el = event.target as HTMLElement;

    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceToBottom <= this.thresholdPx;

    if (isNearBottom && !this.hasEmittedNearEnd) {
      this.hasEmittedNearEnd = true;
      this.nearEnd.emit();
      return;
    }

    if (!isNearBottom) {
      this.hasEmittedNearEnd = false;
    }
  }
}
