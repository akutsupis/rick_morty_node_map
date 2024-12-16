import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { type } = req.query;

    try {
        const filePath = path.resolve(process.cwd(), 'data', `${type}.json`);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileData);

        res.status(200).json(jsonData);
    } catch (error) {
    //    res.status(500).json({ error: `Failed to process ${type} data` });
    }
}