import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pokedex-screen',
  imports: [],
  templateUrl: './pokedex-screen.html',
  styleUrl: './pokedex-screen.scss',
})
export class PokedexScreen {
  pokemon = input<any>();
}
