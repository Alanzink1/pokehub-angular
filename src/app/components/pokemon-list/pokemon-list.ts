import { Component } from '@angular/core';
import { PokedexPokemonOption } from '../pokedex-pokemon-option/pokedex-pokemon-option';

@Component({
  selector: 'app-pokemon-list',
  imports: [PokedexPokemonOption],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss',
})
export class PokemonList {

}
