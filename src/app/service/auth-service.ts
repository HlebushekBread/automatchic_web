import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface token {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'jwtToken';

  private http = inject(HttpClient);

  login(user: { username: string; password: string }) {
    return this.http.post(`${environment.apiUrl}/auth/login`, user).pipe(
      tap((response) => {
        this.doLoginUser(response as token);
      }),
    );
  }

  private doLoginUser(token: token) {
    localStorage.setItem(this.STORAGE_KEY, token.token);
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getTokenPayload() {
    const token = localStorage.getItem(this.STORAGE_KEY);
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      let payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payloadBase64.length % 4 !== 0) {
        payloadBase64 += '=';
      }

      const binaryString = window.atob(payloadBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const payload = new TextDecoder('utf-8').decode(bytes);
      return JSON.parse(payload);
    } catch (error) {
      console.error('Ошибка при декодировании токена: ', error);
      return null;
    }
  }

  private tokenPayload = this.getTokenPayload();

  getTokenId() {
    try {
      return this.tokenPayload.id;
    } catch {
      return 0;
    }
  }

  getTokenUsername() {
    try {
      return this.tokenPayload.sub;
    } catch {
      return '';
    }
  }

  getTokenFullName() {
    try {
      return this.tokenPayload.fullName;
    } catch {
      return '';
    }
  }

  getTokenGroup() {
    try {
      return this.tokenPayload.group;
    } catch {
      return '';
    }
  }

  getTokenAuthorities() {
    try {
      return this.tokenPayload.authorities;
    } catch {
      return ['ROLE_GUEST'];
    }
  }

  getTokenExpirationDate() {
    try {
      return this.tokenPayload.exp * 1000;
    } catch {
      return 0;
    }
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem(this.STORAGE_KEY) && this.getTokenExpirationDate() > Date.now()) {
      return true;
    }
    return false;
  }
}
