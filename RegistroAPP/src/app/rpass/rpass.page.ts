import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rpass',
  templateUrl: './rpass.page.html',
  styleUrls: ['./rpass.page.scss'],
})
export class RpassPage implements OnInit {
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private http: HttpClient
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {}

  getErrorMessage(campo: string): string {
    const control = this.resetForm.get(campo);
    if (control?.errors) {
      if (control.errors['required']) {
        return `Este campo es requerido`;
      }
      if (control.errors['email']) {
        return 'Ingrese un correo electrónico válido';
      }
      if (control.errors['minlength']) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
    }
    return '';
  }

  async onResetPassword() {
    if (this.resetForm.valid) {
      const { email, newPassword } = this.resetForm.value;
      
      try {
        // Primero, verifica si el usuario existe
        const respuesta: any = await this.http.get(`http://localhost:3000/users?email=${email}`).toPromise();
        
        if (respuesta && respuesta.length > 0) {
          const usuario = respuesta[0];
          
          // Actualiza la contraseña del usuario
          const respuestaActualizacion: any = await this.http.put(`http://localhost:3000/users/${email}`, {
            ...usuario,
            password: newPassword
          }).toPromise();

          if (respuestaActualizacion && respuestaActualizacion.message === 'Usuario actualizado exitosamente') {
            const alerta = await this.alertController.create({
              header: 'Contraseña actualizada',
              message: 'Tu contraseña ha sido actualizada exitosamente.',
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {
                    this.router.navigate(['/login']);
                  }
                }
              ]
            });

            await alerta.present();
          } else {
            throw new Error('Fallo al actualizar la contraseña');
          }
        } else {
          throw new Error('Usuario no encontrado');
        }
      } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        
        const alerta = await this.alertController.create({
          header: 'Error',
          message: 'No se encontró una cuenta asociada a este correo electrónico o hubo un problema al actualizar la contraseña.',
          buttons: ['Aceptar']
        });

        await alerta.present();
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}