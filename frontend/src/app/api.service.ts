import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_URL = 'http://localhost:3000';  

  constructor(private http: HttpClient) {}


  getNotes(): Observable<any> {
    return this.http.get(`${this.API_URL}/notes_data`);
  }


  uploadNote(file: File, subject: string): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subject', subject);
    return this.http.post(`${this.API_URL}/upload`, formData);
  }


  deleteNote(fileName: string) {
    return this.http.delete(`http://localhost:3000/notes/${fileName}`);
  }

 
  getNoteFile(fileName: string): string {
    return `${this.API_URL}/notes/${fileName}`; 
  }
}
