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
  completed: Task[] = [];
  taskSelected: boolean = false;
  darkmode = false;
  hide = true;
  remove = "";
  openOrder = false;
  criterio: string = 'semordem';
  r: boolean = false;

  newTask: Task = {
    id: '',
    title: '',
    description: '',
    date: null,
    time: null,
    status: false,
    repeat: ''
  }

  constructor(private todoService: TodoService) { }

  ngOnInit() {
    this.nowdate = new Date();
    this.loadTasks();
  }



  order(lista: Task[], criterio: 'title' | 'date'): void {
    lista.sort((a, b) => {
      let valorA: string | number = 0;
      let valorB: string | number = 0;

      if (criterio === 'date') {
        // Colocar `null` no final e converter valores válidos para timestamp
        const dataA = a.date ? new Date(a.date).getTime() : null;
        const dataB = b.date ? new Date(b.date).getTime() : null;

        // Nulls vão para o final
        if (dataA === null && dataB === null) return 0;
        if (dataA === null) return 1; // `a` vai para o final
        if (dataB === null) return -1; // `b` vai para o final

        // Ordenar valores válidos normalmente
        return dataA - dataB;
      } else if (criterio === 'title') {
        // Garantir comparação de `title` como strings
        valorA = a.title ? a.title.toLowerCase() : '';
        valorB = b.title ? b.title.toLowerCase() : '';

        // Comparação padrão
        if (valorA > valorB) return 1;
        if (valorA < valorB) return -1;
        return 0;
      }

      return 0; // Caso não caia em nenhum critério
    });
  }

  atributeOrderTasks(criterio: 'title' | 'date') {
    this.criterio = criterio;
    if (criterio === 'title') {
      this.order(this.filteredTasks, 'title');
      this.order(this.completed, 'title');

    } else if (criterio === 'date') {
      this.order(this.filteredTasks, 'date');
      this.order(this.completed, 'date');
    }
  }

  clearTime() {
    this.newTask.date = null;
    this.newTask.time = null;
    this.newTask.repeat = '';
  }

  toggleMenu() {
    this.openOrder = !this.openOrder;
  }

  hidetask() {
    this.hide = !this.hide;
    this.loadTasks();
  }

  loadTasks() {
    this.todoService.getTasks().subscribe(task => {
      this.tasks = task;
      this.filteredTasks = this.tasks.filter(task => !task.status);
      this.completedTasks = this.tasks.filter(task => task.status);
      if (this.hide === false) {
        this.completed = this.completedTasks;
      } else {
        this.completed = [];
      }
    });
    if (this.criterio !== 'semordem') {
      this.atributeOrderTasks(this.criterio as 'title' | 'date')
    }
  }

  modetoggle() {
    this.darkmode = !this.darkmode;

    document.documentElement.setAttribute('data-theme', this.darkmode ? "dark" : "light");

    const modeIcon = document.getElementById('mode-icon') as HTMLImageElement;
    // const modeDelete = document.getElementById('delete') as HTMLImageElement;
    // const modeUp = document.getElementById('update') as HTMLImageElement;
    if (modeIcon) {
      modeIcon.src = this.darkmode ? "assets/mode-light.png" : "assets/mode-dark.png";

      const updateIcons = document.querySelectorAll('id-update') as NodeListOf<HTMLImageElement>;
      updateIcons.forEach(icon => {
        icon.src = this.darkmode ? "assets/update.png" : "assets/update-dark.png";
      });

      const deleteIcons = document.querySelectorAll('id-delete') as NodeListOf<HTMLImageElement>;
      deleteIcons.forEach(icon => {
        icon.src = this.darkmode ? "assets/delete-dark.png" : "assets/delete.png";
      });
    }
  }
  repeatToggle() {
    this.r = !this.r;
  }

  reT() {
    if (this.newTask.repeat) {
      this.repeatTask();
      this.newTask.id = '';
      this.addTask();
    } else {
    }
  }

  repeatTask() {
    const dateTask = new Date(this.newTask.date + 'T00:00:00');

    const newDateTask = new Date(dateTask);

    if (this.newTask.repeat === 'diariamente') {
      newDateTask.setDate(newDateTask.getDate() + 1);

    } else if (this.newTask.repeat === 'semanalmente') {
      newDateTask.setDate(newDateTask.getDate() + 7);

    } else if (this.newTask.repeat === 'mensalmente') {
      newDateTask.setMonth(newDateTask.getMonth() + 1);

    } else if (this.newTask.repeat === 'anualmente') {
      newDateTask.setFullYear(newDateTask.getFullYear() + 1);
    } else {
    }
    const formattedDate = newDateTask.toISOString().split('T')[0];

    this.newTask.date = formattedDate;
  }
  toggleStatus(task: Task) {
    task.status = !task.status;
    this.todoService.updateTask(task).subscribe(() => {
      if (task.status) {
        this.filteredTasks = this.filteredTasks.filter(t => t.id !== task.id);
        this.completedTasks.push(task);
      } else {
        this.completedTasks = this.completedTasks.filter(t => t.id !== task.id);
        this.filteredTasks.push(task);
        this.hide === false;
      }
    });
    this.loadTasks();
  }


  editTask(task: Task) {
    this.editedTask = { ...task };
    this.newTask = { ...task };
  }

  save() {
    if (this.newTask.date === null || (this.newTask.date === null && this.newTask.time)) {
      this.newTask.repeat = '';
    }
    if (this.taskSelected) {
      this.updateTask();
    } else {
      this.addTask();
    }
    this.clear();
    this.remove = "";
  }

  selected(task: Task) {
    this.editTask(task);
    this.taskSelected = true;
    const s = this.taskSelected;
    console.log(this.taskSelected)
    this.remove = "Remover data de conclusão";
    return s;
  }

  clear() {
    this.newTask = {
      id: '',
      title: '',
      description: '',
      date: null, // Definindo como null para não preencher automaticamente com a data atual
      time: null,
      status: false,
      repeat: ''
    }
    this.taskSelected = false;
    this.r = false

  }
  addTask() {

    if (this.newTask.title && this.newTask.title.trim() !== '') {
      this.todoService.addTask(this.newTask).subscribe(task => {
        this.tasks.push(task);
        this.loadTasks();
      });

    } else {
      alert("Insira o título da tarefa.")
    }
  }
  updateTask() {
    this.editedTask = this.newTask;
    if (this.newTask) {
      this.todoService.updateTask(this.editedTask).subscribe(task => {
        const index = this.tasks.findIndex(i => i.id === task.id);
        if (index !== -1) this.tasks[index] = task;
        this.editedTask = null;
        this.loadTasks();
        this.clear();

      });
    }
  }
  deleteTask(id: string) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      this.todoService.deleteTask(id).subscribe(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.loadTasks();
        this.clear();
      });
    }

  }
}
