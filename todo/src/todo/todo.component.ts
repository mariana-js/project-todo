import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TodoService } from '../service/todo.service';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule],
  providers: [TodoService],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  tasks: Task[] = [];
  nowdate: Date | undefined;
  editTask: Task | null = null;
  filteredTasks: Task[] = [];
  completedTasks: Task[] = [];
  newTask: Task = {
    id: 0,
    title: '',
    description: '',
    date: new Date(),
    time: {
      hours: 0,
      minutes: 0
    },
    status: false
  }

  constructor(private todoService: TodoService) {

  }

  ngOnInit() {
    this.nowdate = new Date();
    this.loadTasks();
  }

  loadTasks() {
    this.todoService.getTasks().subscribe(task => {
      this.tasks = task;
      this.filteredTasks = this.tasks.filter(task => task.status === false);
      this.completedTasks = this.tasks.filter(task => task.status === true);

    });
  }
  toggleStatus(task: Task) {
    task.status = !task.status;
    this.todoService.updateTask(task).subscribe();
    this.loadTasks();
  }

  editItem(task: Task) {
    this.editTask = { ...task };
  }

  addTask() {
    this.todoService.addTask(this.newTask).subscribe(task => {
      this.tasks.push(task);
      this.newTask = {
        id: 0,
        title: '',
        description: '',
        date: new Date(),
        time: {
          hours: 0,
          minutes: 0
        },
        status: false
      }
    })
  }
  updateTask() {
    if (this.editTask) {
      this.todoService.updateTask(this.editTask).subscribe(task => {
        const index = this.tasks.findIndex(i => i.id === task.id);
        if (index !== -1) this.tasks[index] = task;
        this.editTask = null;
      });
    }
  }
  deleteItem(id: number) {
    this.todoService.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter(task => task.id !== id); // Remove o item da lista
    });
  }

}

