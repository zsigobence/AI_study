import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { SharedModule } from '../shared.module';

@Component({
  imports: [SharedModule],
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent {

  user = {
    username: '',
    password: '',
    role: 'user'
  };
  constructor(private apiService: ApiService, private authService: AuthService) {}

  onSubmit() {
    const token = this.authService.getToken();
    console.log(localStorage)
    if (this.user.username && this.user.password && this.user.role) {
      this.apiService.addUser(this.user).subscribe({
        next: () => alert('Felhasználó sikeresen hozzáadva!'),
        error: (err) => alert('Hiba történt: ' + err.error.message)
      });
    } else {
      alert('Kérjük, töltsd ki az összes mezőt!');
    }
  }
}
