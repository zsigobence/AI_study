import { Routes } from '@angular/router';
import { NotesListComponent } from './notes-list/notes-list.component';
import { UploadComponent } from './upload/upload.component';
import { QuestionsComponent } from './questions/questions.component';
import { QuizComponent } from './quiz/quiz.component';
import { LoginComponent } from './login/login.component';
import { AdduserComponent } from './adduser/adduser.component';
import { ListuserComponent } from './listuser/listuser.component';


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
},
{
    path: 'quiz',
    component: QuizComponent
},
{
    path: 'login',
    component: LoginComponent
},
{
    path: 'adduser',
    component: AdduserComponent
},
{
    path: 'listuser',
    component: ListuserComponent
},













];
