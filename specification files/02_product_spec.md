# NaijaAssets Product Specification
Version: 1.0
Status: Source of Truth
Priority: Highest

---

# PURPOSE

This document defines every functional aspect of the NaijaAssets platform.

Any AI generating software, backend systems, frontend components, APIs, databases, documentation, legal documents, UI, product specifications or future features MUST follow this document.

If another document conflicts with this specification, this specification takes precedence.

The platform should always be designed to scale from thousands to millions of users.

---

# PRODUCT PHILOSOPHY

NaijaAssets is not simply an online tutoring platform.

It is an AI-first learning platform.

Every future feature should move toward replacing repetitive human teaching with intelligent educational software while improving learning outcomes.

The product should prioritize:

Simple UI

Fast performance

Low bandwidth

High accessibility

Automation

Scalability

Consistency

Affordability

AI assistance

Student engagement

---

# PRIMARY USERS

Students

Parents

Teachers

Moderators

Support staff

Affiliates

Administrators

Future schools

Future enterprises

---

# PLATFORM MODULES

Authentication

Subscriptions

Payments

Dashboard

Classes

Recordings

Resources

Assignments

AI Tutor

AI Whiteboard

AI Chat

Search

Notifications

Profile

Settings

Teacher Portal

Affiliate Dashboard

Scholarships

Rewards

Community

Administration

Analytics

---

# AUTHENTICATION

Authentication is handled by Supabase Auth.

Supported methods:

Email

Password

Future OAuth providers

Future SSO

Future enterprise authentication

JWT is used for authenticated APIs.

The frontend should never trust itself.

Every privileged action must be verified server-side.

---

# ACCOUNT MODEL

Each account belongs to one student.

Current policy:

One device logged in simultaneously.

Future family plans may override this restriction.

Accounts remain active after subscription expiration.

Subscriptions determine access.

Authentication does not determine permissions.

---

# SUBSCRIPTIONS

Subject Subscription

Unlocks one academic subject.

Multiple subjects may be subscribed simultaneously.

---

Rex

Allows viewing recordings belonging only to actively subscribed subjects.

If subject expires:

Access immediately ends.

---

Rex Pro

Allows viewing all recordings for the student's current academic grade.

Subject subscriptions are ignored.

Other grades remain inaccessible.

---

Vault Pass

Highest subscription tier.

Allows viewing every recording.

No subject restrictions.

No grade restrictions.

No archive restrictions.

Designed for educators, high-performing students and advanced learners.

Future premium tiers may exist.

Backend logic must not assume Vault Pass is permanently the highest tier.

---

# ACCESS CONTROL

Access decisions occur entirely on the backend.

Frontend never determines permissions.

Frontend simply renders API responses.

If content is inaccessible:

Backend returns metadata.

Backend withholds protected resources.

Never expose protected URLs.

Never rely on frontend hiding.

---

# RECORDINGS

Every recording contains:

Unique ID

Title

Description

Grade

Subject

Teacher

Duration

Thumbnail

View count

Creation date

Premium status

Tags

Metadata

Video URL

Only authorized users receive the Video URL.

Everyone may receive metadata unless future policy changes.

---

# SEARCH

Search should be global.

Supports:

Title

Description

Teacher

Tags

Subjects

Grades

Future AI semantic search.

Search results may include inaccessible content.

Visibility does not equal accessibility.

---

# LIVE CLASSES

Teachers host live lessons.

Students attend.

Attendance may be recorded.

Classes may become recordings.

Classes may be rescheduled.

Teachers may be replaced.

Platform reserves scheduling flexibility.

---

# AI SYSTEM

AI is a core platform component.

Future AI includes:

Tutor

Whiteboard

Voice

Vision

Homework

Planning

Revision

Study assistant

Learning analytics

Lesson generation

Exam preparation

Interactive explanations

Future AI agents

Every AI interaction should be context aware.

Future AI may remember learning progress.

---

# AI WHITEBOARD

Primary future feature.

Students ask questions.

AI teaches visually.

Infinite canvas.

Real-time drawing.

Diagram generation.

Step-by-step mathematics.

Physics.

Chemistry.

Biology.

Economics.

Programming.

Interactive teaching.

The whiteboard should feel like learning from a human teacher.

---

# AI MEMORY

Future capability.

Remember:

Student strengths.

Weaknesses.

Learning speed.

Preferred explanations.

Mistakes.

Goals.

Memory should always remain privacy-compliant.

---

# DOWNLOADS

Platform supports offline learning.

Downloads should never expose raw video files.

Downloads remain encrypted.

Only playable inside NaijaAssets.

Access expires with subscriptions.

Downloaded content respects backend permissions.

---

# PAYMENTS

Future providers:

Stripe

Additional processors

Payment success activates subscriptions.

Payment failure begins grace period.

After grace period:

Subscription deactivates.

Account remains.

History remains.

---

# API DESIGN

Backend owns business logic.

Frontend owns presentation.

Never duplicate business rules.

Every API returns:

Status

Message

Errors

Data

Pagination where applicable.

---

# SECURITY

Zero trust architecture.

Never trust frontend.

Every permission verified.

Rate limiting.

Audit logging.

Encryption.

Future anomaly detection.

Future fraud detection.

---

# TEACHER SYSTEM

Teachers create:

Live lessons

Recordings

Assignments

Resources

Teachers may access:

Attendance

Student lists

Schedules

Limited analytics

Teachers never own platform IP.

Teacher content follows licensing agreements.

---

# STUDENT DASHBOARD

Shows:

Subscriptions

Upcoming classes

Recordings

Assignments

Resources

Progress

AI features

Notifications

Scholarships

Rewards

Affiliate earnings (if applicable)

---

# SCHOLARSHIP SYSTEM

Students may apply.

Competitions may exist.

Applications may include:

Essays

Videos

Assignments

Projects

Selection is discretionary.

Awards may change.

Programs may end.

---

# AFFILIATE SYSTEM

Users receive referral links.

Conversions tracked.

Fraud monitored.

Self-referrals prohibited.

Commission structure configurable.

---

# ANALYTICS

Platform collects:

Usage

Learning progress

Attendance

Completion

Retention

Engagement

Errors

Performance

Fraud signals

Analytics improve the platform.

---

# SCALABILITY

Design for:

1 million students.

100k concurrent users.

Millions of recordings.

Global CDN.

Multiple regions.

Microservices where appropriate.

Event-driven architecture.

Future enterprise deployments.

---

# PRODUCT PRINCIPLES

Every feature should satisfy:

Simple

Fast

Secure

Scalable

Accessible

Mobile friendly

Bandwidth efficient

Future-proof

AI-enhanced

Maintainable

---

# FUTURE PRODUCTS

Assume future development of:

AI Teacher

AI School

AI Classroom

Enterprise LMS

Parent Portal

School Portal

Developer APIs

Marketplace

Mobile apps

Desktop apps

Browser extension

Educational operating system

Future acquisitions

---

# FINAL INSTRUCTION

Every engineering decision should maximize:

Maintainability

Automation

Security

Scalability

Student outcomes

Developer productivity

Business flexibility

Do not tightly couple features.

Prefer modular architecture.

Assume NaijaAssets will evolve into an AI-native education company rather than a traditional tutoring platform.