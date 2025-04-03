import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
    selector: 'loading-dialog',
    template: `
    <h2 mat-dialog-title>Generálás</h2>
    <mat-dialog-content>
    <mat-spinner></mat-spinner>
    </mat-dialog-content>`
    ,
    styles: [`  
        mat-dialog-content {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
  
        mat-spinner {
          width: 50px;
          height: 50px;
        }
  
        h2 {
          text-align: center;
        }
      `],
    imports: [MatButtonModule,  MatDialogTitle, MatDialogContent,MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class LoadingDialog {
    readonly dialogRef = inject(MatDialogRef<LoadingDialog>);
  }