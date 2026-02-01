import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpDataClient } from '../../services/http-data-client';

@Component({
  selector: 'app-pokedex-pokemon-option',
  standalone: true,
  templateUrl: './pokedex-pokemon-option.html',
  styleUrl: './pokedex-pokemon-option.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexPokemonOption {
  private readonly pokemonService = inject(HttpDataClient);

  private audio?: HTMLAudioElement;
  private wasActive = false;

  url = input<string>('');
  isActive = input<boolean>(false);

  // ✅ AGORA É SIGNAL (tem .set e é lido com pokemon())
  pokemon = signal<any | null>(null);

  // (opcional) evita string e deixa simples
  cardClass = computed(() => (this.isActive() ? 'option-selected' : ''));

  constructor() {
    // ✅ Busca quando url() mudar
    effect(() => {
      const u = this.url();
      if (!u) {
        this.pokemon.set(null);
        return;
      }

      this.pokemonService.getPokemonByUrl(u).subscribe({
        next: (data: any) => {
          const formatted = {
            ...data,
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
          };

          // ✅ evita NG0100/hydration: seta no próximo microtask
          queueMicrotask(() => this.pokemon.set(formatted));
        },
        error: (err) => console.error('Erro ao carregar dados do pokémon:', err),
      });
    });

    // ✅ Som quando vira ativo (sem mexer no template)
    effect(() => {
      const active = this.isActive();
      if (active && !this.wasActive) this.playAudio();
      this.wasActive = active;
    });
  }

  onClick() {
  // se quiser tocar só quando estiver ativo:
  if (!this.isActive()) return;
  this.playAudio();
}


  playAudio() {
  const p = this.pokemon();
  const cry = p?.cries?.latest || p?.cries?.legacy;
  if (!cry) return;

  if (this.audio) {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  this.audio = new Audio(cry);
  this.audio.volume = 0.1;
  this.audio.play().catch(() => {});
}

}
