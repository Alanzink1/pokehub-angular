import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpDataClient {
  private readonly http: HttpClient = inject(HttpClient);
  private baseAPIUrl = 'https://pokeapi.co/api/v2/pokemon';

  getLimitedPokemon(offset: number = 0, limit: number = 50): Observable<any[]> {
    const params = new HttpParams()
    .set('offset', offset.toString())
    .set('limit', limit.toString());
    return this.http.get<any>(this.baseAPIUrl, {params});
  }

  getPokemonByUrl(url: string): Observable<any> {
    return this.http.get<any>(url);
  }
}
