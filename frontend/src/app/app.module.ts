import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { ApiService } from './api.service';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from './shared.module';
import { ListuserComponent } from './listuser/listuser.component';


@NgModule({
  declarations: [
    AppComponent,
    NotesListComponent,
    HeaderComponent,
    ListuserComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    NgFor,
    HttpClientModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    SharedModule
  ],
  providers: [
    ApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
