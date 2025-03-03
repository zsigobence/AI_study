import { Routes } from '@angular/router';
import { NotesListComponent } from './notes-list/notes-list.component';
import { UploadComponent } from './upload/upload.component';
import { QuestionsComponent } from './questions/questions.component';

export const routes: Routes = [

{
    path: 'notes',
    component: NotesListComponent
},
{
    path: 'upload',
    component: UploadComponent
},
{
    path: 'questions',
    component: QuestionsComponent
}














];
