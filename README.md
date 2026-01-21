# Fairway Condominiums Owner Association in Pecan Plantation

[![Netlify Status](https://api.netlify.com/api/v1/badges/38eb09d6-759c-45ea-ba4f-143de05703bf/deploy-status)](https://app.netlify.com/projects/fcoapecan/deploys)

## Firestore Security Rules

Deploy rules with the Firebase CLI:

```sh
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

Rules are defined in `firestore.rules`. The Firebase config embedded in the JS is expected for client apps; access control is enforced by these rules.

## Admin Allowlist

To grant admin access, add a document in `adminUsers` where the document ID is the user's UID:

1. Sign in with Google to create the user in Firebase Auth.
2. Copy the UID from Firebase Auth users.
3. Create `/adminUsers/{uid}` with:
   - `email`: the user's email address
   - `active`: `true`

Only users with an active allowlist entry can create, update, or delete documents
