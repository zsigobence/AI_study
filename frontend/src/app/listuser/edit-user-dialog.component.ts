import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { SharedModule } from '../shared.module'; 

@Component({
  selector: 'app-edit-user-dialog',
  template:`
<h2 mat-dialog-title>Felhasználó szerkesztése</h2>
<mat-dialog-content>
  <form>
    <mat-form-field appearance="fill">
      <mat-label>Felhasználónév</mat-label>
      <input matInput [(ngModel)]="user.name" name="name" required>
    </mat-form-field>

        <mat-form-field appearance="fill">
      <mat-label>Teljes név</mat-label>
      <input matInput [(ngModel)]="user.fullname" name="fullname" required>
    </mat-form-field>

    <mat-form-field appearance="fill">
      <mat-label>Email</mat-label>
      <input matInput type="email" [(ngModel)]="user.email" name="email" required>
    </mat-form-field>


    <mat-form-field appearance="fill">
      <mat-label>Szerepkör</mat-label>
      <mat-select [(ngModel)]="user.role" name="role" required>
        <mat-option value="admin">Admin</mat-option>
        <mat-option value="user">User</mat-option>
      </mat-select>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="cancel()">Mégse</button>
  <button mat-raised-button color="primary" (click)="updateUser()">Mentés</button>
</mat-dialog-actions>
`,
imports:[SharedModule],
styles: [`  
    h2{
    padding-bottom: 20px;
    }
  `],
})
export class EditUserDialog {

  user: any;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService
  ) {
    this.user = data.user;
  }

  updateUser() {
  if (this.user.name && this.user.role && this.user.fullname && this.user.email) {
    const updateData: any = {
      name: this.user.name,
      fullname: this.user.fullname,
      email: this.user.email,
      role: this.user.role
    };
    this.apiService.updateUser(this.user._id, updateData).subscribe({
      next: () => {
        alert('Felhasználó frissítve!');
        this.dialogRef.close('updated');
      },
      error: (err) => {
        alert('Hiba történt: ' + err.error.message);
      }
    });
  } else {
    alert('Minden mezőt ki kell tölteni!');
  }
}


  cancel() {
    this.dialogRef.close();
  }
}
