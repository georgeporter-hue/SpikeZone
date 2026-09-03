# SPIKEZONE v0.2 prototype

This is a mobile-first Next.js prototype exported from v0 and patched locally.

## Included
- Home
- My Marks
- Ranking
- Add Result
- Compete
- Achievements
- Profile
- SPIKE SCORE detail
- U12/U14/U16 categories added to the type system and ranking filter

## Important before production
The exported prototype currently contains a simplified, non-official scoring formula in `lib/events.ts`.
It MUST NOT be presented as the official World Athletics scoring system in production.
Replace it with the official World Athletics Scoring Tables dataset/implementation before launching real points.

The current demo also uses sample athletes/results and localStorage rather than a production database/auth system.

## Next production steps
1. Replace demo scoring with the official World Athletics tables.
2. Implement FAA category/event eligibility by season, sex and modality.
3. Add Supabase authentication/database.
4. Implement real friend relationships, challenges and rankings.
5. Add privacy/parental safeguards for minors.
6. Test iOS and Android builds.
