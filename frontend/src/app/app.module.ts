import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { CanvasComponent } from './core/components/canvas/canvas.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TestchatComponent } from './core/components/testchat/testchat.component';

@NgModule({
    declarations: [AppComponent, CanvasComponent, TestchatComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        MatCommonModule,
        MatSliderModule,
        MatCardModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
