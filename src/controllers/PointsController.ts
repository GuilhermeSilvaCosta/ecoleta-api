import { Request, Response } from 'express';
import knex from '../database/connection';

interface POINT {
    point_id: Number
}

class PointsController {

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        const serializePoints = points.map(point => {
            return {
                ...point,
                image_url: `${process.env.IMAGE_PATH}/${point.image}`
            }
        });

        return response.json(serializePoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found.' })
        }

        const serializePoint = {
            ...point,
            image_url: `${process.env.IMAGE_PATH}/${point.image}`
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)

        response.json({ point: serializePoint, items });
    }

    async store(request: Request, response: Response) {
        try {
            const { 
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf,
                items
            } = request.body;
        
            const point = {
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf,
                image: request.file.filename
            }
    
            const trx = await knex.transaction();
            const result = <POINT> await trx('points').insert(point);
            console.log(result);
            const point_id = result.point_id;
        
            const pointItems = items
                .split(',')
                .map((item: string) => Number(item.trim()))
                .map((item_id: Number) => {
                return {
                    item_id,
                    point_id
                }
            })
        
            await trx('point_items').insert(pointItems);
    
            await trx.commit();
        
            return response.json({ 
                id: point_id,
                ...point
            });
        } catch(err) {
            return response.status(500).json({ message: err.message });
        }
    }
}

export default new PointsController();