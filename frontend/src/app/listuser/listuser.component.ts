import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-listuser',
  imports: [SharedModule],
  templateUrl: './listuser.component.html',
  styleUrls: ['./listuser.component.css']
})
export class ListuserComponent {

  users: any[] = [];
  selectedUser: any = null;
  isModalOpen: boolean = false; 

  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers() {
    this.apiService.getUsers().subscribe((data: any) => {
      this.users = data.users;
    });
  }
  
  deleteUser(id: string) {
    if (confirm('Biztosan törölni szeretnéd?')) {
      this.apiService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
  
  editUser(user: any) {
    this.selectedUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  updateUser() {
    if (this.selectedUser.username && this.selectedUser.role) {
      this.apiService.updateUser(this.selectedUser._id, this.selectedUser).subscribe({
        next: () => {
          alert('Felhasználó sikeresen frissítve!');
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          alert('Hiba történt a frissítés során: ' + err.error.message);
        }
      });
    } else {
      alert('Minden mezőt ki kell tölteni!');
    }
  }
}
