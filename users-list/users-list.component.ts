import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  newUserName: string = '';
  selectedUser: any = null;
  editUserName: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsers().subscribe(users => this.users = users);
  }

  addUser() {
    if (this.newUserName.trim()) {
      this.apiService.getUsers().subscribe(users => {
       
        const existingUser = users.find(user => user.name.toLowerCase().includes(this.newUserName.toLowerCase()));
        if (existingUser) {
          window.alert("User with a matching substring already exists.");
        } else {
          this.apiService.createUser(this.newUserName).subscribe(
            user => {
              this.users.push(user);
              this.newUserName = '';
            },
            error => {
              window.alert(error.error.error); // Show the error message from the backend
            }
          );
        }
      });
    } else {
      window.alert("User name cannot be empty.");
    }
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.editUserName = user.name;
    this.loadTodos(user.id);
  }

  updateUser(userId: number) {
    if (this.editUserName.trim()) {
      this.apiService.updateUser(userId, this.editUserName).subscribe(
        () => {
          const user = this.users.find(u => u.id === userId);
          if (user) {
            user.name = this.editUserName; // Update the user name in the list
          }
          this.selectedUser.name = this.editUserName; // Update the selected user name
          this.selectedUser = null; // Deselect the user
        },
        error => {
          window.alert(error.error.error); // Show the error message from the backend
        }
      );
    } else {
      window.alert("User name cannot be empty.");
    }
  }

  deleteUser(user: any) {
    this.apiService.deleteUser(user.id).subscribe(() => {
      this.users = this.users.filter(u => u.id !== user.id);
      if (this.selectedUser && this.selectedUser.id === user.id) {
        this.selectedUser = null;
      }
    });
  }

  loadTodos(userId: number) {
    this.apiService.getTodos(userId).subscribe(todos => {
      if (this.selectedUser) {
        this.selectedUser.todos = todos.map(t => t.todo);
      }
    });
  }
}
