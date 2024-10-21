import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  private apiUrl = 'http://localhost:3000'; // Asegúrate de que este URL sea correcto

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) {
        return `El ${field} es requerido`;
      }
      if (control.errors['email']) {
        return 'Ingrese un correo electrónico válido';
      }
    }
    return '';
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      this.http.post(`${this.apiUrl}/login`, { email, password }).subscribe(
        async (response: any) => {
          localStorage.setItem('currentUserEmail', email);
          if (response.user.role === 'profesor') {
            this.router.navigate(['/profe-home']);
          } else {
            this.router.navigate(['/estu-home']);
          }
        },
        async (error) => {
          const toast = await this.toastController.create({
            message: 'Credenciales incorrectas',
            duration: 2000,
            position: 'bottom',
            color: 'Warning'
          });
          toast.present();
        }
      );
    }
  }

  goToRegistro() {
    this.router.navigate(['/registro']);
  }

  goToResetPassword() {
    this.router.navigate(['/rpass']);
  }

  
}
