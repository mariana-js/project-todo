import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TodoComponent } from "../todo/todo.component";
import { AngularMaterialCheckboxComponent } from "./angular-material-checkbox/angular-material-checkbox.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TodoComponent, AngularMaterialCheckboxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'todo';


}
