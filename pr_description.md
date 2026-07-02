# Pull Request

**Title:** feat(auth): implement secure password reset workflow

**Summary:**
This PR introduces a robust, asynchronous password reset flow with optimized backend performance and premium UI handling. 

**Key Changes:**
- **Backend:** 
  - Offloaded SMTP email dispatch to an async background thread to prevent API blocking.
  - Implemented strict 3-minute UTC token expiration to prevent rate limit abuse.
  - Transitioned from hard token deletion to a soft-invalidation `used` flag to eliminate database race conditions.
  - Added inline CSS HTML email templates for cross-client compatibility (e.g., Gmail).
- **Frontend:**
  - Added proactive token validation on mount to instantly lock down the UI for expired tokens.
  - Built polished, animated "Link Expired" and "Token Used" empty states using MUI.
  - Resolved all oxlint warnings to ensure strict code quality.

**Testing:**
- Verified 3-minute strict expiration and rate limiting constraints.
- Verified non-blocking async email delivery.
- Verified proper UI lockdown states on invalid tokens.
- Passed all linter checks.
