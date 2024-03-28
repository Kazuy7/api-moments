import { v4 as uuidv4 } from 'uuid';

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import Moment from 'App/Models/Moment';

import Application from '@ioc:Adonis/Core/Application';

export default class MomentsController {
    private validationOptions = { // Valida a imagem antes de inserir no sistema
        types: ['image'],
        size: '2mb',
    }


    public async store({request, response}: HttpContextContract) { // Cria um registro
        const body = request.body()

        const image = request.file('image', this.validationOptions)

        if(image) {
            const imageName = `${uuidv4()}.${image.extname}` // Concatena a extenção ao nome da imagem para que cada uma tenha um nome único

            await image.move(Application.tmpPath('uploads'), { // Armazena a imagem em tmpPath
                name: imageName
            })

            body.image = imageName // Salva a imagem com o nome atualizado no corpo da requisição
        }

        const moment = await Moment.create(body)

        response.status(201)

        return {
            message: "Momento criado com sucesso!",
            data: moment,
        }
    }

    public async index() { // Busca todos os registros
        const moments = await Moment.query().preload('comments') // Carrega os comentários junto

        return {
            data: moments,
        }
    }

    public async show({params}: HttpContextContract) { // Busca um resgistro por id
        const moment = await Moment.findOrFail(params.id)

        await moment.load('comments') // Traz todos os comentários do momento selecionado

        return {
            data: moment,
        }
    }

    public async destroy({params}: HttpContextContract) { // Delete
        const moment = await Moment.findOrFail(params.id)

        await moment.delete()

        return {
            message: "Momento excluído com sucesso!",
            data: moment,
        }
    }

    public async update({params, request}: HttpContextContract) { // Atualizar informações
        const body = request.body() // Pega informações do body

        const moment = await Moment.findOrFail(params.id) // Verifica se existe o momento pelo id

        moment.title = body.title // Substituindo os dados que vieram do body
        moment.description = body.description // Substituindo os dados que vieram do body

        if(moment.image != body.image || !moment.image) { // Verifica se a imagem é a mesma para não gerar substituição desnecessária & verifica se o momento não possui uma imagem
            const image = request.file('image', this.validationOptions) // Puxa a imagem

            if (image) { // Verifica se a imagem veio
            const imageName = `${uuidv4()}.${image.extname}` // Refaz o nome

            await image.move(Application.tmpPath('uploads'), { // Move para uploads
                name: imageName
            })

            moment.image = imageName // Substitui a imagem
            }
        }

        await moment.save() // Método para atualizar um dado já existente

        return {
            message: "Momento atualizado com sucesso!",
            data: moment, // Retorna o dado atualizado
        }
    }
}
