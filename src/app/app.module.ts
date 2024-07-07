import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TwoWayStreamComponent } from './components/two-way-stream/two-way-stream.component';
import { RenegotiateComponent } from './components/renegotiate/renegotiate.component';

@NgModule({
  declarations: [
    AppComponent,
    TwoWayStreamComponent,
    RenegotiateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
