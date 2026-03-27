import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    return this.http.get<any>(this.baseAPIUrl, { params });
  }

  getAllPokemonNames(): Observable<{ name: string; url: string }[]> {
    const params = new HttpParams().set('limit', '2000').set('offset', '0');
    return this.http.get<any>(this.baseAPIUrl, { params }).pipe(
      map((res: any) => res.results as { name: string; url: string }[])
    );
  }

  getPokemonByUrl(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  searchByNameOrId(nameOrId: string): Observable<any> {
    return this.http.get<any>(`${this.baseAPIUrl}/${nameOrId.toLowerCase().trim()}`);
  }
}
