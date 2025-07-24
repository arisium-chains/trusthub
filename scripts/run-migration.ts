#!/usr/bin/env tsx

/**
 * TrustHub Data Migration Runner
 * 
 * This script migrates mock data to production PocketBase database.
 * 
 * Usage:
 *   npm run migrate           # Run full migration
 *   npm run migrate:rollback  # Rollback migration (dev only)
 *   npm run migrate:status    # Check migration status
 */

import { config } from 'dotenv';
import { migrationService } from '../src/lib/migration';
import { pb } from '../src/lib/pocketbase-production';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const command = process.argv[2] || 'migrate';
  
  console.log(`\n🚀 TrustHub Migration Runner\n`);
  console.log(`Command: ${command}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`PocketBase URL: ${process.env.NEXT_PUBLIC_POCKETBASE_URL}\n`);

  try {
    switch (command) {
      case 'migrate':
        await runMigration();
        break;
        
      case 'rollback':
        await runRollback();
        break;
        
      case 'status':
        await checkStatus();
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log(`Available commands: migrate, rollback, status`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`💥 Migration failed:`, error);
    process.exit(1);
  }
}

async function runMigration() {
  console.log('🔄 Starting data migration...\n');
  
  // Check PocketBase connection
  const isHealthy = await pb.healthCheck();
  if (!isHealthy) {
    throw new Error('PocketBase connection failed. Please check your database.');
  }
  
  console.log('✅ PocketBase connection verified\n');
  
  // Run migration
  const result = await migrationService.executeMigration();
  
  // Display results
  console.log('\n📊 Migration Results:');
  console.log('='.repeat(50));
  console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Execution Time: ${result.executionTime}ms`);
  console.log('');
  
  console.log('📈 Statistics:');
  console.log(`Users: ${result.statistics.users.created} created, ${result.statistics.users.updated} updated, ${result.statistics.users.failed} failed`);
  console.log(`Businesses: ${result.statistics.businesses.created} created, ${result.statistics.businesses.updated} updated, ${result.statistics.businesses.failed} failed`);
  console.log(`Reviews: ${result.statistics.reviews.created} created, ${result.statistics.reviews.updated} updated, ${result.statistics.reviews.failed} failed`);
  
  if (result.statistics.users.errors.length > 0 || 
      result.statistics.businesses.errors.length > 0 || 
      result.statistics.reviews.errors.length > 0) {
    console.log('\n❌ Errors:');
    [...result.statistics.users.errors, 
     ...result.statistics.businesses.errors, 
     ...result.statistics.reviews.errors]
      .forEach(error => console.log(`  - ${error}`));
  }
  
  // Migration log summary
  const errorLogs = result.migrationLog.filter(log => log.level === 'error');
  const warnLogs = result.migrationLog.filter(log => log.level === 'warn');
  
  if (errorLogs.length > 0 || warnLogs.length > 0) {
    console.log('\n⚠️ Migration Log Summary:');
    if (errorLogs.length > 0) {
      console.log(`Errors: ${errorLogs.length}`);
      errorLogs.slice(0, 5).forEach(log => console.log(`  - ${log.message}`));
    }
    if (warnLogs.length > 0) {
      console.log(`Warnings: ${warnLogs.length}`);
      warnLogs.slice(0, 5).forEach(log => console.log(`  - ${log.message}`));
    }
  }
  
  if (result.success) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Check the migrated data in your PocketBase admin panel');
    console.log('3. Test the application functionality');
  } else {
    console.log('\n💥 Migration failed. Please check the errors above.');
    console.log('\nTroubleshooting:');
    console.log('1. Verify PocketBase is running and accessible');
    console.log('2. Check your environment variables');
    console.log('3. Review the migration logs for specific errors');
    process.exit(1);
  }
}

async function runRollback() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Rollback is not allowed in production environment');
    process.exit(1);
  }
  
  console.log('⚠️  Rolling back migration...\n');
  console.log('This will delete all migrated data from the database.');
  
  // Confirm rollback
  if (!process.argv.includes('--confirm')) {
    console.log('To confirm rollback, run:');
    console.log('npm run migrate:rollback -- --confirm');
    return;
  }
  
  try {
    await migrationService.rollbackMigration();
    console.log('✅ Migration rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

async function checkStatus() {
  console.log('📊 Checking migration status...\n');
  
  try {
    // Check PocketBase connection
    const isHealthy = await pb.healthCheck();
    console.log(`PocketBase Health: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    if (!isHealthy) {
      console.log('Database connection failed. Cannot check migration status.');
      return;
    }
    
    // Check for migrated data
    const users = await pb.client.collection('users').getFullList({ fields: 'id' });
    const businesses = await pb.client.collection('businesses').getFullList({ fields: 'id' });
    const reviews = await pb.client.collection('reviews').getFullList({ fields: 'id' });
    
    console.log('\n📈 Database Records:');
    console.log(`Users: ${users.length}`);
    console.log(`Businesses: ${businesses.length}`);
    console.log(`Reviews: ${reviews.length}`);
    
    // Check for migrated records specifically
    const migratedBusinesses = await pb.client.collection('businesses')
      .getFullList({ filter: 'migrated_from!=""', fields: 'id,migrated_from,migration_date' });
    
    const migratedReviews = await pb.client.collection('reviews')
      .getFullList({ filter: 'migrated_from!=""', fields: 'id,migrated_from,migration_date' });
    
    console.log('\n🔄 Migrated Records:');
    console.log(`Businesses: ${migratedBusinesses.length}`);
    console.log(`Reviews: ${migratedReviews.length}`);
    
    if (migratedBusinesses.length > 0) {
      const latestMigration = migratedBusinesses
        .sort((a, b) => new Date(b.migration_date).getTime() - new Date(a.migration_date).getTime())[0];
      console.log(`Latest Migration: ${new Date(latestMigration.migration_date).toLocaleString()}`);
    }
    
    // Connection status
    const connectionStatus = pb.getConnectionStatus();
    console.log(`\nConnection Status: ${connectionStatus}`);
    
    console.log('\n✅ Status check completed');
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Migration interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Migration terminated');
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});