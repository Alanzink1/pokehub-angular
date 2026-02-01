import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokedexPokemonInfo } from './pokedex-pokemon-info';

describe('PokedexPokemonInfo', () => {
  let component: PokedexPokemonInfo;
  let fixture: ComponentFixture<PokedexPokemonInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexPokemonInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokedexPokemonInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
