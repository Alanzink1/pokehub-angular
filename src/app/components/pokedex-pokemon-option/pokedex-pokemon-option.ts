import { Component, computed, inject, input, Input, OnInit } from '@angular/core';
import { HttpDataClient } from '../../services/http-data-client';

@Component({
  selector: 'app-pokedex-pokemon-option',
  imports: [],
  templateUrl: './pokedex-pokemon-option.html',
  styleUrl: './pokedex-pokemon-option.scss',
})
export class PokedexPokemonOption implements OnInit {
  private readonly pokemonService = inject(HttpDataClient)
  url = input<string>('');
  isActive = input<boolean>(false);

  cardClass = computed(() => this.isActive() ? 'option-selected' : '');

  pokemon: any;

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

}
