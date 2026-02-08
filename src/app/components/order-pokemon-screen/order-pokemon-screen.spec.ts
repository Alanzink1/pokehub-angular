import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPokemonScreen } from './order-pokemon-screen';

describe('OrderPokemonScreen', () => {
  let component: OrderPokemonScreen;
  let fixture: ComponentFixture<OrderPokemonScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPokemonScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPokemonScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
