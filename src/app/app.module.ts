import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MenuModule} from 'primeng/menu';
import {ButtonModule, DropdownModule, InputTextModule, MessageService, OrderListModule, TooltipModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {MapService} from './map.service';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {ToastModule} from 'primeng/toast';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MenuModule,
    InputTextModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ButtonModule,
    OrderListModule,
    DropdownModule,
    TooltipModule,
    ToastModule
  ],
  providers: [MapService, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
