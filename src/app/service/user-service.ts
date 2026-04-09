import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const RoleTranslation: Record<string, string> = {
  STUDENT: 'Студент',
};

export interface User {
  username: string;
  fullName: string;
  group: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  saveUser(data: { fullName: string; group: string }): Observable<{ token: string }> {
    return this.http.patch<{ token: string }>(`${environment.apiUrl}/users/update/self`, data);
  }

  deleteSelf(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/delete/self`);
  }

  checkEnabledSelf(): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/users/check/self`);
  }
}
