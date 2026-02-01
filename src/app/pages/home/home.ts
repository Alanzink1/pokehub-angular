import { Component } from '@angular/core';
import { PokedexScreen } from '../../components/pokedex-screen/pokedex-screen';
import { PokedexPokemonOption } from '../../components/pokedex-pokemon-option/pokedex-pokemon-option';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';

@Component({
  selector: 'app-home',
  imports: [
    PokedexScreen,
    PokemonList
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {

}
