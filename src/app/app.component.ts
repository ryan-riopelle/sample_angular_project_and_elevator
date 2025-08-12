// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { PoetryService } from './poetry.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  poems: any[] = [];
  randomPoem: any;

  constructor(private poetryService: PoetryService) { }

  ngOnInit() {
    this.getPoems();
    this.getRandomPoem();
  }

  getPoems() {
    this.poetryService.getPoemsByAuthor('William Shakespeare') // Fetch poems by author
      .subscribe(data => {
        this.poems = data;
      });
  }

  getRandomPoem() {
    this.poetryService.getRandomPoem()
      .subscribe(data => {
        this.randomPoem = data[0]; // The API returns an array, we take the first item
      });
  }
}

