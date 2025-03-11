import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'questions',
  imports: [NgFor, NgIf],
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent {
  questions: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getQuestions();
  }

  getQuestions(): void {
    this.apiService.getQuestions().subscribe(
      (response) => {
        if (response.questions && response.questions.length > 0) {
          this.questions = response.questions;
        } else {
          console.log('Nincsenek kérdések!');
        }
      },
      (error) => {
        console.error('Hiba történt a kérdések lekérésekor:', error);
      }
    );
  }

}
