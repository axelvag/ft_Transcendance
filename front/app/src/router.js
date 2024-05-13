import { isAuthenticated } from '@/auth.js';
import Router from '@/utils/Router.js';
import { initWebSocket } from '@/friends.js';

import '@/views/view-not-found.ce.js';
import '@/views/view-welcome.ce.js';
import '@/views/view-signup.ce.js';
import '@/views/view-profile.ce.js';
import '@/views/view-email-confirmation.ce.js';
import '@/views/view-login.ce.js';
import '@/game/view-game-set-mode.ce.js';
import '@/game/view-game-offline.ce.js';
import '@/game/view-game-online.ce.js';
import '@/game/view-game-history.ce.js';
import '@/game/view-game-tournament.ce.js';
import '@/game/view-game-tournament-salon.ce.js';
import '@/game/view-game-tournament-start.ce.js';
import '@/game/view-game-online-matchmaking.ce.js';
import '@/game/view-game-history.ce.js';
import '@/views/view-friend.ce.js';
import '@/views/view-reinitialisation-pass-mail.ce.js';
import '@/views/view-new-pass.ce.js';
import '@/views/view-dashboard.ce.js';
import '@/views/view-settings.ce.js';
import '@/views/view-careers.ce.js';
import '@/views/view-rank.ce.js';
import '@/views/view-auth42-callback.ce.js';

const isLoggedOutGuard = async () => {
  const isLoggedin = await isAuthenticated();
  if (isLoggedin) redirectTo('/dashboard');
  initWebSocket();
  return !isLoggedin;
};

const isLoggedInGuard = async () => {
  const isLoggedin = await isAuthenticated();
  if (!isLoggedin) redirectTo('/login');
  initWebSocket();
  return isLoggedin;
};

const router = new Router({
  useHash: false,
  baseUrl: '',
  linkAttribute: 'data-link',
  linkActiveClass: 'active',
  routes: [
    {
      name: 'welcome',
      path: '/',
      title: 'Pong',
      template: '<view-welcome></view-welcome>',
    },
    // auth routes
    {
      name: 'login',
      path: '/login',
      title: 'Login',
      template: '<view-signin></view-signin>',
      beforeEnter: isLoggedOutGuard,
    },
    {
      name: 'signup',
      path: '/signup',
      title: 'Signup',
      template: '<view-signup></view-signup>',
      beforeEnter: isLoggedOutGuard,
    },
    {
      name: 'forget-pass',
      path: '/forget-pass',
      title: 'Forget password',
      template: '<view-forget-pass></view-forget-pass>',
    },
    {
      name: 'new-pass',
      path: '/new-pass',
      title: 'New password',
      template: '<view-new-pass></view-new-pass>',
    },
    {
      name: 'email-confirmation',
      path: '/email-confirmation',
      title: 'Email confirmation',
      template: '<view-email-confirmation></view-email-confirmation>',
    },
    // logged in routes
    {
      name: 'dashboard',
      path: '/dashboard',
      title: 'Dashboard',
      template: '<view-dash></view-dash>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'profile',
      path: '/profile',
      title: 'Profile',
      template: '<view-profile></view-profile>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'friends',
      path: '/friends',
      title: 'Friends',
      template: '<view-friend></view-friend>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'careers',
      path: '/careers',
      title: 'Careers',
      template: '<view-careers></view-careers>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-history',
      path: '/game-history',
      title: 'Game history',
      template: '<view-game-history></view-game-history>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-history-record',
      path: '/game-history/:gameId',
      title: 'Game history record',
      template: params => `<view-game-online game-id="${params.gameId}" back-route="/game-history"></view-game-online>`,
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'settings',
      path: '/settings',
      title: 'Settings',
      template: '<view-settings></view-settings>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-mode',
      path: '/game',
      title: 'Game mode',
      template: '<view-game-set-mode></view-game-set-mode>',
    },
    {
      name: 'game-solo',
      path: '/game/solo',
      title: 'Game solo',
      template: '<view-game-offline></view-game-offline>',
    },
    {
      name: 'game-duo',
      path: '/game/duo',
      title: 'Game duo',
      template: '<view-game-offline duo></view-game-offline>',
    },
    {
      name: 'game-tournament',
      path: '/game/tournament',
      title: 'Game tournament',
      template: '<view-game-tournament></view-game-tournament>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-tournament-salon',
      path: '/game/tournament/waiting',
      title: 'Game tournament salon',
      template: '<view-game-tournament-salon></view-game-tournament-salon>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-tournament-start',
      path: '/game/tournament/start',
      title: 'Game tournament start',
      template: '<view-game-tournament-start></view-game-tournament-start>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-online-search-player',
      path: '/game/online',
      title: 'Game online',
      template: '<view-game-online-matchmaking></view-game-online-matchmaking>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-online-play',
      path: '/game/online/:gameId',
      title: 'Game online',
      template: params => `<view-game-online game-id="${params.gameId}" back-route="/game"></view-game-online>`,
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'game-online-play-tournament',
      path: '/game/online/:gameId/:tournamentId',
      title: 'Game online',
      template: params =>
        `<view-game-online game-id="${params.gameId}" back-route="/game/tournament/start"></view-game-online>`,
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'rank',
      path: '/rank',
      title: 'Rank',
      template: '<view-rank></view-rank>',
      beforeEnter: isLoggedInGuard,
    },
    {
      name: 'not-found',
      path: '/not-found',
      title: 'Not Found',
      template: '<view-not-found></view-not-found>',
    },
    {
      name: 'auth42-callback',
      path: '/auth42-callback',
      title: 'Auth42-callback',
      template: '<view-auth42-callback></view-auth42-callback>',
      beforeEnter: isLoggedOutGuard,
    },
  ],
  fallbackRouteName: 'not-found',
  renderTarget: '#app',
});

router.init();

export let redirectTo = router.push;
export let currentRoute = router.currentRoute;
