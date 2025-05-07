import { Component, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { SharedModule } from '../shared.module';
import { EditUserDialog } from './edit-user-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-listuser',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './listuser.component.html',
  styleUrls: ['./listuser.component.css']
})
export class ListuserComponent {
  users: any[] = [];

  constructor(private apiService: ApiService) {}

  readonly dialog = inject(MatDialog);

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
    const dialogRef = this.dialog.open(EditUserDialog, {
      width: '350px',
      data: { user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this.loadUsers(); 
      }
    });
  }
}
