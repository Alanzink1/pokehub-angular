import { Component } from '@angular/core';
import { OrderPokemon } from '../../components/order-pokemon/order-pokemon';
import { OrderPokemonScreen } from '../../components/order-pokemon-screen/order-pokemon-screen';

@Component({
  selector: 'app-order',
  imports: [OrderPokemon, OrderPokemonScreen],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {

}
