import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPokemonList } from './order-pokemon-list';

describe('OrderPokemonList', () => {
  let component: OrderPokemonList;
  let fixture: ComponentFixture<OrderPokemonList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPokemonList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPokemonList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
