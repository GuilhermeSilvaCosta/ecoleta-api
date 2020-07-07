import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {

    async index(request: Request, response: Response) {
        const items = await knex('items').select('*');

        const serializedItems = items.map(item => {
            return {
                ...item,
                image_url: `${process.env.IMAGE_PATH}/${item.image}`
            }
        })
    
        return response.json(serializedItems);
    }

}

export default new ItemsController();