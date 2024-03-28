import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import Comment from 'App/Models/Comment'

export default class CommentsController {

    public async store({request, params, response}: HttpContextContract) { // Método para inserir comentários no sistema
        const body = request.body() // Chamar conteúdo do body
        const momentId = params.momentId // Chama o ID do momento

        await Moment.findOrFail(momentId) // Verifica se o comentário está indo para um momento válido

        body.momentId = momentId // Insere o momentId no body

        const comment = await Comment.create(body) // Cria o comentário

        response.status(201)

        return {
            message: 'Comentário adicionado com sucesso!',
            data: comment, // Envia o comentário
        }
    }
}
