import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { Order } from './pages/order/order';

export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'order', component: Order}
];
