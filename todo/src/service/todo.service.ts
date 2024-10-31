import { Time } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: Time;
  status: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private api = 'http://localhost:3000/taks';
  private tasks: Task[] = [];
  private nextId = "";
  private cod = 0;

  constructor(private http: HttpClient) {

    this.getTaskCount().subscribe(count => {
      this.cod = count + 1; // O próximo ID será um a mais que o total atual
    });
   }
  getTaskCount(): Observable<number> {
    return this.http.get<any[]>(this.api).pipe(
      map((tasks => tasks.length) // Retorna a quantidade de tarefas
    ));
  }
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.api);
  }
  addTask(task: Task): Observable<Task> {
    task.id = this.cod.toString();
    this.tasks.push(task);
    return this.http.post<Task>(this.api, task);
  }

  updateTask(task: Task): Observable<Task> {
    const index = this.tasks.findIndex(i => i.id === task.id);
    if (index !== -1) {
      this.tasks[index] = task;
    }
    return this.http.put<Task>(`${this.api}/${task.id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    this.tasks = this.tasks.filter(task => task.id !== id);
    return this.http.delete<void>(`${this.api}/${id}`)
  }
}
