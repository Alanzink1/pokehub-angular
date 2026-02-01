import { Component } from '@angular/core';
import { PokedexScreen } from '../../components/pokedex-screen/pokedex-screen';
import { PokedexPokemonOption } from '../../components/pokedex-pokemon-option/pokedex-pokemon-option';

@Component({
  selector: 'app-home',
  imports: [
    PokedexScreen,
    PokedexPokemonOption
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {

}
