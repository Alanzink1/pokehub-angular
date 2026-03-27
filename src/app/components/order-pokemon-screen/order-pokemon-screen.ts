import { Component, computed, input } from '@angular/core';
import { TeamPokemon, TYPE_COLORS } from '../../services/team.service';

@Component({
  selector: 'app-order-pokemon-screen',
  imports: [],
  templateUrl: './order-pokemon-screen.html',
  styleUrl: './order-pokemon-screen.scss',
})
export class OrderPokemonScreen {
  pokemon = input<TeamPokemon | null>(null);

  hpPercent = computed(() => {
    const p = this.pokemon();
    if (!p) return 100;
    return Math.round((p.currentHp / p.maxHp) * 100);
  });

  primaryType = computed(() => {
    const p = this.pokemon();
    return p?.types?.[0] ?? 'normal';
  });

  typeColor = computed(() => {
    return TYPE_COLORS[this.primaryType()] ?? TYPE_COLORS['normal'];
  });

  hpBarColor = computed(() => {
    const pct = this.hpPercent();
    if (pct > 50) return '#64eb17';
    if (pct > 25) return '#f8d030';
    return '#e02020';
  });

  bgUrl = computed(() => {
    const p = this.pokemon();
    if (!p || !p.types) return '/images/scene.jpg';
    
    const types = p.types.map(t => t.toLowerCase());
    if (types.includes('water') || types.includes('ice')) return '/images/scene water.png';
    if (types.includes('fire')) return '/images/scene fire.jpg';
    if (types.includes('grass') || types.includes('bug')) return '/images/scene.jpg';
    
    return '/images/scene.jpg';
  });
}
