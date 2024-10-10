import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Asistencia {
  nombre: string;
  correo: string;
  fechaHora: string;
}

@Component({
  selector: 'app-profe-home',
  templateUrl: './profe-home.page.html',
  styleUrls: ['./profe-home.page.scss'],
})
export class ProfeHomePage implements OnInit {
  nombre: string = '';
  correo: string = '';
  asistencias: Asistencia[] = [];
  qrData: string | null = null;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.cargarAsistencias();
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

  generarCodigoQR() {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    this.qrData = `clase_${timestamp}_${randomString}`;
  }

  cargarAsistencias() {
    this.http.get<Asistencia[]>(`${this.apiUrl}/asistencias`).subscribe(
      (asistencias) => {
        this.asistencias = asistencias;
      },
      (error) => {
        console.error('Error al cargar las asistencias', error);
      }
    );
  }

  ionViewDidEnter() {
    this.cargarAsistencias();
  }
}