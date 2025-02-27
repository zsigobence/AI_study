import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getNotesData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notes_data`);
  }

  uploadNote(file: File, subject: string): Observable<any> {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("subject", subject);
  
    return this.http.post('http://localhost:3000/upload', formData);
  }
  
  
}
