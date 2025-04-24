import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SharedModule } from '../shared.module';

@Component({
  imports: [SharedModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoggedIn = false;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.isLoggedIn().subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  onSubmit() {
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log(localStorage)
        console.log('Sikeres bejelentkezés!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Hibás belépési adatok!';
        console.error(err);
      }
    });
  }
  
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']); 
  }
}
