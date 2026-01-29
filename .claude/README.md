# Claude Code Setup for NIOS Prep

This directory contains Claude Code specific configuration for the NIOS Prep project.

## Project Overview

NIOS Prep is a comprehensive education platform built with:

- Next.js 16 (App Router)
- TypeScript
- MongoDB with Mongoose
- Clerk for authentication
- Groq AI for grading
- Tailwind CSS + Framer Motion for UI

## Getting Started with Claude Code

1. Ensure you have the required environment variables set up (see README.md)
2. Run `npm install` to install dependencies
3. Use `npm run dev` to start development server

## Available Tasks

Use these commands with Claude Code:

- `dev` - Start development server with hot reload
- `build` - Build for production
- `lint` - Run ESLint
- `lint:fix` - Auto-fix ESLint issues

## Project Structure

- `app/` - Next.js pages, components, and API routes
- `lib/` - Database models, utilities, and AI integration
- `public/` - Static assets

## Environment Setup

Required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `GROQ_API_KEY` - Groq AI API key
