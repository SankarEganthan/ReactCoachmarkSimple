// ALL tours of the app live here. This is the only file you edit when you copy the
// coachmark folder into another project (and when you change the text of a tour).
//
// - The key (dashboard, posts ...) is the name a page uses:  useTour('posts')
// - `target` is any CSS selector of an element that ALREADY exists in the page,
//   for example '.search-box', '#orders-table' or 'h1'. Nothing has to be added to the page.
//   If you prefer, you may add data-tour="..." to an element and use '[data-tour="..."]'.
// - `id` names the cookie (coachmark_<id>). Make it unique.
// - When you change a tour, raise its `version` by 1: everyone sees that page's tour again.
// - A step whose element is not on the page is skipped.

import type { Tour } from './types'

export const tours: Record<string, Tour> = {
  dashboard: {
    id: 'dashboard',
    version: 1,
    steps: [
      {
        target: '.navbar-links',
        title: 'Navigation',
        text: 'Use these links to move between the Dashboard, Posts and Users pages.',
        placement: 'bottom',
      },
      {
        target: '.stat-row',
        title: 'Quick numbers',
        text: 'These cards show how many posts, users and finished todos there are.',
        placement: 'bottom',
      },
      {
        target: '.simple-list',
        title: 'Latest posts',
        text: 'The five newest posts appear here.',
        placement: 'top',
      },
      {
        target: '.help-button',
        title: 'Need this again?',
        text: "Click the ? button on any page to see that page's tour again.",
        placement: 'bottom',
      },
    ],
  },

  posts: {
    id: 'posts',
    version: 1,
    steps: [
      {
        target: '.search-box',
        title: 'Search posts',
        text: 'Type here to filter the posts by title.',
        placement: 'bottom',
      },
      {
        target: '.card-list > li:first-child',
        title: 'A post',
        text: 'Every post shows its title and a short text.',
        placement: 'top',
      },
    ],
  },

  users: {
    id: 'users',
    version: 1,
    steps: [
      {
        target: '.table',
        title: 'Users',
        text: 'All users with their email, phone and company.',
        placement: 'top',
      },
    ],
  },
}
