import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { authGuard, sessionGuard } from './guards/auth.guard';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';
import { IDLE_LIMIT_MS, IdleService } from './services/idle.service';

describe('Sessions', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  const guard = (g: typeof authGuard) => TestBed.runInInjectionContext(() => g({} as any, {} as any));

  it('refuse les pages des identifiants sans connexion', () => {
    const r = guard(authGuard) as UrlTree;
    expect(router.serializeUrl(r)).toBe('/login');
  });

  it('renvoie vers la saisie du mot de passe tant que le jeton est limité', () => {
    auth.setPendingToken('1|limite');
    expect(router.serializeUrl(guard(authGuard) as UrlTree)).toBe('/verify-password');
    expect(guard(sessionGuard)).toBe(true);
  });

  it('remplace le jeton limité par le jeton de session après le mot de passe', () => {
    auth.setPendingToken('1|limite');
    auth.verifyAppPassword('Secret#123').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/verify-password`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer 1|limite');
    req.flush({ verified: true, token: '2|session', expires_in: 300 });

    expect(auth.token()).toBe('2|session');
    expect(auth.locked()).toBe(false);
    expect(localStorage.getItem('session_locked')).toBeNull();
    expect(guard(authGuard)).toBe(true);
  });

  it('ferme la session locale quand le serveur répond 401', () => {
    auth.setPendingToken('1|x');
    TestBed.inject(HttpClient).get(`${environment.apiUrl}/me`).subscribe({ error: () => {} });
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/me`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.token()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it("n'envoie jamais le jeton à un autre domaine", () => {
    auth.setPendingToken('1|x');
    TestBed.inject(HttpClient).get('https://exemple.com/data').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('https://exemple.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('déconnecte après 30 minutes sans activité', () => {
    const idle = TestBed.inject(IdleService);
    auth.setPendingToken('1|x');
    const logout = vi.spyOn(auth, 'logout').mockImplementation(() => {});

    localStorage.setItem('last_activity', String(Date.now() - IDLE_LIMIT_MS + 60_000));
    (idle as any).check();
    expect(logout).not.toHaveBeenCalled();

    localStorage.setItem('last_activity', String(Date.now() - IDLE_LIMIT_MS - 1000));
    (idle as any).check();
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("l'activité dans un onglet repousse la déconnexion", () => {
    const idle = TestBed.inject(IdleService);
    localStorage.setItem('last_activity', String(Date.now() - 20 * 60_000));
    idle.touch(true);
    expect(idle.idleFor()).toBeLessThan(1000);
  });
});
