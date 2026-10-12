// The tours of THIS app: one small tour per page. They are just data.
// Each `target` matches a data-tour="..." attribute in that page.
// A page uses its tour with:  useTour(dashboardTour)
//
// IMPORTANT: when you change a tour, raise its `version` by 1.
// Everyone who saw the old version will see that page's tour again.

import type { Tour } from '../coachmark'

export const dashboardTour: Tour = {
  id: 'dashboard', // saved in the cookie "coachmark_dashboard"
  version: 1,
  steps: [
    {
      target: '[data-tour="nav-links"]',
      title: 'Navigation',
      text: 'Use these links to move between the Dashboard, Posts and Users pages.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="stats"]',
      title: 'Quick numbers',
      text: 'These cards show how many posts, users and finished todos there are.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="latest-posts"]',
      title: 'Latest posts',
      text: 'The five newest posts appear here.',
      placement: 'top',
    },
    {
      target: '[data-tour="help-button"]',
      title: 'Need this again?',
      text: 'Click the ? button on any page to see that page\'s tour again.',
      placement: 'bottom',
    },
  ],
}

export const postsTour: Tour = {
  id: 'posts',
  version: 1,
  steps: [
    {
      target: '[data-tour="posts-search"]',
      title: 'Search posts',
      text: 'Type here to filter the posts by title.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="first-post"]',
      title: 'A post',
      text: 'Every post shows its title and a short text.',
      placement: 'top',
    },
  ],
}

export const usersTour: Tour = {
  id: 'users',
  version: 1,
  steps: [
    {
      target: '[data-tour="users-table"]',
      title: 'Users',
      text: 'All users with their email, phone and company.',
      placement: 'top',
    },
  ],
}
