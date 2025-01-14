import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'start-ani',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'rpass',
    loadChildren: () => import('./rpass/rpass.module').then( m => m.RpassPageModule)
  },
  {
    path: 'profe-home',
    loadChildren: () => import('./profe-home/profe-home.module').then( m => m.ProfeHomePageModule)
  },
  {
    path: 'estu-home',
    loadChildren: () => import('./estu-home/estu-home.module').then( m => m.EstuHomePageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule)
  } ,
  {
    path: 'start-ani',
    loadChildren: () => import('./start-ani/start-ani.module').then( m => m.StartAniPageModule)
  },
  {
    path: 'list-asis',
    loadChildren: () => import('./list-asis/list-asis.module').then( m => m.ListAsisPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }