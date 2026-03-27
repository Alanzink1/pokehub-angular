import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamPokemon, TYPE_COLORS } from '../../services/team.service';

@Component({
  selector: 'app-order-pokemon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-pokemon.html',
  styleUrl: './order-pokemon.scss',
})
export class OrderPokemon {
  pokemon = input.required<TeamPokemon>();
  index = input.required<number>();
  isSelected = input<boolean>(false);
  isFirst = input<boolean>(false);
  isLast = input<boolean>(false);

  selectPokemon = output<void>();
  moveUp = output<void>();
  moveDown = output<void>();
  removePokemon = output<void>();
  changeLevel = output<number>();

  hpPercent = computed(() => {
    const p = this.pokemon();
    return p ? (p.currentHp / p.maxHp) * 100 : 0;
  });

  hpBarColor = computed(() => {
    const p = this.hpPercent();
    if (p < 20) return '#c03028';
    if (p < 50) return '#f08030';
    return '#78c850';
  });

  levelChanged(event: any) {
    const val = parseInt(event.target.value);
    if (!isNaN(val)) {
      this.changeLevel.emit(Math.min(100, Math.max(1, val)));
    }
  }

  typeColor(type: string): string {
    return TYPE_COLORS[type.toLowerCase()] || '#A8A878';
  }
}
