import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireRole } from '../replitAuth';
import { insertReviewSchema } from '@shared/schema';

export const reviewsRouter = Router();

// POST /api/reviews
reviewsRouter.post('/', isAuthenticated, requireRole('athlete'), async (req: any, res) => {
  try {
    const athleteId = req.user.claims.sub;
    const data = insertReviewSchema.parse(req.body);

    const acceptedCoaches = await storage.getAcceptedCoachesForAthlete(athleteId);
    const hasAcceptedRequest = acceptedCoaches.some(c => c.userId === data.coachId);
    if (!hasAcceptedRequest) {
      return res.status(403).json({ message: "You can only review coaches you've had accepted sessions with" });
    }

    const review = await storage.createReview({ ...data, athleteId });
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create review' });
  }
});

// GET /api/reviews/my-reviews
reviewsRouter.get('/my-reviews', isAuthenticated, async (req: any, res) => {
  try {
    const reviews = await storage.getReviewsByAthlete(req.user.claims.sub);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/accepted-coaches
reviewsRouter.get('/accepted-coaches', isAuthenticated, async (req: any, res) => {
  try {
    const coaches = await storage.getAcceptedCoachesForAthlete(req.user.claims.sub);
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accepted coaches' });
  }
});

// GET /api/reviews/pending — coaches that athlete had a session with but hasn't reviewed
reviewsRouter.get('/pending', isAuthenticated, async (req: any, res) => {
  try {
    const athleteId = req.user.claims.sub;
    const [acceptedCoaches, existingReviews] = await Promise.all([
      storage.getAcceptedCoachesForAthlete(athleteId),
      storage.getReviewsByAthlete(athleteId),
    ]);
    const reviewedCoachIds = new Set(existingReviews.map((r: any) => r.coachId));
    const pending = acceptedCoaches.filter((c: any) => !reviewedCoachIds.has(c.userId));
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending reviews' });
  }
});

// GET /api/reviews/coach/:coachId — public
reviewsRouter.get('/coach/:coachId', async (req, res) => {
  try {
    const reviews = await storage.getReviewsByCoach(req.params.coachId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});
