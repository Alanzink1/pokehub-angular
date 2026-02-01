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

  pokemonSelected = output<any>();
}
