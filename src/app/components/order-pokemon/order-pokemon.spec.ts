import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPokemon } from './order-pokemon';

describe('OrderPokemon', () => {
  let component: OrderPokemon;
  let fixture: ComponentFixture<OrderPokemon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPokemon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPokemon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
