import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-no-content-error',
  standalone: false,
  templateUrl: './no-content-error.html',
  styleUrl: './no-content-error.scss'
})
export class NoContentError {
  @Input() title?: string;
  @Input() description?: string;
  @Input() link?: string;
}
