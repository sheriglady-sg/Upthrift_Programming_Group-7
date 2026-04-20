Group 7
Instructions for the UpThrift Website


Local Installation:

Install Required Software :

Please ensure the following are installed on your machine:

Node.js
MySQL or XAMPP (Then run apache/mysql)
Git
Postman for the Forms+

If XAMPP is used, only the MySQL service is required.
2. Clone the Repository:

Open a terminal and run:
git clone https://github.com/sheriglady-sg/Upthrift_Programming_Group-7.git
cd Upthrift_Programming_Group-7/backend

3. Install Dependencies:

Npm Install

4. Create ENV Files:

PORT=3000
SESSION_SECRET=upthrift_secure_secret

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=upthrift_db

EMAILJS_PUBLIC_KEY=your_emailjs_public_key 
EMAILJS_SERVICE_ID=your_emailjs_service_id 
EMAILJS_TEMPLATE_ID=your_emailjs_template_id


EmailJS:
Public Key: nE2AH-EQh35iokv7S
Service ID: service_vv4nmzn
Template ID: template_dairvfk

5. Database:
Start MySQL using XAMPP
CREATE DATABASE upthrift_db;
The import the database: 
Using mysql2/promise to link backend
Using bcrypt to hashing users passwords secretly


6. Ensure Upload Folders Exist:
Please make sure the following files exist
backend/src/public/uploads/profile
backend/src/public/uploads/messages
7. Run the Application:
From the backend folder, run: node src/server.js
Than npm start
8. Open the Website:
http://localhost:3000


Important Notes:

Express Validator:

We used an express-validator in the backend to validate form input, such as email format, password length, required fields, and rating values. This helped reduce invalid data and made the user input handling more reliable.
Testing Real-Time Chat and Notifications
To properly test the messaging and notification system, two active user sessions are required.
Step 1. Create Two Accounts
Open the website
Register two different users (e.g. user1 and user2)
Step 2. Open Two Browser Sessions
Use:
One - normal browser window and One - incognito/private window
Log in with:
Account 1 in the first window
Account 2 in the second window
Step 3. Start a Conversation
From one account, go to Messages
Start or open a conversation with the second user
Both users should open the same chat


Step 4. Test Messaging
Send a message from User 1 : The message should appear instantly on User 2’s screen without refreshing
Then:
Reply from User 2: Confirm real-time delivery on User 1’s screen

Step 5. Test Typing Indicator
Begin typing in one window
The other user should see a typing  indicator

Step 6. Test Notifications
Ensure User 2 is  not inside the chat page -Send a message from User 1
Expected result: Notification badge (bell icon) increases instantly
 Notification appears without page refresh (if Socket.IO event is triggered)
Step 7. Test Notification Page
Click the bell icon
Verify: Notifications are listed and unread notifications are counted correctly

If images are sent in chat, a manual refresh may be required  for them to appear
Real-time functionality depends on Socket.IO connection, so both users must remain connected
Notifications update in real-time only when the receiving user is online

Side Note: The Events Page data some have been created while the rest are actual existing data



