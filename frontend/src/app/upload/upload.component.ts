import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  imports: [FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  subject: string = "";

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (this.selectedFile && this.subject) {
      this.apiService.uploadNote(this.selectedFile, this.subject).subscribe(response => {
        console.log("Feltöltés sikeres!", response);
        alert("Jegyzet sikeresen feltöltve!");
      }, error => {
        console.error("Hiba történt!", error);
        alert("Hiba történt a feltöltés során.");
      });
    } else {
      alert("Adj meg egy tárgyat és válassz egy fájlt!");
    }
  }
}
