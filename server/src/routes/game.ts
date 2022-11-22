import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

export async function gameRoutes(fastify: FastifyInstance) {
	fastify.get('/games/count', async () => {
		const count = await prisma.game.count()

		return { count }
	})


	fastify.get('/pools/:id/games', {
		onRequest: [authenticate]
	}, async (request) => {
		const getPoolParams = z.object({
			id: z.string(),
		})

		const { id } = getPoolParams.parse(request.params)

		const games = await prisma.game.findMany({
			orderBy: {
				date: 'desc',
			},
			include: {
				guesses: {
					where: {
						participant: {
							userId: request.user.sub,
							poolId: id,
						}
					}
				}
			}
		})

		return {
			games: games.map(game => {
				return {
					...game,
					guess: game.guesses.length > 0 ? game.guesses[0] : null,
					guesses: undefined,
				}
			})
		}
	})

	fastify.get('/games/list', {
	}, async () => {
		const games = await prisma.game.findMany()

		return { games }
	})

	fastify.post('/games', { onRequest: [authenticate] }, async (request: any, reply) => {
		const joinGameBody = z.object({
			date: z.string(),
			firstTeamCountryCode: z.string(),
			secondTeamCountryCode: z.string(),
		});

		request.body.forEach(async (element: any) => {
			const { date, firstTeamCountryCode, secondTeamCountryCode } = joinGameBody.parse(element)

			await prisma.game.create({
				data: {
					date: date,
					firstTeamCountryCode: firstTeamCountryCode,
					secondTeamCountryCode: secondTeamCountryCode,
				}
			})
		});
		return reply.status(201).send()
	})
}
