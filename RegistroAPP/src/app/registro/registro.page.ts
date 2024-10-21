import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  registroform: FormGroup;
  private apiUrl = 'http://localhost:3000'; // Asegúrate de que este URL sea correcto

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {
    this.registroform = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      role: ['alumno', Validators.required]
    });
  }

  ngOnInit() {}

  passwordValidator(control: any) {
    const value = control.value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const valid = hasUpperCase && hasNumber;
    return valid ? null : { invalidPassword: true };
  }

  getErrorMessage(field: string): string {
    const control = this.registroform.get(field);
    if (control?.errors) {
      if (control.errors['required']) {
        return `El ${field} es requerido`;
      }
      if (control.errors['email']) {
        return 'Ingrese un correo electrónico válido';
      }
      if (control.errors['minlength']) {
        return `La contraseña debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['invalidPassword']) {
        return 'La contraseña debe contener al menos una mayúscula y un número';
      }
    }
    return '';
  }

  async onSubmit() {
    if (this.registroform.valid) {
      const userData = this.registroform.value;
      
      this.http.post(`${this.apiUrl}/register`, userData).subscribe(
        async (response: any) => {
          const toast = await this.toastController.create({
            message: 'Registro exitoso. Por favor, inicia sesión.',
            duration: 2000,
            position: 'bottom',
            color: 'warning'
          });
          toast.present();
          this.router.navigate(['/login']);
        },
        async (error) => {
          const toast = await this.toastController.create({
            message: error.error.message || 'Error en el registro. Intente nuevamente.',
            duration: 2000,
            position: 'bottom',
            color: 'warning'
          });
          toast.present();
        }
      );
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}