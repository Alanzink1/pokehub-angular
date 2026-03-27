import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpDataClient } from './http-data-client';
import { forkJoin, map, of } from 'rxjs';

export interface BattleMove {
  name: string;
  displayName: string;
  power: number;
  type: string;
  pp: number;
  currentPp: number;
  url?: string;
  isEnriched?: boolean;
}

export interface TeamPokemon {
  id: number;
  name: string;
  displayName: string;
  url: string;
  sprite: string;
  backSprite: string;
  animatedSprite: string;
  types: string[];
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  baseStats: { hp: number; atk: number; def: number; spd: number };
  moves: BattleMove[];
}

export type SelectionMode = 'team' | 'opponent';

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpDataClient);
  readonly MAX_TEAM_SIZE = 6;

  playerTeam = signal<TeamPokemon[]>([]);
  opponentTeam = signal<TeamPokemon[]>([]);
  selectionMode = signal<SelectionMode>('team');
  battleMode = signal<'offline' | 'online' | null>(null);
  username = signal<string>(this.generateName());
  opponentName = signal<string>(this.generateName('Trainer'));
  pendingVsParam = signal<string | null>(null);

  private generateName(prefix: string = 'Treinador'): string {
    return prefix + Math.floor(Math.random() * 999);
  }

  playerTeamFull = computed(() => this.playerTeam().length >= this.MAX_TEAM_SIZE);
  opponentTeamFull = computed(() => this.opponentTeam().length >= this.MAX_TEAM_SIZE);

  isInPlayerTeam(id: number): boolean {
    return this.playerTeam().some(p => p.id === id);
  }

  isInOpponentTeam(id: number): boolean {
    return this.opponentTeam().some(p => p.id === id);
  }

  toggleInCurrentTeam(raw: any): void {
    if (this.selectionMode() === 'team') {
      this.toggleInPlayerTeam(raw);
    } else {
      this.toggleInOpponentTeam(raw);
    }
  }

  toggleInPlayerTeam(raw: any): void {
    const id = raw.id as number;
    if (this.isInPlayerTeam(id)) {
      this.playerTeam.update(t => t.filter(p => p.id !== id));
    } else if (!this.playerTeamFull()) {
      const p = this.buildTeamPokemon(raw);
      this.playerTeam.update(t => [...t, p]);
      this.enrichMoveDetails(p, 'team');
    }
  }

  toggleInOpponentTeam(raw: any): void {
    const id = raw.id as number;
    if (this.isInOpponentTeam(id)) {
      this.opponentTeam.update(t => t.filter(p => p.id !== id));
    } else if (!this.opponentTeamFull()) {
      const p = this.buildTeamPokemon(raw);
      this.opponentTeam.update(t => [...t, p]);
      this.enrichMoveDetails(p, 'opponent');
    }
  }

  removeFromPlayerTeam(index: number): void {
    this.playerTeam.update(t => t.filter((_, i) => i !== index));
  }

  removeFromOpponentTeam(index: number): void {
    this.opponentTeam.update(t => t.filter((_, i) => i !== index));
  }

  swapPlayerTeam(fromIdx: number, toIdx: number): void {
    this.playerTeam.update(t => {
      const copy = [...t];
      [copy[fromIdx], copy[toIdx]] = [copy[toIdx], copy[fromIdx]];
      return copy;
    });
  }

  swapOpponentTeam(fromIdx: number, toIdx: number): void {
    this.opponentTeam.update(t => {
      const copy = [...t];
      [copy[fromIdx], copy[toIdx]] = [copy[toIdx], copy[fromIdx]];
      return copy;
    });
  }

  updatePokemonLevel(index: number, newLevel: number): void {
    const mode = this.selectionMode();
    const list = mode === 'team' ? this.playerTeam : this.opponentTeam;
    list.update(t => {
      const copy = [...t];
      const p = copy[index];
      if (p) {
        copy[index] = this.recalculateStats(p, newLevel);
      }
      return copy;
    });
  }

  enrichMoveDetails(p: TeamPokemon, mode: SelectionMode): void {
    const moveRequests = p.moves
      .filter(m => m.url && !m.isEnriched)
      .map(m => this.http.getPokemonByUrl(m.url!).pipe(
        map(res => ({
          ...m,
          power: res.power ?? 0,
          type: res.type?.name ?? m.type,
          pp: res.pp ?? m.pp,
          currentPp: res.pp ?? m.pp,
          isEnriched: true
        }))
      ));

    if (moveRequests.length === 0) return;

    forkJoin(moveRequests).subscribe(enrichedMoves => {
      const list = mode === 'team' ? this.playerTeam : this.opponentTeam;
      list.update(currentTeam => {
        return currentTeam.map(entry => {
          if (entry.id === p.id) {
            const newMoves = entry.moves.map(m => {
              const enriched = enrichedMoves.find(em => em.name === m.name);
              return enriched || m;
            });
            return { ...entry, moves: newMoves };
          }
          return entry;
        });
      });
    });
  }

  private recalculateStats(p: TeamPokemon, level: number): TeamPokemon {
    const { hp, atk, def, spd } = p.baseStats;
    const maxHp = Math.floor((2 * hp * level) / 100) + level + 10;
    const attack = Math.floor((2 * atk * level) / 100) + 5;
    const defense = Math.floor((2 * def * level) / 100) + 5;
    const speed = Math.floor((2 * spd * level) / 100) + 5;
    return { ...p, level, maxHp, currentHp: maxHp, attack, defense, speed };
  }

  buildTeamPokemon(raw: any, level: number = 99): TeamPokemon {
    const getStat = (name: string) =>
      (raw.stats ?? []).find((s: any) => s.stat?.name === name)?.base_stat ?? 45;

    const baseHp = getStat('hp');
    const baseAtk = getStat('attack');
    const baseDef = getStat('defense');
    const baseSpd = getStat('speed');

    const maxHp = Math.floor((2 * baseHp * level) / 100) + level + 10;
    const attack = Math.floor((2 * baseAtk * level) / 100) + 5;
    const defense = Math.floor((2 * baseDef * level) / 100) + 5;
    const speed = Math.floor((2 * baseSpd * level) / 100) + 5;

    const types: string[] = (raw.types ?? []).map((t: any) => t.type?.name as string);
    const allMoves: any[] = raw.moves ?? [];
    const moves = this.pickRandomMoves(allMoves, types[0] ?? 'normal');

    const name = raw.name as string;
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return {
      id: raw.id as number,
      name,
      displayName,
      url: `https://pokeapi.co/api/v2/pokemon/${raw.id}`,
      sprite: raw.sprites?.front_default ?? '',
      backSprite: raw.sprites?.back_default ?? raw.sprites?.front_default ?? '',
      animatedSprite:
        raw.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default ??
        raw.sprites?.front_default ?? '',
      types,
      level,
      maxHp,
      currentHp: maxHp,
      attack,
      defense,
      speed,
      baseStats: { hp: baseHp, atk: baseAtk, def: baseDef, spd: baseSpd },
      moves,
    };
  }

  private pickRandomMoves(allMoves: any[], pokemonType: string): BattleMove[] {
    const powerOptions = [40, 50, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    const ppOptions = [5, 10, 10, 15, 15, 20];

    const shuffled = [...allMoves].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);

    return selected.map((m: any) => {
      const moveName: string = m.move?.name ?? 'tackle';
      const moveUrl: string = m.move?.url ?? '';
      const power = powerOptions[Math.floor(Math.random() * powerOptions.length)];
      const pp = ppOptions[Math.floor(Math.random() * ppOptions.length)];
      const displayName = moveName
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      return {
        name: moveName,
        displayName,
        power,
        type: pokemonType,
        pp,
        currentPp: pp,
        url: moveUrl,
        isEnriched: false
      };
    });
  }

  getEffectiveness(moveType: string, defenderTypes: string[]): number {
    let mult = 1;
    for (const defType of defenderTypes) {
      mult *= TYPE_CHART[moveType]?.[defType] ?? 1;
    }
    return mult;
  }

  calculateDamage(attacker: TeamPokemon, move: BattleMove, defender: TeamPokemon): number {
    const level = attacker.level;
    const atk = attacker.attack;
    const def = Math.max(1, defender.defense);
    const power = move.power || 0;

    if (power === 0) return 0;

    let damage = Math.floor(((2 * level / 5 + 2) * atk * power / def) / 50) + 2;
    const randomFactor = (Math.floor(Math.random() * 16) + 85) / 100;
    damage = Math.floor(damage * randomFactor);

    if (attacker.types.includes(move.type)) {
      damage = Math.floor(damage * 1.5);
    }

    const effectiveness = this.getEffectiveness(move.type, defender.types);
    damage = Math.floor(damage * effectiveness);

    return Math.max(1, damage);
  }

  encodeTeam(team: TeamPokemon[]): string {
    const data = team.map(p => `${p.id}:${p.level}`).join(',');
    return btoa(data);
  }

  decodeTeamIds(encoded: string): { id: number; level: number }[] {
    try {
      const data = atob(encoded);
      return data.split(',').map(entry => {
        const [id, level] = entry.split(':').map(Number);
        return { id, level };
      });
    } catch {
      return [];
    }
  }

  clearAll(): void {
    this.playerTeam.set([]);
    this.opponentTeam.set([]);
    this.selectionMode.set('team');
    this.battleMode.set(null);
    this.pendingVsParam.set(null);
  }
}
