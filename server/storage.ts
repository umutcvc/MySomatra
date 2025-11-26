import { 
  type User, type InsertUser,
  type JournalEntry, type InsertJournalEntry,
  type Task, type InsertTask,
  type TherapySession, type InsertTherapySession,
  type ActivityLog, type InsertActivityLog,
  type DeviceConnection, type InsertDeviceConnection,
  users, journalEntries, tasks, therapySessions, activityLogs, deviceConnections
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  deleteJournalEntry(id: string): Promise<void>;
  
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  
  getTherapySessions(): Promise<TherapySession[]>;
  createTherapySession(session: InsertTherapySession): Promise<TherapySession>;
  endTherapySession(id: string): Promise<TherapySession | undefined>;
  
  getActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  getDeviceConnections(): Promise<DeviceConnection[]>;
  saveDeviceConnection(connection: InsertDeviceConnection): Promise<DeviceConnection>;
  updateDeviceConnection(id: string, updates: Partial<InsertDeviceConnection>): Promise<DeviceConnection | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db.insert(journalEntries).values(entry).returning();
    return journalEntry;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }

  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTherapySessions(): Promise<TherapySession[]> {
    return db.select().from(therapySessions).orderBy(desc(therapySessions.startedAt));
  }

  async createTherapySession(session: InsertTherapySession): Promise<TherapySession> {
    const [newSession] = await db.insert(therapySessions).values(session).returning();
    return newSession;
  }

  async endTherapySession(id: string): Promise<TherapySession | undefined> {
    const [ended] = await db.update(therapySessions)
      .set({ endedAt: new Date() })
      .where(eq(therapySessions.id, id))
      .returning();
    return ended;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return db.select().from(activityLogs).orderBy(desc(activityLogs.loggedAt));
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getDeviceConnections(): Promise<DeviceConnection[]> {
    return db.select().from(deviceConnections).orderBy(desc(deviceConnections.lastConnected));
  }

  async saveDeviceConnection(connection: InsertDeviceConnection): Promise<DeviceConnection> {
    const [saved] = await db.insert(deviceConnections).values(connection).returning();
    return saved;
  }

  async updateDeviceConnection(id: string, updates: Partial<InsertDeviceConnection>): Promise<DeviceConnection | undefined> {
    const [updated] = await db.update(deviceConnections)
      .set({ ...updates, lastConnected: new Date() })
      .where(eq(deviceConnections.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
