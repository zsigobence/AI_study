import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-upload',
  imports: [FormsModule,CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  subject: string = "";
  notes: any[] = [];  // Jegyzetek listája

  selectedSubject: string = "";
  selectedNote: string = "";
  selectedType: string = "";
  selectedLength: number = 10;
  selectedListSubject: string = "";
  constructor(private apiService: ApiService, private router: Router) {}

  filteredNotes: any[] = [];
  filteredNotesList: any[] = [];

  ngOnInit(): void {
    this.loadNotes();
    this.onSubjectChange();
  }

  loadNotes(): void {
    this.apiService.getNotes().subscribe(
      (response) => {
        this.notes = response.data;
        this.onSubjectChange();
      },
      (error) => {
        console.error("Hiba a jegyzetek lekérésekor:", error);
      }
    );
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (this.selectedFile && this.subject) {
      this.apiService.uploadNote(this.selectedFile, this.subject).subscribe(
        (response) => {
          console.log("Feltöltés sikeres!", response);
          alert("Jegyzet sikeresen feltöltve!");
          this.loadNotes();
        },
        (error) => {
          console.error("Hiba történt!", error);
          alert("Hiba történt a feltöltés során.");
        }
      );
    } else {
      alert("Adj meg egy tárgyat és válassz egy fájlt!");
    }
  }

  deleteNote(fileName: string) {
    if (confirm(`Biztos törölni szeretnéd: ${fileName}?`)) {
      this.apiService.deleteNote(fileName).subscribe(
        () => {
          alert("Jegyzet törölve!");
          this.loadNotes();
          this.onSubjectChange();
        },
        (error) => {
          console.error("Hiba a törlésnél:", error);
          alert("Nem sikerült törölni a jegyzetet.");
        }
      );
    }
  }

  viewNote(fileName: string) {
    window.open(this.apiService.getNoteFile(fileName), "_blank");
  }

  generate(){
    if (this.selectedLength && this.selectedType && this.selectedSubject) {
      this.apiService.generateQuestions(this.selectedLength, this.selectedType, this.selectedSubject, this.selectedNote).subscribe(
        (response) => {
          console.log(response);
          alert("Generálás sikeres!");
          this.router.navigate(['/questions']);
        },
        (error) => {
          console.error("Hiba történt!", error);
          alert("Hiba történt a generálás során. Próbálja újra!");
        }
      );
    } else {
      alert("Adj meg egy típust és válassz egy fájlt!");
    }
  }

  getUniqueSubjects(): string[] {
    return [...new Set(this.notes.map(note => note.subject))];
  }

  
  onSubjectChange(): void {
    if (this.selectedListSubject) {
      this.filteredNotesList = this.notes.filter(note => note.subject === this.selectedListSubject);
    } else {
      this.filteredNotesList = this.notes; 
    }
    if (this.selectedSubject) {
      this.filteredNotes = this.notes.filter(note => note.subject === this.selectedSubject);
    } else {
      this.filteredNotes = []; 
    }
  }
}