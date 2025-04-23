import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.checkLoginStatus());

  constructor() {}

  // Bejelentkezés
  login(username: string, password: string): Observable<any> {
    // Itt történik a hitelesítés a backenddel
    // Például: HTTP POST kérés a backendhez
    const mockResponse = { token: 'fake-jwt-token' }; // Mock válasz
    if (mockResponse.token) {
      this.saveToken(mockResponse.token);
      this.loggedIn.next(true); // Bejelentkezve állapot
      return new Observable((observer) => {
        observer.next(mockResponse);
        observer.complete();
      });
    } else {
      return new Observable((observer) => {
        observer.error('Hibás bejelentkezési adatok!');
      });
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn.next(false); // Kijelentkezett állapot
  }

  checkLoginStatus(): boolean {
    return localStorage.getItem('token') !== null;
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
}
