import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-estu-home',
  templateUrl: './estu-home.page.html',
  styleUrls: ['./estu-home.page.scss'],
})
export class EstuHomePage implements OnInit {
  nombre: string = '';
  correo: string = '';
  qrDisponible: boolean = false;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.verificarQRDisponible();
  }

  getCurrentUser() {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any>(`${this.apiUrl}/users`).subscribe(
      (users) => {
        const currentUser = users.find((user: any) => user.email === currentUserEmail);
        if (currentUser) {
          this.nombre = currentUser.nombre;
          this.correo = currentUser.email;
        } else {
          console.error('Usuario no encontrado');
          this.router.navigate(['/login']);
        }
      },
      (error) => {
        console.error('Error al obtener los datos del usuario', error);
        this.router.navigate(['/login']);
      }
    );
  }

  logout() {
    localStorage.removeItem('currentUserEmail');
    this.router.navigate(['/login']);
  }

  verificarQRDisponible() {
    this.http.get<boolean>(`${this.apiUrl}/qr-disponible`).subscribe(
      (disponible) => {
        this.qrDisponible = disponible;
      },
      (error) => {
        console.error('Error al verificar disponibilidad del QR', error);
      }
    );
  }

  async escanearQR() {
    console.log('Escaneando código QR...');
    
    const fechaHora = new Date().toISOString();
    
    this.http.get<{disponible: boolean, qrData: string}>(`${this.apiUrl}/qr-disponible`).subscribe(
      (response) => {
        if (response.disponible) {
          const qrLeido = response.qrData;
          const [clase, seccion, timestamp, randomString] = qrLeido.split('|');

          this.http.post(`${this.apiUrl}/asistencia`, {
            nombre: this.nombre,
            correo: this.correo,
            fechaHora: fechaHora,
            clase: clase,
            seccion: seccion,
            qrData: qrLeido
          }).subscribe(
            async (response: any) => {
              console.log('Respuesta del servidor:', response);
              const toast = await this.toastController.create({
                message: response.message || 'Asistencia registrada con éxito',
                duration: 2000,
                position: 'bottom',
                color: 'warning'
              });
              toast.present();
            },
            async (error: HttpErrorResponse) => {
              console.error('Error al registrar asistencia', error);
              let errorMessage = 'Error al registrar asistencia';
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              this.mostrarError(errorMessage);
            }
          );
        } else {
          this.mostrarError('No hay un código QR válido disponible');
        }
      },
      (error) => {
        console.error('Error al obtener el QR disponible', error);
        this.mostrarError('Error al verificar el código QR');
      }
    );
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
    toast.present();
  }
}