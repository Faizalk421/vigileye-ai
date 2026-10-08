import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing VigilEye Database Setup on Neon PostgreSQL...');

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@vigileye.ai';
  const adminUsername = process.env.INITIAL_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@12345!';

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const demoPasswordHash = await bcrypt.hash('Password@12345!', 10);

  // 1. Upsert Admin Account
  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      role: 'ADMIN',
      isEmailVerified: true
    },
    create: {
      fullName: 'System Administrator',
      username: adminUsername.toLowerCase(),
      email: adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      country: 'United States',
      timezone: 'UTC',
      profile: {
        create: {
          bio: 'VigilEye Platform Administrator',
          occupation: 'System Administrator',
          themePreference: 'dark'
        }
      },
      settings: {
        create: {
          earThreshold: 0.21,
          drowsinessThreshold: 1.5,
          alarmVolume: 0.85,
          alarmPattern: 'siren',
          darkMode: true,
          localProcessingOnly: true
        }
      },
      notifications: {
        create: [
          {
            title: 'System Operational',
            message: 'VigilEye AI Full-Stack Production Platform is active and ready.',
            type: 'SYSTEM'
          }
        ]
      }
    }
  });

  console.log(`✅ Admin account configured: ${admin.email}`);

  // 2. Upsert Demo User (Faizal)
  const demoUser = await prisma.user.upsert({
    where: { email: 'faizal@vigileye.ai' },
    update: {
      isEmailVerified: true
    },
    create: {
      fullName: 'Faizal Khan',
      username: 'faizal',
      email: 'faizal@vigileye.ai',
      passwordHash: demoPasswordHash,
      role: 'USER',
      isEmailVerified: true,
      country: 'India',
      phone: '+91 9876543210',
      timezone: 'Asia/Kolkata',
      profile: {
        create: {
          bio: 'Fleet logistics driver & safety operator.',
          occupation: 'Fleet Logistics Driver',
          themePreference: 'dark'
        }
      },
      settings: {
        create: {
          earThreshold: 0.21,
          drowsinessThreshold: 1.5,
          alarmVolume: 0.8,
          alarmPattern: 'siren',
          darkMode: true,
          localProcessingOnly: true
        }
      },
      notifications: {
        create: [
          {
            title: 'Welcome to VigilEye AI',
            message: 'Your personal drowsiness prevention safety system is online.',
            type: 'SYSTEM'
          },
          {
            title: 'Weekly Safety Report Ready',
            message: 'You completed 14.5 hours of active monitoring with 98.2% alertness score.',
            type: 'REPORT'
          }
        ]
      }
    }
  });

  console.log(`✅ Demo user configured: ${demoUser.email}`);

  // Seed sample session if user has none
  const sessionCount = await prisma.session.count({ where: { userId: demoUser.id } });
  if (sessionCount === 0) {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 2);
    const endTime = new Date();

    await prisma.session.create({
      data: {
        userId: demoUser.id,
        startTime,
        endTime,
        durationSeconds: 7200,
        blinkCount: 1980,
        averageBlinkRate: 16.5,
        drowsinessCount: 1,
        longestClosureSeconds: 1.8,
        avgEAR: 0.32,
        minEAR: 0.14,
        deviceName: 'Integrated Webcam HD',
        browser: 'Google Chrome',
        status: 'COMPLETED',
        notes: 'Initial calibrated session',
        drowsinessEvents: {
          create: [
            {
              userId: demoUser.id,
              timestamp: new Date(startTime.getTime() + 3600 * 1000),
              durationSeconds: 1.8,
              earAtTrigger: 0.14,
              resolvedType: 'AUTO_ALARM_RESET',
              notes: 'Prolonged eye closure detected'
            }
          ]
        }
      }
    });
  }

  console.log('✅ Database setup completed successfully on Neon PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
