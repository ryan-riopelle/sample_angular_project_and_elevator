import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

@Injectable({ providedIn: 'root' })
export class PoemService {
  private base = 'https://poetrydb.org';

  constructor(private http: HttpClient) {}

  getByAuthor(author: string): Observable<Poem[]> {
    const url = `${this.base}/author/${encodeURIComponent(author)}`;
    return this.http.get<Poem[] | any>(url).pipe(
      map(r => Array.isArray(r) ? r : []),
      catchError(() => of([]))
    );
  }

  getByTitle(title: string): Observable<Poem[]> {
    const url = `${this.base}/title/${encodeURIComponent(title)}`;
    return this.http.get<Poem[] | any>(url).pipe(
      map(r => Array.isArray(r) ? r : []),
      catchError(() => of([]))
    );
  }

  // Fetch both in parallel from a single name input
  searchByName(name: string): Observable<{ byAuthor: Poem[]; byTitle: Poem[] }> {
    return forkJoin({
      byAuthor: this.getByAuthor(name),
      byTitle: this.getByTitle(name),
    }).pipe(
      tap(result => this.logResults(name, result.byAuthor, result.byTitle))
    );
  }

  private logResults(name: string, byAuthor: Poem[], byTitle: Poem[]) {
    const logPoems = (label: string, poems: Poem[]) => {
      console.group(`${label}: ${poems.length} result(s)`);
      poems.forEach((p, i) => {
        console.group(`#${i + 1} ${p.title} — ${p.author}`);
        console.log('Lines:', p.lines.length);
        console.log('First line:', p.lines[0]);
        console.log('Data object:', p);
        console.groupEnd();
      });
      console.groupEnd();
    };

    console.group(`Search "${name}"`);
    logPoems('Matched by author', byAuthor);
    logPoems('Matched by title', byTitle);
    console.groupEnd();
  }
}