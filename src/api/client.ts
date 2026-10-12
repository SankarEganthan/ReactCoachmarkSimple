// One shared axios instance. Every api file imports this,
// so the base URL is written in exactly one place.

import axios from 'axios'

export const client = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000, // give up after 10 seconds
})
