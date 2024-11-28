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
  
order(lista: Task[], criterio: 'title' | 'date'): void {
  lista.sort((a, b) => {
      let valorA = a[criterio];
      let valorB = b[criterio];

      if (criterio === 'date') {
        valorA = a.date ? a.date.getTime() : 0;
        valorB = b.date ? b.date.getTime() : 0;
      } else if (criterio === 'title') {
        valorA = a.title.toLowerCase();
        valorB = b.title.toLowerCase();
      }

      if (valorA > valorB) return 1;
      if (valorA < valorB) return -1;
      return 0;
    });
  this.openOrder = false; // Fecha o menu após a ordenação
}

  // Funções para adicionar ao projeto em casa
  clearTime() {
    this.newTask.date = null;
    this.newTask.time = null;
  }


  openOrder = false; // Controla se o menu está aberto ou não

  toggleMenu() {
    this.openOrder = !this.openOrder;
  }


  remove = "";
  tasks: Task[] = [];
  nowdate: Date | undefined;
  editedTask: Task | null = null;
  filteredTasks: Task[] = [];
  completedTasks: Task[] = [];
  taskSelected: boolean = false;
  darkmode = false;

  newTask: Task = {
    id: '',
    title: '',
    description: '',
    date: null,
    time: null,
    status: false
  }

  constructor(private todoService: TodoService) { }

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

  toggleStatus(task: Task) {
    task.status = !task.status; // Altera o status localmente
    this.todoService.updateTask(task).subscribe(() => {
      // Atualiza as listas localmente sem recarregar todas as tarefas
      if (task.status) {
        // Se a tarefa estiver concluída, mova para completedTasks
        this.filteredTasks = this.filteredTasks.filter(t => t.id !== task.id);
        this.completedTasks.push(task);
      } else {
        // Se a tarefa não estiver concluída, mova para filteredTasks
        this.completedTasks = this.completedTasks.filter(t => t.id !== task.id);
        this.filteredTasks.push(task);
      }
    });
  }


  editTask(task: Task) {
    this.editedTask = { ...task };
    this.newTask = { ...task };
  }

  save() {
    if (this.taskSelected) {
      this.updateTask();
    } else {
      this.addTask();
    }
    this.taskSelected = false;
    this.clear();
    // Adicao
    this.remove = ""; 
  }

  selected(task: Task) {
    this.editTask(task);
    const s = this.taskSelected = true;
    // Adicao
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
      status: false
    }
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
      });
    }
  }
  deleteTask(id: string) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      this.todoService.deleteTask(id).subscribe(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.loadTasks();
      });
    }

  }

}
