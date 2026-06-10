import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { waitlistRouter } from "./routers/waitlist";
import { adminRouter } from "./routers/admin";
import { masterEmailsRouter } from "./routers/masterEmails";
import { novaReignRouter } from "./routers/novaReign";
import { valor1775Router } from "./routers/valor1775";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  waitlist: waitlistRouter,
  admin: adminRouter,
  masterEmails: masterEmailsRouter,
  novaReign: novaReignRouter,
  valor1775: valor1775Router,
});

export type AppRouter = typeof appRouter;
