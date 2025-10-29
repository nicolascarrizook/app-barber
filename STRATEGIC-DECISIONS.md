# Decisiones Estratégicas del Proyecto

**Fecha**: 2025-10-28
**Estado**: ✅ Confirmadas

## 📋 Decisiones Técnicas

### 1. Email & Notificaciones
- **Proveedor**: Resend
- **Justificación**: API moderna, excelente DX, precios competitivos
- **Capacidades**: Transactional emails, templates, analytics
- **Plan inicial**: Free tier (100 emails/día) → Growth plan cuando escale

### 2. Gateway de Pagos
- **Proveedor**: MercadoPago
- **Justificación**: Líder en Argentina/LATAM, mejor integración local
- **Capacidades**: Tarjetas, QR, link de pago, suscripciones
- **Consideraciones**: Fees ~4-6%, compliance automático con AFIP

### 3. Hosting & Infraestructura
- **Proveedor**: DigitalOcean
- **Justificación**: Balance óptimo costo/features, buena documentación
- **Servicios planificados**:
  - Droplets para API (NestJS)
  - Managed PostgreSQL 15
  - Managed Redis
  - Spaces para storage (compatible S3)
  - App Platform para frontend (Next.js)

### 4. Aplicación Móvil
- **Decisión**: No prioritario (solo web)
- **Justificación**: MVP enfocado en web responsive
- **Roadmap futuro**: Evaluar React Native o Flutter en Fase 4+
- **Consideraciones**: Diseño mobile-first asegura buena UX en móviles

### 5. Internacionalización (i18n)
- **Decisión**: Fase posterior
- **Justificación**: Reducir complejidad inicial, enfoque en mercado argentino
- **Roadmap futuro**: Implementar en Fase 3 si hay demanda
- **Preparación**: Código con strings extraíbles, estructura preparada para i18n

## 🎯 Stack Tecnológico Final

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 15 (Managed DigitalOcean)
- **ORM**: Prisma
- **Cache**: Redis 7 (Managed DigitalOcean)
- **Auth**: Passport.js + JWT
- **Payments**: MercadoPago SDK
- **Email**: Resend SDK
- **Real-time**: Socket.io
- **Testing**: Jest + Supertest + Playwright

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **HTTP**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library

### DevOps
- **Hosting**: DigitalOcean (Droplets + App Platform)
- **CI/CD**: GitHub Actions
- **Monitoring**: (TBD - considerar Sentry/LogRocket)
- **Analytics**: (TBD - considerar PostHog/Mixpanel)

## 📝 Notas Importantes

### Cambios Respecto al Plan Original
1. **Resend en lugar de SendGrid**: Mejor DX, pricing más simple
2. **Sin app móvil inicial**: Enfoque en web responsive de calidad

### Consideraciones Futuras
1. **SMS**: Evaluar Twilio cuando se necesite (recordatorios)
2. **WhatsApp Business**: Integración futura para notificaciones
3. **Multi-idioma**: Arquitectura preparada, implementación diferida

### Riesgos Identificados
1. **MercadoPago fees**: Monitorear impacto en márgenes
2. **DigitalOcean limits**: Planificar escalabilidad vertical/horizontal
3. **Resend free tier**: Monitorear uso, upgrade proactivo

## ✅ Próximo Paso
**TASK-001**: Inicializar estructura del monorepo

---

*Documento generado por Orchestrator Skill*
*Última actualización: 2025-10-28*
