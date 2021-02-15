import { Request, Response } from 'express';
import knex from '../database/connection';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';

interface POINT {
    id: Number
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
            image_url: `${process.env.BUCKET_PATH}/${point.image}`
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)

        response.json({ point: serializePoint, items });
    }

    async store(request: Request, response: Response) {
        try {
            const storage = new Storage();

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

            const [, { name: cloudPath }] = await storage.bucket('guilherme-portfolio').upload(request.file.path, {
                destination: `nlw1/${request.file.filename}`,
                // Support for HTTP requests made with `Accept-Encoding: gzip`
                gzip: true,
            });
            await storage.bucket('guilherme-portfolio').file(cloudPath).makePublic();
            fs.unlinkSync(request.file.path);
        
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
            const [result] = await trx('points').insert(point).returning('*');
            const point_id = result.id;
        
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
                id: result.id,
                ...point
            });
        } catch(err) {
            return response.status(500).json({ message: err.message });
        }
    }
}

export default new PointsController();