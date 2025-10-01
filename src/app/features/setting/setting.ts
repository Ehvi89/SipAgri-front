import {Component, OnInit} from '@angular/core';
import {Supervisor} from '../../core/models/supervisor-model';
import { AuthService } from "../auth/services/auth-service";

@Component({
  selector: "app-setting",
  standalone: false,
  templateUrl: './setting.html',
  styleUrl: './setting.scss'
})
export class Setting implements OnInit {
  menus!: {
    label: string,
    link: string,
    exact: boolean,
  } []

  supervisor!: Supervisor;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.supervisor = this.authService.getCurrentUser();
    this.menus = [
      { label: "Compte", link: "/settings", exact: true },
      { label: "Superviseurs", link: "supervisors", exact: false },
      { label: "Générale", link: "general", exact: true},
      { label: "Produits", link: "products", exact: false },
      { label: "Kits", link: "kits", exact: false },
    ]
  }
}
