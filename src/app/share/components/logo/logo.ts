import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './logo.html',
  styleUrls: ['./logo.scss']
})
export class Logo {

  @Input()
  variant: "default" | "unique" | "custom" = "default";

  @Input()
  color?: string;

  @Input()
  size?: "sm" | "md" | "xl";

  @Input()
  margin?: "none" | "xs" | "sm" | "md" | "lg" | "xl";

  @Input()
  navTo: string = "#";

  constructor() {}
}
