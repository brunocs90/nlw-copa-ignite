import { FastifyInstance } from "fastify"

export async function home(fastify: FastifyInstance) {
	fastify.get('/', async (request, reply) => {
		reply.status(200).send({ response: 'Bem vindo ao Backend do Bolão da Copa 2022' })
	})
}
