# Crayfish

Crayfish is a social media platform for sharing and discovering content.

It is modeled after [Lobste.rs](https://lobste.rs), a computing-focused community centered around link aggregation and discussion. Crayfish takes after its invitations system, which acts as a form of spam control.

There is no vetting process for new users. Each user is responsible for inviting people they believe will contribute positively to the forum. Any misbehaviour on the part of a user will reflect poorly on the standing of the user who invited them.

As no member of the team has a Lobste.rs account and therefore is unfamiliar with the actual user registration flow, we drafted our own invitation mechanism that checks an invitation code against the inviting user and the email of the intended invitee (there is currently no email-sending functionality, in line with IS113 group project requirements of not using libraries beyond what was covered in class, *though this may be implemented in the future*).

## Prerequisites
- Node.js v22+

## Installation
1. Clone this repository
2. Create the `.env` file
```
cp .env.example .env
```
3. Fill in the required fields in `.env`
**Examples**:
    - `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname`
    - `PORT=3000`
    - `SESSION_SECRET=any_random_string`
4. Install required packages using
```
npm install
```
5. At the root of the project folder, run the seed script using:
```
node seed-first-user.js
```
This will create an initial admin user in the MongoDB instance along with the invite for this admin user.

6. Run `nodemon app.js` or `npm run start`

7. Log into the user the seed script created, using:
    - Username: `admin`
    - Password: `Admin123!`

8. Remember to change your admin credentials.

## Running
1. Run `nodemon app.js` or `npm run start`
2. On the browser, navigate to `http://localhost:3000`
3. The landing page (`public/index.html`) will render.