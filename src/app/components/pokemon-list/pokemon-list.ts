import { HttpDataClient } from './../../services/http-data-client';
import { Component, inject, OnInit, signal } from '@angular/core';
import { PokedexPokemonOption } from '../pokedex-pokemon-option/pokedex-pokemon-option';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [PokedexPokemonOption],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss',
})

export class PokemonList implements OnInit {
  private readonly pokemonService = inject(HttpDataClient)
  readonly limit = 50;
  audio: any;
  currentOffset = 0;
  results: any[] = [];
  pokemonList: any[] = [];
  selectedPokemon = signal<any | null>(null);

  ngOnInit() {
    this.loadMore();
  }

  loadMore() {
    this.pokemonService.getLimitedPokemon(this.currentOffset, this.limit).subscribe({
      next: (data: any) => {
        this.pokemonList = [...this.pokemonList, ...data.results];
        this.currentOffset += this.limit;
      },
      error: (err) => console.error('Erro ao carregar pokémon:', err)
    })
  }

  selectPokemon(pokemon: any) {
    this.selectedPokemon.set(pokemon);
    // this.audio = new Audio(pokemon.cries.legacy);
    // this.audio.play();
  }


}
