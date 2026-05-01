# Security Specification for Home Cooking Service

## Document Invariants
1. **Users**: A user can only read and write their own profile (except admins). User roles are immutable by the user.
2. **Orders**: 
   - Customers can create orders but only for themselves.
   - Chefs can only see orders assigned to them or pending orders if they are online.
   - OTP cannot be modified after creation by the customer.
   - Status transitions must be valid (PENDING -> COOKING -> PAID).
3. **Config**: Only Admins can modify the global configuration.

## The "Dirty Dozen" Payloads (Threat Models)
1. **Identity Theft**: User A tries to read User B's profile.
2. **Role Escalation**: User A tries to update their own `role` to `ADMIN`.
3. **Shadow Update**: User A tries to add a `isVerified: true` field to their profile by including it in a regular update.
4. **Order Hijacking**: Chef A tries to update Chef B's assigned order.
5. **Unauthorized Creation**: Anonymous user tries to create a User profile.
6. **ID Poisoning**: User tries to create a document with a 2MB string as ID.
7. **Resource Exhaustion**: User tries to store a 10MB string in the `address` field.
8. **State Shortcut**: User tries to update order status from `PENDING` directly to `PAID` without the chef starting.
9. **Relational Bypass**: User tries to create an order referencing a non-existent `userId`.
10. **Admin Spoofing**: User tries to set `isAdmin: true` on their profile.
11. **PII Leakage**: Generic authenticated user tries to list all user emails.
12. **Timestamp Fraud**: User provides a past timestamp for `createdAt` instead of server time.

## Test Runner Plan
- `firestore.rules.test.ts` will verify that all above payloads return `PERMISSION_DENIED`.
