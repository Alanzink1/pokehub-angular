import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { Order } from './pages/order/order';
import { GameMode } from './pages/game-mode/game-mode';
import { BattlePage } from './pages/battle/battle';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'order', component: Order },
  { path: 'game-mode', component: GameMode },
  { path: 'battle', component: BattlePage },
];
