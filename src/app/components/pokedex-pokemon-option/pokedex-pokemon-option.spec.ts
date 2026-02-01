import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokedexPokemonOption } from './pokedex-pokemon-option';

describe('PokedexPokemonOption', () => {
  let component: PokedexPokemonOption;
  let fixture: ComponentFixture<PokedexPokemonOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexPokemonOption]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokedexPokemonOption);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
