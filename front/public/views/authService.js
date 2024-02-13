// authService.js
import { isUserLoggedIn } from './apiService';
import { redirectTo } from '../router';

export const verifyUserLoginAndDisplayDashboard = (displayDashboardCallback) => {
  isUserLoggedIn()
    .then(data => {
      if (data.success) {
        console.log(data.username, data.email);
        displayDashboardCallback(data.username);
      } else {
        alert('Veuillez vous connecter.');
        redirectTo("/login");
      }
    })
    .catch(error => console.error(error));
}