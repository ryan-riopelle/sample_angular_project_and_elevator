import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoemService, Poem } from './poem.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  query = '';
  loading = false;
  error: string | null = null;

  poems: Poem[] = [];
  randomPoem?: Poem;
  countAuthor = 0;
  countTitle = 0;

  constructor(private poemsApi: PoemService) {}

  search() {
    const name = this.query.trim();
    if (!name) return;

    this.loading = true;
    this.error = null;

    this.poemsApi.searchByName(name).subscribe({
      next: ({ byAuthor, byTitle }) => {
        this.countAuthor = byAuthor.length;
        this.countTitle = byTitle.length;

        // De-duplicate by author+title
        const key = (p: Poem) => `${p.author}::${p.title}`;
        const uniq = new Map<string, Poem>();
        [...byAuthor, ...byTitle].forEach(p => uniq.set(key(p), p));
        this.poems = Array.from(uniq.values());

        // Pick a random poem if any
        this.randomPoem = this.poems.length
          ? this.poems[Math.floor(Math.random() * this.poems.length)]
          : undefined;

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to fetch poems. Please try again.';
        this.loading = false;
      },
    });
  }

  clear() {
    this.query = '';
    this.poems = [];
    this.randomPoem = undefined;
    this.countAuthor = 0;
    this.countTitle = 0;
    this.error = null;
  }
}

