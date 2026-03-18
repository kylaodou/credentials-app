import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Credential, CredentialSecrets } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CredentialService {
  private api = inject(ApiService);

  getAll(): Observable<Credential[]> {
    return this.api.get<Credential[]>('credentials');
  }

  getOne(id: string): Observable<Credential> {
    return this.api.get<Credential>(`credentials/${id}`);
  }

  reveal(id: string): Observable<CredentialSecrets> {
    return this.api.get<CredentialSecrets>(`credentials/${id}/reveal`);
  }

  create(data: Partial<Credential & CredentialSecrets>): Observable<Credential> {
    return this.api.post<Credential>('credentials', data);
  }

  update(id: string, data: Partial<Credential & CredentialSecrets>): Observable<Credential> {
    return this.api.put<Credential>(`credentials/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`credentials/${id}`);
  }
}
