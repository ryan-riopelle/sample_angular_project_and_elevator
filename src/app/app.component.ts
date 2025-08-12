import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PoemService, Poem } from './poem.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'poetry-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  query = '';
  loading = false;
  error: string | null = null;

  poems: Poem[] = [];
  randomPoem?: Poem;
  countAuthor = 0;
  countTitle = 0;

  private input$ = new Subject<string>();
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  constructor(private poemsApi: PoemService) {}

  ngOnInit() {
    // Seed from URL (?q=...)
    const initial = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.query = initial;
    this.input$.next(initial);

    // Debounced pipeline
    this.input$
      .pipe(
        map(q => q.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        tap(q => {
          // Update URL (remove q when empty)
          this.router.navigate([], {
            queryParams: q ? { q } : { q: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          this.loading = !!q;
          if (!q) this.resetResults();
        }),
        switchMap(q => (q ? this.poemsApi.searchByName(q) : of(null))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          if (!res) { this.loading = false; return; }
          this.countAuthor = res.byAuthor.length;
          this.countTitle = res.byTitle.length;

          const key = (p: Poem) => `${p.author}::${p.title}`;
          const uniq = new Map<string, Poem>([...res.byAuthor, ...res.byTitle].map(p => [key(p), p]));
          this.poems = Array.from(uniq.values());
          this.randomPoem = this.poems.length ? this.poems[Math.floor(Math.random() * this.poems.length)] : undefined;
          this.error = null;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to fetch poems. Please try again.';
          this.loading = false;
        },
      });
  }

  onQueryChanged() {
    this.input$.next(this.query);
  }

  searchNow() {
    // Optional: immediate search on Enter (skip debounce)
    const q = this.query.trim();
    this.loading = !!q;
    this.router.navigate([], {
      queryParams: q ? { q } : { q: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.input$.next(q);
  }

  clear() {
    this.query = '';
    this.onQueryChanged();
  }

  private resetResults() {
    this.poems = [];
    this.randomPoem = undefined;
    this.countAuthor = 0;
    this.countTitle = 0;
    this.error = null;
  }
}

