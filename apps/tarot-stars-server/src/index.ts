#!/usr/bin/env node

/**
 * Tarot Stars Server - Main Entry Point
 * 
 * This is the main entry point for the Tarot Stars Telegram Bot and Mini App server.
 * It initializes the MongoDB connection, sets up the Telegram Bot with grammY,
 * starts the Express API server, and handles graceful shutdown.
 * 
 * Features:
 * - Telegram Bot with daily tarot card readings
 * - Mini App integration
 * - MongoDB data persistence
 * - DDD architecture
 * - High availability and low coupling design
 */

import './runtime.local';

// The actual application logic is in runtime.local.ts
// This file serves as the main entry point for the application