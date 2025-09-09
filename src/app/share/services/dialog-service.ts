import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ConfirmationDialog} from '../components/confirmation-dialog/confirmation-dialog';
import {MatDialog} from '@angular/material/dialog';

@Injectable()
export class DialogService {
  constructor(private dialog: MatDialog,) {}

  showDialog(data: {
    title?: string,
    message?: string,
    cancelText?: string,
    confirmText?: string,
    deletion: boolean
  }): Observable<boolean> {
    return this.dialog.open(ConfirmationDialog, {
      data: {
        title: data.title,
        message: data.message,
        confirmText: data.confirmText,
        cancelText: data.cancelText,
        deletion: data.deletion ?? false,
      }
    }).afterClosed()
  }
}
