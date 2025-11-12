## Inspiration
It began with a moment almost every person who menstruates can relate to,  being in a public restroom and realizing there’s no sanitary product available. The experience is stressful, isolating, and far too common.

We wanted to change that by building something that turns these moments of panic into moments of connection. That’s how **ShareCycle** was born, a simple, safe, and instant way for women to support each other privately when they need or can offer sanitary products.

Our inspiration came from the belief that access to menstrual hygiene products shouldn’t depend on luck or location. Through **ShareCycle**, we aim to create a network of empathy and support, ensuring that no woman ever has to face a period emergency alone.

## What it does
**ShareCycle** is a privacy-first mobile app that connects people who need menstrual products (pads, tampons, liners) with nearby helpers who can share them.

### Core Features

#### Request Help
- Users request products with urgency levels (**ASAP**, **Later**, **I'll pick up**).  
- AI classifies urgency and provides empathetic responses.  
- Requests use **coarse geolocation** (privacy-preserving).

#### Help Others
- Helpers see nearby requests and can accept them.  
- Each helper-requester pair gets a **unique chat thread**.  
- Helpers can mark items as **"dropped off"** when delivered.

#### Empathetic Chatbot (Blossoms AI)
- We built on **Blossoms AI**, an empathetic chatbot designed to offer comfort and information to users who might be anxious, embarrassed, or simply looking for someone to talk to.  
- The chatbot communicates like a **caring older sister**, ensuring users feel heard and supported.  
- Powered by **GPT-based natural language understanding**, it can **answer menstrual health questions**, provide **product recommendations**, and **guide users** through the app.  
- This integration in the future ensures users not only receive help but also feel emotionally supported in sensitive moments.

#### Privacy-First Chat
- Server-side safety filter **redacts PII** (emails, phone numbers, names, ages, addresses, etc.).  
- Role-aware quick prompts for fast communication.  
- Messages are stored **only in redacted form**.

### Privacy & Safety
- Coarse location grids (no precise coordinates).  
- PII redaction before storage.  
- Thread-based access control.

## How we built it
### Development Process
Our team divided the work into four main focus areas:
1. **Frontend & UX Design** – Built the mobile interface using **React Native (Expo)** for cross-platform deployment. We focused on quick navigation, minimal UI, and a calm visual tone to reduce user anxiety.
2. **Backend & API Integration** – Implemented using **FastAPI (Python)** to manage requests, chat threads, and AI interactions. This allowed for lightweight, scalable communication between users and the database.
3. **AI & Chatbot Development** – Integrated **Blossoms AI**, a GPT-based chatbot that maintains an empathetic tone and can answer menstrual health questions, similar to an older sister. It also assists in understanding urgency levels and classifying requests.
4. **Database & Authentication** – Managed through **Firebase Firestore** for real-time updates and **Auth0** for secure authentication using JWT tokens. We enforced strong privacy rules and data validation throughout.

### Detailed Tech Stack

- **Frontend:**  
  Built using **React Native with Expo**, which allowed rapid prototyping and deployment on both iOS and Android. We used **React Navigation** for seamless screen transitions and **Tailwind RN** for quick, responsive styling.  

- **Backend:**  
  Developed in **Python with FastAPI**, chosen for its asynchronous support and easy scalability. We designed RESTful APIs for:  
  - Request creation and acceptance  
  - Chat thread management  
  - AI-driven urgency analysis  

- **Database:**  
  Used **Firebase Firestore** for fast, real-time synchronization between users. Each chat, request, and helper activity is stored as a structured document with strict access control and redacted identifiers.  

- **Authentication:**  
  Integrated **Auth0** with JWT verification for secure, privacy-first logins. This ensured that user sessions remain anonymous and encrypted.  

- **AI Layer:**  
  The **AI urgency classifier** analyzes text inputs from help requests to detect urgency and emotional tone.  
  **Blossoms AI**, our GPT-powered chatbot, provides empathetic responses, answers menstrual health questions, and offers guidance on nearby availability.  

- **Maps & Location Handling:**  
  Implemented **Mapbox SDK** with **coarse geolocation grids**, allowing users to connect nearby without exposing precise coordinates. Future iterations will integrate **vendor notification APIs** for automatic restock alerts.  

- **Security:**  
  All sensitive data is **redacted server-side**, ensuring no PII is stored.  
  Messages are filtered through a safety layer to remove any identifiers.

## Challenges we ran into
Building **ShareCycle** in just 24 hours came with its fair share of challenges  both technical and human.

### 1. Balancing Privacy with Location Accuracy  
One of our biggest challenges was finding a way to connect users based on proximity **without revealing exact locations**.  
We experimented with multiple mapping APIs before finalizing a **coarse grid-based geolocation system**, which provided general vicinity matching while maintaining user safety.

### 2. Ensuring Safety in Conversations  
We wanted the in-app chat to feel safe, supportive, and private.  
Designing a **server-side PII redaction filter** that removes names, while keeping conversations understandable  required a lot of testing and fine-tuning.  
The hardest part was striking the right balance between **empathy and moderation**. Going forward we would also work on improving this to work for numbers, addresses etc. 

### 3. Building Empathetic AI  
While using **Blossoms AI**, we wanted to ensure the chatbot didn’t sound robotic or clinical.  
Training and prompting the model to communicate like a **caring older sister** required thoughtful tone adjustments.  

### 4. Limited Time and Resources  
Developing a **cross-platform app**, a **real-time backend**, and an **AI chatbot** in one day was ambitious.  
Time constraints forced us to prioritize:  
- Core privacy and communication flows first  
- AI empathy features second  
- Future restock alert system as a prototype  

### 5. Integrating Multiple APIs Seamlessly  
We integrated **FastAPI**, **Firebase**, **Mapbox**, and **Auth0**, which each had their own authentication and request formats.  
Coordinating API keys, ensuring data consistency, and managing asynchronous requests within the time limit took meticulous debugging and teamwork.

### 6. Emotional Sensitivity in Design  
Since the topic involves **menstrual health**, we wanted to design an experience that felt **non-judgmental, inclusive, and supportive**.  
Choosing colors, tones, and copy that comforted users while preserving simplicity was surprisingly challenging, but deeply rewarding.

Despite these challenges, each obstacle taught us something valuable about **responsible design, empathetic AI, and the power of community-driven innovation**.  
In the end, we built something that not only works, but genuinely **cares**.

## Accomplishments that we're proud of
Building **ShareCycle** in just 24 hours was a challenge, but what we achieved as a team makes us incredibly proud.

### 1. Creating a Safe and Supportive Space  
We successfully designed a platform that **connects women in need** while keeping privacy and empathy at the forefront.  
Seeing our prototype help simulate real requests and safe responses felt like proof that technology can build **trust and compassion**, not just connections.

### 2. Building Blossoms AI  
We’re proud of developing on **Blossoms AI**, our empathy-driven chatbot.  
It speaks with warmth and understanding, helping users feel supported, especially during stressful or embarrassing situations.  
Blossoms AI isn’t just a feature; it represents **emotional intelligence in tech**, something rarely seen in hackathon prototypes.

### 3. Implementing Privacy-First Communication  
We implemented a **server-side PII redaction system** that automatically removes personal identifiers from all messages.  
Even under time pressure, we built a functioning **anonymous chat** system that protects users while allowing meaningful interaction.

### 4. Seamless Real-Time Functionality  
Using **Firebase Firestore**, we built near-instant request updates and chat synchronization.  
The fact that two users can connect and communicate in real time securely was a major technical milestone for us.

### 5. Cross-Functional Collaboration  
Our four-person team balanced design, backend, AI, and frontend development in perfect sync.  
From brainstorming the user journey to writing code at 3 a.m., every team member contributed creatively and technically.  
This synergy was one of our biggest achievements.

### 6. From Idea to Prototype in One Day  
In under 24 hours, we went from **a simple idea about sharing pads** to a working mobile prototype that demonstrates location-based help requests, empathetic chat, and privacy-aware data handling.  
Watching it all come together was deeply fulfilling. 

We’re proud that **ShareCycle** doesn’t just solve a logistical problem, it addresses a social and emotional one, too.  
Our biggest accomplishment is creating something that makes people feel **seen, safe, and supported**.

## What we learned
### 1. Empathy is as important as technology  
Throughout this hackathon, we learned that the human element matters just as much as technical execution.  
Designing for menstruation, a topic often stigmatized or ignored, required us to think about tone, trust, and comfort.  
We realized how powerful technology can be when paired with genuine emotional understanding.

### 2. Building privacy-first systems is hard but necessary  
We realized that protecting user data is not only about encryption but about rethinking how data is shared in the first place.  
From designing coarse geolocation grids to implementing message redaction, every technical decision reminded us that safety must always come before convenience.

### 3. Designing AI for emotional intelligence  
Working on Blossoms AI taught us how difficult and rewarding it is to make AI sound empathetic rather than robotic.  
We experimented with prompt engineering and tone calibration to ensure the chatbot could comfort users like a caring friend, not a generic support bot.  
This process deepened our understanding of AI ethics, tone design, and trust-building.

### 4. Time constraints foster creativity  
With only 24 hours, we learned how to prioritize impact over perfection.  
We focused on building features that truly mattered, such as safety, empathy, and usability, instead of unnecessary complexity.  
It taught us how to think fast, iterate faster, and stay calm under pressure.

### 5. Collaboration fuels innovation  
We discovered how much stronger our ideas became when we listened to each other.  
Each teammate brought a unique perspective, whether technical, emotional, or social, and that diversity shaped ShareCycle into something meaningful.  
We learned that great teams do not just build apps, they build understanding.

## What's next for ShareCycle
ShareCycle started as a 24-hour idea to help women in need, but we now see it as the beginning of something much bigger.  
Our mission is to change how people perceive menstrual health by creating a culture of openness, safety, and community support.

### 1. Expanding the Network  
We plan to scale ShareCycle beyond a prototype into a full mobile app that connects communities, campuses, workplaces, and public spaces.  
Our goal is to ensure that no one ever faces a period emergency alone, no matter where they are.  

### 2. Smarter and Safer AI Agents  
We aim to evolve **Blossoms AI** into a more intelligent and context-aware agent.  
It will learn from real interactions to offer better emotional support, proactive assistance, and trustworthy information on menstrual health.  
We want to make AI that feels like a caring companion, not just a chatbot.

### 3. Partnering with Vendors and Facilities  
We plan to collaborate with **local vendors, restrooms, and institutions** to create a real-time map of sanitary product availability.  
ShareCycle will soon be able to automatically notify vendors when supplies run low, helping establish predictable restock patterns and improving accessibility for everyone.

### 4. Empowering Awareness and Education  
We want to use the ShareCycle platform to drive **awareness and education** about menstrual health.  
By creating a safe, stigma-free space for conversations and support, we hope to normalize discussions around periods and personal care.

### 5. Building a Better, Smarter, and Kinder Future  
Our vision is to make ShareCycle more than an app.  
We want it to represent a movement for empathy-driven technology, where AI is used to make life easier, safer, and smarter for everyone.  
By combining privacy-first design, emotional intelligence, and real human connection, we hope to inspire lasting change.
