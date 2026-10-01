import { Router } from 'express';
import { SafetyController } from './safety.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Emergency Contacts
router.get('/contacts', authenticate, SafetyController.getContacts);
router.post('/contacts', authenticate, SafetyController.addContact);
router.delete('/contacts/:id', authenticate, SafetyController.deleteContact);

// SOS Beacon
router.post('/sos', authenticate, SafetyController.triggerSOS);

// Check-ins
router.post('/checkin', authenticate, SafetyController.submitCheckIn);

// Phrases
router.get('/phrases', SafetyController.getPhrases);

// Incident Assistant
router.post('/incidents', authenticate, SafetyController.createIncident);
router.get('/incidents', authenticate, SafetyController.getIncidents);

export default router;
