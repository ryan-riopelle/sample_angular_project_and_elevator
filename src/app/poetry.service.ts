// src/app/poetry.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoetryService {
  private readonly POETRY_API_BASE_URL = 'https://poetrydb.org/'; 

  constructor(private http: HttpClient) { } // Inject HttpClient

  // Example: Fetch poems by author
  getPoemsByAuthor(author: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.POETRY_API_BASE_URL}author/${author}`); // Perform GET request
  }

  // Example: Fetch a random poem
  getRandomPoem(): Observable<any[]> {
    return this.http.get<any[]>(`${this.POETRY_API_BASE_URL}random`);
  }
}

