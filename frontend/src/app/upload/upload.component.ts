import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  // 📌 Jegyzetek betöltése
  loadNotes(): void {
    this.apiService.getNotes().subscribe(
      (response) => {
        this.notes = response.data;
      },
      (error) => {
        console.error("Hiba a jegyzetek lekérésekor:", error);
      }
    );
  }

  // 📌 Fájl kiválasztása
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // 📌 Fájl feltöltése
  upload() {
    if (this.selectedFile && this.subject) {
      this.apiService.uploadNote(this.selectedFile, this.subject).subscribe(
        (response) => {
          console.log("Feltöltés sikeres!", response);
          alert("Jegyzet sikeresen feltöltve!");
          this.loadNotes(); // Frissítjük a listát
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

  // 📌 Jegyzet törlése
  deleteNote(fileName: string) {
    if (confirm(`Biztos törölni szeretnéd: ${fileName}?`)) {
      this.apiService.deleteNote(fileName).subscribe(
        () => {
          alert("Jegyzet törölve!");
          this.loadNotes();
        },
        (error) => {
          console.error("Hiba a törlésnél:", error);
          alert("Nem sikerült törölni a jegyzetet.");
        }
      );
    }
  }

  // 📌 Jegyzet megtekintése
  viewNote(fileName: string) {
    window.open(this.apiService.getNoteFile(fileName), "_blank");
  }
}