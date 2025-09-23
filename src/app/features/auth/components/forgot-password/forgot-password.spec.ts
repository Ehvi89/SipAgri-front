import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {of, throwError} from 'rxjs';
import {ForgotPassword} from './forgot-password';
import {AuthService} from '../../services/auth-service';
import {NotificationService} from '../../../../core/services/notification-service';
import {AuthModule} from '../../auth-module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['resetPassword']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

        await TestBed.configureTestingModule({
            declarations: [ForgotPassword],
            imports: [ReactiveFormsModule, AuthModule, HttpClientTestingModule],
            providers: [
                {provide: AuthService, useValue: authServiceSpy},
                {provide: NotificationService, useValue: notificationServiceSpy}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ForgotPassword);
        component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

    it('should initialize form controls', () => {
        expect(component.emailCtrl).toBeTruthy();
    expect(component.telCtrl).toBeTruthy();
        expect(component.fpForm).toBeTruthy();
        expect(component.fpForm.controls['field']).toBeTruthy();
        expect(component.fpForm.controls['method']).toBeTruthy();
    });

    it('should select reset method and update form value', () => {
        component.selectMethod('SMS');
        expect(component.selectedMethod).toBe('SMS');
        expect(component.fpForm.get('method')?.value).toBe('SMS');

        component.selectMethod('EMAIL');
        expect(component.selectedMethod).toBe('EMAIL');
        expect(component.fpForm.get('method')?.value).toBe('EMAIL');
    });

    it('should not call API on invalid form submission', () => {
        spyOn(component, 'focusInvalidField');
        component.emailCtrl.setValue('');
        component.sendInstructions();
        expect(authServiceSpy.resetPassword).not.toHaveBeenCalled();
        expect(component.focusInvalidField).toHaveBeenCalled();
    });

    it('should handle success response from API', () => {
        const response = {success: true, message: 'Success!'};
        authServiceSpy.resetPassword.and.returnValue(of(response));

        component.emailCtrl.setValue('test@example.com');
        component.selectedMethod = 'EMAIL';
        component.fpForm.get('field')?.setValue('test@example.com');

        component.sendInstructions();

        expect(authServiceSpy.resetPassword).toHaveBeenCalledWith({field: 'test@example.com', method: 'EMAIL'});
        expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith(response.message);
    });

    it('should handle error response from API', () => {
        authServiceSpy.resetPassword.and.returnValue(throwError(() => ({statusCode: 404})));

        component.emailCtrl.setValue('invalid@example.com');
        component.selectedMethod = 'EMAIL';
        component.fpForm.get('field')?.setValue('invalid@example.com');

        component.sendInstructions();

        expect(authServiceSpy.resetPassword).toHaveBeenCalledWith({field: 'invalid@example.com', method: 'EMAIL'});
        expect(notificationServiceSpy.showError).toHaveBeenCalledWith('Aucun compte trouvé avec cet email');
    });
});
