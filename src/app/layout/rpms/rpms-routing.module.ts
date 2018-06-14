import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RpmsComponent } from './rpms.component';

const routes: Routes = [
    {
        path: '', component: RpmsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RpmsRoutingModule {
}
