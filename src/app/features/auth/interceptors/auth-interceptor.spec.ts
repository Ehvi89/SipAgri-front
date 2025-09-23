// auth-interceptor.spec.ts
import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {of} from 'rxjs';

import {AuthInterceptor} from './auth-interceptor';
import {AuthService} from '../services/auth-service';

describe('AuthInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const authServiceMock = jasmine.createSpyObj('AuthService', ['getToken', 'forgetConnexionInfo']);
        const routerMock = jasmine.createSpyObj('Router', ['navigate', 'url']);
        routerMock.url = '/some-url';

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
                {provide: AuthService, useValue: authServiceMock},
                {provide: Router, useValue: routerMock},
            ],
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should pass through requests to authentication endpoints', () => {
        const requestUrl = '/auth/login';
        httpClient.get(requestUrl).subscribe();

        const httpRequest = httpMock.expectOne(requestUrl);
        expect(httpRequest.request.url).toBe(requestUrl);
        httpRequest.flush({});
    });

    it('should add the Authorization header if token is available', () => {
        const token = 'test-token';
        authServiceSpy.getToken.and.returnValue(token);
        const requestUrl = '/protected';

        httpClient.get(requestUrl).subscribe();

        const httpRequest = httpMock.expectOne(requestUrl);
        expect(httpRequest.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
        httpRequest.flush({});
    });

    it('should not add Authorization header if no token is available', () => {
        authServiceSpy.getToken.and.returnValue(null);
        const requestUrl = '/protected';

        httpClient.get(requestUrl).subscribe();

        const httpRequest = httpMock.expectOne(requestUrl);
        expect(httpRequest.request.headers.has('Authorization')).toBeFalse();
        httpRequest.flush({});
    });

    it('should handle 401 errors and refresh the session', () => {
        authServiceSpy.getToken.and.returnValue('expired-token');
        authServiceSpy.forgetConnexionInfo.and.returnValue(of(undefined));
        const requestUrl = '/protected';

        httpClient.get(requestUrl).subscribe({
            error: () => {
                expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
                    queryParams: {sessionExpired: true, redirectUrl: routerSpy.url},
                    replaceUrl: true,
                });
            },
        });

        const httpRequest = httpMock.expectOne(requestUrl);
        httpRequest.flush({}, {status: 401, statusText: 'Unauthorized'});
    });

    it('should handle non-401 errors by passing them through', () => {
        authServiceSpy.getToken.and.returnValue('valid-token');
        const requestUrl = '/protected';

        httpClient.get(requestUrl).subscribe({
            error: (error) => {
                expect(error.status).toBe(500);
            },
        });

        const httpRequest = httpMock.expectOne(requestUrl);
        httpRequest.flush({}, {status: 500, statusText: 'Internal Server Error'});
    });
});
