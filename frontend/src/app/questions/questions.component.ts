import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedModule } from '../shared.module'; 

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [SharedModule], 
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent {
  questions: any[] = [];
  notes: any[] = [];  
  selectedSubject: string = "";
  selectedNote: string = "";
  filteredNotes: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadNotes();
    this.getQuestions();
    this.onSubjectChange();
  }

  loadNotes(): void {
  this.apiService.getNotes().subscribe(
    (response) => {
      this.notes = response;
      this.onSubjectChange();
    },
    (error) => {
      console.error("Hiba a jegyzetek lekérésekor:", error);
    }
  );
}


  changeActiveQuestions(): void {
    this.apiService.changeQuestions(this.selectedNote).subscribe(
      (response) => {
        console.log("Kérdések frissítve")
        this.getQuestions();
      },
      (error) => {
        console.error('Hiba történt a kérdés frissítésekor:', error);
      }
    );
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

    getUniqueSubjects(): string[] {
    return [...new Set(this.notes.map(note => note.subject))];
  }

  
  onSubjectChange(): void {
    if (this.selectedSubject) {
      this.filteredNotes = this.notes.filter(note => note.subject === this.selectedSubject && note.questions.length > 0);
    } else {
      this.filteredNotes = []; 
    }
  }

}
