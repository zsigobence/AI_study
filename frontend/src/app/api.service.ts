import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_URL = 'http://localhost:3000';  

  constructor(private http: HttpClient) {}
  
  addUser(data: { name: string; fullname: string; email: string; password: string; role: string }) {
  const token = this.getToken();
  return this.http.post(`${this.API_URL}/add_user`, data, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  });
}


  private getToken(): string {
    return localStorage.getItem('token') || '';
  }
  
  getUserRole() {
  const token = this.getToken();
  return this.http.get<{ role: string }>(`${this.API_URL}/user-role`, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  });
}


  getUsers() {
    const token = this.getToken();
    return this.http.get<any[]>(`${this.API_URL}/users`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  deleteUser(id: string) {
    const token = this.getToken();
    return this.http.delete(`${this.API_URL}/users/${id}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }
  

  updateUser(id: string, data: { name?: string; fullname?: string; email?: string; password?: string; role?: string }) {
  const token = this.getToken();
  return this.http.put(`${this.API_URL}/users/${id}`, data, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
  });
}



    getNotes() {
    const token = this.getToken();
    return this.http.get<any[]>(`${this.API_URL}/notes_data`, {   // itt is a backend URL kell
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
}




  uploadNote(file: File, subject: string): Observable<any> {
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('subject', subject);

  const token = this.getToken();

  return this.http.post(`${this.API_URL}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}



  deleteNote(fileName: string) {
    return this.http.delete(`http://localhost:3000/notes/${fileName}`);
  }

 
  getNoteFile(fileName: string): string {
    return `${this.API_URL}/notes/${fileName}`; 
  }


generateQuestions(length: number, type: string, subject: string, note?: string): Observable<any> {
  const params = {
    length: length,
    type: type,
    subject: subject,
    note: note || ''
  };

  const token = this.getToken();

  return this.http.get(`${this.API_URL}/generate_questions`, { 
    params: params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


  saveQuestions(subject: string, note: string, newQuestions: any[]): Observable<any> {
  const token = this.getToken();
  return this.http.post(`${this.API_URL}/save_questions`, {
    subject: subject,
    note: note,
    newQuestions: newQuestions
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
  
  getQuestions(): Observable<any> {
  const token = this.getToken();
  return this.http.get<any>(`${this.API_URL}/get_questions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

  changeQuestions(note: string): Observable<any> {
  const token = this.getToken();
  const params = {
    note: note
  };
  return this.http.post<any>(`${this.API_URL}/change_questions`, {
    note: note
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

  getAnswer(question: string, answer: string): Observable<any> {
  const token = this.getToken();
  const params = {
    question: question,
    answer: answer
  };
  return this.http.get<any>(`${this.API_URL}/evaluate_question`, {
    params: params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

}
  




