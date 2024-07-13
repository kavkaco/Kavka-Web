import { Injectable } from '@angular/core';
import { InternalServerError, UnauthorizedError } from '@app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(

  ) { }

  RefreshToken(refreshToken: string, userId: string) {
    return new Promise<string>(
      (resolve: (newAccessToken: string) => void, reject) => {
        this.client
          .refreshToken({
            userId: userId,
            refreshToken: refreshToken,
          })
          .then((response) => {
            if (response.accessToken) {
              resolve(response.accessToken);
              return;
            }

            reject(new InternalServerError());
          })
          .catch((e) => {
            console.error('[AuthService][RefreshToken]', e);

            reject(new UnauthorizedError());
          });
      }
    );
  }

  isAccessTokenExpired(accessToken: string): boolean {
    try {
      const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
      const expiry = decodedToken.exp;
      return Date.now() / 1000 >= expiry
    } catch (err) {
      return true;
    }
  }
}
