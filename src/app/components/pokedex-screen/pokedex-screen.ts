import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pokedex-screen',
  imports: [],
  templateUrl: './pokedex-screen.html',
  styleUrl: './pokedex-screen.scss',
})
export class PokedexScreen {
  pokemon = input<any>();
  opened = input<boolean>(false);
  onclick = output<void>();

  bgUrl = computed(() => {
    const pkmn = this.pokemon();
    if (!pkmn || !pkmn.types) return '/images/scene.jpg';
    
    const types = pkmn.types.map((t: any) => t.type.name.toLowerCase());
    if (types.includes('water')) return '/images/scene water.png';
    if (types.includes('fire')) return '/images/scene fire.jpg';
    if (types.includes('grass')) return '/images/scene.jpg';
    
    return '/images/scene.jpg';
  });
}
