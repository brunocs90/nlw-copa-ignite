import Fastify from 'fastify';
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"

import { poolRoutes } from "./routes/pool"
import { authRoutes } from "./routes/auth"
import { gameRoutes } from "./routes/game"
import { guessRoutes } from "./routes/guess"
import { userRoutes } from "./routes/user"
import { home } from "./routes/home"

const fastify = Fastify({ logger: true, pluginTimeout: 20000 });

fastify.register(cors, {
    origin: true,
})

const secretKeyJwt = process.env.SECRET_KEY_JWT as string

fastify.register(jwt, {
    secret: secretKeyJwt,
})

fastify.register(poolRoutes);
fastify.register(authRoutes);
fastify.register(gameRoutes);
fastify.register(guessRoutes);
fastify.register(userRoutes);
fastify.register(home);

const port = (process.env.PORT ?? 3333) as number;
const host = (process.env.HOST ?? '0.0.0.0') as string

fastify.listen({ port, host }, (err, address) => {
    console.log(`Servidor rodando na porta: ${address}`)
})
