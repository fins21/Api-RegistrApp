import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';

interface Asistencia {
  nombre: string;
  correo: string;
  fechaHora: string;
  clase: string;
  seccion: string;
}

interface Clase {
  nombre: string;
  secciones: string[];
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
  clases: Clase[] = [];
  claseSeleccionada: string = '';
  seccionSeleccionada: string = '';
  qrGenerado: boolean = false;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ){}

  ngOnInit() {
    this.getCurrentUser();
    this.cargarAsistencias();
    this.cargarClases();
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

  cargarClases() {
    this.http.get<Clase[]>(`${this.apiUrl}/clases`).subscribe(
      (clases) => {
        this.clases = clases;
        console.log('Clases cargadas:', this.clases);
      },
      (error) => {
        console.error('Error al cargar las clases', error);
      }
    );
  }

  async seleccionarClaseYSeccion() {
    const claseAlert = await this.alertController.create({
      header: 'Seleccionar Clase',
      inputs: this.clases.map(clase => ({
        name: 'clase',
        type: 'radio',
        label: clase.nombre,
        value: clase.nombre,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Siguiente',
          handler: async (claseNombre) => {
            if (claseNombre) {
              this.claseSeleccionada = claseNombre;
              const claseSeleccionada = this.clases.find(c => c.nombre === claseNombre);
              if (claseSeleccionada) {
                await this.seleccionarSeccion(claseSeleccionada.secciones);
              }
            }
          },
        },
      ],
    });

    await claseAlert.present();
  }

  async seleccionarSeccion(secciones: string[]) {
    const seccionAlert = await this.alertController.create({
      header: 'Seleccionar Sección',
      inputs: secciones.map(seccion => ({
        name: 'seccion',
        type: 'radio',
        label: seccion,
        value: seccion,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Generar QR',
          handler: (seccion) => {
            if (seccion) {
              this.seccionSeleccionada = seccion;
              this.generarCodigoQR();
            }
          },
        },
      ],
    });

    await seccionAlert.present();
  }

  generarCodigoQR() {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(1, 5);
    this.qrData = `${this.claseSeleccionada}|${this.seccionSeleccionada}|${timestamp}|${randomString}`;
    this.qrGenerado = true;

    // Notificar al servidor que se ha generado un nuevo código QR
    this.http.post(`${this.apiUrl}/qr-generado`, {
      clase: this.claseSeleccionada,
      seccion: this.seccionSeleccionada,
      qrData: this.qrData
    }).subscribe(
      async (response: any) => {
        console.log('Generación de código QR notificada al servidor', response);
        const toast = await this.toastController.create({
          message: 'Nuevo código QR generado y activado',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        toast.present();
      },
      async error => {
        console.error('Error al notificar la generación del código QR', error);
        const toast = await this.toastController.create({
          message: 'Error al generar el código QR',
          duration: 2000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
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
  
  ionViewDidEnter() {
    this.cargarAsistencias();
  }

  getAsistenciasPorClase(): { [key: string]: Asistencia[] } {
    return this.asistencias.reduce((acc, asistencia) => {
      const key = `${asistencia.clase}|${asistencia.seccion}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(asistencia);
      return acc;
    }, {} as { [key: string]: Asistencia[] });
  }
}