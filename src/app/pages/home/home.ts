import { Component, inject, OnInit, signal } from '@angular/core';
import { PokedexScreen } from '../../components/pokedex-screen/pokedex-screen';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';
import { HttpDataClient } from '../../services/http-data-client';
import { PokedexPokemonInfo } from '../../components/pokedex-pokemon-info/pokedex-pokemon-info';

@Component({
  selector: 'app-home',
  imports: [
    PokedexPokemonInfo,
    PokedexScreen,
    PokemonList
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit {

  private readonly pokemonService = inject(HttpDataClient);
  readonly limit = 50;
  audio: any;
  currentOffset = 0;
  results: any[] = [];
  pokemonList: any[] = [];
  selectedPokemon = signal<any | null>(null);
  showTable = false;

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

  onInfoOpenedChange(value: boolean) {
    this.showTable = value;
  }

  onNearEnd() {
    this.loadMore();
  }

  selectPokemon(pokemon: any) {
    this.pokemonService.getPokemonByUrl(pokemon.url).subscribe({
    next: (fullPokemon: any) => {
      this.selectedPokemon.set(fullPokemon);
    },
    error: (err) => console.error('Erro ao buscar detalhes:', err)
  });
  }


}
