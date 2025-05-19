import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { SharedModule } from '../shared.module';
import { Router } from '@angular/router';

@Component({
  imports: [SharedModule],
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent {

  user = {
  name: '',       // username helyett name
  fullname: '',
  email: '',
  password: '',
  role: 'user'
};


  constructor(private apiService: ApiService, private authService: AuthService, 
              private router: Router  
  ) {}

  ngOnInit() {
      this.apiService.getUserRole().subscribe({
        next: (data) => {
          console.log(data);
          if (data.role !== 'admin') {
            alert('Nincs jogosultságod az oldal megtekintéséhez!');
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Nem sikerült ellenőrizni a jogosultságot.');
          this.router.navigate(['/login']);
        }
      });
    }

  onSubmit() {
  if (this.user.name && this.user.fullname && this.user.email && this.user.password && this.user.role) {
    this.apiService.addUser(this.user).subscribe({
      next: () => alert('Felhasználó sikeresen hozzáadva!'),
      error: (err) => alert('Hiba történt: ' + err.error.message)
    });
  } else {
    alert('Kérjük, töltsd ki az összes mezőt!');
  }
}

}
