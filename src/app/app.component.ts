import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'seqnavi';
  items: MenuItem[];

  ngOnInit() {
    this.items = [
      {
        label: 'マップ',
        icon: 'pi pi-map-marker',
        routerLink: ['/map']
      },
    ];
  }

}
