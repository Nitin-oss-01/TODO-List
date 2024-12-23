import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../api.service';

interface Todo {
  id: number;
  description: string;
}

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnChanges {
  @Input() selectedUser: { id: number; name: string; todos: Todo[] } | null = null;
  newTodo: string = '';
  editingIndex: number | null = null;
  editingTodo: string = '';

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedUser'] && this.selectedUser) {
      this.resetTodoForm();
      this.loadTodos();
    }
  }

  loadTodos() {
    if (this.selectedUser) {
      this.apiService.getTodos(this.selectedUser.id).subscribe(
        todos => {
          if (this.selectedUser) {
            // console.log(this.selectedUser)
            this.selectedUser.todos = todos.map(t => ({ id: t.id, description: t.todo }));
          }
        },
        error => {
          console.error('Error fetching todos:', error);
          window.alert('Unable to load TODOs. Please try again later.');
        }
      );
    }
  }

  resetTodoForm() {
    this.newTodo = '';
    this.editingIndex = null;
    this.editingTodo = '';
  }

  addTodo() {
    if (this.newTodo.trim() && this.selectedUser) {
      this.apiService.addTodo(this.selectedUser.id, this.newTodo).subscribe(
        todo => {
          if (this.selectedUser) {
            this.selectedUser.todos.push({ id: todo.id, description: this.newTodo });
            this.newTodo = '';
          }
        },
        error => {
          window.alert(error.error.error); // Show the error message from the backend
        }
      );
    } else {
      window.alert("TODO cannot be empty.");
    }
  }

  editTodo(index: number, todo: Todo) {
    this.editingIndex = index;
    this.editingTodo = todo.description;
  }

  saveTodo() {
    if (this.editingTodo.trim() && this.selectedUser && this.editingIndex !== null) {
      const todo = this.selectedUser.todos[this.editingIndex];
      this.apiService.updateTodo(todo.id, this.editingTodo).subscribe(
        () => {
          if (this.selectedUser && this.editingIndex !== null) {
            this.selectedUser.todos[this.editingIndex].description = this.editingTodo;
            this.resetTodoForm();
          }
        },
        error => {
          window.alert(error.error.error); // Show the error message from the backend
        }
      );
    }
  }

  deleteTodo(todo: Todo) {
    this.apiService.deleteTodo(todo.id).subscribe(() => {
      if (this.selectedUser) {
        this.selectedUser.todos = this.selectedUser.todos.filter(t => t.id !== todo.id);
      }
    });
  }
}
