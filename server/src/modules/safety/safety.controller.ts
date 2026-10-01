import { Request, Response, NextFunction } from 'express';
import { SafetyService } from './safety.service';

export class SafetyController {
  static async getContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contacts = await SafetyService.getContacts(req.user!.userId);
      res.status(200).json({ success: true, data: contacts });
    } catch (err) {
      next(err);
    }
  }

  static async addContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contact = await SafetyService.addContact(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }

  static async deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SafetyService.deleteContact(req.user!.userId, req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async triggerSOS(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SafetyService.triggerSOS(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'SOS Emergency beacon dispatched to contacts and local support.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async submitCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripShareId, status } = req.body;
      const result = await SafetyService.submitCheckIn(tripShareId, status);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getPhrases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const country = (req.query.country as string) || 'IN';
      const phrases = await SafetyService.getEmergencyPhrases(country);
      res.status(200).json({ success: true, data: phrases });
    } catch (err) {
      next(err);
    }
  }

  static async createIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await SafetyService.createIncidentReport(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Incident reported to TravelHub Concierge. We are reviewing this urgently.',
        data: incident,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getIncidents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incidents = await SafetyService.getUserIncidents(req.user!.userId);
      res.status(200).json({ success: true, data: incidents });
    } catch (err) {
      next(err);
    }
  }
}
