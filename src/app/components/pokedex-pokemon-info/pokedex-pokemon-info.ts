import { Component, input, computed, inject, signal, effect } from '@angular/core';
import { HttpDataClient } from '../../services/http-data-client';

@Component({
  selector: 'app-pokedex-pokemon-info',
  standalone: true,
  imports: [],
  templateUrl: './pokedex-pokemon-info.html',
  styleUrl: './pokedex-pokemon-info.scss',
})
export class PokedexPokemonInfo {
  private readonly pokemonService = inject(HttpDataClient);

  pokemon = input<any | null>(null);
  showTable = false;
  
  species = signal<any | null>(null);

  types = computed(() => this.pokemon()?.types ?? []);

  heightM = computed(() => ((this.pokemon()?.height ?? 0) / 10).toFixed(1));
  weightKg = computed(() => ((this.pokemon()?.weight ?? 0) / 10).toFixed(1));

  flavorText = computed(() => {
    const entries = this.species()?.flavor_text_entries ?? [];
    const en = entries.find((e: any) => e.language?.name === 'en');
    return (en?.flavor_text ?? '').replace(/\f/g, ' ');
  });

  constructor() {
    effect((onCleanup) => {
      const id = this.pokemon()?.id;
      if (!id) {
        this.species.set(null);
        return;
      }

      const url = `https://pokeapi.co/api/v2/pokemon-species/${id}/`;

      const sub = this.pokemonService.getPokemonByUrl(url).subscribe({
        next: (data: any) => this.species.set(data),
        error: (err) => {
          console.error('Erro ao carregar species:', err);
          this.species.set(null);
        },
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  toggleTable() {
    if (this.pokemon() != null) {
      this.showTable = !this.showTable;
    }
  }
}
