import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokedexScreen } from './pokedex-screen';

describe('PokedexScreen', () => {
  let component: PokedexScreen;
  let fixture: ComponentFixture<PokedexScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokedexScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
