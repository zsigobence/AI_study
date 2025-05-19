import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { SharedModule } from '../shared.module'; 
import { ApiService } from '../api.service';


@Component({
  imports: [SharedModule],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  isLoggedIn = false; 
  userRole: string = '';

  constructor(private authService: AuthService, private router: Router,
    private apiservice: ApiService) {}

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((status) => {
      this.isLoggedIn = status;

      if (this.isLoggedIn) {
        this.apiservice.getUserRole().subscribe({
          next: (data) => {
            this.userRole = data.role;
          },
          error: (err) => {
            console.error('Nem sikerült lekérni a szerepkört:', err);
            this.userRole = '';
          }
        });
      } else {
        this.userRole = '';
      }
    });
  }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(path: string) {
  this.router.navigate([path]);
  this.menuOpen = false; 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); 
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  canAccess() {
    return this.userRole === 'admin' || this.userRole === 'user';
  }
}
