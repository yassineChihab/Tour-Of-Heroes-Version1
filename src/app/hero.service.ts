import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from 'src/models/hero';
import { MessageService } from './message.service';


@Injectable({ providedIn: 'root' })
export class HeroService {

  private heroesUrl = 'api/heroes';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET heroes from the server */
  getHeroes():Observable<Hero[]>{
    return this.http.get<Hero[]>(this.heroesUrl)
    .pipe(
      tap(_=>this.log('fetched Heroes')),
      catchError(this.handleError('getHeroes',[]))
    );
  }

  getHero(id:number):Observable<Hero>
  {
    const url=`${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_=>this.log(`fetched hero whit id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  /** GET hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

 


  addHero(hero:Hero):Observable<Hero>
  {
    return this.http.post<Hero>(this.heroesUrl,hero,this.httpOptions).pipe(
      tap((newHero:Hero)=>this.log((`added new Hero with id=${newHero.id}`))),
      catchError(this.handleError<Hero>('AddHero'))
    );
  }

  deleteHero(id:number):Observable<Hero>{
    const url=`${this.heroesUrl}/${id}`;
    return this.http.delete<Hero>(url,this.httpOptions).pipe(
          tap(_=>this.log(`deleted Hero id=${id}`)),
          catchError(this.handleError<Hero>('deletedHero'))
    );
  }
  updateHero(hero:Hero):Observable<any>
  {
    return this.http.put(this.heroesUrl,hero,this.httpOptions).pipe(
      tap(_=>this.log(`updates hero id=${hero.id}` ),
      catchError(this.handleError<any>('updateHero')))
    );
  }
  /** 
  * @param operation - name of the operation that failed
  * @param result - optional value to return as the observable result
  * 
  * */
  private handleError<T>(operation='operation',result?: T)
  {
      return (error:any):Observable<T>=>{
        console.error(error);
        console.log(`${operation} failed: ${error.message}`);
        return of(result as T);
      }
  }
  
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
         this.log(`found heroes matching "${term}"`) :
         this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
 
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}