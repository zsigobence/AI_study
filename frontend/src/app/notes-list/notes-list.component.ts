import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-notes-list',
  imports: [NgIf, NgFor],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit {

  notes: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getNotesData().subscribe(
      (data: any) => {
        console.log(data);
        this.notes = data.data;
      },
      (error) => {
        console.error('Hiba történt a jegyzetek lekérése közben:', error);
      }
    );
  }

}
