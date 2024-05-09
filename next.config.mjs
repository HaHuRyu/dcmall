/** @type {import('next').NextConfig} */
import { env } from 'process'

const nextConfig = {
  env: {
    DB_HOST: env.DB_HOST,
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD,
    DB_DATABASE: env.DB_DATABASE
  }
}

export default nextConfig;