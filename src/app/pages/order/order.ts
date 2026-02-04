import { Component } from '@angular/core';
import { OrderPokemon } from '../../components/order-pokemon/order-pokemon';

@Component({
  selector: 'app-order',
  imports: [OrderPokemon],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {

}
