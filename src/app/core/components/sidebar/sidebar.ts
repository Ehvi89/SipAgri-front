import {Component, OnInit} from '@angular/core';

export interface Menu {
  link: string;
  label: string;
  icon: string;
  fa: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  menus!: Menu[]

  constructor() {}

  ngOnInit() {
    this.initMenus()
  }

  private initMenus(): void {
    this.menus = [
      { label: "Dashboard", link: "/", icon: "dashboard", fa: false },
      { label: "Planteurs", link: "/planteurs", icon: "group", fa: false },
      { label: "Plantations", link: "/plantations", icon: "fa-tractor", fa: true },
      { label: "Productions", link: "/productions", icon: "fa-wheat-awn", fa: true },
      { label: "Paramètre", link: "/paramètres", icon: "settings", fa: false }
    ]
  }
}
