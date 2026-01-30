# TaskFlow - What's Left

> **Last Updated:** 2026-01-30  
> **Overall Progress:** ~85% Complete (MVP functional, enhancements pending)

---

## Priority 1: Critical to Launch

### OAuth Configuration ⚠️ Manual Step Required
| Task | Effort | Blocker |
|------|--------|---------|
| Enable Google OAuth in Supabase Dashboard | 5 min | Manual config needed |
| Enable GitHub OAuth in Supabase Dashboard | 5 min | Manual config needed |
| Add redirect URLs | 2 min | Manual config needed |

**See `docs/todos/oauth-setup.md` for step-by-step instructions.**

---

## Priority 2: UI Polish

### Notification Bell Integration
| Task | Effort | Status |
|------|--------|--------|
| Integrate NotificationBell into Header | 15 min | Component exists, needs wiring |
| Test unread count badge | 10 min | Verify realtime updates |
| Add notification drawer UI | 30 min | Show notification list |

### Header Integration
| Task | Effort | Status |
|------|--------|--------|
| Add NotificationBell to Header | 10 min | Update `components/layout/Header.tsx` |
| Add UserMenu to Header | 10 min | Profile dropdown with logout |

---

## Priority 3: Testing

### End-to-End Testing
| Task | Effort | Description |
|------|--------|-------------|
| Install Playwright | 30 min | Setup E2E testing framework |
| Write auth flow tests | 1 hour | Login, register, logout |
| Write task CRUD tests | 1 hour | Create, update, delete |
| Write realtime tests | 2 hours | Multi-user scenario |

### Accessibility Audit
| Task | Effort | Description |
|------|--------|-------------|
| Run axe DevTools | 30 min | Find accessibility issues |
| Fix ARIA labels | 30 min | Add missing labels |
| Keyboard navigation | 1 hour | Ensure all actions work via keyboard |
| Color contrast check | 30 min | Verify WCAG AA compliance |

---

## Priority 4: Deployment

### Production Setup
| Task | Effort | Description |
|------|--------|-------------|
| Set up Vercel project | 10 min | Connect GitHub repo |
| Configure environment variables | 15 min | Add Supabase URLs |
| Deploy to production | 10 min | Push to main branch |
| Test production deployment | 20 min | Verify all features work |
| Set up custom domain | 30 min | Optional branding |

### Monitoring
| Task | Effort | Description |
|------|--------|-------------|
| Set up Sentry (error tracking) | 1 hour | Capture production errors |
| Set up LogRocket (session replay) | 1 hour | Debug user issues |
| Configure Vercel Analytics | 15 min | Basic metrics |

---

## Priority 5: Nice to Have (Post-MVP)

### Task Features
| Feature | Effort | Description |
|---------|--------|-------------|
| Task comments | 4 hours | Discussion thread on tasks |
| File attachments | 6 hours | Upload files to tasks |
| Task templates | 3 hours | Predefined task types |
| Due dates | 2 hours | Add deadline to tasks |
| Tags/labels | 3 hours | Categorize tasks |

### Collaboration Features
| Feature | Effort | Description |
|---------|--------|-------------|
| @mentions | 4 hours | Notify users in comments |
| Activity feed | 3 hours | Recent changes across tasks |
| Email notifications | 6 hours | Send email for important events |
| Slack integration | 4 hours | Post updates to Slack |

### Analytics Enhancements
| Feature | Effort | Description |
|---------|--------|-------------|
| Time tracking | 6 hours | Track time spent on tasks |
| Burndown charts | 4 hours | Sprint progress visualization |
| Custom date ranges | 2 hours | Analytics date picker |

### Admin Features
| Feature | Effort | Description |
|---------|--------|-------------|
| User management | 4 hours | Admin panel for users |
| Team management | 3 hours | Create teams, manage members |
| Settings page | 2 hours | User preferences |
| Audit log export | 2 hours | Download activity history |

---

## Priority 6: Future Enhancements

| Feature | Effort | Value |
|---------|--------|-------|
| Mobile app (React Native) | 40+ hours | On-the-go access |
| Dark mode toggle | 2 hours | Visual preference |
| Task dependencies | 8 hours | Blocking relationships |
| Kanban board view | 8 hours | Drag-and-drop interface |
| Calendar view | 6 hours | Timeline visualization |
| Search across all tasks | 4 hours | Global search |
| Keyboard shortcuts | 4 hours | Power user features |
| Webhooks API | 6 hours | Integration with other tools |
| Import/export CSV | 3 hours | Data portability |
| SSO/SAML | 12 hours | Enterprise authentication |

---

## Estimated Effort Summary

| Priority | Total Effort | Description |
|----------|--------------|-------------|
| 1 - Critical (OAuth) | 15 min | Manual Supabase config |
| 2 - UI Polish | 1 hour | Notification bell, header |
| 3 - Testing | 5 hours | E2E + accessibility |
| 4 - Deployment | 2 hours | Vercel + monitoring |
| 5 - Nice to Have | 40+ hours | Comments, files, templates |
| 6 - Future | 100+ hours | Mobile, advanced features |

**Time to Production:** ~8 hours of focused work (excluding OAuth manual config)

---

## Quick Start: What to Do Next

If you want to launch TaskFlow to production:

1. **OAuth Setup** (15 min) - Follow `docs/todos/oauth-setup.md`
2. **UI Polish** (1 hour) - Integrate notification bell
3. **Deploy to Vercel** (30 min) - Push and test
4. **Optional: Testing** (5 hours) - E2E tests, accessibility audit

**Total: ~2 hours to have a working production deployment**

---

## Deferred Decisions

These were intentionally deferred from MVP:

| Decision | Reason |
|----------|--------|
| Email notifications | In-app notifications sufficient for MVP |
| File attachments | Adds complexity with Supabase Storage |
| Task comments | Nice to have, not core to handoff workflow |
| Due dates | Teams use different tracking methods |
| Mobile app | Responsive web works for now |
| Advanced permissions | Simple team model sufficient |

---

## Known Issues

None blocking. The application is functional and ready for use.

| Issue | Impact | Workaround |
|-------|--------|------------|
| OAuth not configured | Cannot use Google/GitHub login | Use email/password |
| Notification bell not in header | No visible notification icon | Check /notifications page |
