import { CommonModule } from '@angular/common';
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
    HttpClientModule
  ],
  providers: [TodoService],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  tasks: Task[] = [];
  nowdate: Date | undefined;
  editedTask: Task | null = null;
  filteredTasks: Task[] = [];
  completedTasks: Task[] = [];
  taskSelected: boolean = false;
  newTask: Task = {
    id: '',
    title: '',
    description: '',
    date: new Date(),
    time: {
      hours: 0,
      minutes: 0
    },
    status: false
  }

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.nowdate = new Date();
    this.loadTasks();
  }

  loadTasks() {
    this.todoService.getTasks().subscribe(task => {
      this.tasks = task;
      this.filteredTasks = this.tasks.filter(task => !task.status);
      this.completedTasks = this.tasks.filter(task => task.status);

    });
  }
  toggleStatus(task: Task) {
    task.status = !task.status;
    this.todoService.updateTask(task).subscribe();
    this.loadTasks();
  }

  editTask(task: Task) {
    this.editedTask = { ...task };
    this.newTask = { ...task };
  }
  save(){
    console.log("Salvando", this.taskSelected)
    if (this.taskSelected === true){
      console.log("Alterando",this.editedTask)

      this.updateTask();
      this.loadTasks()
    } else {
      console.log("Adicionando")
      this.addTask();
      this.loadTasks()
    }

    this.loadTasks();
  }
  selected(task: Task) {
    this.editTask(task);
    const s =  this.taskSelected = true;
    console.log("Selecionando ",s)
    return s;
  }

  clear(){
    this.newTask = {
      id: '',
      title: '',
      description: '',
      date: new Date(),
      time: {
        hours: 0,
        minutes: 0
      },
      status: false
    }
  }
  addTask() {

    if (this.newTask.title && this.newTask.title.trim() !== '') {
    this.todoService.addTask(this.newTask).subscribe(task => {
      this.tasks.push(task);
      this.clear();
    });

  } else {
    alert("Insira o título da tarefa.")
  }
  }
  updateTask() {
    if (this.newTask) {
      this.editedTask = this.newTask;
      this.todoService.updateTask(this.editedTask).subscribe(task => {
        const index = this.tasks.findIndex(i => i.id === task.id);
        if (index !== -1) this.tasks[index] = task;
        this.editedTask = null;
        this.taskSelected = false
        this.clear();
        console.log("Alterado")
      });
    }
  }
  deleteTask(id: string) {
    if(confirm("Tem certeza que deseja excluir esta tarefa?")){
      this.todoService.deleteTask(id).subscribe(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.loadTasks();
      });
    }

  }

}
