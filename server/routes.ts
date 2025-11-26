import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertJournalEntrySchema, 
  insertTaskSchema, 
  insertTherapySessionSchema,
  insertActivityLogSchema,
  insertDeviceConnectionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/journal", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const data = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create journal entry" });
      }
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      await storage.deleteJournalEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete journal entry" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const taskList = await storage.getTasks();
      res.json(taskList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(data);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create task" });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const updates = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, updates);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update task" });
      }
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  app.get("/api/therapy-sessions", async (req, res) => {
    try {
      const sessions = await storage.getTherapySessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapy sessions" });
    }
  });

  app.post("/api/therapy-sessions", async (req, res) => {
    try {
      const data = insertTherapySessionSchema.parse(req.body);
      const session = await storage.createTherapySession(data);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create therapy session" });
      }
    }
  });

  app.patch("/api/therapy-sessions/:id/end", async (req, res) => {
    try {
      const session = await storage.endTherapySession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to end therapy session" });
    }
  });

  app.get("/api/activity-logs", async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const data = insertActivityLogSchema.parse(req.body);
      const log = await storage.createActivityLog(data);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create activity log" });
      }
    }
  });

  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDeviceConnections();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch device connections" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const data = insertDeviceConnectionSchema.parse(req.body);
      const device = await storage.saveDeviceConnection(data);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to save device connection" });
      }
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const updates = insertDeviceConnectionSchema.partial().parse(req.body);
      const device = await storage.updateDeviceConnection(req.params.id, updates);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update device" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
