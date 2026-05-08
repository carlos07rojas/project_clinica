import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import {
  heroBeaker,
  heroUserGroup,
  heroUser,
  heroCalendarDays,
  heroClipboardDocument,
  heroCreditCard,
  heroBuildingOffice2,
  heroCurrencyDollar,
  heroClock
} from '@ng-icons/heroicons/outline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // habilita HttpClient en toda la aplicación sin esto ningún servicio puede hacer peticiones HTTP
    provideHttpClient(), // es como registrar un cliente HTTP global 
    provideIcons({
      heroBeaker,
      heroUserGroup,
      heroUser,
      heroCalendarDays,
      heroClipboardDocument,
      heroCreditCard,
      heroBuildingOffice2,
      heroCurrencyDollar,
      heroClock
    })
  ]
};