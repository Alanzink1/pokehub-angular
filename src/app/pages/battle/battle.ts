import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpDataClient } from '../../services/http-data-client';
import { BattleMove, TeamPokemon, TeamService, TYPE_COLORS } from '../../services/team.service';
import { MusicService } from '../../services/music.service';

type BattlePhase = 'intro' | 'action' | 'move-select' | 'pokemon-select' | 'flee-confirm' | 'processing' | 'game-over';

export interface SpriteState {
  hurt: boolean;
  fainted: boolean;
  entering: boolean;
  attacking: boolean;
  shaking: boolean;
}

@Component({
  selector: 'app-battle',
  imports: [],
  templateUrl: './battle.html',
  styleUrl: './battle.scss',
})
export class BattlePage implements OnInit {
  private readonly pokemonService = inject(HttpDataClient);
  private readonly router = inject(Router);
  readonly teamService = inject(TeamService);
  private readonly route = inject(ActivatedRoute);
  private readonly musicService = inject(MusicService);

  phase = signal<BattlePhase>('intro');
  messages = signal<string[]>([]);
  currentMessage = signal('');
  loadingOpponent = signal(false);
  gameOverMessage = signal('');
  winner = signal<'player' | 'enemy' | null>(null);

  playerTeamBattle = signal<TeamPokemon[]>([]);
  opponentTeamBattle = signal<TeamPokemon[]>([]);
  playerActiveIndex = signal(0);
  opponentActiveIndex = signal(0);

  playerActive = computed(() => this.playerTeamBattle()[this.playerActiveIndex()] ?? null);
  opponentActive = computed(() => this.opponentTeamBattle()[this.opponentActiveIndex()] ?? null);

  playerHpPercent = computed(() => {
    const p = this.playerActive();
    return p ? Math.max(0, Math.round((p.currentHp / p.maxHp) * 100)) : 0;
  });
  opponentHpPercent = computed(() => {
    const p = this.opponentActive();
    return p ? Math.max(0, Math.round((p.currentHp / p.maxHp) * 100)) : 0;
  });
  playerHpColor = computed(() => this.hpColor(this.playerHpPercent()));
  opponentHpColor = computed(() => this.hpColor(this.opponentHpPercent()));

  playerState = signal<SpriteState>({ hurt: false, fainted: false, entering: false, attacking: false, shaking: false });
  enemyState = signal<SpriteState>({ hurt: false, fainted: false, entering: false, attacking: false, shaking: false });

  arenaShake = signal(false);
  flashScreen = signal(false);
  flashColor = signal('#ffffff');

  arenaBgUrl = computed(() => {
    const opp = this.opponentActive();
    if (!opp || !opp.types) return '/images/scene.jpg';
    const types = opp.types.map(t => t.toLowerCase());
    if (types.includes('water') || types.includes('ice')) return '/images/scene water.png';
    if (types.includes('fire')) return '/images/scene fire.jpg';
    return '/images/scene.jpg';
  });

  cursorIndex = signal(0);
  moveCursorIndex = signal(0);
  selectedBenchIndex = signal(0);
  keyboardActive = signal(false);
  displayedMessage = signal('');
  private _typewriterTimer: any = null;
  private _pendingPhase: BattlePhase = 'action';
  private _isTypewriting = false;
  readonly typeColors = TYPE_COLORS;

  ngOnInit() {
    this.musicService.play('gym');
    const vsParam = this.route.snapshot.queryParamMap.get('vs');
    if (vsParam) this.loadOnlineOpponent(vsParam);
    else this.initBattle();
  }

  private loadOnlineOpponent(encoded: string) {
    if (this.teamService.playerTeam().length === 0) {
      this.teamService.pendingVsParam.set(encoded);
      this.router.navigate(['/']);
      return;
    }
    this.loadingOpponent.set(true);
    const decoded = this.teamService.decodeTeamIds(encoded);
    if (decoded.length === 0) { this.initBattle(); return; }
    const requests = decoded.map(entry => this.pokemonService.searchByNameOrId(String(entry.id)).toPromise());
    Promise.all(requests).then(results => {
      const team = results.filter(r => !!r).map(r => this.teamService.buildTeamPokemon(r));
      this.teamService.opponentTeam.set(team);
      this.loadingOpponent.set(false);
      this.initBattle();
    }).catch(() => { this.loadingOpponent.set(false); this.initBattle(); });
  }

  private initBattle() {
    this.teamService.battleMode.set('online');
    const playerTeam = this.teamService.playerTeam();
    let opponentTeam = this.teamService.opponentTeam();
    if (playerTeam.length === 0) { this.router.navigate(['/']); return; }
    if (opponentTeam.length === 0) {
      opponentTeam = this.generateRandomOpponent(playerTeam.length);
      this.teamService.opponentTeam.set(opponentTeam);
    }
    this.playerTeamBattle.set(playerTeam.map(p => ({ ...p, currentHp: p.maxHp })));
    this.opponentTeamBattle.set(opponentTeam.map(p => ({ ...p, currentHp: p.maxHp })));
    this.playerActiveIndex.set(0);
    this.opponentActiveIndex.set(0);
    this.phase.set('intro');
    this.triggerEnterAnimation('enemy', 600);
    this.triggerEnterAnimation('player', 1000);
    setTimeout(() => {
      this.queueMessages([
        `${this.opponentTeamBattle()[0]?.displayName ?? '???'} é seu adversário!`,
        `Vai, ${this.teamService.username()}! ${this.playerTeamBattle()[0]?.displayName ?? '???'} é com você!`,
      ], 'action');
    }, 400);
  }

  private generateRandomOpponent(size: number): TeamPokemon[] {
    const ids: number[] = [];
    const used = new Set<number>();
    while (ids.length < size) {
      const id = Math.floor(Math.random() * 151) + 1;
      if (!used.has(id)) { used.add(id); ids.push(id); }
    }
    return ids.map(id => this.teamService.buildTeamPokemon({ id, name: `pokemon-${id}`, stats: [], types: [], moves: [], sprites: {} }));
  }

  selectFight() {
    if (this.phase() !== 'action' || !this.playerActive() || this.playerActive()!.currentHp <= 0) return;
    this.phase.set('move-select');
    this.moveCursorIndex.set(0);
  }

  backToAction() {
    if (this.playerActive() && this.playerActive()!.currentHp > 0) {
      this.phase.set('action');
      this.cursorIndex.set(0);
    }
  }

  useMove(move: BattleMove) {
    if (this.phase() !== 'move-select' || move.currentPp <= 0) {
      if (move.currentPp <= 0) this.showMessage('Sem PP!');
      return;
    }
    this.phase.set('processing');
    const player = { ...this.playerActive()! };
    const opponent = { ...this.opponentActive()! };
    const oppMoves = opponent.moves.filter(m => m.currentPp > 0);
    const oppMove = { ...(oppMoves.length > 0 ? oppMoves[Math.floor(Math.random() * oppMoves.length)] : opponent.moves[0]) };
    const playerFirst = player.speed >= opponent.speed;
    const playerDmg = this.teamService.calculateDamage(player, move, opponent);
    const oppDmg = this.teamService.calculateDamage(opponent, oppMove, player);
    const eff1 = this.teamService.getEffectiveness(move.type, opponent.types);
    const eff2 = this.teamService.getEffectiveness(oppMove.type, player.types);
    const oppNewHp = Math.max(0, opponent.currentHp - playerDmg);
    const playerNewHp = Math.max(0, player.currentHp - oppDmg);
    move.currentPp = Math.max(0, move.currentPp - 1);
    oppMove.currentPp = Math.max(0, oppMove.currentPp - 1);
    if (playerFirst) this.runPlayerFirstCinematic(player, opponent, move, oppMove, playerDmg, oppDmg, eff1, eff2, oppNewHp, playerNewHp);
    else this.runEnemyFirstCinematic(player, opponent, move, oppMove, playerDmg, oppDmg, eff1, eff2, oppNewHp, playerNewHp);
  }

  private runPlayerFirstCinematic(p: TeamPokemon, o: TeamPokemon, pm: BattleMove, om: BattleMove, pd: number, od: number, e1: number, e2: number, on: number, pn: number) {
    this.animateAttack('player', pm, () => {
      this.applyDamageToOpponent(on);
      this.updatePlayerMove(pm);
      if (on <= 0) {
        this.triggerFaint('enemy');
        this.queueMessages(this.buildMoveMessages(p, o, pm, e1, on, null, null, null, null), this.determineNextPhase(true, false));
      } else {
        setTimeout(() => this.animateAttack('enemy', om, () => {
          this.applyDamageToPlayer(pn);
          this.updateOpponentMove(om);
          if (pn <= 0) this.triggerFaint('player');
          this.queueMessages(this.buildMoveMessages(p, o, pm, e1, on, om, e2, pn, true), this.determineNextPhase(pn > 0, on > 0));
        }), 900);
      }
    });
  }

  private runEnemyFirstCinematic(p: TeamPokemon, o: TeamPokemon, pm: BattleMove, om: BattleMove, pd: number, od: number, e1: number, e2: number, on: number, pn: number) {
    this.animateAttack('enemy', om, () => {
      this.applyDamageToPlayer(pn);
      this.updateOpponentMove(om);
      if (pn <= 0) {
        this.triggerFaint('player');
        this.queueMessages(this.buildMoveMessages(p, o, null, null, null, om, e2, pn, false), this.determineNextPhase(false, true));
      } else {
        setTimeout(() => this.animateAttack('player', pm, () => {
          this.applyDamageToOpponent(on);
          this.updatePlayerMove(pm);
          if (on <= 0) this.triggerFaint('enemy');
          this.queueMessages(this.buildMoveMessages(p, o, pm, e1, on, om, e2, pn, false), this.determineNextPhase(pn > 0, on > 0));
        }), 900);
      }
    });
  }

  private animateAttack(who: 'player' | 'enemy', move: BattleMove, onHit: () => void) {
    const s = who === 'player' ? this.playerState : this.enemyState;
    const h = who === 'player' ? this.enemyState : this.playerState;
    s.update(v => ({ ...v, attacking: true }));
    setTimeout(() => s.update(v => ({ ...v, attacking: false })), 400);
    setTimeout(() => {
      this.triggerFlash(this.typeColor(move.type), 160);
      this.triggerArenaShake();
      setTimeout(() => {
        h.update(v => ({ ...v, hurt: true }));
        setTimeout(() => h.update(v => ({ ...v, hurt: false })), 600);
        onHit();
      }, 180);
    }, 320);
  }

  private buildMoveMessages(p: TeamPokemon, o: TeamPokemon, pm: BattleMove|null, e1: number|null, on: number|null, om: BattleMove|null, e2: number|null, pn: number|null, pf: boolean|null): string[] {
    const msgs: string[] = [];
    const add = (atk: TeamPokemon, mv: BattleMove, eff: number, tA: boolean, def: string) => {
      msgs.push(`${atk.displayName} usou ${mv.displayName}!`);
      if (eff > 1) msgs.push('É super eficaz!!! 💥');
      else if (eff > 0 && eff < 1) msgs.push('Não é muito eficaz...');
      else if (eff === 0) msgs.push('Não teve efeito!');
      if (!tA) msgs.push(`${def} desmaiou! ☠️`);
    };
    if (pf === null || pf === true) {
      if (pm && e1 !== null && on !== null) add(p, pm, e1, on > 0, o.displayName);
      if (om && e2 !== null && pn !== null) add(o, om, e2, pn > 0, p.displayName);
    } else {
      if (om && e2 !== null && pn !== null) add(o, om, e2, pn > 0, p.displayName);
      if (pm && e1 !== null && on !== null) add(p, pm, e1, on > 0, o.displayName);
    }
    return msgs;
  }

  private determineNextPhase(pa: boolean, oa: boolean): BattlePhase {
    if (!oa) {
      const idx = this.findNextOpponent();
      if (idx !== -1) {
        const next = this.opponentTeamBattle()[idx];
        this.opponentActiveIndex.set(idx);
        this.triggerEnterAnimation('enemy', 400);
        setTimeout(() => this.queueMessages([`O adversário enviou ${next.displayName}!`], 'action'), 200);
        return 'processing';
      }
      this.triggerVictoryFlash(); this.winner.set('player'); 
      return 'game-over';
    }
    if (!pa) {
      if (this.findNextPlayer() !== -1) return 'pokemon-select';
      this.winner.set('enemy'); 
      return 'game-over';
    }
    return 'action';
  }

  private findNextOpponent(): number {
    const t = this.opponentTeamBattle(); const c = this.opponentActiveIndex();
    for (let i = 0; i < t.length; i++) if (i !== c && t[i].currentHp > 0) return i;
    return -1;
  }

  private findNextPlayer(): number {
    const t = this.playerTeamBattle(); const c = this.playerActiveIndex();
    for (let i = 0; i < t.length; i++) if (i !== c && t[i].currentHp > 0) return i;
    return -1;
  }

  switchPokemon(i: number) {
    if (this.playerTeamBattle()[i].currentHp <= 0) return;
    this.playerActiveIndex.set(i);
    this.triggerEnterAnimation('player', 300);
    this.phase.set('processing');
    this.queueMessages([`Vai, ${this.playerTeamBattle()[i].displayName}!`], 'action');
  }

  flee() { this.phase.set('flee-confirm'); this.cursorIndex.set(0); }
  confirmFlee() { this.winner.set(null); this.gameOverMessage.set('Você fugiu!'); this.phase.set('game-over'); }

  private queueMessages(m: string[], n: BattlePhase) {
    if (m.length === 0) { this.phase.set(n); return; }
    this.currentMessage.set(m[0]); this.startTypewriter(m[0]);
    this.messages.set(m.slice(1)); this.phase.set('processing');
    this._pendingPhase = n;
  }

  onMessageClick() {
    if (this._isTypewriting) {
      if (this._typewriterTimer) clearTimeout(this._typewriterTimer);
      this._isTypewriting = false;
      this.displayedMessage.set(this.currentMessage());
      return;
    }
    const msgs = this.messages();
    if (msgs.length > 0) {
      this.currentMessage.set(msgs[0]); this.startTypewriter(msgs[0]);
      this.messages.set(msgs.slice(1));
    } else this.phase.set(this._pendingPhase);
  }

  private showMessage(m: string) {
    this.currentMessage.set(m); this.startTypewriter(m);
    this.messages.set([]); this.phase.set('processing'); this._pendingPhase = 'move-select';
  }

  private startTypewriter(t: string) {
    if (this._typewriterTimer) clearTimeout(this._typewriterTimer);
    this._isTypewriting = true;
    this.displayedMessage.set('');
    let i = 0;
    const tick = () => {
      if (i <= t.length) {
        this.displayedMessage.set(t.slice(0, i)); i++;
        this._typewriterTimer = setTimeout(tick, 28);
      } else {
        this._isTypewriting = false;
      }
    };
    tick();
  }

  private applyDamageToOpponent(h: number) {
    this.opponentTeamBattle.update(t => {
      const c = t.map(p => ({ ...p })); c[this.opponentActiveIndex()].currentHp = h; return c;
    });
  }

  private applyDamageToPlayer(h: number) {
    this.playerTeamBattle.update(t => {
      const c = t.map(p => ({ ...p })); c[this.playerActiveIndex()].currentHp = h; return c;
    });
  }

  private updatePlayerMove(mv: BattleMove) {
    this.playerTeamBattle.update(t => {
      const c = t.map(p => ({ ...p, moves: [...p.moves] }));
      const pk = c[this.playerActiveIndex()];
      const midx = pk.moves.findIndex(m => m.name === mv.name);
      if (midx >= 0) pk.moves[midx] = { ...mv };
      return c;
    });
  }

  private updateOpponentMove(mv: BattleMove) {
    this.opponentTeamBattle.update(t => {
      const c = t.map(p => ({ ...p, moves: [...p.moves] }));
      const pk = c[this.opponentActiveIndex()];
      const midx = pk.moves.findIndex(m => m.name === mv.name);
      if (midx >= 0) pk.moves[midx] = { ...mv };
      return c;
    });
  }

  private triggerArenaShake() { this.arenaShake.set(true); setTimeout(() => this.arenaShake.set(false), 500); }
  private triggerFlash(c: string, d: number) { this.flashColor.set(c); this.flashScreen.set(true); setTimeout(() => this.flashScreen.set(false), d); }
  private triggerFaint(w: 'player' | 'enemy') {
    if (w === 'player') this.playerState.update(s => ({ ...s, fainted: true }));
    else this.enemyState.update(s => ({ ...s, fainted: true }));
  }

  private triggerEnterAnimation(w: 'player' | 'enemy', d = 0) {
    setTimeout(() => {
      const st = { hurt: false, fainted: false, entering: true, attacking: false, shaking: false };
      if (w === 'player') { this.playerState.set(st); setTimeout(() => this.playerState.update(s => ({ ...s, entering: false })), 700); }
      else { this.enemyState.set(st); setTimeout(() => this.enemyState.update(s => ({ ...s, entering: false })), 700); }
    }, d);
  }

  private triggerVictoryFlash() {
    let c = 0; const f = () => {
      if (c >= 6) return; this.triggerFlash('#ffd700', 120); c++; setTimeout(f, 250);
    }; f();
  }

  hpColor(p: number) { if (p > 50) return '#5ACB14'; if (p > 25) return '#F8D030'; return '#E02020'; }
  typeColor(t: string) { return (TYPE_COLORS as any)[t] ?? '#A8A878'; }
  restartBattle() { this.initBattle(); }
  goHome() { this.teamService.clearAll(); this.router.navigate(['/']); }

  handleJoystick(dir: 'up' | 'down' | 'left' | 'right') {
    this.keyboardActive.set(true);
    if (this.phase() === 'action') this.moveCursor(dir, 2, this.cursorIndex, 3);
    else if (this.phase() === 'move-select') this.moveCursor(dir, 2, this.moveCursorIndex, 3);
    else if (this.phase() === 'flee-confirm') this.moveCursor(dir, 2, this.cursorIndex, 1);
    else if (this.phase() === 'pokemon-select') {
      const limit = this.playerTeamBattle().length;
      const cols = window.innerWidth >= 600 ? 3 : 2;
      let idx = this.selectedBenchIndex();

      if (dir === 'left') idx--;
      else if (dir === 'right') idx++;
      else if (dir === 'up') idx -= cols;
      else if (dir === 'down') idx += cols;

      if (idx < 0) idx = 0;
      if (idx >= limit) idx = limit - 1;
      this.selectedBenchIndex.set(idx);
    }
  }

  private moveCursor(dir: string, cols: number, sig: any, limit: number) {
    let i = sig();
    if (dir === 'left') i--; else if (dir === 'right') i++; else if (dir === 'up') i -= cols; else if (dir === 'down') i += cols;
    if (i < 0) i = 0; if (i > limit) i = limit; sig.set(i);
  }

  handleA() {
    const p = this.phase();
    if (p === 'intro' || p === 'processing') this.onMessageClick();
    else if (p === 'action') {
      const i = this.cursorIndex();
      if (i === 0) this.selectFight(); else if (i === 1) this.onPokemon(); else if (i === 3) this.flee();
    } else if (p === 'move-select') {
      const m = this.playerActive()?.moves[this.moveCursorIndex()]; if (m) this.useMove(m);
    } else if (p === 'pokemon-select') this.switchPokemon(this.selectedBenchIndex());
    else if (p === 'flee-confirm') {
      if (this.cursorIndex() === 0) this.confirmFlee(); else this.backToAction();
    }
    else if (p === 'game-over') this.restartBattle();
  }

  handleB() {
    const p = this.phase(); if (p === 'move-select' || p === 'pokemon-select' || p === 'flee-confirm') this.backToAction();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    const k = e.key;
    if (this.phase() === 'intro' || this.phase() === 'processing') {
      if (k === 'Enter' || k === ' ') { e.preventDefault(); this.onMessageClick(); }
      return;
    }
    if (this.winner()) return;
    this.keyboardActive.set(true);
    if (k.startsWith('Arrow')) this.handleJoystick(k.replace('Arrow', '').toLowerCase() as any);
    else if (k === 'Enter' || k === ' ') this.handleA();
    else if (k === 'Escape' || k === 'Backspace') this.handleB();
  }

  onPokemon() { this.phase.set('pokemon-select'); this.selectedBenchIndex.set(0); }
}
