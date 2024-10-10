import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-estu-home',
  templateUrl: './estu-home.page.html',
  styleUrls: ['./estu-home.page.scss'],
})
export class EstuHomePage implements OnInit {
  nombre: string = '';
  correo: string = '';
  private apiUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getCurrentUser();
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

  async escanearQR() {
    console.log('Escaneando código QR...');
    
    const fechaHora = new Date().toLocaleString();
    
    this.http.post(`${this.apiUrl}/asistencia`, {
      nombre: this.nombre,
      correo: this.correo,
      fechaHora: fechaHora
    }).subscribe(
      async () => {
        const toast = await this.toastController.create({
          message: 'Asistencia registrada con éxito',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        toast.present();
      },
      async (error) => {
        console.error('Error al registrar asistencia', error);
        const toast = await this.toastController.create({
          message: 'Error al registrar asistencia',
          duration: 2000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
      }
    );
  }
}