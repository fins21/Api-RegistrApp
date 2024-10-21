import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Asistencia {
  nombre: string;
  correo: string;
  fechaHora: string;
  clase: string;
  seccion: string;
}

@Component({
  selector: 'app-list-asis',
  templateUrl: './list-asis.page.html',
  styleUrls: ['./list-asis.page.scss'],
})
export class ListAsisPage implements OnInit {
  nombre: string = '';
  asistencias: Asistencia[] = [];
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
  clearAsistencias() {
    this.http.delete(`${this.apiUrl}/clear-asistencias`).subscribe(
      (response: any) => {
        console.log(response.message);

        this.asistencias = [];

      },
      (error) => {
        console.error('Error al borrar asistencias', error);
      }
    );
  }

  getAsistenciasPorClase(): { [key: string]: Asistencia[] } {
    return this.asistencias.reduce((acc, asistencia) => {
      const key = `${asistencia.clase}_${asistencia.seccion}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(asistencia);
      return acc;
    }, {} as { [key: string]: Asistencia[] });
  }

  yawe() {
    this.router.navigate(['/profe-home']);
  }
    
}